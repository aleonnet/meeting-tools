// Universal audio chunking via Web Audio API + WebCodecs.
// Works in Electron (desktop) and Obsidian mobile WebView. No ffmpeg, no native deps.

import { Muxer, ArrayBufferTarget } from "webm-muxer";

/**
 * Decodes a compressed audio Blob (webm/m4a/mp3/etc) into a mono AudioBuffer
 * at targetSampleRate. Using OfflineAudioContext with a tiny output buffer
 * triggers decodeAudioData to perform resampling + channel downmix during
 * decode, so we never hold the original stereo/48kHz PCM in memory.
 */
export async function decodeAudioToBuffer(
  blob: Blob,
  targetSampleRate = 16000
): Promise<AudioBuffer> {
  const arrayBuffer = await blob.arrayBuffer();
  const OfflineCtx =
    (window as any).OfflineAudioContext ||
    (window as any).webkitOfflineAudioContext;
  if (!OfflineCtx) throw new Error("OfflineAudioContext não disponível");
  const ctx = new OfflineCtx(1, 1, targetSampleRate);
  return await ctx.decodeAudioData(arrayBuffer);
}

/**
 * Slices an AudioBuffer into consecutive chunks of chunkSec seconds each.
 * Last chunk may be shorter. Pure temporal split, no fade/crossfade.
 */
export function sliceBufferToChunks(
  buffer: AudioBuffer,
  chunkSec: number
): AudioBuffer[] {
  const sampleRate = buffer.sampleRate;
  const channels = buffer.numberOfChannels;
  const samplesPerChunk = Math.floor(chunkSec * sampleRate);
  const total = buffer.length;
  const chunks: AudioBuffer[] = [];

  const AudioCtx =
    (window as any).AudioContext || (window as any).webkitAudioContext;
  const tmpCtx = new AudioCtx();

  try {
    for (let start = 0; start < total; start += samplesPerChunk) {
      const length = Math.min(samplesPerChunk, total - start);
      const out = tmpCtx.createBuffer(channels, length, sampleRate);
      for (let ch = 0; ch < channels; ch++) {
        const src = buffer.getChannelData(ch).subarray(start, start + length);
        out.copyToChannel(src, ch, 0);
      }
      chunks.push(out);
    }
  } finally {
    if (typeof tmpCtx.close === "function") tmpCtx.close();
  }

  return chunks;
}

/**
 * Records every silence range that was removed from the original audio.
 * Each cut is anchored to its position in the COMPACT (post-VAD) timeline,
 * with the duration that was removed at that point. Used to expand SRT
 * timestamps back to the original audio's timeline.
 *
 * Cuts are stored in ascending order of `atCompactSec` so that
 * mapCompactToOriginal can stop iterating as soon as it passes the query.
 */
export interface SilenceMap {
  cuts: Array<{ atCompactSec: number; removedSec: number }>;
}

/**
 * Detects and removes silences longer than `minSilenceSec` from a mono
 * AudioBuffer using a simple RMS-per-window energy detector. Returns a new
 * compact buffer plus a SilenceMap that lets callers reconstruct original
 * timestamps for any time in the compact buffer.
 *
 * Algorithm:
 *   - Slide a 20ms analysis window across the buffer; compute RMS in dBFS.
 *   - Mark a window as silent when its level is below `thresholdDb`.
 *   - Group consecutive silent windows into ranges.
 *   - For ranges longer than `minSilenceSec`, keep only `keepMarginSec` at
 *     each end (preserves natural breath/word boundaries) and drop the middle.
 *
 * Channels: assumes mono. If the input has multiple channels, the silence
 * detection uses channel 0 only — sufficient given decodeAudioToBuffer
 * already targets mono (16 kHz).
 */
