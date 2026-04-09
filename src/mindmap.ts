import { Notice, requestUrl, TFile } from "obsidian";
import type MeetingToolsPlugin from "./main";
import {
  ContextResult,
  srtToPlainText,
  insertAtCursor,
  insertAfterContext,
  nowParts,
} from "./file-utils";
import { PreviewModal, TranscriptSuggestModal } from "./modals";
import { MINDMAP_PROMPT } from "./prompts";

function sanitizeMindmapLabels(text: string): string {
  if (!text) return "";
  let t = text
    .replace(/\r/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/[–—]/g, "-");
  t = t.replace(/[:]/g, " - ").replace(/[\[\]\(\)]/g, "");
  t = t
    .split("\n")
    .map((line) => {
      const m = line.match(/^(\s*)(.*)$/);
      if (!m) return line;
      const indent = m[1] || "";
      const label = (m[2] || "")
        .replace(/[ \t]{2,}/g, " ")
        .replace(/[ \t]+$/, "");
      return indent + label;
    })
    .join("\n");
  return t.trim();
}

function toMermaidMindmap(raw: string): string {
  if (!raw) return fallbackMermaidMindmap();
  let inner = raw;
  const mMer = raw.match(/^```mermaid[^\n]*\n([\s\S]*?)\n```$/i);
  const mMM = raw.match(/^```mindmap[^\n]*\n([\s\S]*?)\n```$/i);
  if (mMer) inner = mMer[1];
  else if (mMM) inner = mMM[1];
  inner = sanitizeMindmapLabels(inner);
  const lines = inner.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0 || !/^mindmap\s*$/i.test(lines[0]))
    lines.unshift("mindmap");
  const body = lines.join("\n");
  return "```mermaid\n" + body + "\n```";
}

function fallbackMermaidMindmap(): string {
  return "```mermaid\nmindmap\n  Reunião\n    Sem dados suficientes\n```";
}

async function openaiChat(
  apiKey: string,
  model: string,
  system: string,
  user: string
): Promise<string> {
  const res = await requestUrl({
    url: "https://api.openai.com/v1/chat/completions",
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.0,
      top_p: 1,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (res.status !== 200 || res.json?.error) {
    console.error("[MeetingTools] OpenAI error:", res.json?.error || res);
    throw new Error("Falha na chamada OpenAI.");
  }
  return res.json?.choices?.[0]?.message?.content ?? "";
}

export async function generateMindmap(
  plugin: MeetingToolsPlugin,
  transcriptPath?: string,
  context?: ContextResult
): Promise<void> {
  const { app, settings } = plugin;
  const apiKey = plugin.getApiKey();
  if (!apiKey) {
    new Notice("Configure a OpenAI API Key nas settings do Meeting Tools.");
    return;
  }

  let plain: string;

  if (context) {
    plain = context.text;
  } else if (transcriptPath) {
    const file = app.vault.getAbstractFileByPath(transcriptPath);
    if (!file || !(file instanceof TFile)) {
      new Notice("Arquivo não encontrado: " + transcriptPath);
      return;
    }
    const raw = await app.vault.read(file);
    const ext = (file.extension || "").toLowerCase();
    plain = ext === "srt" ? srtToPlainText(raw) : raw;
  } else {
    // Fallback: open fuzzy modal
    const path = await new Promise<string | null>((resolve) => {
      new TranscriptSuggestModal(app, settings.transcriptsDir, (p) =>
        resolve(p)
      ).open();
    });
    if (!path) return;
    const file = app.vault.getAbstractFileByPath(path);
    if (!file || !(file instanceof TFile)) {
      new Notice("Arquivo não encontrado: " + path);
      return;
    }
    const raw = await app.vault.read(file);
    const ext = (file.extension || "").toLowerCase();
    plain = ext === "srt" ? srtToPlainText(raw) : raw;
  }

  new Notice("Gerando mindmap…");
  let out = await openaiChat(
    apiKey,
    settings.mindmapModel,
    MINDMAP_PROMPT,
    `Transcrição:\n"""${plain.slice(-120000)}"""`
  );

  out = toMermaidMindmap(out);
  if (!out || out.trim().length < 16) out = fallbackMermaidMindmap();

  let finalText = out;

  if (settings.showPreview) {
    const modal = new PreviewModal(app, "Preview do Mindmap", finalText);
    modal.open();
    const result = await modal.waitForResult();
    if (result === null) return;
    finalText = result;
  }

  const inserted = context
    ? insertAfterContext(app, finalText, context)
    : insertAtCursor(app, finalText);
  if (inserted) new Notice("Mapa mental inserido.");
}
