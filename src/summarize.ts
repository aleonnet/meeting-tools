import { Notice, requestUrl, TFile } from "obsidian";
import type MeetingToolsPlugin from "./main";
import {
  ContextResult,
  srtToPlainText,
  insertAtCursor,
  insertAfterContext,
  showApiKeyMissingNotice,
} from "./file-utils";
import { PreviewModal } from "./modals";
import { TranscriptSuggestModal } from "./modals";
import { TASK_FORMAT_SPEC } from "./prompts";
import {
  findArtifactById,
  getArtifactContent,
} from "./vault-templates";
import { loadTemplate, substitute } from "./templates";
import { resolveLanguageInstruction, t } from "./i18n";
import { buildTaskContextPreamble, detectMeetingContext } from "./task-context";
import { parseOpenAIError } from "./openai-errors";

async function openaiChat(
  apiKey: string,
  model: string,
  system: string,
  user: string
): Promise<string> {
  let res;
  try {
    res = await requestUrl({
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
      throw: false,
    });
  } catch (e) {
    const err = parseOpenAIError(null, e);
    console.error("[MeetingTools] OpenAI network error:", err);
    new Notice(err.friendly, 10000);
    throw new Error(err.code ?? "network_error");
  }
  if (res.status >= 400 || res.json?.error) {
    const err = parseOpenAIError({ status: res.status, json: res.json, text: res.text });
    console.error("[MeetingTools] OpenAI error:", err);
    new Notice(err.friendly, 10000);
    throw new Error(err.code ?? "openai_error");
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
    showApiKeyMissingNotice(plugin);
    return;
  }

  let plain: string;

  if (context) {
    plain = context.text;
  } else if (transcriptPath) {
    const file = app.vault.getAbstractFileByPath(transcriptPath);
    if (!file || !(file instanceof TFile)) {
      new Notice(t().noticeFileNotFound(transcriptPath));
      return;
    }
    const raw = await app.vault.read(file);
    const ext = (file.extension || "").toLowerCase();
    plain = ext === "srt" ? srtToPlainText(raw) : raw;
  } else {
    const path = await new Promise<string | null>((resolve) => {
      new TranscriptSuggestModal(app, settings.transcriptsDir, (p) =>
        resolve(p)
      ).open();
    });
    if (!path) return;
    const file = app.vault.getAbstractFileByPath(path);
    if (!file || !(file instanceof TFile)) {
      new Notice(t().noticeFileNotFound(path));
      return;
    }
    const raw = await app.vault.read(file);
    const ext = (file.extension || "").toLowerCase();
    plain = ext === "srt" ? srtToPlainText(raw) : raw;
  }

  const wc = plain.trim().split(/\s+/).filter(Boolean).length;

  let summary: string;

  if (wc < settings.minWordsForSummary) {
    summary = t().summaryShortFallback(settings.userName);
  } else {
    new Notice(t().noticeGeneratingSummary);
    const summaryArtifact = findArtifactById("summary-template");
    const embeddedDefault = summaryArtifact
      ? getArtifactContent(summaryArtifact)
      : "";
    const tpl = await loadTemplate(
      app,
      settings.summaryTemplatePath,
      embeddedDefault
    );
    const meetingContext = detectMeetingContext(plugin);
    const system = substitute(tpl, {
      language_instruction: resolveLanguageInstruction(settings.outputLanguage),
      user_name: settings.userName,
      task_context: buildTaskContextPreamble(meetingContext),
      task_format_spec: TASK_FORMAT_SPEC,
      transcript: plain.slice(-120000),
    });
    summary = await openaiChat(apiKey, settings.summaryModel, system, "");
  }

  if (!summary) {
    new Notice(t().noticeSummaryEmpty);
    return;
  }

  let finalText = summary;

  if (settings.showPreview) {
    const modal = new PreviewModal(app, t().modalPreview, finalText);
    modal.open();
    const result = await modal.waitForResult();
    if (result === null) return;
    finalText = result;
  }

  const inserted = context
    ? insertAfterContext(app, finalText, context)
    : insertAtCursor(app, finalText);
  if (inserted) new Notice(t().noticeSummaryInserted);
}
