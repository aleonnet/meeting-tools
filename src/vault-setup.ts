import { Notice, TFile } from "obsidian";
import type MeetingToolsPlugin from "./main";
import { ensureFolder } from "./file-utils";
import { t } from "./i18n";
import { getGuideContent, getGuideFilePath } from "./guide";
import {
  LOCALIZED_ARTIFACTS,
  getArtifactContent,
  getArtifactPath,
} from "./vault-templates";

const VAULT_FOLDERS = [
  "Vault",
  "Vault/Templates",
  "Vault/Daily Notes",
  "Vault/Projects",
  "Vault/Projects/Documents",
  "Vault/Audios",
  "Vault/Transcripts",
  "Vault/Resources",
  "Vault/Contacts",
  "Vault/Archive",
];

/**
 * Returns the list of files that Setup Vault creates. Content and paths are
 * locale-aware (see LOCALIZED_ARTIFACTS + getGuideFilePath/getGuideContent),
 * so this is evaluated lazily at call time rather than captured at import.
 */
export function getVaultFiles(): { path: string; content: string }[] {
  const artifacts = LOCALIZED_ARTIFACTS.map((a) => ({
    path: getArtifactPath(a),
    content: getArtifactContent(a),
  }));
  const guide = {
    path: getGuideFilePath(),
    content: getGuideContent(),
  };
  return [...artifacts, guide];
}

export async function setupVault(plugin: MeetingToolsPlugin): Promise<void> {
  const { app } = plugin;
  let created = 0;
  let skipped = 0;

  // Create folders
  for (const folder of VAULT_FOLDERS) {
    await ensureFolder(app, folder);
  }

  // Create files (skip if already exists)
  for (const file of getVaultFiles()) {
    const existing = app.vault.getAbstractFileByPath(file.path);
    if (existing) {
      skipped++;
      continue;
    }
    // Ensure parent folder
    const lastSlash = file.path.lastIndexOf("/");
    if (lastSlash > 0) {
      await ensureFolder(app, file.path.slice(0, lastSlash));
    }
    await app.vault.create(file.path, file.content);
    created++;
  }

  new Notice(t().noticeSetupComplete(created, skipped));

  // Open the task dashboard (locale-aware path)
  const taskDashboard = LOCALIZED_ARTIFACTS.find((a) => a.id === "task-dashboard");
  if (taskDashboard) {
    const dashFile = app.vault.getAbstractFileByPath(getArtifactPath(taskDashboard));
    if (dashFile instanceof TFile) {
      await app.workspace.getLeaf(false).openFile(dashFile);
    }
  }
}
