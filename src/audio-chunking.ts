// Universal audio chunking via Web Audio API — works in Electron (desktop) and
// Obsidian mobile WebView. No ffmpeg, no child_process.

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
  // We only need AudioContext to construct new AudioBuffers via createBuffer.
  // Create once, reuse.
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
 * Encodes a mono/stereo AudioBuffer as 16-bit PCM WAV.
 * Output size: 44 + samples * channels * 2 bytes.
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

  // RIFF header
  writeString(dv, 0, "RIFF");
  dv.setUint32(4, totalSize - 8, true);
  writeString(dv, 8, "WAVE");

  // fmt chunk
  writeString(dv, 12, "fmt ");
  dv.setUint32(16, 16, true); // fmt size
  dv.setUint16(20, 1, true); // PCM
  dv.setUint16(22, channels, true);
  dv.setUint32(24, sampleRate, true);
  dv.setUint32(28, byteRate, true);
  dv.setUint16(32, blockAlign, true);
  dv.setUint16(34, 16, true); // bits per sample

  // data chunk
  writeString(dv, 36, "data");
  dv.setUint32(40, dataSize, true);

  // interleaved PCM16
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
