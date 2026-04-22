import { App, PluginSettingTab, Setting } from "obsidian";
import type MeetingToolsPlugin from "./main";
import { t, type OutputLanguage } from "./i18n";

const SECRET_ID = "meeting-tools-openai-key";

export type TranscriptionModel =
  | "auto"
  | "whisper-1"
  | "gpt-4o-transcribe-diarize";

export interface MeetingToolsSettings {
  openaiApiKey: string;
  audioDir: string;
  transcriptsDir: string;
  transcriptionModel: TranscriptionModel;
  chunkDurationMin: number;
  summaryModel: string;
  tasksModel: string;
  mindmapModel: string;
  outputLanguage: OutputLanguage;
  summaryTemplatePath: string;
  generateMdFromSrt: boolean;
  showPreview: boolean;
  showFileIcons: boolean;
  minWordsForSummary: number;
  userName: string;
  dismissedArtifacts: string[];
  onboardingShown: boolean;
  summaryTemplateCompatDismissed: boolean;
}

export const DEFAULT_SETTINGS: MeetingToolsSettings = {
  openaiApiKey: "",
  audioDir: "Vault/Audios",
  transcriptsDir: "Vault/Transcripts",
  transcriptionModel: "auto",
  chunkDurationMin: 10,
  summaryModel: "gpt-4.1",
  tasksModel: "gpt-4.1",
  mindmapModel: "gpt-4.1",
  outputLanguage: "auto",
  summaryTemplatePath: "Vault/Templates/Summary Template.md",
  generateMdFromSrt: true,
  showPreview: true,
  showFileIcons: true,
  minWordsForSummary: 60,
  userName: "user",
  dismissedArtifacts: [],
  onboardingShown: false,
  summaryTemplateCompatDismissed: false,
};

export function getApiKey(plugin: MeetingToolsPlugin): string {
  return plugin.settings.openaiApiKey || "";
}

// --- Secret storage helpers (same pattern as Whisper plugin) ---

function migrateKeyToSecretStorage(
  plugin: MeetingToolsPlugin,
  settings: MeetingToolsSettings
): boolean {
  const secrets = (plugin.app as any).secretStorage;
  if (settings.openaiApiKey && secrets) {
    secrets.setSecret(SECRET_ID, settings.openaiApiKey);
    settings.openaiApiKey = "";
    return true;
  }
  return false;
}

function loadKeyFromSecretStorage(
  plugin: MeetingToolsPlugin,
  settings: MeetingToolsSettings
): void {
  const secrets = (plugin.app as any).secretStorage;
  if (secrets) {
    settings.openaiApiKey = secrets.getSecret(SECRET_ID) ?? "";
  }
}

export async function loadSettingsWithSecrets(
  plugin: MeetingToolsPlugin
): Promise<MeetingToolsSettings> {
  const settings = Object.assign(
    {},
    DEFAULT_SETTINGS,
    await plugin.loadData()
  );
  if (migrateKeyToSecretStorage(plugin, settings)) {
    await plugin.saveData(settings);
  }
  loadKeyFromSecretStorage(plugin, settings);
  return settings;
}

export async function saveSettingsWithSecrets(
  plugin: MeetingToolsPlugin,
  settings: MeetingToolsSettings
): Promise<void> {
  migrateKeyToSecretStorage(plugin, settings);
  await plugin.saveData(settings);
  loadKeyFromSecretStorage(plugin, settings);
}

// --- Settings Tab ---

export class MeetingToolsSettingTab extends PluginSettingTab {
  plugin: MeetingToolsPlugin;

