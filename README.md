# Meeting Tools — Obsidian Plugin

Workflow completo de reuniões e gestão de projetos: gravação de áudio nativa, transcrição, resumo e mindmap (GPT), extração de tasks, criação de projetos a partir de documentos, Kanban board, Gantt timeline e dashboards de tasks.

Funciona em desktop e mobile. Única operação desktop-only: extração automática de PDF/PPTX em **New Project from Document** (usa `pdftotext` via `poppler`). Em mobile, esse comando aceita TXT.

## Instalação

1. Copiar a pasta `meeting-tools/` (com `manifest.json`, `main.js`, `styles.css`) para `.obsidian/plugins/`
2. Ativar o plugin em Settings → Community Plugins
3. Configurar a OpenAI API Key em Settings → Meeting Tools (armazenada no keychain do sistema)
4. `Cmd+P` → "Meeting Tools: Setup Vault" — cria automaticamente todas as pastas, templates e dashboards

## Comandos

Acessíveis via `Cmd+P` ou pelo ícone briefcase no ribbon (sidebar esquerda):

### Áudio
| Comando | Descrição |
|---------|-----------|
| **Start/Stop Recording** | Gravação nativa via MediaRecorder. Status bar mostra duração. Ao parar, salva o áudio e transcreve automaticamente. |
| **Import Audio** | File picker nativo → salva no vault. Re-encoda em Opus via WebCodecs se necessário. |

### Análise com IA
| Comando | Descrição |
|---------|-----------|
| **Transcribe Audio** | Fuzzy search de áudios → API de transcrição (whisper-1 ou gpt-4o-transcribe-diarize) → salva `.srt` + `.md` (com player de áudio embutido) em Transcripts/. VAD pré-processamento opcional remove silêncios prolongados. |
| **Summarize Transcript** | Detecta contexto (seleção ou time block ≥ min words). Se insuficiente, oferece abrir transcrição. GPT gera resumo + tasks numa única chamada (json_schema strict) → preview editável → insere com `---` dentro do time block. |
| **Generate Mindmap** | Mesma lógica de contexto. GPT gera Mermaid mindmap → preview → insere com `---` dentro do time block. |
| **Extract Tasks** | Mesma lógica de contexto. GPT extrai tasks via json_schema strict, com `evidence_quote` rastreável e `owner_type` (`person` / `team` / `unassigned`). Renderizadas como `- [ ] ... [resource::] [priority::] #task #projects/ [[Projeto]] 📅`. Preview → insere com `---`. |

### Projetos e Pipeline
| Comando | Descrição |
|---------|-----------|
| **New Project from Document** | File picker (PDF/PPTX/TXT) → extrai texto → GPT gera nota do projeto → preview → salva em Projects/. Documento original salvo em Projects/Documents/. |
| **Full Pipeline** | Import → Transcribe → Summarize → Mindmap. Status bar mostra etapa atual. Tasks parseáveis saem direto na seção 2 do resumo (formato único com Extract Tasks). |
| **Setup Vault** | Cria a estrutura completa de pastas e arquivos: templates, dashboards, views. Não sobrescreve existentes. |

### Lógica de contexto (Summarize, Mindmap, Extract Tasks)

Os 3 comandos seguem o mesmo fluxo:

1. **Seleção de texto** ≥ `Min words for summary` → usa como input, insere resultado após a seleção com `---`
2. **Time block** (cursor dentro de `### HH:MM`) ≥ `Min words for summary` → usa conteúdo do bloco, insere após com `---`
3. **Texto insuficiente** → modal informando quantidade de palavras e mínimo, com opções [Cancelar] [Abrir transcrição]
4. **Sem contexto** → banner "Posicione o cursor" → [Cancelar] [Continuar] → fuzzy modal de transcrições

Time block é definido exclusivamente por `### HH:MM` — qualquer conteúdo entre dois headers de time block pertence ao bloco.

### Feedback visual

Todos os comandos mostram progresso na status bar: `⏳ operação` → `✅ concluído` (3s) ou `❌ erro` (5s).

