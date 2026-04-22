import { getLocale } from "./i18n";
import { TASK_FORMAT_SPEC } from "./prompts";

// Filenames are canonical (EN) and stable across locales. Only the CONTENT of
// each artifact is localized. Legacy PT-BR paths are kept here only for
// one-time migration of vaults created under v2.2.0-pre.

// --- Summary Template ---

const SUMMARY_TEMPLATE_EN = `
{{language_instruction}}

You are an executive assistant with 20+ years of experience.
Transform the transcript below into meeting notes, following this exact format:

**[Meeting Title]**
**Date:** [Insert Date]
**Participants:** [List]

## 1. Executive Summary
- Concise view of purpose, main topics and outcomes.

## 2. Action Items
Extract ALL action items and commitments from the transcript (for every participant, not only {{user_name}}), following the format below.

{{task_context}}

{{task_format_spec}}

## 3. Detailed Topics
### Topic 1: [Name]
- Discussion points
- Decisions made
- Action items and owners

### Topic 2: [Name]
- (repeat as needed)

RULES:
- Do NOT invent. If something is missing, write literally "Not mentioned".
- Identify participants from the transcript; otherwise "Not mentioned".
- Professional, clear, objective tone. Use bullets and bold headers.

---

Transcript:
{{transcript}}
`.trim();

const SUMMARY_TEMPLATE_PT_BR = `
{{language_instruction}}

Você é um(a) assistente executivo(a) com 20+ anos de experiência.
Transforme a transcrição abaixo em notas de reunião, seguindo este formato exato:

**[Título da Reunião]**
**Data:** [Inserir data]
**Participantes:** [Lista]

## 1. Resumo Executivo
- Visão concisa do propósito, principais tópicos e outcomes.

## 2. Itens de Ação
Extraia TODOS os itens de ação e compromissos da transcrição (para cada participante, não apenas {{user_name}}), seguindo o formato abaixo.

{{task_context}}

{{task_format_spec}}

## 3. Tópicos Detalhados
### Tópico 1: [Nome]
- Pontos discutidos
- Decisões tomadas
- Itens de ação e responsáveis

### Tópico 2: [Nome]
- (repita conforme necessário)

REGRAS:
- NÃO invente. Se algo estiver ausente, escreva literalmente "Não mencionado".
- Identifique participantes a partir da transcrição; caso contrário, "Não mencionado".
- Tom profissional, claro e objetivo. Use bullets e negrito em cabeçalhos.

---

Transcrição:
{{transcript}}
`.trim();

// --- Daily Note Template ---

const DAILY_NOTE_EN = `# {{date:YYYY-MM-DD}}

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
`;

const DAILY_NOTE_PT_BR = `# {{date:YYYY-MM-DD}}

---
## Blocos de Tempo

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
## Notas e Observações
`;

// --- Project Template ---

const PROJECT_TEMPLATE_EN = `# {{title}}

## Executive Summary
>

## Objectives
-

## Workstreams
### 1.
- Owner:
- Scope:

## Timeline


## Stakeholders
| Role | Name |
|------|------|
|      |      |

## Source Documents
-

## Task List


## Meeting History
\`\`\`meeting-history
\`\`\`
`;

const PROJECT_TEMPLATE_PT_BR = `# {{title}}

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
`;

// --- MT Task Dashboard ---

const TASK_DASHBOARD_EN = `# MT Task Dashboard

## By Project
\`\`\`meeting-tasks
view: project
\`\`\`

---

## By Resource
\`\`\`meeting-tasks
view: resource
\`\`\`

---

## By Aging
\`\`\`meeting-tasks
view: aging
\`\`\`

---

## By Priority
\`\`\`meeting-tasks
view: priority
\`\`\`

---

## All Tasks
\`\`\`meeting-tasks
view: all
\`\`\`
`;

const TASK_DASHBOARD_PT_BR = `# MT Task Dashboard

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
`;

// --- MT Kanban View ---

