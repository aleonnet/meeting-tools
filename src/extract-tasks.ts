import { Notice, MarkdownView, TFile, TFolder, requestUrl } from "obsidian";
import type MeetingToolsPlugin from "./main";
import { ContextResult, insertAtCursor, insertAfterContext } from "./file-utils";
import { PreviewModal } from "./modals";
import { EXTRACT_TASKS_PROMPT } from "./prompts";

/**
 * Find project files in Vault/Projects/ and resolve wikilinks in task text.
 */
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
    new Notice("Configure a OpenAI API Key nas settings do Meeting Tools.");
    return;
  }

  if (!inputText) {
    new Notice("Nenhum texto fornecido para extração de tasks.");
    return;
  }
  const inputContent = inputText;

  if (inputContent.trim().split(/\s+/).length < 10) {
    new Notice("Conteúdo muito curto para extrair tasks.");
    return;
  }

  new Notice("Extraindo tasks…");

  const res = await requestUrl({
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
        { role: "system", content: EXTRACT_TASKS_PROMPT },
        { role: "user", content: inputContent },
      ],
    }),
  });

  if (res.status !== 200 || res.json?.error) {
    console.error("[MeetingTools] Extract tasks error:", res.json?.error || res);
    new Notice("Falha ao extrair tasks.");
    return;
  }

  let tasksText = res.json?.choices?.[0]?.message?.content ?? "";

  if (!tasksText || tasksText.includes("Nenhum item de ação identificado")) {
    new Notice("Nenhum item de ação identificado no texto.");
    return;
  }

  // Resolve project wikilinks against actual vault files
  tasksText = resolveProjectLinks(plugin, tasksText);

  // Preview
  let finalText = tasksText;
  if (plugin.settings.showPreview) {
    const modal = new PreviewModal(
      plugin.app,
      "Tasks extraídas — revise antes de inserir",
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
  if (inserted) new Notice("Tasks inseridas.");
}