## Dashboards (code blocks)

Inserir em qualquer nota para renderizar dashboards interativos:

### Task Dashboard (`meeting-tasks`)
````md
```meeting-tasks
view: project
```
````

Views disponíveis: `project`, `resource`, `aging`, `priority`, `all`

Funcionalidades:
- Status clicável (cicla `[ ]` → `[/]` → `[x]` → `[-]` → `[ ]`)
- Prioridade clicável (cicla `high` → `medium` → `low` → `high`)
- Ícones por aging: 🔴 atrasado, 🟠 hoje, 🔵 esta semana, ⚪ futuro
- Seção colapsável de concluídas/canceladas
- Exportar CSV
- Atualização sincronizada entre múltiplos blocos

### Kanban (`meeting-kanban`)
````md
```meeting-kanban
filter: project
```
````

Filtros: `project`, `resource`, `all`

Funcionalidades:
- 4 colunas: Pendente → Em Progresso → Concluído → Cancelado
- Drag & drop entre colunas atualiza status no arquivo fonte
- Cards com responsável, projeto, prioridade e prazo
- Combo de filtro dinâmico
- Double-click no card abre a nota

### Gantt / Timeline (`meeting-gantt`)
````md
```meeting-gantt
filter: project
```
````

Filtros: `project`, `resource`, `all`. Opcionalmente `value: nome` para filtro fixo.

Funcionalidades:
- Mermaid Gantt gerado dinamicamente das tasks com `⏳` (início) e `📅` (fim)
- Tasks concluídas = `:done`, em progresso = `:active`
- Agrupamento por workstream ou projeto
- Tabela de tasks com prazo + tabela de tasks sem prazo para adicionar datas
- Botão ✏️ abre modal de edição de datas

### Histórico de reuniões (`meeting-history`)
````md
```meeting-history
```
````

Usar dentro de notas de projeto. Lista automaticamente todas as daily notes que mencionam o projeto (via `[[wikilink]]` ou `#projects/tag`), com os time blocks relevantes como subitens.

## Formato de Tasks

```
- [ ] Descrição [resource:: Nome] [priority:: high] #task #projects/nome [[Projeto]] ⏳ 2026-01-01 📅 2026-01-15
```

| Campo | Descrição |
|-------|-----------|
| `[resource:: Nome]` | Responsável |
| `[priority:: high\|medium\|low]` | Prioridade: ⏫ alta, 🔼 média, 🔽 baixa, ➖ sem |
| `#task` | Tag obrigatória para aparecer nos dashboards |
| `#projects/nome` | Associação a projeto |
| `[[Projeto]]` | Wikilink ao arquivo do projeto |
| `⏳ YYYY-MM-DD` | Data início (scheduled) |
| `📅 YYYY-MM-DD` | Data fim (due) |
| `[ ]` `[/]` `[x]` `[-]` | Status: pendente, em progresso, concluído, cancelado |

### Ícones nos dashboards

**Status (por aging):**
| Ícone | Significado |
|-------|-------------|
| 🔴 | Atrasado (prazo vencido) |
| 🟠 | Vence hoje |
| 🔵 | Vence esta semana |
| ⚪ | Futuro ou sem prazo |
| 🟡 | Em progresso `[/]` |
| 🟢 | Concluído `[x]` |
| ⚫ | Cancelado `[-]` |

**Prioridade (clicável para ciclar):**
| Ícone | Nível |
|-------|-------|
| ⏫ | Alta (high) |
| 🔼 | Média (medium) |
| 🔽 | Baixa (low) |
| ➖ | Sem prioridade |

## Settings

Em Obsidian → Settings → Meeting Tools:

