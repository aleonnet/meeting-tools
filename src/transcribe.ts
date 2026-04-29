import { Notice, TFile } from "obsidian";
import type MeetingToolsPlugin from "./main";
import {
  baseName,
  ensureFolder,
  getAudioDurationSec,
  showApiKeyMissingNotice,
  srtToPlainText,
} from "./file-utils";
import {
  decodeAudioToBuffer,
  encodeOpus,
  encodeWav16,
  isOpusEncodingSupported,
  mapCompactToOriginal,
  removeSilence,
  sliceBufferToChunks,
  type SilenceMap,
} from "./audio-chunking";
import type { MeetingToolsSettings, TranscriptionModel } from "./settings";
import { t } from "./i18n";
import { parseOpenAIError } from "./openai-errors";

const MIME_BY_EXT: Record<string, string> = {
  webm: "audio/webm",
  m4a: "audio/mp4",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  mp4: "audio/mp4",
};

// Mitigates whisper-1 hallucination loops ('...' blocks) in long audios.
// Recommended by OpenAI community — not user-facing.
const WHISPER_HALLUCINATION_PROMPT =
  "The sentence may be cut off, do not make up words to fill in the rest of the sentence.";

// 25MB limit is an OpenAI-wide constraint on the audio upload endpoint,
// applied uniformly to whisper-1, gpt-4o-transcribe, and gpt-4o-transcribe-diarize.
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

// Hard server-side cap reported by gpt-4o-transcribe-diarize:
//   "audio duration 1828.44 seconds is longer than 1400 seconds which is the
//    maximum for this model"
// Confirmed empirically in 2026-04-27 — the limit applies even when
// chunking_strategy=auto is sent (the OpenAI docs are misleading on this).
const DIARIZE_MAX_SEC = 1400;

export interface TranscribeResult {
  srtPath: string;
  mdPath: string | null;
}

interface DiarizedSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

interface DiarizedResponse {
  segments?: DiarizedSegment[];
  text?: string;
}

