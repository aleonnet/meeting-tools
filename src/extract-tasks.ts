import { Notice, TFile, TFolder } from "obsidian";
import type MeetingToolsPlugin from "./main";
import {
  ContextResult,
  insertAtCursor,
  insertAfterContext,
  showApiKeyMissingNotice,
} from "./file-utils";
import { PreviewModal } from "./modals";
import { t } from "./i18n";
import { detectMeetingContext } from "./task-context";
import { extractAndRenderTasks } from "./task-extractor";

/**
 * Resolves wikilinks in task output to existing project notes (case-insensitive,
 * fuzzy match). Originally written for the free-text prompt, kept because the
 * structured extractor still uses MeetingContext wikilinks verbatim and they
 * may not match a project note's exact basename.
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

  let result: { markdown: string };
  try {
    result = await extractAndRenderTasks(plugin, apiKey, inputContent, meetingContext);
  } catch {
    // extractAndRenderTasks already shows its own Notice on API/network errors.
    return;
  }

  const isEmptyMarker = !result.markdown.includes("- [ ]");
  if (isEmptyMarker) {
    new Notice(t().noticeNoTasksFound);
    return;
  }

  const tasksText = resolveProjectLinks(plugin, result.markdown);

  let finalText = tasksText;
  if (plugin.settings.showPreview) {
    const modal = new PreviewModal(
      plugin.app,
      t().modalPreview,
      tasksText
    );
    modal.open();
    const previewResult = await modal.waitForResult();
    if (previewResult === null) return;
    finalText = previewResult;
  }

  const inserted = context
    ? insertAfterContext(plugin.app, finalText, context)
    : insertAtCursor(plugin.app, finalText);
  if (inserted) new Notice(t().noticeTasksInserted);
}
