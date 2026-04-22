import { App, MarkdownView, Notice, Plugin, TFile, TFolder } from "obsidian";
import { t } from "./i18n";

/**
 * Shows an actionable Notice when the OpenAI API key is missing. Adds an
 * "Open Settings" button that navigates the user directly to the plugin's
 * settings tab. Uses Obsidian's internal `app.setting` API (undocumented but
 * widely used across community plugins).
 */
export function showApiKeyMissingNotice(plugin: Plugin): void {
  const s = t();
  const notice = new Notice("", 0);
  const el = notice.noticeEl;
  el.empty();
  el.addClass("mt-missing-notice");
  el.createEl("div", { text: s.noticeConfigureApiKey });

  const btnRow = el.createDiv({ cls: "mt-notice-btn-row" });
  const openBtn = btnRow.createEl("button", {
    text: s.btnOpenSettings,
    cls: "mod-cta",
  });
  openBtn.addEventListener("click", () => {
    notice.hide();
    const setting = (plugin.app as any).setting;
    if (setting?.open) {
      setting.open();
      setting.openTabById?.(plugin.manifest.id);
    }
  });
  const dismissBtn = btnRow.createEl("button", { text: s.btnDismiss });
  dismissBtn.addEventListener("click", () => notice.hide());
}

/**
 * Detects audio duration via HTML5 <audio> element. Works in Electron (desktop)
 * and Obsidian mobile WebView — no ffmpeg needed.
 *
 * MediaRecorder webm files lack EBML Duration metadata, so loadedmetadata
 * reports Infinity. Workaround: seek to end, then read duration on seeked.
 * Returns null after 10s timeout or on error.
 */
export async function getAudioDurationSec(blob: Blob): Promise<number | null> {
  const url = URL.createObjectURL(blob);
  return await new Promise<number | null>((resolve) => {
    let settled = false;
    const done = (v: number | null) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      resolve(v);
    };
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        done(audio.duration);
        return;
      }
      // webm quirk — force seek to end to populate duration
      audio.currentTime = Number.MAX_SAFE_INTEGER;
      audio.onseeked = () => {
        if (isFinite(audio.duration) && audio.duration > 0) done(audio.duration);
        else done(null);
      };
    };
    audio.onerror = () => done(null);
    audio.src = url;
    setTimeout(() => done(null), 10000);
  });
}

export async function ensureFolder(app: App, path: string): Promise<void> {
  const existing = app.vault.getAbstractFileByPath(path);
  if (existing) return;
  await app.vault.createFolder(path).catch(() => {});
}

export async function readFileContent(
  app: App,
  path: string
): Promise<string | null> {
  const file = app.vault.getAbstractFileByPath(path);
  if (file instanceof TFile) {
    return await app.vault.read(file);
  }
  return null;
}

export function baseName(path: string): string {
  const slash = path.lastIndexOf("/");
  const name = slash >= 0 ? path.slice(slash + 1) : path;
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(0, dot) : name;
}

export function srtToPlainText(srt: string): string {
  if (!srt) return "";
  let t = srt
    .replace(/\r/g, "")
    .replace(/\u2028|\u2029/g, "\n")
    .trim();
  // Remove sequence numbers
  t = t.replace(/^\s*\d+\s*$/gm, "");
  // Remove timestamps
  t = t.replace(
    /\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}(?:.*)?$/gm,
    ""
  );
  // Remove HTML tags
  t = t.replace(/<[^>]+>/g, "");
  // Collapse to single line
  t = t
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length)
    .join(" ");
  t = t.replace(/\s{2,}/g, " ").trim();
  return t;
}

/**
 * Shows a non-blocking banner at the top of the editor.
 * Returns true if user clicks "Continuar", false if "Cancelar".
 */