export async function transcribeAudio(
  plugin: MeetingToolsPlugin,
  audioPath: string
): Promise<TranscribeResult | null> {
  const { app, settings } = plugin;
  const apiKey = plugin.getApiKey();
  if (!apiKey) {
    showApiKeyMissingNotice(plugin);
    return null;
  }

  const file = app.vault.getAbstractFileByPath(audioPath);
  if (!file || !(file instanceof TFile)) {
    new Notice(t().noticeAudioNotFound(audioPath));
    return null;
  }

  const ext = (file.extension || "").toLowerCase();
  const mime = MIME_BY_EXT[ext] || "application/octet-stream";
  const buf = await (app.vault.adapter as any).readBinary(audioPath);
  const blob = new Blob([buf], { type: mime });

  const durationSec = await getAudioDurationSec(blob);

  // VAD pre-processing (optional). When enabled, we decode the audio once,
  // strip silences > minSilenceSec, and use the compact buffer for everything
  // downstream. The SilenceMap lets us expand SRT/diarize timestamps back to
  // the original audio's timeline so the player stays in sync.
  const vad = await maybePreprocessSilence(blob, settings, durationSec);

  // Effective size/duration drive resolveMode. With VAD, we use the compact
  // buffer's duration and a conservative Opus-bitrate size estimate.
  const effectiveDurationSec = vad ? vad.buffer.duration : durationSec;
  const effectiveSize = vad
    ? estimateOpusBytes(vad.buffer)
    : buf.byteLength;

  const mode = resolveMode(
    settings.transcriptionModel,
    effectiveDurationSec,
    effectiveSize,
    settings.chunkDurationMin
  );

  await ensureFolder(app, settings.transcriptsDir);

  let srtText: string;
  let mdBody: string;
  let modelLabel: string;

  try {
    if (mode === "whisper-single") {
      modelLabel = "whisper-1";
      new Notice(t().noticeTranscribingWith(modelLabel));
      const uploadBlob = vad ? await encodeBufferToBlob(vad.buffer) : blob;
      const uploadName = vad ? renameForVad(file.name) : file.name;
      let srt = await postWhisper(apiKey, uploadBlob, uploadName);
      if (vad) srt = expandSrtTimestamps(srt, vad.map);
      srtText = srt;
      mdBody = srtToPlainText(srtText) || t().transcriptEmptyMarker;
    } else if (mode === "whisper-chunked") {
      modelLabel = "whisper-1 (chunked)";
      new Notice(t().noticeTranscribingWith(modelLabel));
      const result = await transcribeWhisperChunked(
        apiKey,
        blob,
        settings.chunkDurationMin,
        vad?.buffer ?? null
      );
      srtText = vad ? expandSrtTimestamps(result.srt, vad.map) : result.srt;
      mdBody = srtToPlainText(srtText) || t().transcriptEmptyMarker;
    } else if (mode === "diarize-single") {
      modelLabel = "gpt-4o-transcribe-diarize";
      new Notice(t().noticeTranscribingWith(modelLabel));
      const uploadBlob = vad ? await encodeBufferToBlob(vad.buffer) : blob;
      const uploadName = vad ? renameForVad(file.name) : file.name;
      let json = await postDiarize(apiKey, uploadBlob, uploadName);
      if (vad) json = expandDiarizedTimestamps(json, vad.map);
      srtText = diarizedToSrt(json);
      mdBody = diarizedToMd(json) || "_(transcrição vazia)_";
    } else {
      // diarize-chunked: cap effective chunk at the server's 1400s limit
      // (with 20s safety margin) regardless of the user's chunkDurationMin.
      modelLabel = "gpt-4o-transcribe-diarize (chunked)";
      new Notice(t().noticeTranscribingWith(modelLabel));
      const userChunkSec = settings.chunkDurationMin * 60;
      const effectiveChunkSec = Math.min(userChunkSec, DIARIZE_MAX_SEC - 20);
      let merged = await transcribeDiarizeChunked(
        apiKey,
        blob,
        effectiveChunkSec,
        vad?.buffer ?? null
      );
      if (vad) merged = expandDiarizedTimestamps(merged, vad.map);
      srtText = diarizedToSrt(merged);
      mdBody = diarizedToMd(merged) || "_(transcrição vazia)_";
    }
  } catch (e: any) {
    console.error("[MeetingTools] Transcription error:", e);
    new Notice(t().noticeTranscribeFailed(e?.message ?? String(e)));
    return null;
  }

  const srtPath = `${settings.transcriptsDir}/${baseName(audioPath)}.srt`;
  const existingSrt = app.vault.getAbstractFileByPath(srtPath);
  if (existingSrt instanceof TFile) {
    await app.vault.modify(existingSrt, srtText);
  } else {
    await app.vault.create(srtPath, srtText);
  }
  new Notice(t().noticeSrtSaved(srtPath));

  let mdPath: string | null = null;
  if (settings.generateMdFromSrt) {
    mdPath = `${settings.transcriptsDir}/${baseName(audioPath)}.md`;
    const content = `${t().transcriptMdHeader}\n\n![[${audioPath}]]\n\n${mdBody}`;
    const existingMd = app.vault.getAbstractFileByPath(mdPath);
    if (existingMd instanceof TFile) {
      await app.vault.modify(existingMd, content);
    } else {
      await app.vault.create(mdPath, content);
    }
    new Notice(t().noticeMdSaved(mdPath));
  }

  return { srtPath, mdPath };
}

// --- VAD pre-processing ---

interface VadResult {
  buffer: AudioBuffer;
  map: SilenceMap;
}

/**
 * Decodes the audio and removes silences when settings.removeSilence is true.
 * Returns null when the setting is off, signaling that the rest of the pipeline
 * should use the original blob (and may bypass decode entirely for single-call
 * uploads).
 *
 * Skips if the source is suspiciously short (< 2 × minSilenceSec) — there's
 * nothing meaningful to cut and decoding adds latency for no gain.
 */