export function removeSilence(
  buffer: AudioBuffer,
  minSilenceSec = 2,
  thresholdDb = -50,
  keepMarginSec = 0.2
): { buffer: AudioBuffer; map: SilenceMap } {
  const sampleRate = buffer.sampleRate;
  const channels = buffer.numberOfChannels;
  const total = buffer.length;
  const windowSamples = Math.max(1, Math.floor(0.02 * sampleRate)); // 20ms
  const thresholdAmp = Math.pow(10, thresholdDb / 20);
  const minSilenceSamples = Math.floor(minSilenceSec * sampleRate);
  const marginSamples = Math.floor(keepMarginSec * sampleRate);

  const data0 = buffer.getChannelData(0);

  // Identify silent ranges (in samples). Energy detection is non-destructive;
  // we only mark spans here, then build the keep-list in a second pass.
  const silentRanges: Array<{ start: number; end: number }> = [];
  let runStart = -1;

  for (let i = 0; i + windowSamples <= total; i += windowSamples) {
    let sumSq = 0;
    for (let j = 0; j < windowSamples; j++) {
      const s = data0[i + j];
      sumSq += s * s;
    }
    const rms = Math.sqrt(sumSq / windowSamples);
    const isSilent = rms < thresholdAmp;
    if (isSilent && runStart < 0) {
      runStart = i;
    } else if (!isSilent && runStart >= 0) {
      silentRanges.push({ start: runStart, end: i });
      runStart = -1;
    }
  }
  if (runStart >= 0) silentRanges.push({ start: runStart, end: total });

  // Build keep-segments (sample ranges that survive). For each long silence,
  // keep `marginSamples` at each end and drop the middle.
  const keepSegments: Array<{ start: number; end: number }> = [];
  let cursor = 0;

  for (const r of silentRanges) {
    const len = r.end - r.start;
    if (len <= minSilenceSamples) continue;
    const keepStart = Math.min(r.end, r.start + marginSamples);
    const keepEnd = Math.max(r.start, r.end - marginSamples);
    if (keepEnd <= keepStart) continue;
    // Keep [cursor, keepStart) (audio + leading margin), then drop [keepStart, keepEnd).
    if (keepStart > cursor) {
      keepSegments.push({ start: cursor, end: keepStart });
    }
    cursor = keepEnd;
  }
  if (cursor < total) keepSegments.push({ start: cursor, end: total });

  // Concatenate keep segments into a new buffer and build the SilenceMap.
  const compactLen = keepSegments.reduce((a, s) => a + (s.end - s.start), 0);

  const AudioCtx =
    (window as any).AudioContext || (window as any).webkitAudioContext;
  const tmpCtx = new AudioCtx();
  let out: AudioBuffer;
  try {
    out = tmpCtx.createBuffer(channels, Math.max(1, compactLen), sampleRate);
    for (let ch = 0; ch < channels; ch++) {
      const dest = new Float32Array(compactLen);
      let writePos = 0;
      const src = buffer.getChannelData(ch);
      for (const seg of keepSegments) {
        const slice = src.subarray(seg.start, seg.end);
        dest.set(slice, writePos);
        writePos += slice.length;
      }
      out.copyToChannel(dest, ch, 0);
    }
  } finally {
    if (typeof tmpCtx.close === "function") tmpCtx.close();
  }

  // Build the compact-to-original timeline mapping. Walk keep-segments in
  // order; the gap between two consecutive segments equals the removed slice.
  const cuts: SilenceMap["cuts"] = [];
  let compactPos = 0;
  for (let i = 0; i < keepSegments.length - 1; i++) {
    const seg = keepSegments[i];
    const nextSeg = keepSegments[i + 1];
    compactPos += seg.end - seg.start;
    const removedSamples = nextSeg.start - seg.end;
    if (removedSamples > 0) {
      cuts.push({
        atCompactSec: compactPos / sampleRate,
        removedSec: removedSamples / sampleRate,
      });
    }
  }

  return { buffer: out, map: { cuts } };
}

/**
 * Maps a timestamp from the compact (post-VAD) timeline back to the original
 * audio timeline. Adds the duration of every cut that occurred at or before
 * the given compact time.
 */
export function mapCompactToOriginal(
  compactSec: number,
  map: SilenceMap
): number {
  let original = compactSec;
  for (const cut of map.cuts) {
    if (cut.atCompactSec <= compactSec) {
      original += cut.removedSec;
    } else {
      break;
    }
  }
  return original;
}

/**
 * True when WebCodecs AudioEncoder + AudioData are available.
 * Required by encodeOpus. Available in Electron (desktop Obsidian),
 * Safari 26+ (iOS Obsidian recent), and Chrome WebView (Android Obsidian).
 */
export function isOpusEncodingSupported(): boolean {
  const w = window as any;
  return typeof w.AudioEncoder !== "undefined" &&
    typeof w.AudioData !== "undefined";
}

