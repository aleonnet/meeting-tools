# Changelog

## [2.2.0] - 2026-04-15

### Adicionado
- **Template editável de Summarize** em `Vault/Templates/Summary Template.md`. Criado pelo Setup Vault, carregado em runtime via `loadTemplate()` com fallback silencioso para o default embutido (sem quebrar o comando se o arquivo estiver ausente/vazio/corrompido).
- **Localização (i18n) EN + PT-BR**. Detecta automaticamente o locale do Obsidian via `window.localStorage.getItem("language")`. Outros idiomas caem em English. Cobre Notices, labels de settings, menu ribbon, comandos, modais, banner do gravador, status bar, dashboards (Task/Kanban/Gantt/Meeting History) e mensagens de erro propagadas pro usuário. Arquitetura extensível: novo idioma = novo arquivo em `src/i18n/` + import.
- **Setting `outputLanguage`** com 3 modos: `Auto (match transcript)` (default — instrui o LLM a seguir o idioma da transcrição), `Portuguese (Brazil)`, `English`. Aplicado a Summarize, Mindmap, Extract Tasks e New Project.
- **Check de artefatos na inicialização** — ao abrir o Obsidian, o plugin detecta templates e dashboards MT* ausentes e mostra um Notice clicável com botões `Run Setup Vault` e `Dismiss`. `Dismiss` adiciona os paths a `dismissedArtifacts` (persistente) — artefatos dispensados ficam silenciosos até serem recriados via Setup Vault.
- **Setting `showFileIcons`** (default true) — toggle para os ícones Lucide no file explorer (templates e MT*). Ícone próprio para `Summary Template` (clipboard-list).
- Placeholders no template do Summarize: `{{language_instruction}}`, `{{user_name}}`, `{{task_format_spec}}`, `{{transcript}}`.

### Unificação do formato de tasks
- **Seção 2 do Summary agora gera tasks no formato parseável** (`- [ ] ... [resource::] [priority::] #task #projects/ [[Projeto]] 📅`) — alimenta diretamente os dashboards `meeting-tasks`, `meeting-kanban`, `meeting-gantt`. Elimina a duplicação entre o resumo e o Extract Tasks.
- **Single source of truth**: novo `TASK_FORMAT_SPEC` em `src/prompts.ts` consumido por `EXTRACT_TASKS_PROMPT` (via template literal) e pelo Summary Template (via placeholder `{{task_format_spec}}`).
- **Regra corrigida**: Summary não exige mais `deadline` explícito — owner obrigatório, `📅` opcional, alinhado com Extract Tasks.
- **Full Pipeline reduzido de 5 para 4 passos**: Import → Transcribe → Summarize → Mindmap. Extract Tasks continua disponível como comando standalone (ribbon + Cmd+P) para texto arbitrário fora do fluxo de reunião.

### Refinamento da extração de tasks
- **Summary seção 2 agora extrai TODAS as tasks da reunião**, não mais filtradas por `{{user_name}}`. Título mudou para "Action Items" (sem filtro pessoal).
- **Fonte do projeto**: wikilinks do time block header que contém o cursor. Ex: `### 10:00 - Alinhamento [[Kaidô]] [[Deck.pptx]]` → cada task recebe `[[Kaidô]] [[Deck.pptx]]`.
- **Tag `#projects/slug`** só é gerada quando o primeiro wikilink resolve (case- e accent-insensitive) para um arquivo em `Vault/Projects/*.md`. Senão, task fica sem tag (aparece em "(sem projeto)" nos dashboards).
- **Sem wikilinks no header** → task recebe `[[No project]]` literal (dashboards agrupam em "(sem projeto)").
- **Tasks em 1ª pessoa** ("eu vou...", "I'll...") atribuídas automaticamente a `settings.userName`.
- Novo `src/task-context.ts` com `detectMeetingContext` + `buildTaskContextPreamble` compartilhado por Summary e Extract Tasks.
- Placeholder novo `{{task_context}}` no Summary Template.

