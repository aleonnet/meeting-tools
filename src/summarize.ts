import { Notice, requestUrl, TFile } from "obsidian";
import type MeetingToolsPlugin from "./main";
import {
  ContextResult,
  srtToPlainText,
  insertAtCursor,
  insertAfterContext,
  nowParts,
} from "./file-utils";
import { PreviewModal } from "./modals";
import { TranscriptSuggestModal } from "./modals";
import { summaryPrompt } from "./prompts";

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

export async function summarizeTranscript(
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

  // If context provided (cenário 1 ou 2), use it directly
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

  const wc = plain.trim().split(/\s+/).filter(Boolean).length;

  let summary: string;

  if (wc < settings.minWordsForSummary) {
    summary = `**1. Resumo Executivo**
- Transcrição curta; conteúdo insuficiente para síntese.

**2. Principais Itens de Ação/Compromissos para ${settings.userName}**
- Não mencionado

**3. Detalhamento por Tópico**
- Não mencionado`;
  } else {
    new Notice("Gerando resumo…");
    summary = await openaiChat(
      apiKey,
      settings.summaryModel,
      summaryPrompt(settings.userName),
      `Transcrição:\n"""${plain.slice(-120000)}"""`
    );
  }

  if (!summary) {
    new Notice("Resumo vazio.");
    return;
  }

  let finalText = summary;

  if (settings.showPreview) {
    const modal = new PreviewModal(app, "Preview do Resumo", finalText);
    modal.open();
    const result = await modal.waitForResult();
    if (result === null) return;
    finalText = result;
  }

  const inserted = context
    ? insertAfterContext(app, finalText, context)
    : insertAtCursor(app, finalText);
  if (inserted) new Notice("Resumo inserido.");
}
