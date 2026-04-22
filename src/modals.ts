import {
  App,
  FuzzySuggestModal,
  Modal,
  TFile,
  TFolder,
  MarkdownRenderer,
} from "obsidian";
import { t } from "./i18n";

// --- File Suggest Modals ---

class FileSuggestModal extends FuzzySuggestModal<TFile> {
  private folderPath: string;
  private extensions: Set<string>;
  private onChoose: (path: string | null) => void;

  constructor(
    app: App,
    folderPath: string,
    extensions: Set<string>,
    onChoose: (path: string | null) => void
  ) {
    super(app);
    this.folderPath = folderPath;
    this.extensions = extensions;
    this.onChoose = onChoose;
  }

  getItems(): TFile[] {
    const folder = this.app.vault.getAbstractFileByPath(this.folderPath);
    if (!folder || !(folder instanceof TFolder)) return [];
    return (
      folder.children.filter(
        (f) =>
          f instanceof TFile &&
          this.extensions.has((f.extension || "").toLowerCase())
      ) as TFile[]
    ).sort((a, b) => b.stat.mtime - a.stat.mtime);
  }

  getItemText(item: TFile): string {
    return item.name;
  }

  onChooseItem(item: TFile): void {
    this.onChoose(item.path);
  }

  onClose(): void {}
}

export class AudioSuggestModal extends FileSuggestModal {
  constructor(
    app: App,
    audioDir: string,
    onChoose: (path: string | null) => void
  ) {
    super(
      app,
      audioDir,
      new Set(["webm", "m4a", "mp3", "wav", "ogg", "mp4"]),
      onChoose
    );
    this.setPlaceholder(t().modalAudioSuggestPlaceholder);
  }
}

export class TranscriptSuggestModal extends FileSuggestModal {
  constructor(
    app: App,
    transcriptsDir: string,
    onChoose: (path: string | null) => void
  ) {
    super(app, transcriptsDir, new Set(["md", "srt"]), onChoose);
    this.setPlaceholder(t().modalTranscriptSuggestPlaceholder);
  }
}

// --- Preview Modal ---
//
// DOM hierarchy of Obsidian Modal:
//   .modal-container (overlay)
//     .modal  ← this.modalEl  (frame with border/shadow)
//       .modal-close-button (X)
//       .modal-content  ← this.contentEl
//
// Strategy:
//   - Apply sizing + flex to modalEl (.meeting-tools-modal class)
//   - CSS targets .meeting-tools-modal .modal-content for flex column
//   - Textarea is the default view (editable immediately)
//   - Preview is a toggle (rendered markdown)
//   - Buttons are always at the bottom via flex: 0 0 auto

export class PreviewModal extends Modal {
  private content: string;
  private title: string;
  private resolved = false;
  private resolvePromise: ((value: string | null) => void) | null = null;

  constructor(app: App, title: string, content: string) {
    super(app);
    this.title = title;
    this.content = content;
  }

  private doResolve(value: string | null) {
    if (this.resolved) return;
    this.resolved = true;
    this.resolvePromise?.(value);
  }

