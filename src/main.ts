import { Menu, Notice, Plugin, TFile, debounce } from "obsidian";
import {
  DEFAULT_SETTINGS,
  MeetingToolsSettings,
  MeetingToolsSettingTab,
  getApiKey,
  loadSettingsWithSecrets,
  saveSettingsWithSecrets,
} from "./settings";
import {
  showCursorBanner,
  withStatusFeedback,
  getContextCheck,
  ContextCheck,
  showApiKeyMissingNotice,
} from "./file-utils";
import { transcribeAudio } from "./transcribe";
import { summarizeTranscript } from "./summarize";
import { generateMindmap } from "./mindmap";
import { importAudio } from "./import-audio";
import { extractTasks } from "./extract-tasks";
import { newProjectFromDocument } from "./new-project";
import { AudioSuggestModal, TranscriptSuggestModal, InsufficientTextModal, GuideModal } from "./modals";
import { registerTaskDashboard } from "./task-dashboard";
import { registerKanban } from "./kanban";
import { registerGantt } from "./gantt";
import { startRecordingWithControls } from "./recorder";
import { setupVault, getVaultFiles } from "./vault-setup";
import {
  getGuideContent,
  getGuideFilePath,
  GUIDE_LEGACY_PT_BR_PATH,
  matchesKnownGuideContent,
} from "./guide";
import {
  LOCALIZED_ARTIFACTS,
  findArtifactById,
  getArtifactContent,
  getArtifactPath,
  getLegacyPaths,
  matchesKnownArtifactContent,
} from "./vault-templates";
import { findMissingPlaceholders } from "./templates";
import { registerMeetingHistory } from "./meeting-history";
import { registerFileIcons } from "./file-icons";
import { resolveLocale, setLocale, t } from "./i18n";

export default class MeetingToolsPlugin extends Plugin {
  settings: MeetingToolsSettings = DEFAULT_SETTINGS;