async function maybePreprocessSilence(
  blob: Blob,
  settings: MeetingToolsSettings,
  durationSec: number | null
): Promise<VadResult | null> {
  if (!settings.removeSilence) return null;
  if (durationSec != null && durationSec < settings.minSilenceSec * 2) {
    return null;
  }

  new Notice(t().noticeRemovingSilences);
  const fullBuffer = await decodeAudioToBuffer(blob, 16000);
  const { buffer: compact, map } = removeSilence(
    fullBuffer,
    settings.minSilenceSec,
    settings.silenceThresholdDb
  );

  const origSec = fullBuffer.duration;
  const compactSec = compact.duration;
  // Only notify when the cut is meaningful — small detection wobble shouldn't
  // spam the user with "removed 0s" notices.
  if (compactSec < origSec - 0.5) {
    new Notice(t().noticeSilenceRemoved(origSec, compactSec));
  }

  return { buffer: compact, map };
}

/**
 * Conservative size estimate for an Opus-encoded AudioBuffer at the encoder's
 * default 24 kbps mono target, with 33% headroom for webm container overhead
 * and bitrate spikes. Used by resolveMode to pick single-call vs chunked.
 */
function estimateOpusBytes(buffer: AudioBuffer): number {
  return Math.ceil(buffer.duration * 4000);
}

/**
 * Encodes an AudioBuffer to Opus/WebM (when WebCodecs is available) or WAV.
 * Used both for single-call uploads after VAD and for chunked encoding.
 */
async function encodeBufferToBlob(buffer: AudioBuffer): Promise<Blob> {
  return isOpusEncodingSupported()
    ? await encodeOpus(buffer)
    : encodeWav16(buffer);
}

function renameForVad(originalName: string): string {
  const dot = originalName.lastIndexOf(".");
  const base = dot > 0 ? originalName.slice(0, dot) : originalName;
  const ext = isOpusEncodingSupported() ? "webm" : "wav";
  return `${base}-vad.${ext}`;
}

// --- mode resolution ---

type Mode =
  | "whisper-single"
  | "whisper-chunked"
  | "diarize-single"
  | "diarize-chunked";

/**
 * Decides the transcription path based on model, source size, and source duration.
 *
 * - whisper-1 single-call when source ≤ 25 MB AND duration ≤ chunkDurationMin.
 *   (Both conditions matter: even if the file fits, long audio gets chunked
 *   client-side as anti-hallucination defense.)
 * - whisper-1 chunked otherwise (size > 25 MB OR duration > chunkDurationMin).
 * - diarize single-call when source ≤ 25 MB AND duration ≤ DIARIZE_MAX_SEC.
 *   The server's chunking_strategy=auto does NOT bypass the 1400s server cap
 *   (verified empirically), so we still need to chunk client-side for longer
 *   audio.
 * - diarize chunked when source > 25 MB OR duration > DIARIZE_MAX_SEC.
 *
 * When duration detection fails, assumes long (forces chunking) to be safe.
 */
function resolveMode(
  setting: TranscriptionModel,
  durationSec: number | null,
  sizeBytes: number,
  chunkDurationMin: number
): Mode {
  const duration = durationSec ?? Infinity;
  const tooBig = sizeBytes > MAX_UPLOAD_BYTES;

  if (setting === "gpt-4o-transcribe-diarize") {
    const tooLongForDiarize = duration > DIARIZE_MAX_SEC;
    return tooBig || tooLongForDiarize ? "diarize-chunked" : "diarize-single";
  }
  // whisper-1
  const tooLongForWhisper = duration > chunkDurationMin * 60;
  return tooBig || tooLongForWhisper ? "whisper-chunked" : "whisper-single";
}

// --- whisper single-call ---

async function postWhisper(
  apiKey: string,
  blob: Blob,
  fileName: string,
  contextPrompt?: string
): Promise<string> {
  const form = new FormData();
  form.append("file", blob, fileName);
  form.append("model", "whisper-1");
  form.append("response_format", "srt");
  form.append("temperature", "0");
  form.append(
    "prompt",
    contextPrompt
      ? `${WHISPER_HALLUCINATION_PROMPT} ${contextPrompt}`
      : WHISPER_HALLUCINATION_PROMPT
  );

  let resp: Response;
  try {
    resp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey },
      body: form,
    });
  } catch (e) {
    const err = parseOpenAIError(null, e);
    console.error("[MeetingTools] whisper network error:", err);
    new Notice(err.friendly, 10000);
    throw new Error(err.code ?? "network_error");
  }
  if (!resp.ok) {
    const json = await resp.json().catch(() => null);
    const err = parseOpenAIError({ status: resp.status, json });
    console.error("[MeetingTools] whisper error:", err);
    new Notice(err.friendly, 10000);
    throw new Error(err.code ?? "openai_error");
  }
  return await resp.text();
}