export async function showCursorBanner(app: App): Promise<boolean> {
  const view = app.workspace.getActiveViewOfType(MarkdownView);
  if (!view?.containerEl) return true; // no editor = skip banner

  return new Promise<boolean>((resolve) => {
    let resolved = false;
    const banner = document.createElement("div");
    banner.className = "mt-insert-banner";

    const s = t();
    const msg = document.createElement("span");
    msg.textContent = s.cursorBannerMessage;
    banner.appendChild(msg);

    const btnRow = document.createElement("div");
    btnRow.className = "mt-insert-banner-buttons";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = s.btnCancelPlain;
    cancelBtn.className = "mt-insert-cancel";

    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = s.btnContinue;
    confirmBtn.className = "mt-insert-confirm";

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(confirmBtn);
    banner.appendChild(btnRow);

    const cleanup = (result: boolean) => {
      if (resolved) return;
      resolved = true;
      banner.remove();
      resolve(result);
    };

    cancelBtn.addEventListener("click", () => cleanup(false));
    confirmBtn.addEventListener("click", () => cleanup(true));

    view.containerEl.prepend(banner);
  });
}

/**
 * Inserts text at current cursor position.
 */
export function insertAtCursor(app: App, text: string): boolean {
  const view = app.workspace.getActiveViewOfType(MarkdownView);
  if (view?.editor) {
    view.editor.replaceSelection("\n" + text + "\n");
    return true;
  }
  return false;
}

export function nowParts(): {
  date: string;
  label: string;
  safe: string;
} {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const d = new Date();
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const date = `${p.find((x) => x.type === "year")!.value}-${p.find((x) => x.type === "month")!.value}-${p.find((x) => x.type === "day")!.value}`;
  const hm = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(d)
    .split(":");
  return { date, label: `${hm[0]}:${hm[1]}`, safe: `${hm[0]}h${hm[1]}` };
}

export function listFilesInFolder(
  app: App,
  folderPath: string,
  extensions: Set<string>
): TFile[] {
  const folder = app.vault.getAbstractFileByPath(folderPath);
  if (!folder || !(folder instanceof TFolder)) return [];
  return (folder.children.filter(
    (f) =>
      f instanceof TFile &&
      extensions.has((f.extension || "").toLowerCase())
  ) as TFile[]).sort((a, b) => b.stat.mtime - a.stat.mtime);
}

export async function saveArrayBufferToVault(
  app: App,
  dir: string,
  fileName: string,
  arrayBuffer: ArrayBuffer
): Promise<string> {
  await ensureFolder(app, dir);
  const dot = fileName.lastIndexOf(".");
  const name = dot >= 0 ? fileName.slice(0, dot) : fileName;
  const ext = dot >= 0 ? fileName.slice(dot + 1).toLowerCase() : "";
  const clean =
    (name.replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").trim() ||
      "audio") + (ext ? "." + ext : "");
  let finalPath = `${dir}/${clean}`;
  let i = 1;
  while (app.vault.getAbstractFileByPath(finalPath)) {
    const baseNoExt =
      dot >= 0 ? clean.slice(0, clean.lastIndexOf(".")) : clean;
    const extPart =
      dot >= 0 ? "." + clean.slice(clean.lastIndexOf(".") + 1) : "";
    finalPath = `${dir}/${baseNoExt} (${i})${extPart}`;
    i++;
  }
  await (app.vault.adapter as any).writeBinary(
    finalPath,
    new Uint8Array(arrayBuffer)
  );
  return finalPath;
}

/**
 * Result of context detection — includes text, mode, and where to insert.
 */
export interface ContextResult {
  text: string;
  mode: "selection" | "timeblock";
  insertLine: number;
}

export interface ContextCheck {
  result: ContextResult | null;
  insufficientBlock: boolean;
  wordCount?: number;
}

/**
 * Detect context and report if time block was found but insufficient.
 */
