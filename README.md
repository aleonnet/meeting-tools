# Meeting Tools — Obsidian Plugin

Workflow completo de reuniões e gestão de projetos: gravação de áudio nativa, transcrição (Whisper), resumo e mindmap (GPT), extração de tasks, criação de projetos a partir de documentos, Kanban board, Gantt timeline e dashboards de tasks.

**Desktop only** — usa MediaRecorder (gravação) e Node.js APIs (extração de PDF/PPTX).

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
| **Start/Stop Recording** | Gravação nativa via MediaRecorder. Status bar mostra duração. Ao parar, salva o áudio e transcreve automaticamente via Whisper API. |
| **Import Audio** | File picker nativo → salva no vault. Comprime via Web Audio API se >25MB. |

### Análise com IA
| Comando | Descrição |
|---------|-----------|
| **Transcribe Audio** | Fuzzy search de áudios → Whisper API → salva `.srt` + `.md` (com player de áudio embutido) em Transcripts/ |
| **Summarize Transcript** | Detecta contexto (seleção ou time block ≥ min words). Se insuficiente, oferece abrir transcrição. GPT gera resumo → preview editável → insere com `---` dentro do time block. |
| **Generate Mindmap** | Mesma lógica de contexto. GPT gera Mermaid mindmap → preview → insere com `---` dentro do time block. |
| **Extract Tasks** | Mesma lógica de contexto. GPT extrai tasks formatadas com `[resource::]`, `[priority::]`, `#task`, `#projects/`, `[[Projeto]]`, `📅`. Preview → insere com `---`. |

### Projetos e Pipeline
| Comando | Descrição |
|---------|-----------|
| **New Project from Document** | File picker (PDF/PPTX/TXT) → extrai texto → GPT gera nota do projeto → preview → salva em Projects/. Documento original salvo em Projects/Documents/. |
| **Full Pipeline** | Import → Transcribe → Summarize → Extract Tasks → Mindmap. Status bar mostra etapa atual. |
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
| Summary Model | Modelo OpenAI para resumos | gpt-4.1 |
| Mindmap Model | Modelo OpenAI para mindmaps | gpt-4.1 |
| Generate .md from .srt | Gerar .md limpo ao transcrever | ✅ |
| Show preview | Preview editável antes de inserir | ✅ |
| Min words for summary | Mínimo de palavras para usar contexto automático | 60 |

## Dependências

- **OpenAI API Key** — para Whisper (transcrição) e GPT (resumo, mindmap, tasks, projeto)
- **pdftotext** (opcional) — para extração de texto de PDFs. Instalado via `brew install poppler`. Fallback regex se ausente.

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
├── transcribe.ts      — Whisper API → SRT + MD (com player embutido)
├── summarize.ts       — GPT → resumo estruturado
├── mindmap.ts         — GPT → Mermaid mindmap
├── extract-tasks.ts   — GPT → tasks formatadas + resolução de wikilinks
├── new-project.ts     — PDF/PPTX/TXT → GPT → nota de projeto
├── import-audio.ts    — File picker + compressão Web Audio API se >25MB
├── task-parser.ts     — Parser compartilhado: ParsedTask, status/priority cycle, date edit
├── task-dashboard.ts  — Code block `meeting-tasks` (tabelas, CSV export)
├── kanban.ts          — Code block `meeting-kanban` (drag & drop)
├── gantt.ts           — Code block `meeting-gantt` (Mermaid Gantt + editor de datas)
├── meeting-history.ts — Code block `meeting-history` (daily notes por projeto)
├── vault-setup.ts     — Setup Vault: cria pastas, templates e dashboards
├── file-icons.ts      — Ícones Lucide no file explorer para arquivos MT
├── file-utils.ts      — Helpers (context detection, cursor banner, status feedback)
├── modals.ts          — Suggest modals, PreviewModal, InsufficientTextModal
└── prompts.ts         — System prompts (resumo, mindmap, extração, projeto)
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