  async onload() {
    setLocale(resolveLocale());
    await this.loadSettings();
    this.addSettingTab(new MeetingToolsSettingTab(this.app, this));

    // Code block processors
    registerTaskDashboard(this);
    registerKanban(this);
    registerGantt(this);

    registerMeetingHistory(this);

    // Reactive refresh bus for task-based dashboards (tasks / kanban / gantt).
    // A single metadataCache listener debounces and fans out one workspace
    // event; each render child subscribes and re-renders itself. Covers both
    // in-plugin edits (click / drag / modal) and external edits (other pane,
    // sync, rename) — close/reopen is no longer required.
    const fireTasksChanged = debounce(
      () => this.app.workspace.trigger("meeting-tools:tasks-changed"),
      250,
      true
    );
    this.registerEvent(
      this.app.metadataCache.on("changed", (_file, _data, cache) => {
        const hasTaskTag = cache?.tags?.some((t) => t.tag === "#task");
        if (hasTaskTag) fireTasksChanged();
      })
    );
    this.registerEvent(this.app.vault.on("delete", () => fireTasksChanged()));
    this.registerEvent(this.app.vault.on("rename", () => fireTasksChanged()));

    // File explorer icons (toggleable — runtime changes require plugin reload)
    if (this.settings.showFileIcons) {
      registerFileIcons(this);
    }

    // Migrate guide to current locale (if applicable) and then check for
    // missing artifacts. Sequencing matters: the migration may delete a
    // non-current-locale file that checkMissingArtifacts would otherwise
    // flag as missing.
    this.app.workspace.onLayoutReady(async () => {
      await this.migrateGuideIfNeeded();
      await this.migrateArtifactsIfNeeded();
      this.checkMissingArtifacts();
      await this.checkSummaryTemplateCompat();
      await this.maybeShowOnboarding();
    });

    // Ribbon menu
    this.addRibbonIcon("briefcase", "Meeting Tools", (evt) => {
      const s = t();
      const menu = new Menu();
      menu.addItem((item) =>
        item.setTitle(s.cmdStartRecording).setIcon("mic").onClick(() => this.record())
      );
      menu.addItem((item) =>
        item.setTitle(s.cmdImportAudio).setIcon("download").onClick(() => this.doImportAudio())
      );
      menu.addSeparator();
      menu.addItem((item) =>
        item.setTitle(s.cmdTranscribe).setIcon("file-text").onClick(() => this.doTranscribe())
      );
      menu.addItem((item) =>
        item.setTitle(s.cmdSummarize).setIcon("clipboard-list").onClick(() => this.doSummarize())
      );
      menu.addItem((item) =>
        item.setTitle(s.cmdMindmap).setIcon("git-branch").onClick(() => this.doMindmap())
      );
      menu.addItem((item) =>
        item.setTitle(s.cmdExtractTasks).setIcon("check-square").onClick(() => this.doExtractTasks())
      );
      menu.addSeparator();
      menu.addItem((item) =>
        item.setTitle(s.cmdNewProject).setIcon("folder-plus").onClick(() => this.doNewProject())
      );
      menu.addItem((item) =>
        item.setTitle(s.cmdFullPipeline).setIcon("zap").onClick(() => this.doFullPipeline())
      );
      menu.addSeparator();
      menu.addItem((item) =>
        item.setTitle(s.cmdSetupVault).setIcon("settings").onClick(() => this.doSetupVault())
      );
      menu.addItem((item) =>
        item.setTitle(s.cmdQuickStartGuide).setIcon("book-open").onClick(() => this.doShowGuide())
      );
      menu.showAtMouseEvent(evt);
    });

    // Commands — names resolved now because command registration is one-shot.
    // Users who switch Obsidian language will see new names on next reload.
    const s = t();
    this.addCommand({ id: "record", name: s.cmdStartRecording, callback: () => this.record() });
    this.addCommand({ id: "import-audio", name: s.cmdImportAudio, callback: () => this.doImportAudio() });
    this.addCommand({ id: "transcribe", name: s.cmdTranscribe, callback: () => this.doTranscribe() });
    this.addCommand({ id: "summarize", name: s.cmdSummarize, callback: () => this.doSummarize() });
    this.addCommand({ id: "mindmap", name: s.cmdMindmap, callback: () => this.doMindmap() });
    this.addCommand({ id: "extract-tasks", name: s.cmdExtractTasks, callback: () => this.doExtractTasks() });
    this.addCommand({ id: "new-project", name: s.cmdNewProject, callback: () => this.doNewProject() });
    this.addCommand({ id: "full-pipeline", name: s.cmdFullPipeline, callback: () => this.doFullPipeline() });
    this.addCommand({ id: "setup-vault", name: s.cmdSetupVault, callback: () => this.doSetupVault() });
    this.addCommand({ id: "quick-start-guide", name: s.cmdQuickStartGuide, callback: () => this.doShowGuide() });
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
    await withStatusFeedback(this, t().statusLabelImport, async () => {
      await importAudio(this);
    });
  }

  async doTranscribe(audioPath?: string) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      showApiKeyMissingNotice(this);
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