export function getContextCheck(app: App, minWords: number): ContextCheck {
  const view = app.workspace.getActiveViewOfType(MarkdownView);
  if (!view?.editor) return { result: null, insufficientBlock: false };

  const editor = view.editor;

  // 1. Selected text — check minWords
  const selection = editor.getSelection();
  if (selection && selection.trim().length > 0) {
    const wc = selection.trim().split(/\s+/).filter(Boolean).length;
    if (wc >= minWords) {
      const selections = editor.listSelections();
      const sel = selections[0];
      const endLine = Math.max(sel.head.line, sel.anchor.line);
      return { result: { text: selection, mode: "selection", insertLine: endLine }, insufficientBlock: false };
    }
    return { result: null, insufficientBlock: true, wordCount: wc };
  }

  // 2. Time block above cursor
  const cursor = editor.getCursor();
  const lines = editor.getValue().split("\n");
  const lineCount = lines.length;
  const timeBlockRegex = /### \d{2}:\d{2}/;
  let blockStart = -1;
  let blockEnd = lineCount;

  for (let i = cursor.line; i >= 0; i--) {
    if (timeBlockRegex.test(lines[i])) { blockStart = i; break; }
  }

  if (blockStart >= 0) {
    for (let i = blockStart + 1; i < lineCount; i++) {
      if (timeBlockRegex.test(lines[i])) { blockEnd = i; break; }
    }
    const blockText = lines.slice(blockStart, blockEnd).join("\n").trim();
    const wc = blockText.split(/\s+/).filter(Boolean).length;
    if (wc >= minWords) {
      return { result: { text: blockText, mode: "timeblock", insertLine: blockEnd }, insufficientBlock: false };
    }
    return { result: null, insufficientBlock: true, wordCount: wc };
  }

  return { result: null, insufficientBlock: false };
}

/**
 * Legacy — kept for backward compatibility.
 */
export function getContextResult(app: App, minWords: number): ContextResult | null {
  const view = app.workspace.getActiveViewOfType(MarkdownView);
  if (!view?.editor) return null;

  const editor = view.editor;

  // 1. Selected text — check minWords
  const selection = editor.getSelection();
  if (selection && selection.trim().length > 0) {
    const wordCount = selection.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount >= minWords) {
      const selections = editor.listSelections();
      const sel = selections[0];
      const endLine = Math.max(sel.head.line, sel.anchor.line);
      return { text: selection, mode: "selection", insertLine: endLine };
    }
    // Selection too short → fall through to time block
  }

  // 2. Time block above cursor (### HH:MM ... next ### or --- or ##)
  const cursor = editor.getCursor();
  const lines = editor.getValue().split("\n");
  const lineCount = lines.length;

  const timeBlockRegex = /### \d{2}:\d{2}/;
  let blockStart = -1;
  let blockEnd = lineCount;

  for (let i = cursor.line; i >= 0; i--) {
    if (timeBlockRegex.test(lines[i])) {
      blockStart = i;
      break;
    }
  }

  if (blockStart >= 0) {
    for (let i = blockStart + 1; i < lineCount; i++) {
      if (timeBlockRegex.test(lines[i])) {
        blockEnd = i;
        break;
      }
    }
    const blockText = lines.slice(blockStart, blockEnd).join("\n").trim();
    const wordCount = blockText.split(/\s+/).filter(Boolean).length;
    if (wordCount >= minWords) {
      return { text: blockText, mode: "timeblock", insertLine: blockEnd };
    }
  }

  // 3. Nothing qualifies → return null (caller should open fuzzy modal)
  return null;
}

/**
 * Insert text after the detected context with a --- separator.
 * For selection: inserts after the end of selection.
 * For timeblock: inserts before the next block header.
 */
export function insertAfterContext(app: App, text: string, context: ContextResult): boolean {
  const view = app.workspace.getActiveViewOfType(MarkdownView);
  if (!view?.editor) return false;
  const editor = view.editor;

  const insertContent = "\n---\n\n" + text + "\n";

  if (context.mode === "selection") {
    const lineText = editor.getLine(context.insertLine);
    editor.replaceRange(insertContent, {
      line: context.insertLine,
      ch: lineText.length,
    });
    return true;
  }

  if (context.mode === "timeblock") {
    editor.replaceRange(insertContent, {
      line: context.insertLine,
      ch: 0,
    });
    return true;
  }

  return false;
}

/**
 * Wraps an async operation with status bar feedback.
 * Shows ⏳ during execution, ✅ on success, ❌ on error.
 */
export async function withStatusFeedback<T>(
  plugin: Plugin,
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  const el = plugin.addStatusBarItem();
  const s = t();
  el.setText(s.statusRunning(label));
  el.style.fontWeight = "600";
  try {
    const result = await fn();
    el.setText(s.statusDone(label));
    setTimeout(() => el.remove(), 3000);
    return result;
  } catch (e) {
    el.setText(s.statusError(label));
    setTimeout(() => el.remove(), 5000);
    throw e;
  }
}
