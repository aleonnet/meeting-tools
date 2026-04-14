import { Notice, requestUrl, TFile } from "obsidian";
import type MeetingToolsPlugin from "./main";
import { baseName, ensureFolder, srtToPlainText } from "./file-utils";

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

export interface TranscribeResult {
  srtPath: string;
  mdPath: string | null;
}

export async function transcribeAudio(
  plugin: MeetingToolsPlugin,
  audioPath: string
): Promise<TranscribeResult | null> {
  const { app, settings } = plugin;
  const apiKey = plugin.getApiKey();
  if (!apiKey) {
    new Notice("Configure a OpenAI API Key.");
    return null;
  }

  const file = app.vault.getAbstractFileByPath(audioPath);
  if (!file || !(file instanceof TFile)) {
    new Notice("Áudio não encontrado: " + audioPath);
    return null;
  }

  new Notice("Gerando transcrição (whisper-1)…");

  const ext = (file.extension || "").toLowerCase();
  const mime = MIME_BY_EXT[ext] || "application/octet-stream";
  const buf = await (app.vault.adapter as any).readBinary(audioPath);

  if (buf.byteLength > 25 * 1024 * 1024) {
    new Notice(`Arquivo de áudio excede 25MB (${(buf.byteLength / 1024 / 1024).toFixed(1)}MB). Importe novamente para comprimir.`);
    return null;
  }

  const blob = new Blob([buf], { type: mime });

  const form = new FormData();
  form.append("file", blob, file.name);
  form.append("model", "whisper-1");
  form.append("response_format", "srt");
  form.append("temperature", "0");
  form.append("prompt", WHISPER_HALLUCINATION_PROMPT);

  const resp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: "Bearer " + apiKey },
    body: form,
  });

  if (!resp.ok) {
    const err = await resp.text().catch(() => "(no body)");
    console.error("[MeetingTools] SRT error:", err);
    new Notice("Falha ao gerar SRT.");
    return null;
  }

  const srtText = await resp.text();

  // Save .srt
  await ensureFolder(app, settings.transcriptsDir);
  const srtPath = `${settings.transcriptsDir}/${baseName(audioPath)}.srt`;
  const existingSrt = app.vault.getAbstractFileByPath(srtPath);
  if (existingSrt instanceof TFile) {
    await app.vault.modify(existingSrt, srtText);
  } else {
    await app.vault.create(srtPath, srtText);
  }
  new Notice("SRT salvo: " + srtPath);

  // Generate .md from .srt
  let mdPath: string | null = null;
  if (settings.generateMdFromSrt) {
    const clean = srtToPlainText(srtText);
    const header = `# Transcrição\n\n![[${audioPath}]]\n\n`;
    const body = clean || "_(SRT vazio ou inválido)_";
    mdPath = `${settings.transcriptsDir}/${baseName(audioPath)}.md`;
    const existingMd = app.vault.getAbstractFileByPath(mdPath);
    if (existingMd instanceof TFile) {
      await app.vault.modify(existingMd, header + body);
    } else {
      await app.vault.create(mdPath, header + body);
    }
    new Notice("MD salvo: " + mdPath);
  }

  return { srtPath, mdPath };
}
