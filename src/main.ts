import { Menu, Notice, Plugin, TFile } from "obsidian";
import {
  DEFAULT_SETTINGS,
  MeetingToolsSettings,
  MeetingToolsSettingTab,
  getApiKey,
  loadSettingsWithSecrets,
  saveSettingsWithSecrets,
} from "./settings";
import { showCursorBanner, withStatusFeedback, getContextCheck, ContextCheck } from "./file-utils";
import { transcribeAudio } from "./transcribe";
import { summarizeTranscript } from "./summarize";
import { generateMindmap } from "./mindmap";
import { importAudio } from "./import-audio";
import { extractTasks } from "./extract-tasks";
import { newProjectFromDocument } from "./new-project";
import { AudioSuggestModal, TranscriptSuggestModal, InsufficientTextModal } from "./modals";
import { registerTaskDashboard } from "./task-dashboard";
import { registerKanban } from "./kanban";
import { registerGantt } from "./gantt";
import { startRecordingWithControls } from "./recorder";
import { setupVault } from "./vault-setup";
import { registerMeetingHistory } from "./meeting-history";
import { registerFileIcons } from "./file-icons";

export default class MeetingToolsPlugin extends Plugin {
  settings: MeetingToolsSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new MeetingToolsSettingTab(this.app, this));

    // Code block processors
    registerTaskDashboard(this);
    registerKanban(this);
    registerGantt(this);

    registerMeetingHistory(this);

    // File explorer icons
    registerFileIcons(this);

    // Ribbon menu
    this.addRibbonIcon("briefcase", "Meeting Tools", (evt) => {
      const menu = new Menu();
      menu.addItem((item) =>
        item
          .setTitle("Start Recording")
          .setIcon("mic")
          .onClick(() => this.record())
      );
      menu.addItem((item) =>
        item
          .setTitle("Import Audio")
          .setIcon("download")
          .onClick(() => this.doImportAudio())
      );
      menu.addSeparator();
      menu.addItem((item) =>
        item
          .setTitle("Transcribe Audio")
          .setIcon("file-text")
          .onClick(() => this.doTranscribe())
      );
      menu.addItem((item) =>
        item
          .setTitle("Summarize Transcript")
          .setIcon("clipboard-list")
          .onClick(() => this.doSummarize())
      );
      menu.addItem((item) =>
        item
          .setTitle("Generate Mindmap")
          .setIcon("git-branch")
          .onClick(() => this.doMindmap())
      );
      menu.addItem((item) =>
        item
          .setTitle("Extract Tasks")
          .setIcon("check-square")
          .onClick(() => this.doExtractTasks())
      );
      menu.addSeparator();
      menu.addItem((item) =>
        item
          .setTitle("New Project from Document")
          .setIcon("folder-plus")
          .onClick(() => this.doNewProject())
      );
      menu.addItem((item) =>
        item
          .setTitle("Full Pipeline")
          .setIcon("zap")
          .onClick(() => this.doFullPipeline())
      );
      menu.addSeparator();
      menu.addItem((item) =>
        item
          .setTitle("Setup Vault")
          .setIcon("settings")
          .onClick(() => this.doSetupVault())
      );
      menu.showAtMouseEvent(evt);
    });

    // Commands
    this.addCommand({
      id: "record",
      name: "Start Recording",
      callback: () => this.record(),
    });

    this.addCommand({
      id: "import-audio",
      name: "Import Audio",
      callback: () => this.doImportAudio(),
    });

    this.addCommand({
      id: "transcribe",
      name: "Transcribe Audio",
      callback: () => this.doTranscribe(),
    });

    this.addCommand({
      id: "summarize",
      name: "Summarize Transcript",
      callback: () => this.doSummarize(),
    });

    this.addCommand({
      id: "mindmap",
      name: "Generate Mindmap",
      callback: () => this.doMindmap(),
    });

    this.addCommand({
      id: "extract-tasks",
      name: "Extract Tasks",
      callback: () => this.doExtractTasks(),
    });

    this.addCommand({
      id: "new-project",
      name: "New Project from Document",
      callback: () => this.doNewProject(),
    });

    this.addCommand({
      id: "full-pipeline",
      name: "Full Pipeline",
      callback: () => this.doFullPipeline(),
    });

    this.addCommand({
      id: "setup-vault",
      name: "Setup Vault",
      callback: () => this.doSetupVault(),
    });
  }

  async loadSettings() {
    this.settings = await loadSettingsWithSecrets(this);
  }

  async saveSettings() {
    await saveSettingsWithSecrets(this, this.settings);
  }

  getApiKey(): string {
    return getApiKey(this);
  }

  // --- Actions ---

  async record() {
    await startRecordingWithControls(this);
  }

  async doImportAudio() {
    await withStatusFeedback(this, "Importando áudio", async () => {
      await importAudio(this);
    });
  }

  async doTranscribe(audioPath?: string) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      new Notice("Configure a OpenAI API Key nas settings do Meeting Tools.");
      return;
    }

    const path =
      audioPath ??
      (await new Promise<string | null>((resolve) => {
        new AudioSuggestModal(this.app, this.settings.audioDir, (p) =>
          resolve(p)
        ).open();
      }));
    if (!path) return;

    await withStatusFeedback(this, "Transcrevendo áudio", async () => {
      const result = await transcribeAudio(this, path);
      if (result) {
        new Notice("Transcrição salva: " + result.srtPath);
      }
    });
  }

  /**
   * Shared fallback: show insufficient modal or banner, then open fuzzy modal.
   * Returns transcript path or null if cancelled.
   */
  private async fallbackToFuzzyModal(check: ContextCheck): Promise<string | null> {
    if (check.insufficientBlock) {
      const modal = new InsufficientTextModal(this.app, check.wordCount ?? 0, this.settings.minWordsForSummary);
      modal.open();
      const openTranscript = await modal.waitForResult();
      if (!openTranscript) return null;
    } else {
      const confirmed = await showCursorBanner(this.app);
      if (!confirmed) return null;
    }
    return await new Promise<string | null>((resolve) => {
      new TranscriptSuggestModal(this.app, this.settings.transcriptsDir, (p) => resolve(p)).open();
    });
  }

  async doSummarize(transcriptPath?: string) {
    const check = getContextCheck(this.app, this.settings.minWordsForSummary);
    if (check.result) {
      await withStatusFeedback(this, "Gerando resumo", async () => {
        await summarizeTranscript(this, undefined, check.result!);
      });
    } else {
      const path = transcriptPath ?? await this.fallbackToFuzzyModal(check);
      if (!path) return;
      await withStatusFeedback(this, "Gerando resumo", async () => {
        await summarizeTranscript(this, path);
      });
    }
  }

  async doMindmap(transcriptPath?: string) {
    const check = getContextCheck(this.app, this.settings.minWordsForSummary);
    if (check.result) {
      await withStatusFeedback(this, "Gerando mindmap", async () => {
        await generateMindmap(this, undefined, check.result!);
      });
    } else {
      const path = transcriptPath ?? await this.fallbackToFuzzyModal(check);
      if (!path) return;
      await withStatusFeedback(this, "Gerando mindmap", async () => {
        await generateMindmap(this, path);
      });
    }
  }

  async doExtractTasks() {
    const check = getContextCheck(this.app, this.settings.minWordsForSummary);
    if (check.result) {
      await withStatusFeedback(this, "Extraindo tasks", async () => {
        await extractTasks(this, check.result!.text, check.result!);
      });
    } else {
      const path = await this.fallbackToFuzzyModal(check);
      if (!path) return;
      const file = this.app.vault.getAbstractFileByPath(path);
      if (!file || !(file instanceof TFile)) return;
      const raw = await this.app.vault.read(file);
      await withStatusFeedback(this, "Extraindo tasks", async () => {
        await extractTasks(this, raw);
      });
    }
  }

  async doNewProject() {
    await withStatusFeedback(this, "Criando projeto", async () => {
      await newProjectFromDocument(this);
    });
  }

  async doFullPipeline() {
    const statusBar = this.addStatusBarItem();
    statusBar.style.fontWeight = "600";
    const setStep = (step: number, total: number, label: string) => {
      const msg = `📋 ${step}/${total} ${label}`;
      statusBar.setText(msg);
      new Notice(msg, 10000);
    };

    try {
      setStep(1, 5, "Importando áudio…");
      const audioPath = await importAudio(this);
      if (!audioPath) { statusBar.remove(); return; }

      setStep(2, 5, "Transcrevendo…");
      const result = await transcribeAudio(this, audioPath);
      if (!result) { statusBar.remove(); return; }

      const transcriptPath = result.mdPath ?? result.srtPath;

      // Read transcript content for extract tasks
      const transcriptFile = this.app.vault.getAbstractFileByPath(transcriptPath);
      let transcriptContent = "";
      if (transcriptFile instanceof TFile) {
        transcriptContent = await this.app.vault.read(transcriptFile);
      }

      setStep(3, 5, "Gerando resumo…");
      await summarizeTranscript(this, transcriptPath);

      setStep(4, 5, "Extraindo tasks…");
      // Pass transcript content directly — cursor may have moved after summarize
      await extractTasks(this, transcriptContent);

      setStep(5, 5, "Gerando mindmap…");
      await generateMindmap(this, transcriptPath);

      statusBar.setText("✅ Pipeline completo!");
      new Notice("✅ Pipeline completo!", 5000);
      setTimeout(() => statusBar.remove(), 8000);
    } catch (e: any) {
      statusBar.setText("❌ Pipeline falhou");
      new Notice("Erro no pipeline: " + e.message);
      console.error("[MeetingTools]", e);
      setTimeout(() => statusBar.remove(), 8000);
    }
  }

  async doSetupVault() {
    await withStatusFeedback(this, "Configurando vault", async () => {
      await setupVault(this);
    });
  }
}
