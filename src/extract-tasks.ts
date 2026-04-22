import { Notice, TFile, TFolder, requestUrl } from "obsidian";
import type MeetingToolsPlugin from "./main";
import {
  ContextResult,
  insertAtCursor,
  insertAfterContext,
  showApiKeyMissingNotice,
} from "./file-utils";
import { PreviewModal } from "./modals";
import { EXTRACT_TASKS_PROMPT } from "./prompts";
import { resolveLanguageInstruction, t } from "./i18n";
import { buildTaskContextPreamble, detectMeetingContext } from "./task-context";
import { parseOpenAIError } from "./openai-errors";

function resolveProjectLinks(plugin: MeetingToolsPlugin, text: string): string {
  const app = plugin.app;
  const projectsFolder = app.vault.getAbstractFileByPath("Vault/Projects");
  if (!projectsFolder || !(projectsFolder instanceof TFolder)) return text;

  const projectFiles = projectsFolder.children
    .filter((f): f is TFile => f instanceof TFile && f.extension === "md")
    .map((f) => f.basename);

  return text.replace(/\[\[([^\]]+)\]\]/g, (match, name) => {
    if (projectFiles.includes(name)) return match;
    const lower = name.toLowerCase();
    const exactCI = projectFiles.find((p) => p.toLowerCase() === lower);
    if (exactCI) return `[[${exactCI}]]`;
    const fuzzy = projectFiles.find(
      (p) => p.toLowerCase().includes(lower) || lower.includes(p.toLowerCase())
    );
    if (fuzzy) return `[[${fuzzy}]]`;
    return match;
  });
}

export async function extractTasks(
  plugin: MeetingToolsPlugin,
  inputText?: string,
  context?: ContextResult
): Promise<void> {
  const apiKey = plugin.getApiKey();
  if (!apiKey) {
    showApiKeyMissingNotice(plugin);
    return;
  }

  if (!inputText) {
    new Notice(t().noticeNoInputForTasks);
    return;
  }
  const inputContent = inputText;

  if (inputContent.trim().split(/\s+/).length < 10) {
    new Notice(t().noticeContentTooShortForTasks);
    return;
  }

  new Notice(t().noticeExtractingTasks);

  const meetingContext = detectMeetingContext(plugin);
  const taskContextPreamble = buildTaskContextPreamble(meetingContext);
  const systemPrompt =
    resolveLanguageInstruction(plugin.settings.outputLanguage) +
    "\n\n" +
    EXTRACT_TASKS_PROMPT.replace("{{task_context}}", taskContextPreamble);

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
        model: plugin.settings.tasksModel,
        temperature: 0.0,
        top_p: 1,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: inputContent },
        ],
      }),
      throw: false,
    });
  } catch (e) {
    const err = parseOpenAIError(null, e);
    console.error("[MeetingTools] OpenAI network error:", err);
    new Notice(err.friendly, 10000);
    return;
  }

  if (res.status >= 400 || res.json?.error) {
    const err = parseOpenAIError({ status: res.status, json: res.json, text: res.text });
    console.error("[MeetingTools] Extract tasks error:", err);
    new Notice(err.friendly, 10000);
    return;
  }

  let tasksText = res.json?.choices?.[0]?.message?.content ?? "";

  // Empty-result detection. Matches the EN prompt wording and the previous PT-BR
  // fallback in case the model sticks to legacy phrasing.
  if (
    !tasksText ||
    /no action items identified/i.test(tasksText) ||
    tasksText.includes("Nenhum item de ação identificado")
  ) {
    new Notice(t().noticeNoTasksFound);
    return;
  }

  tasksText = resolveProjectLinks(plugin, tasksText);

  let finalText = tasksText;
  if (plugin.settings.showPreview) {
    const modal = new PreviewModal(
      plugin.app,
      t().modalPreview,
      tasksText
    );
    modal.open();
    const result = await modal.waitForResult();
    if (result === null) return;
    finalText = result;
  }

  const inserted = context
    ? insertAfterContext(plugin.app, finalText, context)
    : insertAtCursor(plugin.app, finalText);
  if (inserted) new Notice(t().noticeTasksInserted);
}