| Setting | Descrição | Padrão |
|---------|-----------|--------|
| OpenAI API Key | Armazenada no keychain do sistema | — |
| User Name | Nome nos resumos (itens de ação para [nome]) | Alessandro |
| Audio Directory | Pasta para áudios | Vault/Audios |
| Transcripts Directory | Pasta para transcrições | Vault/Transcripts |
| Transcription Model | Modelo de transcrição. `whisper-1`: rápido e econômico, sem identificação de falantes. `gpt-4o-transcribe-diarize`: identifica falantes (Speaker 1/2/...). | whisper-1 |
| Chunk duration (min) | Tamanho dos chunks em áudios longos. Aplicado também como threshold para chunking anti-alucinação no whisper-1. Range 1-120. | 30 |
| Remove silences | VAD pré-processamento: detecta e remove silêncios antes de enviar | ✅ |
| Min silence (s) | Duração mínima de silêncio para cortar. Range 0.5-30 | 2 |
| Silence threshold (dB) | Energia abaixo da qual o áudio é considerado silêncio. Range -80 a -20 | -50 |
| Summary Model | Modelo OpenAI para resumos e criação de projetos | gpt-4.1 |
| Tasks Model | Modelo OpenAI para extração de tasks | gpt-4.1 |
| Mindmap Model | Modelo OpenAI para mindmaps | gpt-4.1 |
| AI output language | `Auto (match transcript)` / `pt-BR` / `en` | Auto |
| Summary template file | Caminho do `.md` com prompt editável | Vault/Templates/Summary Template.md |
| Generate .md from .srt | Gerar .md limpo ao transcrever | ✅ |
| Show preview | Preview editável antes de inserir | ✅ |
| Min words for summary | Mínimo de palavras para usar contexto automático | 60 |

## Idioma (i18n)

A UI (Notices, Settings, menus) segue automaticamente o idioma do Obsidian. Suportados: **English** e **Português do Brasil**. Qualquer outro locale cai em English. Trocar o idioma do Obsidian reflete na UI após recarregar o plugin.

A saída de IA é controlada pela setting **AI output language**:
- **Auto (match transcript)** — o LLM responde no mesmo idioma da transcrição/input (default).
- **Portuguese (Brazil)** — força PT-BR.
- **English** — força EN.

## Template editável (Summarize)

O prompt do Summarize vive em `Vault/Templates/Summary Template.md` (criado pelo Setup Vault). Edite livremente. Placeholders:
- `{{language_instruction}}` — substituído pela setting de idioma acima
- `{{user_name}}` — nome do usuário
- `{{task_context}}` — preamble dinâmico com User name, wikilinks do time block header e tag `#projects/` (quando resolve). Mantido para back-compat; com structured output, owner/projeto vêm do schema, mas o template ainda recebe o preamble como contexto adicional.
- `{{action_items_block}}` — placeholder preservado verbatim pelo modelo na resposta. O código substitui por tasks renderizadas no formato `- [ ] ... [resource::] #task ...` parseável pelos dashboards.
- `{{transcript}}` — o texto da transcrição (obrigatório manter)

**Back-compat**: templates com o placeholder antigo `{{task_format_spec}}` continuam funcionando — `templates.ts:substitute()` mapeia automaticamente para `{{action_items_block}}`.

### Como o projeto é atribuído às tasks

A fonte é o **header do time block** onde o cursor está (linha `### HH:MM ...`):

- `### 10:00 - Reunião [[Kaidô]]` + `Vault/Projects/Kaidô.md` existe → cada task recebe `#task #projects/kaido [[Kaidô]]`.
- `### 10:00 - Reunião [[Kaidô]] [[Deck.pptx]]` → todos os wikilinks são aplicados; tag `#projects/kaido` só se `Kaidô.md` existir.
- `### 10:00 - Reunião [[Deck.pptx]]` (sem arquivo `Deck.pptx.md` em `Vault/Projects/`) → task recebe `[[Deck.pptx]]` mas sem tag (agrupa em "sem projeto" nos dashboards).
- `### 10:00 - Reunião` (sem wikilinks) → task recebe literal `[[No project]]`.

Tasks em **1ª pessoa** ("eu vou revisar", "I'll check") são atribuídas automaticamente ao `User Name` configurado nas settings.