// --- whisper chunked ---

async function transcribeWhisperChunked(
  apiKey: string,
  blob: Blob,
  chunkDurationMin: number,
  preDecoded: AudioBuffer | null
): Promise<{ srt: string }> {
  const chunkSec = chunkDurationMin * 60;
  const chunks = preDecoded
    ? await chunksFromBuffer(preDecoded, chunkSec)
    : await prepareChunks(blob, chunkDurationMin);
  const ext = chunks[0].type.includes("wav") ? "wav" : "webm";
  const srts: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    new Notice(t().noticeTranscribingChunk(i + 1, chunks.length));
    const contextPrompt =
      i > 0 ? lastSentencesFromSrt(srts[i - 1], 2) : undefined;
    try {
      const srt = await postWithRetry(async () =>
        postWhisper(apiKey, chunks[i], `chunk-${i + 1}.${ext}`, contextPrompt)
      );
      srts.push(srt);
    } catch (e: any) {
      const startSec = i * chunkSec;
      const endSec = startSec + chunkSec;
      console.error(`[MeetingTools] chunk ${i + 1} failed:`, e);
      new Notice(t().noticeChunkFailed(i + 1));
      srts.push(
        `1\n${formatSrtTime(0)} --> ${formatSrtTime(endSec - startSec)}\n[chunk ${i + 1} falhou: ${formatSrtTime(startSec)}–${formatSrtTime(endSec)}]\n`
      );
    }
  }

  return { srt: mergeSrts(srts, chunkSec) };
}

// --- diarize single + chunked ---

async function postDiarize(
  apiKey: string,
  blob: Blob,
  fileName: string
): Promise<DiarizedResponse> {
  const form = new FormData();
  form.append("file", blob, fileName);
  form.append("model", "gpt-4o-transcribe-diarize");
  form.append("response_format", "diarized_json");
  form.append("chunking_strategy", "auto");
  form.append("temperature", "0");

  let resp: Response;
  try {
    resp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey },
      body: form,
    });
  } catch (e) {
    const err = parseOpenAIError(null, e);
    console.error("[MeetingTools] diarize network error:", err);
    new Notice(err.friendly, 10000);
    throw new Error(err.code ?? "network_error");
  }
  if (!resp.ok) {
    const json = await resp.json().catch(() => null);
    const err = parseOpenAIError({ status: resp.status, json });
    console.error("[MeetingTools] diarize error:", err);
    new Notice(err.friendly, 10000);
    throw new Error(err.code ?? "openai_error");
  }
  return (await resp.json()) as DiarizedResponse;
}

async function transcribeDiarizeChunked(
  apiKey: string,
  blob: Blob,
  chunkSec: number,
  preDecoded: AudioBuffer | null
): Promise<DiarizedResponse> {
  const chunks = preDecoded
    ? await chunksFromBuffer(preDecoded, chunkSec)
    : await prepareChunksBySeconds(blob, chunkSec);
  const ext = chunks[0].type.includes("wav") ? "wav" : "webm";
  const allSegments: DiarizedSegment[] = [];
  let fullText = "";

  for (let i = 0; i < chunks.length; i++) {
    new Notice(t().noticeTranscribingChunk(i + 1, chunks.length));
    try {
      const json = await postWithRetry(async () =>
        postDiarize(apiKey, chunks[i], `chunk-${i + 1}.${ext}`)
      );
      const offset = i * chunkSec;
      for (const seg of json.segments ?? []) {
        allSegments.push({
          start: (seg.start ?? 0) + offset,
          end: (seg.end ?? 0) + offset,
          text: seg.text ?? "",
          speaker: seg.speaker,
        });
      }
      if (json.text) fullText += (fullText ? " " : "") + json.text;
    } catch (e: any) {
      console.error(`[MeetingTools] diarize chunk ${i + 1} failed:`, e);
      new Notice(t().noticeChunkFailed(i + 1));
      const startSec = i * chunkSec;
      allSegments.push({
        start: startSec,
        end: startSec + chunkSec,
        text: `[chunk ${i + 1} falhou]`,
      });
    }
  }

  return { segments: allSegments, text: fullText };
}

