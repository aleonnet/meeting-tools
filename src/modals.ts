import {
  App,
  FuzzySuggestModal,
  Modal,
  TFile,
  TFolder,
  MarkdownRenderer,
} from "obsidian";

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
    this.setPlaceholder("Selecione um arquivo de áudio...");
  }
}

export class TranscriptSuggestModal extends FileSuggestModal {
  constructor(
    app: App,
    transcriptsDir: string,
    onChoose: (path: string | null) => void
  ) {
    super(app, transcriptsDir, new Set(["md", "srt"]), onChoose);
    this.setPlaceholder("Selecione uma transcrição (.md ou .srt)...");
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

    // Button row — always at bottom
    const btnRow = contentEl.createDiv({ cls: "meeting-tools-btn-row" });

    // Cancel
    const cancelBtn = btnRow.createEl("button", { text: "Cancelar" });
    cancelBtn.addEventListener("click", () => {
      this.doResolve(null);
      this.close();
    });

    // Preview toggle
    const previewBtn = btnRow.createEl("button", { text: "Preview" });
    let showingPreview = false;
    previewBtn.onclick = async () => {
      if (!showingPreview) {
        this.content = textarea.value;
        textarea.style.display = "none";
        previewDiv.style.display = "block";
        previewBtn.textContent = "Editar";
        showingPreview = true;
        previewDiv.empty();
        // Use MarkdownRenderer with the modal itself as component
        // (Modal extends Component in Obsidian API)
        await MarkdownRenderer.renderMarkdown(this.content, previewDiv, "", this);
      } else {
        textarea.value = this.content;
        previewDiv.style.display = "none";
        textarea.style.display = "block";
        previewBtn.textContent = "Preview";
        showingPreview = false;
        textarea.focus();
      }
    };

    // Save
    const saveBtn = btnRow.createEl("button", { text: "Inserir", cls: "mod-cta" });
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

    contentEl.createEl("h3", { text: "Texto insuficiente" });
    contentEl.createEl("p", {
      text: `Texto insuficiente para gerar sumário, mindmap ou lista de tarefas (${this.wordCount} palavras encontradas, mínimo ${this.minWords}).`,
    });

    const btnRow = contentEl.createDiv({ cls: "meeting-tools-btn-row" });

    btnRow.createEl("button", { text: "Cancelar" })
      .addEventListener("click", () => { this.doResolve(false); this.close(); });

    btnRow.createEl("button", { text: "Abrir transcrição", cls: "mod-cta" })
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
