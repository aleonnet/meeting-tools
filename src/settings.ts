import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import type MeetingToolsPlugin from "./main";

const SECRET_ID = "meeting-tools-openai-key";

export interface MeetingToolsSettings {
  openaiApiKey: string;
  audioDir: string;
  transcriptsDir: string;
  summaryModel: string;
  mindmapModel: string;
  generateMdFromSrt: boolean;
  showPreview: boolean;
  minWordsForSummary: number;
  userName: string;
}

export const DEFAULT_SETTINGS: MeetingToolsSettings = {
  openaiApiKey: "",
  audioDir: "Vault/Audios",
  transcriptsDir: "Vault/Transcripts",
  summaryModel: "gpt-4.1",
  mindmapModel: "gpt-4.1",
  generateMdFromSrt: true,
  showPreview: true,
  minWordsForSummary: 60,
  userName: "user",
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
    containerEl.empty();

    containerEl.createEl("h2", { text: "Meeting Tools" });

    new Setting(containerEl)
      .setName("OpenAI API Key")
      .setDesc("Armazenada de forma segura no keychain do sistema.")
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
      .setName("User Name")
      .setDesc("Nome usado nos resumos (ex: itens de ação para [nome]).")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.userName)
          .onChange(async (value) => {
            this.plugin.settings.userName = value;
            await saveSettingsWithSecrets(this.plugin, this.plugin.settings);
          })
      );

    containerEl.createEl("h3", { text: "Diretórios" });

    new Setting(containerEl)
      .setName("Audio Directory")
      .setDesc("Pasta para salvar áudios importados/gravados.")
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
      .setName("Transcripts Directory")
      .setDesc("Pasta para salvar transcrições (.srt e .md).")
      .addText((text) =>
        text
          .setPlaceholder("Vault/Transcripts")
          .setValue(this.plugin.settings.transcriptsDir)
          .onChange(async (value) => {
            this.plugin.settings.transcriptsDir = value;
            await saveSettingsWithSecrets(this.plugin, this.plugin.settings);
          })
      );

    containerEl.createEl("h3", { text: "Modelos OpenAI" });

    new Setting(containerEl)
      .setName("Summary Model")
      .setDesc("Modelo para geração de resumos.")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.summaryModel)
          .onChange(async (value) => {
            this.plugin.settings.summaryModel = value;
            await saveSettingsWithSecrets(this.plugin, this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName("Mindmap Model")
      .setDesc("Modelo para geração de mindmaps.")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.mindmapModel)
          .onChange(async (value) => {
            this.plugin.settings.mindmapModel = value;
            await saveSettingsWithSecrets(this.plugin, this.plugin.settings);
          })
      );

    containerEl.createEl("h3", { text: "Comportamento" });

    new Setting(containerEl)
      .setName("Generate .md from .srt")
      .setDesc("Gerar automaticamente um .md limpo ao transcrever.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.generateMdFromSrt)
          .onChange(async (value) => {
            this.plugin.settings.generateMdFromSrt = value;
            await saveSettingsWithSecrets(this.plugin, this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName("Show preview before inserting")
      .setDesc("Exibir preview editável antes de inserir resumo/mindmap.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showPreview)
          .onChange(async (value) => {
            this.plugin.settings.showPreview = value;
            await saveSettingsWithSecrets(this.plugin, this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName("Min words for summary")
      .setDesc("Transcrições abaixo desse limite geram resumo genérico.")
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