// --- chunking pipeline ---

/**
 * Decodes blob to PCM, slices into chunkDurationMin segments, and encodes each
 * as Opus/WebM (preferred, ~180 KB/min) or WAV (fallback, ~1.83 MB/min).
 *
 * Throws if any encoded chunk exceeds 25 MB. With Opus that requires very long
 * chunks (>2h at 24 kbps); with WAV fallback it caps around 13 min.
 */
async function prepareChunks(
  blob: Blob,
  chunkDurationMin: number
): Promise<Blob[]> {
  return prepareChunksBySeconds(blob, chunkDurationMin * 60);
}

async function prepareChunksBySeconds(
  blob: Blob,
  chunkSec: number
): Promise<Blob[]> {
  const buffer = await decodeAudioToBuffer(blob, 16000);
  return chunksFromBuffer(buffer, chunkSec);
}

/**
 * Slices a pre-decoded AudioBuffer into chunks and encodes each one for upload.
 * Used both by the original-blob path (after internal decode) and by the VAD
 * path, which already holds the compact buffer in memory.
 */
async function chunksFromBuffer(
  buffer: AudioBuffer,
  chunkSec: number
): Promise<Blob[]> {
  const audioChunks = sliceBufferToChunks(buffer, chunkSec);
  const useOpus = isOpusEncodingSupported();
  const encoded: Blob[] = [];
  for (const c of audioChunks) {
    encoded.push(useOpus ? await encodeOpus(c) : encodeWav16(c));
  }

  for (const w of encoded) {
    if (w.size > MAX_UPLOAD_BYTES) {
      const sizeMb = (w.size / 1024 / 1024).toFixed(1);
      const advice = useOpus
        ? "Reduza Chunk duration."
        : "WebCodecs Opus indisponível neste ambiente; usando WAV (~1.83 MB/min). Reduza Chunk duration para ≤ 12 min.";
      throw new Error(`Chunk excede 25 MB (${sizeMb} MB). ${advice}`);
    }
  }
  return encoded;
}

async function postWithRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    await new Promise((r) => setTimeout(r, 2000));
    return await fn();
  }
}

// --- SRT helpers ---

export function formatSrtTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec - Math.floor(sec)) * 1000);
  return `${pad2(h)}:${pad2(m)}:${pad2(s)},${pad3(ms)}`;
}

export function parseSrtTime(str: string): number {
  const m = str.match(/^(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})$/);
  if (!m) return 0;
  return (
    parseInt(m[1], 10) * 3600 +
    parseInt(m[2], 10) * 60 +
    parseInt(m[3], 10) +
    parseInt(m[4], 10) / 1000
  );
}

function pad2(n: number): string {
  return n < 10 ? "0" + n : String(n);
}
function pad3(n: number): string {
  return n < 10 ? "00" + n : n < 100 ? "0" + n : String(n);
}

/**
 * Walks an SRT and shifts every timestamp from the compact (post-VAD) timeline
 * back to the original audio's timeline using the SilenceMap. Leaves the body
 * text untouched. No-op when the map has no cuts.
 */
export function expandSrtTimestamps(srt: string, map: SilenceMap): string {
  if (map.cuts.length === 0) return srt;
  return srt
    .replace(/\r/g, "")
    .split(/\n\n+/)
    .map((entry) => {
      const lines = entry.split("\n");
      let i = 0;
      if (/^\d+$/.test((lines[0] ?? "").trim())) i = 1;
      const tm = (lines[i] ?? "").match(
        /^(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})(.*)$/
      );
      if (!tm) return entry;
      const start = mapCompactToOriginal(parseSrtTime(tm[1]), map);
      const end = mapCompactToOriginal(parseSrtTime(tm[2]), map);
      lines[i] = `${formatSrtTime(start)} --> ${formatSrtTime(end)}${tm[3]}`;
      return lines.join("\n");
    })
    .join("\n\n");
}

/**
 * Same as expandSrtTimestamps but operates on a DiarizedResponse — shifts
 * each segment's start/end while preserving text and speaker labels.
 */