    await withStatusFeedback(this, t().statusLabelTranscribe, async () => {
      const result = await transcribeAudio(this, path);
      if (result) {
        new Notice(t().noticeTranscriptSaved(result.srtPath));
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
      await withStatusFeedback(this, t().statusLabelSummarize, async () => {
        await summarizeTranscript(this, undefined, check.result!);
      });
    } else {
      const path = transcriptPath ?? await this.fallbackToFuzzyModal(check);
      if (!path) return;
      await withStatusFeedback(this, t().statusLabelSummarize, async () => {
        await summarizeTranscript(this, path);
      });
    }
  }

  async doMindmap(transcriptPath?: string) {
    const check = getContextCheck(this.app, this.settings.minWordsForSummary);
    if (check.result) {
      await withStatusFeedback(this, t().statusLabelMindmap, async () => {
        await generateMindmap(this, undefined, check.result!);
      });
    } else {
      const path = transcriptPath ?? await this.fallbackToFuzzyModal(check);
      if (!path) return;
      await withStatusFeedback(this, t().statusLabelMindmap, async () => {
        await generateMindmap(this, path);
      });
    }
  }

  async doExtractTasks() {
    const check = getContextCheck(this.app, this.settings.minWordsForSummary);
    if (check.result) {
      await withStatusFeedback(this, t().statusLabelTasks, async () => {
        await extractTasks(this, check.result!.text, check.result!);
      });
    } else {
      const path = await this.fallbackToFuzzyModal(check);
      if (!path) return;
      const file = this.app.vault.getAbstractFileByPath(path);
      if (!file || !(file instanceof TFile)) return;
      const raw = await this.app.vault.read(file);
      await withStatusFeedback(this, t().statusLabelTasks, async () => {
        await extractTasks(this, raw);
      });
    }
  }

  async doNewProject() {
    await withStatusFeedback(this, t().statusLabelProject, async () => {
      await newProjectFromDocument(this);
    });
  }

  async doFullPipeline() {
    const s = t();
    const statusBar = this.addStatusBarItem();
    statusBar.style.fontWeight = "600";
    let currentStep = "";
    const setStep = (step: number, total: number, label: string) => {
      currentStep = label;
      const msg = s.pipelineStep(step, total, label);
      statusBar.setText(msg);
      new Notice(msg, 10000);
    };

    try {
      setStep(1, 4, s.pipelineStepImport);
      const audioPath = await importAudio(this);
      if (!audioPath) { statusBar.remove(); return; }

      setStep(2, 4, s.pipelineStepTranscribe);
      const result = await transcribeAudio(this, audioPath);
      if (!result) { statusBar.remove(); return; }

      const transcriptPath = result.mdPath ?? result.srtPath;

      setStep(3, 4, s.pipelineStepSummarize);
      // Summary section 2 now produces parseable tasks inline — no separate
      // Extract Tasks step needed. Extract Tasks remains available as a
      // standalone command for arbitrary text outside the meeting flow.
      await summarizeTranscript(this, transcriptPath);

      setStep(4, 4, s.pipelineStepMindmap);
      await generateMindmap(this, transcriptPath);

      statusBar.setText(s.pipelineComplete);
      new Notice(s.pipelineComplete, 5000);
      setTimeout(() => statusBar.remove(), 8000);
    } catch (e: any) {
      statusBar.setText(
        currentStep ? `${s.pipelineFailed} — ${currentStep}` : s.pipelineFailed
      );
      new Notice(s.pipelineErrorAt(currentStep, e.message), 10000);
      console.error("[MeetingTools]", e);
      setTimeout(() => statusBar.remove(), 8000);
    }
  }

  async doSetupVault() {
    await withStatusFeedback(this, t().statusLabelVault, async () => {
      await setupVault(this);
    });
  }

  async doShowGuide() {
    new GuideModal(this.app, t().modalGuideTitle, getGuideContent()).open();
  }

  /**
   * Opens the guide modal automatically on first install when the user has
   * no API key configured. Sets the `onboardingShown` flag regardless so the
   * prompt never reappears — the user who dismissed it once chose to ignore.
   */
  private async maybeShowOnboarding(): Promise<void> {
    if (this.settings.onboardingShown) return;
    if (!this.getApiKey()) {
      new GuideModal(this.app, t().modalGuideTitle, getGuideContent()).open();
    }
    this.settings.onboardingShown = true;
    await this.saveSettings();
  }

  /**
   * One-time rename of a legacy PT-BR guide filename to the canonical EN
   * filename (user content preserved). Then refreshes content of non-custom
   * files to the current locale's shipped default. Customized files are
   * never overwritten.
   */
  private async migrateGuideIfNeeded(): Promise<void> {
    const expected = getGuideFilePath();
    const freshContent = getGuideContent();

    const legacyFile = this.app.vault.getAbstractFileByPath(GUIDE_LEGACY_PT_BR_PATH);
    if (legacyFile instanceof TFile) {
      const canonicalExists = this.app.vault.getAbstractFileByPath(expected);
      if (!canonicalExists) {
        await this.app.vault.rename(legacyFile, expected);
      } else {
        console.warn(
          `[MeetingTools] Both guide paths exist (${GUIDE_LEGACY_PT_BR_PATH} and ${expected}); skipping rename. Resolve manually.`
        );
      }
    }

    const expectedFile = this.app.vault.getAbstractFileByPath(expected);
    if (expectedFile instanceof TFile) {
      const content = await this.app.vault.read(expectedFile);
      if (
        matchesKnownGuideContent(content) &&
        content.trim() !== freshContent.trim()
      ) {
        await this.app.vault.modify(expectedFile, freshContent);
      }
    }
  }

  /**
   * For each localized artifact (Summary Template, Daily Note Template, etc.):
   *   1. If a legacy (pre-2.2.0) PT-BR-named file exists and the canonical
   *      filename is empty → rename legacy → canonical, preserving user
   *      content (customized or not).
   *   2. If both exist → log warning and skip (user resolves manually).
   *   3. If canonical file has known default content but outdated for current
   *      locale → refresh to current shipped default. Customized files
   *      never overwritten.
   *
   * Also updates `settings.summaryTemplatePath` if it still points to the
   * legacy PT-BR filename — points it at the canonical path.
   */
  private async migrateArtifactsIfNeeded(): Promise<void> {
    for (const a of LOCALIZED_ARTIFACTS) {
      const canonical = getArtifactPath(a);
      const fresh = getArtifactContent(a);
      const legacyPaths = getLegacyPaths(a);

      for (const legacy of legacyPaths) {
        const legacyFile = this.app.vault.getAbstractFileByPath(legacy);
        if (!(legacyFile instanceof TFile)) continue;
        const canonicalExists = this.app.vault.getAbstractFileByPath(canonical);
        if (canonicalExists) {
          console.warn(
            `[MeetingTools] Both paths exist for ${a.id} (${legacy} and ${canonical}); skipping rename. Resolve manually.`
          );
          continue;
        }
        const lastSlash = canonical.lastIndexOf("/");
        if (lastSlash > 0) {
          const parent = canonical.slice(0, lastSlash);
          const parentEl = this.app.vault.getAbstractFileByPath(parent);
          if (!parentEl) await this.app.vault.createFolder(parent).catch(() => {});
        }
        await this.app.vault.rename(legacyFile, canonical);
      }

      const canonicalFile = this.app.vault.getAbstractFileByPath(canonical);
      if (canonicalFile instanceof TFile) {
        const content = await this.app.vault.read(canonicalFile);
        if (
          matchesKnownArtifactContent(a, content) &&
          content.trim() !== fresh.trim()
        ) {
          await this.app.vault.modify(canonicalFile, fresh);
        }
      }
    }

    // If the user's summaryTemplatePath still points at the legacy PT-BR path,
    // migrate it to the canonical path.
    const summaryArtifact = findArtifactById("summary-template");
    if (summaryArtifact) {
      const canonical = getArtifactPath(summaryArtifact);
      const legacy = getLegacyPaths(summaryArtifact);
      if (
        legacy.includes(this.settings.summaryTemplatePath) &&
        this.settings.summaryTemplatePath !== canonical
      ) {
        this.settings.summaryTemplatePath = canonical;
        await this.saveSettings();
      }
    }
  }

  /**
   * Warns the user when their customized Summary Template is missing
   * placeholders the plugin's prompts still expect. Silent on default
   * templates (matches shipped content) and on templates containing all
   * critical placeholders. User-set "dismiss" suppresses until the flag is
   * reset (either by regeneration or manual toggle).
   */
  private async checkSummaryTemplateCompat(): Promise<void> {
    if (this.settings.summaryTemplateCompatDismissed) return;
    const path = this.settings.summaryTemplatePath;
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!(file instanceof TFile)) return;

    const artifact = findArtifactById("summary-template");
    if (!artifact) return;

    const content = await this.app.vault.read(file);
    if (matchesKnownArtifactContent(artifact, content)) return;

    const required = ["transcript", "task_format_spec"];
    const missing = findMissingPlaceholders(content, required);
    if (missing.length === 0) return;

    const s = t();
    const missingStr = missing.map((k) => `{{${k}}}`).join(", ");
    const notice = new Notice("", 0);
    const el = notice.noticeEl;
    el.empty();
    el.addClass("mt-missing-notice");
    el.createEl("div", { text: s.noticeSummaryTemplateIncompatible(missingStr) });

    const btnRow = el.createDiv({ cls: "mt-notice-btn-row" });

    const regenBtn = btnRow.createEl("button", {
      text: s.btnRegenerateTemplate,
      cls: "mod-cta",
    });
    regenBtn.addEventListener("click", async () => {
      await this.app.vault.modify(file, getArtifactContent(artifact));
      new Notice(s.noticeSummaryTemplateRegenerated, 5000);
      notice.hide();
    });

    const dismissBtn = btnRow.createEl("button", { text: s.btnDismiss });
    dismissBtn.addEventListener("click", async () => {
      this.settings.summaryTemplateCompatDismissed = true;
      await this.saveSettings();
      notice.hide();
    });
  }

