import { Notice, TFile } from "obsidian";
import type MeetingToolsPlugin from "./main";
import { ensureFolder } from "./file-utils";

const VAULT_FILES: { path: string; content: string }[] = [
  {
    path: "Vault/Templates/Daily Note Template.md",
    content: `# {{date:YYYY-MM-DD}}

---
## Time Blocks

### 09:00 -
-

### 10:00 -
-

### 11:00 -
-

### 14:00 -
-

### 15:00 -
-

### 16:00 -
-

### 17:00 -
-

---
## Notes and Thoughts
`,
  },
  {
    path: "Vault/Templates/Project Template.md",
    content: `# {{title}}

## Resumo Executivo
>

## Objetivos
-

## Workstreams
### 1.
- Responsável:
- Escopo:

## Timeline


## Stakeholders
| Papel | Nome |
|-------|------|
|       |      |

## Documentos Base
-

## Task List


## Histórico de Reuniões
\`\`\`meeting-history
\`\`\`
`,
  },
  {
    path: "Vault/MT Task Dashboard.md",
    content: `# MT Task Dashboard

## Por Projeto
\`\`\`meeting-tasks
view: project
\`\`\`

---

## Por Responsável
\`\`\`meeting-tasks
view: resource
\`\`\`

---

## Por Aging
\`\`\`meeting-tasks
view: aging
\`\`\`

---

## Por Prioridade
\`\`\`meeting-tasks
view: priority
\`\`\`

---

## Todas as Tasks
\`\`\`meeting-tasks
view: all
\`\`\`
`,
  },
  {
    path: "Vault/MT Kanban View.md",
    content: `# MT Kanban View

## Por Projeto
\`\`\`meeting-kanban
filter: project
\`\`\`

---

## Por Responsável
\`\`\`meeting-kanban
filter: resource
\`\`\`
`,
  },
  {
    path: "Vault/MT Gantt View.md",
    content: `# MT Gantt View

## Por Projeto
\`\`\`meeting-gantt
filter: project
\`\`\`

---

## Por Responsável
\`\`\`meeting-gantt
filter: resource
\`\`\`
`,
  },
];

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

export async function setupVault(plugin: MeetingToolsPlugin): Promise<void> {
  const { app } = plugin;
  let created = 0;
  let skipped = 0;

  // Create folders
  for (const folder of VAULT_FOLDERS) {
    await ensureFolder(app, folder);
  }

  // Create files (skip if already exists)
  for (const file of VAULT_FILES) {
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

  new Notice(
    `Setup completo: ${created} arquivo(s) criado(s), ${skipped} já existente(s).`
  );

  // Open the task dashboard
  const dashFile = app.vault.getAbstractFileByPath("Vault/MT Task Dashboard.md");
  if (dashFile instanceof TFile) {
    await app.workspace.getLeaf(false).openFile(dashFile);
  }
}