### Quick Start Guide
- Novo comando **Quick Start Guide** / **Guia rápido** (ribbon menu abaixo de Setup Vault + Cmd+P). Abre modal read-only com o fluxo essencial do plugin (primeira configuração, workflow de reunião, atribuição de projeto nas tasks, dashboards). Bilíngue: PT-BR ou EN conforme locale do Obsidian.
- Setup Vault cria o guide com **filename localizado**: `Vault/Meeting Tools — Guide.md` em EN, `Vault/Meeting Tools — Guia.md` em PT-BR. Ícone `book-open` em ambos (respeita `showFileIcons`).
- **Migração automática ao trocar idioma**: ao recarregar com locale diferente, o arquivo antigo (se conteúdo bate com um default embutido) é deletado e recriado no path do novo locale. Arquivos customizados pelo usuário são preservados intactos.
- Removidos nomes de projetos reais dos exemplos do guia — usa placeholder `[[ProjectName]]` / `[[NomeDoProjeto]]`.

### Mindmap temático
- `MINDMAP_PROMPT` reescrito pra forçar **6-12 top-level branches temáticos** (proibidos labels de estrutura de documento: "Executive Summary", "Action Items", "Detailed Topics", "Participants"). Mindmap gerado a partir de Summary agora tem mesma qualidade e diversidade de cores do gerado a partir do transcript. Instrução explícita: ignorar layout de seções do input e re-decompor por tema.

### i18n de conteúdo dos templates e dashboards
- Todos os 6 artefatos criados pelo Setup Vault ganham **conteúdo** localizado (EN + PT-BR) — seções, labels e instruções internas seguem o idioma do Obsidian.
- **Filenames permanecem canônicos** (EN) e estáveis em todos os locales: `Summary Template.md`, `Daily Note Template.md`, `Project Template.md`, `MT Task Dashboard.md`, `MT Kanban View.md`, `MT Gantt View.md`, `Meeting Tools — Guide.md`. Decisão intencional: filename é parte da API exposta ao vault (core Daily Notes plugin, wikilinks do usuário, queries Dataview) — mudá-lo por idioma quebra referências sistematicamente.
- **Migração automática** de instalações v2.2.0-pre que tinham filenames traduzidos (`Modelo de Resumo.md`, `Template de Daily Note.md`, etc.): ao carregar, o plugin renomeia pros nomes canônicos via `vault.rename`, **preservando o conteúdo inclusive customizações**. Se ambos os nomes existirem, loga warning e user resolve manualmente.
- **Refresh de conteúdo** ao trocar de locale: arquivos não-customizados (conteúdo bate com default embutido) têm seções/labels atualizadas pro locale atual. Customizações intocadas.
- Setting `summaryTemplatePath` migrado automaticamente do path legacy para o canonical.
- Registro centralizado em `src/vault-templates.ts` (`LOCALIZED_ARTIFACTS`).

### Check de compatibilidade de template customizado
- Quando o Summary Template foi customizado pelo usuário e está sem placeholders críticos (`{{transcript}}` ou `{{task_format_spec}}`), o plugin mostra Notice no carregamento avisando quais placeholders faltam, com botões **Restaurar padrão** (sobrescreve com default atual) / **Dispensar** (seta flag `summaryTemplateCompatDismissed`).
- Só dispara em templates customizados — templates idênticos ao default nunca geram aviso.
- Motivação: ao adicionar novos placeholders em releases (ex.: `{{task_context}}`, `{{task_format_spec}}` em 2.2.0), customizações legadas ficam silenciosamente broken. O check torna o problema explícito e reversível.