  private checkMissingArtifacts(): void {
    const missing = getVaultFiles()
      .map((f) => f.path)
      .filter(
        (p) =>
          !this.app.vault.getAbstractFileByPath(p) &&
          !this.settings.dismissedArtifacts.includes(p)
      );

    if (missing.length === 0) return;

    const s = t();
    const notice = new Notice("", 0);
    const el = notice.noticeEl;
    el.empty();
    el.addClass("mt-missing-notice");
    el.createEl("div", { text: s.noticeMissingArtifacts(missing.length) });

    // Inline basename list so the user sees which files are missing before
    // deciding to Run Setup Vault vs Dismiss.
    const basenames = missing.map((p) => {
      const last = p.lastIndexOf("/");
      const name = last >= 0 ? p.slice(last + 1) : p;
      return name.endsWith(".md") ? name.slice(0, -3) : name;
    });
    const shown = basenames.slice(0, 3).join(", ");
    const more = Math.max(0, basenames.length - 3);
    const listEl = el.createEl("div", {
      text: s.noticeMissingArtifactsList(shown, more),
    });
    listEl.style.fontSize = "0.9em";
    listEl.style.color = "var(--text-muted)";
    listEl.style.marginBottom = "4px";

    const btnRow = el.createDiv({ cls: "mt-notice-btn-row" });

    const runBtn = btnRow.createEl("button", {
      text: s.btnRunSetupVault,
      cls: "mod-cta",
    });
    runBtn.addEventListener("click", async () => {
      notice.hide();
      await this.doSetupVault();
      // After setup, remove any dismissed paths that now exist so a future
      // deletion still surfaces the notice.
      this.settings.dismissedArtifacts = this.settings.dismissedArtifacts.filter(
        (p) => !this.app.vault.getAbstractFileByPath(p)
      );
      await this.saveSettings();
    });

    const dismissBtn = btnRow.createEl("button", { text: s.btnDismiss });
    dismissBtn.addEventListener("click", async () => {
      notice.hide();
      this.settings.dismissedArtifacts = Array.from(
        new Set([...this.settings.dismissedArtifacts, ...missing])
      );
      await this.saveSettings();
    });
  }
}
