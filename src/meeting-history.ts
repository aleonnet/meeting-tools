import { App, TFile, MarkdownPostProcessorContext } from "obsidian";
import type MeetingToolsPlugin from "./main";
import { t } from "./i18n";

interface MatchedNote {
  file: TFile;
  date: string;
  timeBlocks: string[]; // e.g. ["09:00 - Definição de Cronograma", "10:00 - Validação do modelo"]
}

/**
 * Extract time block headers (### HH:MM - Title) from a daily note
 * that reference the given project (via wikilink or #projects/ tag).
 */
function extractRelevantTimeBlocks(
  content: string,
  projectName: string
): string[] {
  const lines = content.split("\n");
  const blocks: string[] = [];
  const projectLower = projectName.toLowerCase();
  const timeBlockRegex = /^### (\d{2}:\d{2}\s*-.*)$/;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(timeBlockRegex);
    if (!match) continue;

    const header = match[1];

    // Collect block content (from header to next header/separator)
    let blockContent = header;
    for (let j = i + 1; j < lines.length; j++) {
      if (/^### \d{2}:\d{2}/.test(lines[j]) || /^---/.test(lines[j]) || /^## /.test(lines[j])) break;
      blockContent += "\n" + lines[j];
    }

    // Check if this block references the project
    const hasWikilink = blockContent.includes(`[[${projectName}]]`);
    const hasTag = blockContent.toLowerCase().includes(`#projects/${projectLower}`);

    if (hasWikilink || hasTag) {
      blocks.push(header.trim());
    }
  }

  return blocks;
}

export function registerMeetingHistory(plugin: MeetingToolsPlugin): void {
  plugin.registerMarkdownCodeBlockProcessor(
    "meeting-history",
    async (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
      const app = plugin.app;

      const currentFile = app.vault.getAbstractFileByPath(ctx.sourcePath);
      if (!currentFile || !(currentFile instanceof TFile)) {
        el.createEl("p", { text: "Não foi possível identificar a nota atual." });
        return;
      }

      const projectName = currentFile.basename;
      const allFiles = app.vault.getMarkdownFiles();
      const dailyNotes = allFiles.filter((f) => f.path.includes("Daily Notes/"));

      const matches: MatchedNote[] = [];

      for (const file of dailyNotes) {
        const content = await app.vault.cachedRead(file);

        const hasWikilink = content.includes(`[[${projectName}]]`);
        const hasTag = content.toLowerCase().includes(
          `#projects/${projectName.toLowerCase()}`
        );

        if (hasWikilink || hasTag) {
          const timeBlocks = extractRelevantTimeBlocks(content, projectName);
          matches.push({ file, date: file.basename, timeBlocks });
        }
      }

      matches.sort((a, b) => b.date.localeCompare(a.date));

      if (matches.length === 0) {
        el.createEl("p", {
          text: t().emptyMeetingHistory,
          cls: "mt-dash-empty",
        });
        return;
      }

      el.createEl("p", {
        text: `${matches.length} reunião(ões) encontrada(s)`,
        cls: "mt-history-count",
      });

      const list = el.createEl("ul", { cls: "mt-history-list" });

      for (const match of matches) {
        const li = list.createEl("li");

        // Daily note link
        const link = li.createEl("a", {
          text: match.date,
          cls: "internal-link mt-history-date",
        });
        link.addEventListener("click", (e) => {
          e.preventDefault();
          app.workspace.getLeaf(false).openFile(match.file);
        });

        // Time blocks as sub-items
        if (match.timeBlocks.length > 0) {
          const subList = li.createEl("ul", { cls: "mt-history-blocks" });
          for (const block of match.timeBlocks) {
            subList.createEl("li", { text: block, cls: "mt-history-block" });
          }
        }
      }
    }
  );
}