function expandDiarizedTimestamps(
  json: DiarizedResponse,
  map: SilenceMap
): DiarizedResponse {
  if (map.cuts.length === 0) return json;
  return {
    ...json,
    segments: (json.segments ?? []).map((seg) => ({
      ...seg,
      start: mapCompactToOriginal(seg.start, map),
      end: mapCompactToOriginal(seg.end, map),
    })),
  };
}

/**
 * Returns the last `count` sentences from an SRT, joined with spaces.
 * Used as Whisper context prompt to bridge chunk boundaries — improves
 * continuity and reduces speaker/topic confusion at the cut.
 */
function lastSentencesFromSrt(srt: string, count: number): string {
  const text = srt
    .replace(/\r/g, "")
    .split(/\n\n+/)
    .map((entry) => {
      const lines = entry.split("\n");
      let i = 0;
      if (/^\d+$/.test((lines[0] ?? "").trim())) i = 1;
      if (/-->/.test(lines[i] ?? "")) i++;
      return lines.slice(i).join(" ").trim();
    })
    .filter(Boolean)
    .join(" ");
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  return sentences.slice(-count).join(" ").trim().slice(0, 800);
}

/**
 * Merges SRT texts from sequential chunks. Offsets each chunk's timestamps
 * by `i * chunkSec` and renumbers entries globally.
 */
export function mergeSrts(srts: string[], chunkSec: number): string {
  const out: string[] = [];
  let globalIndex = 1;
  srts.forEach((srt, i) => {
    const offset = i * chunkSec;
    const entries = srt
      .replace(/\r/g, "")
      .trim()
      .split(/\n\n+/);
    for (const entry of entries) {
      const lines = entry.split("\n");
      if (lines.length < 2) continue;
      let timeLineIdx = 0;
      if (/^\d+$/.test(lines[0].trim())) timeLineIdx = 1;
      const timeLine = lines[timeLineIdx];
      const tm = timeLine.match(
        /^(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})/
      );
      if (!tm) continue;
      const start = parseSrtTime(tm[1]) + offset;
      const end = parseSrtTime(tm[2]) + offset;
      const text = lines.slice(timeLineIdx + 1).join("\n").trim();
      out.push(
        `${globalIndex}\n${formatSrtTime(start)} --> ${formatSrtTime(end)}\n${text}`
      );
      globalIndex++;
    }
  });
  return out.join("\n\n") + "\n";
}

// --- diarized_json → SRT/MD ---

function normalizeSpeaker(raw: string | undefined): string {
  if (!raw) return "Speaker ?";
  if (/^[A-Z]$/.test(raw)) return `Speaker ${raw}`;
  const num = raw.match(/^speaker[_-]?(\d+)$/i);
  if (num) return `Speaker ${parseInt(num[1], 10) + 1}`;
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function diarizedToSrt(json: DiarizedResponse): string {
  const segs = json.segments ?? [];
  if (segs.length === 0) {
    return json.text
      ? `1\n00:00:00,000 --> 00:00:00,000\n${json.text.trim()}\n`
      : "";
  }
  const lines: string[] = [];
  segs.forEach((seg, i) => {
    const label = normalizeSpeaker(seg.speaker);
    const text = (seg.text ?? "").trim();
    lines.push(
      `${i + 1}\n${formatSrtTime(seg.start)} --> ${formatSrtTime(seg.end)}\n[${label}] ${text}`
    );
  });
  return lines.join("\n\n") + "\n";
}

function diarizedToMd(json: DiarizedResponse): string {
  const segs = json.segments ?? [];
  if (segs.length === 0) return (json.text ?? "").trim();

  const blocks: { speaker: string; text: string }[] = [];
  for (const seg of segs) {
    const speaker = normalizeSpeaker(seg.speaker);
    const text = (seg.text ?? "").trim();
    if (!text) continue;
    const last = blocks[blocks.length - 1];
    if (last && last.speaker === speaker) {
      last.text += " " + text;
    } else {
      blocks.push({ speaker, text });
    }
  }
  return blocks.map((b) => `**${b.speaker}:** ${b.text}`).join("\n\n");
}
