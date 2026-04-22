import { getLocale } from "./i18n";

export const GUIDE_EN = `# Meeting Tools — Guide

## First time
1. Settings → Meeting Tools → set your **OpenAI API Key**
2. Run **Setup Vault** (creates folders, templates and dashboards)

## Meeting workflow
1. In a note (e.g. daily note), add a time block:
   \`### 10:00 - Status meeting [[ProjectName]]\`
2. Place the cursor **inside** that block
3. **Start Recording** (or **Import Audio**) — transcription runs automatically when recording stops
4. With the cursor still in the block, run:
   - **Summarize** — summary + parseable tasks
   - **Extract Tasks** — tasks only
   - **Generate Mindmap** — Mermaid diagram
5. Or **Full Pipeline** — chains Import → Transcribe → Summarize → Mindmap

## Project attribution (tasks)
The wikilink in the **time block header** is applied to every task generated:

| Time block header | Task output |
|---|---|
| \`### 10:00 [[ProjectName]]\` + \`Vault/Projects/ProjectName.md\` exists | \`#task #projects/projectname [[ProjectName]]\` |
| \`### 10:00 [[GenericFile.pptx]]\` (no matching project note) | \`#task [[GenericFile.pptx]]\` (no tag) |
| \`### 10:00\` (no wikilink) | \`#task [[No project]]\` |

## Dashboards
Open \`MT Task Dashboard\`, \`MT Kanban View\` or \`MT Gantt View\` (created by Setup Vault). They group tasks by \`#projects/\` and \`[resource::]\`.

## More
Full documentation in the plugin's \`README.md\`, or Settings → Meeting Tools.`;

export const GUIDE_PT_BR = `# Meeting Tools — Guia

## Primeira vez
1. Settings → Meeting Tools → configure sua **OpenAI API Key**
2. Rode **Setup do vault** (cria pastas, templates e dashboards)

## Fluxo de reunião
1. Em uma nota (ex: daily note), crie um time block:
   \`### 10:00 - Reunião de status [[NomeDoProjeto]]\`
2. Posicione o cursor **dentro** desse bloco
3. **Iniciar gravação** (ou **Importar áudio**) — ao parar, transcreve automaticamente
4. Ainda com cursor no bloco, rode:
   - **Resumir transcrição** — resumo + tasks parseáveis
   - **Extrair tasks** — só a lista de tasks
   - **Gerar mindmap** — diagrama Mermaid
5. Ou **Pipeline completo** — encadeia Importar → Transcrever → Resumir → Mindmap

## Atribuição de projeto (tasks)
O wikilink no **header do time block** é aplicado a todas as tasks geradas:

| Header do time block | Task gerada |
|---|---|
| \`### 10:00 [[NomeDoProjeto]]\` + \`Vault/Projects/NomeDoProjeto.md\` existe | \`#task #projects/nomedoprojeto [[NomeDoProjeto]]\` |
| \`### 10:00 [[GenericFile.pptx]]\` (sem nota de projeto) | \`#task [[GenericFile.pptx]]\` (sem tag) |
| \`### 10:00\` (sem wikilink) | \`#task [[No project]]\` |

## Dashboards
Abra \`MT Task Dashboard\`, \`MT Kanban View\` ou \`MT Gantt View\` (criados pelo Setup do vault). Agrupam por \`#projects/\` e \`[resource::]\`.

## Mais
Documentação completa no \`README.md\` do plugin ou Settings → Meeting Tools.`;

/**
 * Returns the guide content matching the current UI locale. Falls back to EN.
 */
export function getGuideContent(): string {
  return getLocale() === "pt-BR" ? GUIDE_PT_BR : GUIDE_EN;
}

/**
 * Canonical vault path for the guide file. Stable across locales — only the
 * content is localized, not the filename. Wikilinks to `[[Meeting Tools — Guide]]`
 * stay valid when the user switches Obsidian language.
 */
export function getGuideFilePath(): string {
  return "Vault/Meeting Tools — Guide.md";
}

/**
 * Legacy path used by v2.2.0-pre when filenames were translated by locale.
 * Kept for one-time migration in `migrateGuideIfNeeded`.
 */
export const GUIDE_LEGACY_PT_BR_PATH = "Vault/Meeting Tools — Guia.md";

/**
 * True if `content` exactly matches one of the shipped guide defaults (EN or
 * PT-BR). Used by the auto-migration to avoid overwriting user-customized
 * guide files.
 */
export function matchesKnownGuideContent(content: string): boolean {
  const normalized = content.trim();
  return normalized === GUIDE_EN.trim() || normalized === GUIDE_PT_BR.trim();
}