  constructor(app: App, plugin: MeetingToolsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    const s = t();
    containerEl.empty();

    containerEl.createEl("h2", { text: "Meeting Tools" });

    new Setting(containerEl)
      .setName(s.settingApiKeyName)
      .setDesc(s.settingApiKeyDesc)
      .addText((text) => {
        text.setPlaceholder("sk-...");
        text.setValue(this.plugin.settings.openaiApiKey);
        text.inputEl.type = "password";
        text.onChange(async (value) => {
          this.plugin.settings.openaiApiKey = value;
          await saveSettingsWithSecrets(this.plugin, this.plugin.settings);
        });
      });

    new Setting(containerEl)
      .setName(s.settingUserNameName)
      .setDesc(s.settingUserNameDesc)
      .addText((text) =>
        text
          .setValue(this.plugin.settings.userName)
          .onChange(async (value) => {
            this.plugin.settings.userName = value;
            await saveSettingsWithSecrets(this.plugin, this.plugin.settings);
          })
      );

    containerEl.createEl("h3", { text: s.settingSectionDirs });

    new Setting(containerEl)
      .setName(s.settingAudioDirName)
      .setDesc(s.settingAudioDirDesc)
      .addText((text) =>
        text
          .setPlaceholder("Vault/Audios")
          .setValue(this.plugin.settings.audioDir)
          .onChange(async (value) => {
            this.plugin.settings.audioDir = value;
            await saveSettingsWithSecrets(this.plugin, this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName(s.settingTranscriptsDirName)
      .setDesc(s.settingTranscriptsDirDesc)
      .addText((text) =>
        text
          .setPlaceholder("Vault/Transcripts")
          .setValue(this.plugin.settings.transcriptsDir)
          .onChange(async (value) => {
            this.plugin.settings.transcriptsDir = value;
            await saveSettingsWithSecrets(this.plugin, this.plugin.settings);
          })
      );

    containerEl.createEl("h3", { text: s.settingSectionTranscription });

    new Setting(containerEl)
      .setName(s.settingTranscriptionModelName)
      .setDesc(s.settingTranscriptionModelDesc)
      .addDropdown((drop) =>
        drop
          .addOption("auto", "Auto")
          .addOption("whisper-1", "whisper-1")
          .addOption("gpt-4o-transcribe-diarize", "gpt-4o-transcribe-diarize")
          .setValue(this.plugin.settings.transcriptionModel)
          .onChange(async (value: string) => {
            this.plugin.settings.transcriptionModel = value as TranscriptionModel;
            await saveSettingsWithSecrets(this.plugin, this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName(s.settingChunkDurationName)
      .setDesc(s.settingChunkDurationDesc)
      .addText((text) =>
        text
          .setValue(String(this.plugin.settings.chunkDurationMin))
          .onChange(async (value) => {
            const n = parseInt(value, 10);
            if (!isNaN(n) && n > 0) {
              this.plugin.settings.chunkDurationMin = n;
              await saveSettingsWithSecrets(this.plugin, this.plugin.settings);
            }
          })
      );

    containerEl.createEl("h3", { text: s.settingSectionModels });

    new Setting(containerEl)
      .setName(s.settingSummaryModelName)
      .setDesc(s.settingSummaryModelDesc)
      .addText((text) =>
        text
          .setValue(this.plugin.settings.summaryModel)
          .onChange(async (value) => {
            this.plugin.settings.summaryModel = value;
            await saveSettingsWithSecrets(this.plugin, this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName(s.settingTasksModelName)
      .setDesc(s.settingTasksModelDesc)
      .addText((text) =>
        text
          .setValue(this.plugin.settings.tasksModel)
          .onChange(async (value) => {
            this.plugin.settings.tasksModel = value;
            await saveSettingsWithSecrets(this.plugin, this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName(s.settingMindmapModelName)
      .setDesc(s.settingMindmapModelDesc)
      .addText((text) =>
        text
          .setValue(this.plugin.settings.mindmapModel)
          .onChange(async (value) => {
            this.plugin.settings.mindmapModel = value;
            await saveSettingsWithSecrets(this.plugin, this.plugin.settings);
          })
      );

    containerEl.createEl("h3", { text: s.settingSectionLanguage });

    new Setting(containerEl)
      .setName(s.settingOutputLanguageName)
      .setDesc(s.settingOutputLanguageDesc)
      .addDropdown((drop) =>
        drop
          .addOption("auto", s.settingOutputLanguageAuto)
          .addOption("pt-BR", s.settingOutputLanguagePt)
          .addOption("en", s.settingOutputLanguageEn)
          .setValue(this.plugin.settings.outputLanguage)
          .onChange(async (value: string) => {
            this.plugin.settings.outputLanguage = value as OutputLanguage;
            await saveSettingsWithSecrets(this.plugin, this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName(s.settingSummaryTemplateName)
      .setDesc(s.settingSummaryTemplateDesc)
      .addText((text) =>
        text
          .setPlaceholder("Vault/Templates/Summary Template.md")
          .setValue(this.plugin.settings.summaryTemplatePath)
          .onChange(async (value) => {
            this.plugin.settings.summaryTemplatePath = value;
            await saveSettingsWithSecrets(this.plugin, this.plugin.settings);
          })
      );

    containerEl.createEl("h3", { text: s.settingSectionBehavior });

    new Setting(containerEl)
      .setName(s.settingGenerateMdName)
      .setDesc(s.settingGenerateMdDesc)
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.generateMdFromSrt)
          .onChange(async (value) => {
            this.plugin.settings.generateMdFromSrt = value;
            await saveSettingsWithSecrets(this.plugin, this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName(s.settingShowPreviewName)
      .setDesc(s.settingShowPreviewDesc)
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showPreview)
          .onChange(async (value) => {
            this.plugin.settings.showPreview = value;
            await saveSettingsWithSecrets(this.plugin, this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName(s.settingShowFileIconsName)
      .setDesc(s.settingShowFileIconsDesc)
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showFileIcons)
          .onChange(async (value) => {
            this.plugin.settings.showFileIcons = value;
            await saveSettingsWithSecrets(this.plugin, this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName(s.settingMinWordsName)
      .setDesc(s.settingMinWordsDesc)
      .addText((text) =>
        text
          .setValue(String(this.plugin.settings.minWordsForSummary))
          .onChange(async (value) => {
            const n = parseInt(value, 10);
            if (!isNaN(n) && n > 0) {
              this.plugin.settings.minWordsForSummary = n;
              await saveSettingsWithSecrets(this.plugin, this.plugin.settings);
            }
          })
      );
  }
}
