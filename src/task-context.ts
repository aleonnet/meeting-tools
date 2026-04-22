import { MarkdownView, TFile, TFolder } from "obsidian";
import type MeetingToolsPlugin from "./main";

/**
 * Context gathered from the user's active workspace that drives task attribution.
 * All fields are filled from the time block header above the cursor in the
 * active Markdown view.
 */
export interface MeetingContext {
  userName: string;
  /**
   * Wikilinks found in the time block header. Applied verbatim to every task.
   * Empty when there's no time block or the header has no wikilinks — in that
   * case buildTaskContextPreamble() emits `[[No project]]` as a single entry.
   */
  wikilinks: string[];
  /**
   * Set only when the first header wikilink resolves (case- and accent-
   * insensitive) to a `Vault/Projects/*.md` file. Used for the `#projects/<slug>`
   * dashboard grouping tag.
   */
  projectSlug: string | null;
}

const PROJECTS_FOLDER = "Vault/Projects";
const TIME_BLOCK_REGEX = /### \d{2}:\d{2}/;

/**
 * Lowercases and strips diacritics so "Kaidô" and "kaido" match.
 */
function normalize(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/**
 * Converts a project basename to a dashboard-friendly slug
 * (lowercase + accent-stripped + spaces → hyphens).
 */
function slugify(basename: string): string {
  return normalize(basename).replace(/\s+/g, "-");
}

/**
 * Reads the time block header (line matching `### HH:MM ...`) above the cursor
 * in the active Markdown view. Returns the header line, or empty string if
 * there's no active view, no cursor, or no time block above.
 *
 * This is independent of `getContextCheck()`'s word-count gate: even when the
 * block is too short to drive Summarize/Extract directly, the header still
 * identifies the project context that must be applied to tasks generated from
 * a fuzzy-picked transcript.
 */
function readActiveTimeBlockHeader(plugin: MeetingToolsPlugin): string {
  const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
  if (!view?.editor) return "";
  const editor = view.editor;
  const cursor = editor.getCursor();
  const lines = editor.getValue().split("\n");
  for (let i = cursor.line; i >= 0; i--) {
    if (TIME_BLOCK_REGEX.test(lines[i])) return lines[i];
  }
  return "";
}

export function detectMeetingContext(
  plugin: MeetingToolsPlugin
): MeetingContext {
  const { app, settings } = plugin;
  const header = readActiveTimeBlockHeader(plugin);

  const wikilinks: string[] = [];
  if (header) {
    const re = /\[\[([^\]]+)\]\]/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(header)) !== null) {
      wikilinks.push(match[1]);
    }
  }

  let projectSlug: string | null = null;
  if (wikilinks.length > 0) {
    const projectsFolder = app.vault.getAbstractFileByPath(PROJECTS_FOLDER);
    if (projectsFolder instanceof TFolder) {
      const target = normalize(wikilinks[0]);
      const match = projectsFolder.children.find(
        (f): f is TFile =>
          f instanceof TFile &&
          f.extension === "md" &&
          normalize(f.basename) === target
      );
      if (match) projectSlug = slugify(match.basename);
    }
  }

  return {
    userName: settings.userName,
    wikilinks,
    projectSlug,
  };
}

/**
 * Renders the Context preamble block injected into LLM prompts. Consumed by
 * both Summary (via {{task_context}} placeholder) and Extract Tasks (via
 * .replace() call).
 *
 * Owner attribution rules live in TASK_FORMAT_SPEC (prompts.ts). This preamble
 * only provides static facts — user name, meeting wikilinks, project tag.
 */
export function buildTaskContextPreamble(mc: MeetingContext): string {
  const wls = mc.wikilinks.length > 0
    ? mc.wikilinks.map((w) => `[[${w}]]`).join(" ")
    : "[[No project]]";

  const lines: string[] = [
    "Context:",
    `- User name: ${mc.userName}`,
    `- Meeting wikilinks (apply to EVERY task, exactly as written): ${wls}`,
  ];
  if (mc.projectSlug) {
    lines.push(`- Project tag (apply to EVERY task): #projects/${mc.projectSlug}`);
  }
  return lines.join("\n");
}