### UX
- Modal "Not enough text" agora esclarece que o escopo é o bloco do cursor.
- Notice "Configure API Key" ganha botão **Abrir Settings** → navega direto pra aba do plugin.
- Notice de artefatos faltantes lista os primeiros 3 nomes inline (antes mostrava só a contagem).
- Full Pipeline em caso de erro indica qual etapa falhou (status bar + Notice).
- **Onboarding automático** na primeira instalação: se não há API key configurada, o Guia rápido abre sozinho (flag `onboardingShown` evita reaparecer).
- Summary/Extract Tasks imprimem `_(no action items identified)_` quando nenhuma task qualifica (antes a seção ficava silenciosamente vazia).
- PreviewModal mostra contagem live de palavras/linhas no rodapé.
- Banner de gravação exibe a pasta destino (`Salvando em Vault/Audios/`).

### Bugfixes
- **Refresh reativo nos três dashboards (Tasks / Kanban / Gantt)** após qualquer edição — click de status, drag-drop, modal de datas ou edit manual em outra pane. Cada block agora usa `MarkdownRenderChild` com ciclo de vida amarrado ao DOM + listener único em `metadataCache.on("changed")` (debounced 250ms) em `main.ts` que dispara o evento `meeting-tools:tasks-changed` no workspace. Fim do close/reopen para ver mudanças. Remove os antipadrões `__mtRender` expando + `Set + MutationObserver` que eram a causa de counts stale em blocks diferentes do mesmo arquivo (ex.: view:project mostrando `(sem projeto) (15)` quando click foi em view:all). Padrão canônico usado por Dataview e Tasks plugin.
- **Wikilinks do time block header agora são lidos mesmo quando o bloco tem poucas palavras.** Antes, a detecção só disparava se `getContextCheck` retornasse `mode === "timeblock"` (exige ≥ `minWordsForSummary`). Em blocos curtos, o user caía no fuzzy modal e o header (ex: `### 10:00 - Reunião [[Kaidô]]`) era ignorado → tasks saíam com `[[No project]]`. Corrigido: `detectMeetingContext` sempre varre o cursor ativo via `MarkdownView` e lê o header acima, independente do word count.
- **Sobreatribuição de tasks ao `userName` corrigida.** Regra de 1ª pessoa que atribuía "eu vou..." / "a gente vai..." ao user era aplicada excessivamente pelo LLM em transcripts coletivos de reuniões. Removida. `TASK_FORMAT_SPEC` agora exige owner nomeado em 3ª pessoa; tasks coletivas ou ambíguas são omitidas.

### Tratamento amigável de erros OpenAI
- Notices passam a mostrar **mensagens acionáveis** em vez de genérico "erro". 12 categorias mapeadas em `src/openai-errors.ts` (key inválida, modelo não encontrado, rate limit com retry-after extraído, cota esgotada, conteúdo bloqueado, 5xx, network, etc.). Duração estendida para 10s.
- Cobertura: `summarize.ts`, `mindmap.ts`, `extract-tasks.ts`, `new-project.ts` (GPT) e `transcribe.ts` (Whisper + diarize).
- Console mantém log detalhado com status + code + mensagem original para debug.

### Breaking changes
- Usuários com `Vault/Templates/Summary Template.md` customizado precisam regenerar (delete + Setup Vault) para adicionar os placeholders novos `{{task_context}}` e `{{task_format_spec}}` na seção 2.

### Mudanças
- `src/prompts.ts` — prompts default agora em English neutro (instrução de idioma injetada via setting). Substituído `summaryPrompt(userName)` por constante exportável `DEFAULT_SUMMARY_TEMPLATE`.
- `src/settings.ts` — descrições de "Transcription Model" e "Chunk duration" encurtadas (≤ 1 linha). Nova seção "Language & Templates".
- `src/vault-setup.ts` — cria `Summary Template.md` junto com os outros templates.

### Arquivos novos
- `src/i18n/index.ts`, `src/i18n/en.ts`, `src/i18n/pt-BR.ts`
- `src/templates.ts` — `loadTemplate()`, `substitute()`