const KANBAN_VIEW_EN = `# MT Kanban View

## By Project
\`\`\`meeting-kanban
filter: project
\`\`\`

---

## By Resource
\`\`\`meeting-kanban
filter: resource
\`\`\`
`;

const KANBAN_VIEW_PT_BR = `# MT Kanban View

## Por Projeto
\`\`\`meeting-kanban
filter: project
\`\`\`

---

## Por Responsável
\`\`\`meeting-kanban
filter: resource
\`\`\`
`;

// --- MT Gantt View ---

const GANTT_VIEW_EN = `# MT Gantt View

## By Project
\`\`\`meeting-gantt
filter: project
\`\`\`

---

## By Resource
\`\`\`meeting-gantt
filter: resource
\`\`\`
`;

const GANTT_VIEW_PT_BR = `# MT Gantt View

## Por Projeto
\`\`\`meeting-gantt
filter: project
\`\`\`

---

## Por Responsável
\`\`\`meeting-gantt
filter: resource
\`\`\`
`;

// --- Registry ---

export interface LocalizedArtifact {
  id: string;
  path: string;
  legacyPtBrPath?: string;
  enContent: string;
  ptBrContent: string;
}

export const LOCALIZED_ARTIFACTS: LocalizedArtifact[] = [
  {
    id: "summary-template",
    path: "Vault/Templates/Summary Template.md",
    legacyPtBrPath: "Vault/Templates/Modelo de Resumo.md",
    enContent: SUMMARY_TEMPLATE_EN,
    ptBrContent: SUMMARY_TEMPLATE_PT_BR,
  },
  {
    id: "daily-note-template",
    path: "Vault/Templates/Daily Note Template.md",
    legacyPtBrPath: "Vault/Templates/Template de Daily Note.md",
    enContent: DAILY_NOTE_EN,
    ptBrContent: DAILY_NOTE_PT_BR,
  },
  {
    id: "project-template",
    path: "Vault/Templates/Project Template.md",
    legacyPtBrPath: "Vault/Templates/Template de Projeto.md",
    enContent: PROJECT_TEMPLATE_EN,
    ptBrContent: PROJECT_TEMPLATE_PT_BR,
  },
  {
    id: "task-dashboard",
    path: "Vault/MT Task Dashboard.md",
    legacyPtBrPath: "Vault/Dashboard de Tasks MT.md",
    enContent: TASK_DASHBOARD_EN,
    ptBrContent: TASK_DASHBOARD_PT_BR,
  },
  {
    id: "kanban-view",
    path: "Vault/MT Kanban View.md",
    legacyPtBrPath: "Vault/Kanban MT.md",
    enContent: KANBAN_VIEW_EN,
    ptBrContent: KANBAN_VIEW_PT_BR,
  },
  {
    id: "gantt-view",
    path: "Vault/MT Gantt View.md",
    legacyPtBrPath: "Vault/Gantt MT.md",
    enContent: GANTT_VIEW_EN,
    ptBrContent: GANTT_VIEW_PT_BR,
  },
];

export function getArtifactPath(a: LocalizedArtifact): string {
  return a.path;
}

export function getArtifactContent(a: LocalizedArtifact): string {
  return getLocale() === "pt-BR" ? a.ptBrContent : a.enContent;
}

export function getLegacyPaths(a: LocalizedArtifact): string[] {
  return a.legacyPtBrPath ? [a.legacyPtBrPath] : [];
}

export function matchesKnownArtifactContent(
  a: LocalizedArtifact,
  content: string
): boolean {
  const normalized = content.trim();
  return (
    normalized === a.enContent.trim() ||
    normalized === a.ptBrContent.trim()
  );
}

export function findArtifactById(id: string): LocalizedArtifact | undefined {
  return LOCALIZED_ARTIFACTS.find((a) => a.id === id);
}

// Re-export for consumers that used to import from prompts.ts.
export { TASK_FORMAT_SPEC };