/**
 * Encodes an AudioBuffer as Opus inside a WebM container, via WebCodecs.
 * Output size for speech-typical bitrate (24 kbps mono): ~180 KB/min.
 *
 * Throws if WebCodecs AudioEncoder is not available — caller should check
 * isOpusEncodingSupported() first and fall back to encodeWav16 if needed.
 */
export async function encodeOpus(
  buffer: AudioBuffer,
  bitrate = 24000
): Promise<Blob> {
  if (!isOpusEncodingSupported()) {
    throw new Error("WebCodecs AudioEncoder não disponível neste ambiente");
  }

  const sampleRate = buffer.sampleRate;
  const numberOfChannels = buffer.numberOfChannels;

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    audio: {
      codec: "A_OPUS",
      numberOfChannels,
      sampleRate,
    },
  });

  let encoderError: Error | null = null;

  const w = window as any;
  const encoder = new w.AudioEncoder({
    output: (chunk: any, meta: any) => muxer.addAudioChunk(chunk, meta),
    error: (e: Error) => {
      encoderError = e;
    },
  });

  encoder.configure({
    codec: "opus",
    sampleRate,
    numberOfChannels,
    bitrate,
  });

  // Stream the buffer to the encoder in 1-second segments.
  // Avoids holding gigantic interleaved Float32 arrays for long buffers.
  const segmentSec = 1;
  const samplesPerSegment = Math.floor(segmentSec * sampleRate);
  const total = buffer.length;
  let timestampUs = 0;

  for (let start = 0; start < total; start += samplesPerSegment) {
    const length = Math.min(samplesPerSegment, total - start);
    const interleaved = new Float32Array(length * numberOfChannels);
    for (let ch = 0; ch < numberOfChannels; ch++) {
      const src = buffer.getChannelData(ch).subarray(start, start + length);
      if (numberOfChannels === 1) {
        interleaved.set(src, 0);
      } else {
        for (let i = 0; i < length; i++) {
          interleaved[i * numberOfChannels + ch] = src[i];
        }
      }
    }

    const audioData = new w.AudioData({
      format: "f32",
      sampleRate,
      numberOfChannels,
      numberOfFrames: length,
      timestamp: timestampUs,
      data: interleaved,
    });
    encoder.encode(audioData);
    audioData.close();

    timestampUs += Math.round((length / sampleRate) * 1_000_000);
  }

  await encoder.flush();
  encoder.close();

  if (encoderError) throw encoderError;

  muxer.finalize();
  return new Blob([(muxer.target as ArrayBufferTarget).buffer], {
    type: "audio/webm",
  });
}

/**
 * Encodes a mono/stereo AudioBuffer as 16-bit PCM WAV.
 * Output size: 44 + samples * channels * 2 bytes.
 *
 * Kept as a fallback for environments without WebCodecs (legacy mobile
 * WebViews on iOS < 16.4). Inflation is severe (~1.83 MB/min mono @16kHz),
 * so chunks must be ≤ ~13 min to fit OpenAI's 25 MB upload limit.
 */
export function encodeWav16(buffer: AudioBuffer): Blob {
  const channels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const samples = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples * blockAlign;
  const totalSize = 44 + dataSize;

  const ab = new ArrayBuffer(totalSize);
  const dv = new DataView(ab);

  writeString(dv, 0, "RIFF");
  dv.setUint32(4, totalSize - 8, true);
  writeString(dv, 8, "WAVE");

  writeString(dv, 12, "fmt ");
  dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true);
  dv.setUint16(22, channels, true);
  dv.setUint32(24, sampleRate, true);
  dv.setUint32(28, byteRate, true);
  dv.setUint16(32, blockAlign, true);
  dv.setUint16(34, 16, true);

  writeString(dv, 36, "data");
  dv.setUint32(40, dataSize, true);

  const channelData: Float32Array[] = [];
  for (let ch = 0; ch < channels; ch++) channelData.push(buffer.getChannelData(ch));

  let offset = 44;
  for (let i = 0; i < samples; i++) {
    for (let ch = 0; ch < channels; ch++) {
      let s = channelData[ch][i];
      if (s > 1) s = 1;
      else if (s < -1) s = -1;
      dv.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([ab], { type: "audio/wav" });
}

function writeString(dv: DataView, offset: number, s: string): void {
  for (let i = 0; i < s.length; i++) dv.setUint8(offset + i, s.charCodeAt(i));
}
