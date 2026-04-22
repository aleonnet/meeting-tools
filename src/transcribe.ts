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
  encodeWav16,
  sliceBufferToChunks,
} from "./audio-chunking";
import type { TranscriptionModel } from "./settings";
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

// Hard limit reported by gpt-4o-transcribe-diarize API in 2026-04-14:
// "audio duration 4489.2 seconds is longer than 1400 seconds..."
const DIARIZE_MAX_SEC = 1400;

// 25MB limit is an OpenAI-wide constraint on the audio upload endpoint.
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

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
  const mode = resolveMode(settings.transcriptionModel, durationSec);

  await ensureFolder(app, settings.transcriptsDir);

  let srtText: string;
  let mdBody: string;
  let modelLabel: string;

  try {
    if (mode === "whisper-chunked") {
      modelLabel = "whisper-1 (chunked)";
      new Notice(t().noticeTranscribingWith(modelLabel));
      const result = await transcribeWhisperChunked(
        plugin,
        apiKey,
        blob,
        settings.chunkDurationMin
      );
      srtText = result.srt;
      mdBody = srtToPlainText(srtText) || t().transcriptEmptyMarker;
    } else if (mode === "diarize-single") {
      modelLabel = "gpt-4o-transcribe-diarize";
      new Notice(t().noticeTranscribingWith(modelLabel));
      const json = await postDiarize(apiKey, blob, file.name);
      srtText = diarizedToSrt(json);
      mdBody = diarizedToMd(json) || "_(transcrição vazia)_";
    } else if (mode === "diarize-chunked") {
      modelLabel = "gpt-4o-transcribe-diarize (chunked)";
      new Notice(t().noticeTranscribingWith(modelLabel));
      const merged = await transcribeDiarizeChunked(
        plugin,
        apiKey,
        blob,
        settings.chunkDurationMin
      );
      srtText = diarizedToSrt(merged);
      mdBody = diarizedToMd(merged) || "_(transcrição vazia)_";
    } else {
      // whisper-single: only used when user explicitly picks whisper-1 and
      // file already fits a single call. For simplicity we still go through
      // the chunked path (1 chunk) — guarantees consistent behavior.
      modelLabel = "whisper-1";
      new Notice(t().noticeTranscribingWith(modelLabel));
      if (buf.byteLength > MAX_UPLOAD_BYTES) {
        new Notice(
          t().noticeFileExceedsLimit((buf.byteLength / 1024 / 1024).toFixed(1))
        );
        return null;
      }
      srtText = await postWhisper(apiKey, blob, file.name);
      mdBody = srtToPlainText(srtText) || t().transcriptEmptyMarker;
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

// --- mode resolution ---

type Mode =
  | "whisper-chunked"
  | "whisper-single"
  | "diarize-single"
  | "diarize-chunked";

function resolveMode(
  setting: TranscriptionModel,
  durationSec: number | null
): Mode {
  // When duration detection fails, assume long to be safe (forces chunking).
  const duration = durationSec ?? Infinity;

  if (setting === "whisper-1") return "whisper-chunked";
  if (setting === "gpt-4o-transcribe-diarize") {
    return duration > DIARIZE_MAX_SEC ? "diarize-chunked" : "diarize-single";
  }
  // auto
  return duration > DIARIZE_MAX_SEC ? "whisper-chunked" : "diarize-single";
}

// --- whisper single-call (used for explicit whisper-1 override on short audio) ---

async function postWhisper(
  apiKey: string,
  blob: Blob,
  fileName: string
): Promise<string> {
  const form = new FormData();
  form.append("file", blob, fileName);
  form.append("model", "whisper-1");
  form.append("response_format", "srt");
  form.append("temperature", "0");
  form.append("prompt", WHISPER_HALLUCINATION_PROMPT);

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
  plugin: MeetingToolsPlugin,
  apiKey: string,
  blob: Blob,
  chunkDurationMin: number
): Promise<{ srt: string }> {
  const chunks = await prepareChunks(blob, chunkDurationMin);
  const chunkSec = chunkDurationMin * 60;
  const srts: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    new Notice(t().noticeTranscribingChunk(i + 1, chunks.length));
    try {
      const srt = await postWithRetry(async () =>
        postWhisper(apiKey, chunks[i], `chunk-${i + 1}.wav`)
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
  plugin: MeetingToolsPlugin,
  apiKey: string,
  blob: Blob,
  chunkDurationMin: number
): Promise<DiarizedResponse> {
  const chunks = await prepareChunks(blob, chunkDurationMin);
  const chunkSec = chunkDurationMin * 60;
  const allSegments: DiarizedSegment[] = [];
  let fullText = "";

  for (let i = 0; i < chunks.length; i++) {
    new Notice(t().noticeTranscribingChunk(i + 1, chunks.length));
    try {
      const json = await postWithRetry(async () =>
        postDiarize(apiKey, chunks[i], `chunk-${i + 1}.wav`)
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

async function prepareChunks(
  blob: Blob,
  chunkDurationMin: number
): Promise<Blob[]> {
  const buffer = await decodeAudioToBuffer(blob, 16000);
  const audioChunks = sliceBufferToChunks(buffer, chunkDurationMin * 60);
  const wavChunks = audioChunks.map((b) => encodeWav16(b));
  for (const w of wavChunks) {
    if (w.size > MAX_UPLOAD_BYTES) {
      throw new Error(
        `Chunk excede 25MB (${(w.size / 1024 / 1024).toFixed(1)}MB). Reduza Chunk duration.`
      );
    }
  }
  return wavChunks;
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
      // Detect format: "N\nHH:MM:SS,mmm --> ..." or missing index
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