### Notas
- Trocar o idioma do Obsidian reflete na UI e nos comandos somente após recarregar o plugin (registro de comandos é one-shot).
- Editar o Summary Template permite customizar seções, ordem e tom do resumo. O placeholder `{{transcript}}` precisa continuar presente para o conteúdo chegar ao modelo.

## [2.1.0] - 2026-04-15

### Adicionado
- **Chunking universal via Web Audio API** (desktop + mobile, sem ffmpeg). Áudios longos são divididos em chunks de `chunkDurationMin` (default 10min), transcritos sequencialmente, e mesclados via `mergeSrts` com offset temporal. Chunks frescos evitam acúmulo de contexto que disparava o loop de alucinação residual do whisper-1.
- Setting **Transcription Model**: dropdown com `auto` (default), `whisper-1`, `gpt-4o-transcribe-diarize`. Em `auto`, áudios ≤ 1400s usam diarize single-call (com falantes); áudios > 1400s caem pra whisper-1 chunked.
- Setting **Chunk duration (min)** configurável.
- Setting **Tasks Model** separada de Summary Model. Extract Tasks agora usa `tasksModel` (Summarize e New Project continuam usando `summaryModel`).
- Suporte a `gpt-4o-transcribe-diarize` com identificação de falantes (`**Speaker A:** ...` no `.md`).

### Mudanças
- `src/audio-chunking.ts` novo — `decodeAudioToBuffer`, `sliceBufferToChunks`, `encodeWav16`.
- `src/file-utils.ts` — nova `getAudioDurationSec` via HTML5 `<audio>` element (funciona em mobile).
- `src/transcribe.ts` — refactor: roteamento por modelo/duração, retry 1x por chunk, placeholder `[chunk N falhou]` em falhas não-recuperáveis.

### Limitações conhecidas
- `gpt-4o-transcribe-diarize` em áudios > 23min usa chunking, e o modelo rotula speakers (A/B/C) por chunk. Speaker A do chunk 1 pode não ser o mesmo Speaker A do chunk 2 — limitação aceita; correlação entre chunks seria voice fingerprinting (fora de escopo).
- iPhones < 2019 (< 2GB RAM) podem estourar memória com áudios > 60min no decode (pico ~288MB).

## [2.0.1] - 2026-04-14

### Corrigido
- Loop de alucinação do `whisper-1` em áudios longos (blocos contíguos de `...` após ~40min). Adicionado prompt mitigante recomendado pela comunidade OpenAI no POST da transcrição. Verificado em áudio de 75min: 0 segmentos `...` contra 1008/2063 sem o prompt.

## [2.0.0] - 2026-04-09

### Comandos
- Start Recording — gravação nativa (MediaRecorder 16kbps) com barra de controle (Pausar/Parar/Cancelar)
- Import Audio — file picker + compressão ffmpeg para >25MB
- Transcribe Audio — Whisper API → .srt + .md com player embutido
- Summarize Transcript — GPT → resumo estruturado, contexto automático (seleção/time block)
- Generate Mindmap — GPT → Mermaid mindmap
- Extract Tasks — GPT → tasks formatadas com wikilinks e inline fields
- New Project from Document — PDF/PPTX/TXT → GPT → nota de projeto
- Full Pipeline — Import → Transcribe → Summarize → Extract Tasks → Mindmap
- Setup Vault — cria estrutura de pastas, templates e dashboards

### Dashboards
- meeting-tasks — tabelas por projeto/responsável/aging/prioridade com status e prioridade clicáveis, CSV export
- meeting-kanban — Kanban board com drag & drop
- meeting-gantt — Gantt timeline com Mermaid + editor de datas
- meeting-history — histórico de reuniões por projeto

### Infraestrutura
- API key no secretStorage (keychain)
- Ícones Lucide no file explorer
- Status bar de progresso em todos os comandos
- Banner de posicionamento do cursor
- Modal de texto insuficiente
- Suporte mobile (exceto PDF/PPTX no New Project)