Se o arquivo for deletado/renomeado, o comando cai automaticamente no template embutido (operação não quebra).

## Dependências

- **OpenAI API Key** — para transcrição (whisper-1 ou gpt-4o-transcribe-diarize) e GPT (resumo, mindmap, tasks, projeto)
- **pdftotext** (opcional, desktop) — para extração de texto de PDFs em **New Project from Document**. Instalado via `brew install poppler`. Fallback regex se ausente.
- **webm-muxer** — dependência npm runtime, JS puro, ~20 KB no bundle. Usada pelo encoder Opus do chunking de transcrição.

Nenhum outro plugin é necessário. Meeting Tools é 100% autossuficiente.

## Build

Requisitos: Node.js 18+

```bash
cd .obsidian/plugins/meeting-tools
npm install
npm run build        # produção (minificado)
npm run dev          # watch mode (desenvolvimento)
```

O build gera `main.js` na raiz do plugin. O Obsidian lê `manifest.json` + `main.js` + `styles.css`.

## Estrutura do código

```
src/
├── main.ts            — Plugin class, comandos, ribbon menu
├── settings.ts        — Interface de settings + SettingTab + secretStorage
├── recorder.ts        — Gravação nativa via MediaRecorder + status bar
├── transcribe.ts      — API de transcrição (whisper-1/diarize) → SRT + MD. Inclui resolveMode (4 paths), bypass single-call, contexto entre chunks, expansão de timestamps via SilenceMap.
├── audio-chunking.ts  — decode + slice + encodeOpus (WebCodecs) ou encodeWav16 (fallback). VAD: removeSilence + mapCompactToOriginal.
├── summarize.ts       — 1 chamada com schema combinado (freeform_markdown + tasks). Substitui {{action_items_block}} no template.
├── task-extractor.ts  — Schema strict + TASK_EXTRACTION_RULES + extractStructuredTasks + renderValidatedTasksAsMarkdown. Compartilhado por extract-tasks e summarize.
├── task-context.ts    — detectMeetingContext + buildTaskContextPreamble (wikilinks + project tag a partir do header do time block).
├── mindmap.ts         — GPT → Mermaid mindmap
├── extract-tasks.ts   — Comando standalone. Delega a task-extractor.ts. Resolução de wikilinks de projeto.
├── new-project.ts     — PDF/PPTX/TXT → GPT → nota de projeto (PDF/PPTX desktop-only)
├── import-audio.ts    — File picker + re-encode Opus via WebCodecs se necessário
├── task-parser.ts     — Parser compartilhado: ParsedTask, status/priority cycle, date edit
├── task-dashboard.ts  — Code block `meeting-tasks` (tabelas, CSV export)
├── kanban.ts          — Code block `meeting-kanban` (drag & drop)
├── gantt.ts           — Code block `meeting-gantt` (Mermaid Gantt + editor de datas)
├── meeting-history.ts — Code block `meeting-history` (daily notes por projeto)
├── vault-setup.ts     — Setup Vault: cria pastas, templates e dashboards
├── vault-templates.ts — Conteúdo localizado dos artefatos do Setup Vault (EN + PT-BR)
├── templates.ts       — loadTemplate + substitute (com back-compat de {{task_format_spec}} → {{action_items_block}})
├── file-icons.ts      — Ícones Lucide no file explorer para arquivos MT
├── file-utils.ts      — Helpers (context detection, cursor banner, status feedback)
├── modals.ts          — Suggest modals, PreviewModal, InsufficientTextModal
├── openai-errors.ts   — Parser de erros da API OpenAI
└── prompts.ts         — System prompts (mindmap, projeto)
```

## Setup Vault — estrutura criada

```
Vault/
├── Templates/
│   ├── Daily Note Template.md
│   └── Project Template.md
├── Daily Notes/
├── Projects/
│   └── Documents/
├── Audios/
├── Transcripts/
├── Resources/
├── Contacts/
├── Archive/
├── MT Task Dashboard.md
├── MT Kanban View.md
└── MT Gantt View.md
```