  onOpen() {
    const { contentEl, modalEl, containerEl } = this;
    contentEl.empty();

    // Prevent closing when clicking outside the modal
    containerEl.addEventListener("click", (e) => {
      if (e.target === containerEl) {
        e.stopPropagation();
        e.preventDefault();
      }
    }, true); // capture phase to intercept before Obsidian's handler

    // Apply layout class to the .modal frame
    modalEl.addClass("meeting-tools-modal");

    // Title
    const titleEl = contentEl.createEl("h3", { text: this.title });
    titleEl.style.margin = "0 0 8px 0";
    titleEl.style.flex = "0 0 auto";

    // Textarea (editable, visible by default)
    const textarea = contentEl.createEl("textarea", {
      cls: "meeting-tools-textarea",
    });
    textarea.value = this.content;

    // Preview container (hidden by default)
    const previewDiv = contentEl.createDiv({ cls: "meeting-tools-preview" });
    previewDiv.style.display = "none";

    // Footer with live word/line counter
    const footer = contentEl.createDiv({ cls: "meeting-tools-preview-footer" });
    const s = t();
    const updateFooter = () => {
      const text = textarea.value;
      const wc = text.trim().split(/\s+/).filter(Boolean).length;
      const lines = text.split("\n").length;
      footer.setText(s.previewFooter(wc, lines));
    };
    textarea.addEventListener("input", updateFooter);
    updateFooter();

    // Button row — always at bottom
    const btnRow = contentEl.createDiv({ cls: "meeting-tools-btn-row" });
    const cancelBtn = btnRow.createEl("button", { text: s.btnCancelPlain });
    cancelBtn.addEventListener("click", () => {
      this.doResolve(null);
      this.close();
    });

    const previewBtn = btnRow.createEl("button", { text: s.modalPreview });
    let showingPreview = false;
    previewBtn.onclick = async () => {
      if (!showingPreview) {
        this.content = textarea.value;
        textarea.style.display = "none";
        previewDiv.style.display = "block";
        previewBtn.textContent = s.modalEdit;
        showingPreview = true;
        previewDiv.empty();
        await MarkdownRenderer.renderMarkdown(this.content, previewDiv, "", this);
      } else {
        textarea.value = this.content;
        previewDiv.style.display = "none";
        textarea.style.display = "block";
        previewBtn.textContent = s.modalPreview;
        showingPreview = false;
        textarea.focus();
      }
    };

    const saveBtn = btnRow.createEl("button", { text: s.modalInsert, cls: "mod-cta" });
    saveBtn.addEventListener("click", () => {
      this.content = showingPreview ? this.content : textarea.value;
      this.doResolve(this.content);
      this.close();
    });

    // Focus textarea
    setTimeout(() => textarea.focus(), 50);
  }

  onClose() {
    this.doResolve(null);
    this.contentEl.empty();
  }

  waitForResult(): Promise<string | null> {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
    });
  }
}

// --- Guide Modal (read-only markdown) ---

export class GuideModal extends Modal {
  private content: string;
  private title: string;

  constructor(app: App, title: string, content: string) {
    super(app);
    this.title = title;
    this.content = content;
  }

  onOpen() {
    const { contentEl, modalEl } = this;
    contentEl.empty();
    modalEl.addClass("meeting-tools-modal");

    const titleEl = contentEl.createEl("h3", { text: this.title });
    titleEl.style.margin = "0 0 8px 0";
    titleEl.style.flex = "0 0 auto";

    const body = contentEl.createDiv({ cls: "meeting-tools-preview" });
    body.style.display = "block";
    // Non-blocking render; safe to ignore the returned promise.
    void MarkdownRenderer.renderMarkdown(this.content, body, "", this as any);

    const btnRow = contentEl.createDiv({ cls: "meeting-tools-btn-row" });
    const closeBtn = btnRow.createEl("button", {
      text: t().btnClose,
      cls: "mod-cta",
    });
    closeBtn.addEventListener("click", () => this.close());
  }

  onClose() {
    this.contentEl.empty();
  }
}

// --- Insufficient Text Modal ---

export class InsufficientTextModal extends Modal {
  private resolved = false;
  private resolvePromise: ((value: boolean) => void) | null = null;
  private wordCount: number;
  private minWords: number;

  constructor(app: App, wordCount: number, minWords: number) {
    super(app);
    this.wordCount = wordCount;
    this.minWords = minWords;
  }

  private doResolve(value: boolean) {
    if (this.resolved) return;
    this.resolved = true;
    this.resolvePromise?.(value);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    const s = t();
    contentEl.createEl("h3", { text: s.modalInsufficientTitle });
    contentEl.createEl("p", {
      text: s.modalInsufficientDesc(this.wordCount, this.minWords),
    });

    const btnRow = contentEl.createDiv({ cls: "meeting-tools-btn-row" });

    btnRow.createEl("button", { text: s.btnCancelPlain })
      .addEventListener("click", () => { this.doResolve(false); this.close(); });

    btnRow.createEl("button", { text: s.modalOpenTranscript, cls: "mod-cta" })
      .addEventListener("click", () => { this.doResolve(true); this.close(); });
  }

  onClose() {
    this.doResolve(false);
    this.contentEl.empty();
  }

  waitForResult(): Promise<boolean> {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
    });
  }
}
