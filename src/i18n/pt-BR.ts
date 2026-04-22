import type { Strings } from "./en";

export const PT_BR: Strings = {
  // --- Notices: common ---
  noticeConfigureApiKey: "Configure a OpenAI API Key nas settings do Meeting Tools.",
  noticeFileNotFound: (path) => `Arquivo não encontrado: ${path}`,
  noticeAudioNotFound: (path) => `Áudio não encontrado: ${path}`,

  // --- Notices: recording ---
  noticeRecordingInProgress: "Já existe uma gravação em andamento.",
  noticeRecordingCancelled: "Gravação cancelada.",
  noticeRecordingStarted: "🔴 Gravação iniciada",
  noticeRecordingSaved: (file, dur, kb) =>
    `Gravação salva: ${file} (${dur}, ${kb}KB)`,
  noticeStartAutoTranscribe: "Iniciando transcrição automática…",
  noticeTranscribeComplete: (path) => `Transcrição completa: ${path}`,
  noticeTranscribeError: (msg) => `Erro na transcrição: ${msg}`,
  noticeRecordingError: (msg) => `Erro ao iniciar gravação: ${msg}`,

  // --- Notices: import ---
  noticeImportCancelled: "Importação cancelada.",
  noticeAudioImported: (path, kb) => `Áudio importado: ${path} (${kb}KB)`,
  noticeAudioTooLargeMobile: (mb) =>
    `Arquivo > 25MB (${mb}MB). Comprima no desktop antes de importar.`,
  noticeFfmpegMissing: "ffmpeg não encontrado. Instale com: brew install ffmpeg (macOS) ou baixe em ffmpeg.org",
  noticeLargeAudioCompressing: (mb) =>
    `Áudio grande (${mb}MB). Comprimindo com ffmpeg…`,
  noticeVaultPathMissing: "Não foi possível detectar o caminho do vault.",
  noticeFfmpegFailed: "ffmpeg falhou. Usando arquivo original.",
  noticeCompressed: (from, to) => `Comprimido: ${from}MB → ${to}MB`,
  noticeCompressedFileMissing: "Arquivo comprimido não encontrado. Usando original.",

  // --- Notices: transcribe ---
  noticeTranscribingWith: (label) => `Transcrevendo com ${label}…`,
  noticeTranscribingChunk: (i, total) => `Transcrevendo chunk ${i}/${total}…`,
  noticeChunkFailed: (i) => `Chunk ${i} falhou — continuando.`,
  noticeTranscribeFailed: (msg) => `Falha ao gerar transcrição: ${msg}`,
  noticeFileExceedsLimit: (mb) =>
    `Arquivo excede 25MB (${mb}MB). Ative chunking (modo auto).`,
  noticeSrtSaved: (path) => `SRT salvo: ${path}`,
  noticeMdSaved: (path) => `MD salvo: ${path}`,
  transcriptMdHeader: "# Transcrição",
  transcriptEmptyMarker: "_(transcrição vazia)_",

  // --- Notices: summarize / mindmap / tasks / new-project ---
  noticeGeneratingSummary: "Gerando resumo…",
  noticeSummaryEmpty: "Resumo vazio.",
  noticeSummaryInserted: "Resumo inserido.",

  noticeGeneratingMindmap: "Gerando mindmap…",
  noticeMindmapInserted: "Mapa mental inserido.",

  noticeNoInputForTasks: "Nenhum texto fornecido para extração de tasks.",
  noticeContentTooShortForTasks: "Conteúdo muito curto para extrair tasks.",
  noticeExtractingTasks: "Extraindo tasks…",
  noticeExtractTasksFailed: "Falha ao extrair tasks.",
  noticeNoTasksFound: "Nenhum item de ação identificado no texto.",
  noticeTasksInserted: "Tasks inseridas.",

  noticeOperationCancelled: "Operação cancelada.",
  noticeDesktopOnlyExtract: "Extração de PDF/PPTX requer desktop. Use um arquivo TXT.",
  noticeReadingDocument: (name) => `Lendo documento: ${name}`,
  noticeDocumentReadError: (msg) => `Erro ao ler documento: ${msg}`,
  noticeDocumentTextTooShort: "Não foi possível extrair texto suficiente do documento.",
  noticeDocumentSaved: (path) => `Documento salvo em: ${path}`,
  noticeGeneratingProjectNote: "Gerando nota do projeto…",
  noticeProjectGenerateFailed: "Falha ao gerar nota do projeto.",
  noticeLlmEmpty: "Resposta vazia do LLM.",
  noticeProjectCreated: (path) => `Projeto criado: ${path}`,

  // --- Notices: setup vault ---
  noticeSetupComplete: (created, skipped) =>
    `Setup completo: ${created} arquivo(s) criado(s), ${skipped} já existente(s).`,
  noticeMissingArtifacts: (n) =>
    n === 1
      ? `1 artefato do Meeting Tools está faltando:`
      : `${n} artefatos do Meeting Tools estão faltando:`,
  noticeMissingArtifactsList: (names, more) =>
    more > 0 ? `${names} e mais ${more}` : names,
  btnRunSetupVault: "Rodar Setup Vault",
  btnDismiss: "Dispensar",
  btnOpenSettings: "Abrir Settings",

  // --- Notices: Summary Template compatibility ---
  noticeSummaryTemplateIncompatible: (missing) =>
    `Seu Summary Template customizado está sem placeholders necessários: ${missing}. Seções que dependem deles ficarão vazias.`,
  btnRegenerateTemplate: "Restaurar padrão",
  noticeSummaryTemplateRegenerated: "Summary Template restaurado para o padrão atual.",

  // --- Notices: pipeline + status ---
  pipelineStepImport: "Importando áudio…",
  pipelineStepTranscribe: "Transcrevendo…",
  pipelineStepSummarize: "Gerando resumo…",
  pipelineStepTasks: "Extraindo tasks…",
  pipelineStepMindmap: "Gerando mindmap…",
  pipelineComplete: "✅ Pipeline completo!",
  pipelineFailed: "❌ Pipeline falhou",
  pipelineError: (msg) => `Erro no pipeline: ${msg}`,
  pipelineErrorAt: (step, msg) =>
    step ? `Pipeline falhou em "${step}": ${msg}` : `Erro no pipeline: ${msg}`,
  pipelineStep: (i, n, label) => `📋 ${i}/${n} ${label}`,

  statusRunning: (label) => `⏳ ${label}`,
  statusDone: (label) => `✅ ${label} — concluído`,
  statusError: (label) => `❌ ${label} — erro`,

  // Labels used by withStatusFeedback
  statusLabelImport: "Importando áudio",
  statusLabelTranscribe: "Transcrevendo áudio",
  statusLabelSummarize: "Gerando resumo",
  statusLabelMindmap: "Gerando mindmap",
  statusLabelTasks: "Extraindo tasks",
  statusLabelProject: "Criando projeto",
  statusLabelVault: "Configurando vault",

  // Notice shown when auto-transcribe finishes
  noticeTranscriptSaved: (path) => `Transcrição salva: ${path}`,

  // --- Settings headers ---
  settingSectionTranscription: "Transcrição",
  settingSectionDirs: "Diretórios",
  settingSectionModels: "Modelos OpenAI (GPT)",
  settingSectionLanguage: "Idioma e Templates",
  settingSectionBehavior: "Comportamento",

  // --- Settings: fields ---
  settingApiKeyName: "OpenAI API Key",
  settingApiKeyDesc: "Armazenada de forma segura no keychain do sistema.",
  settingUserNameName: "Nome do usuário",
  settingUserNameDesc: "Nome usado nos resumos (ex: itens de ação para [nome]).",
  settingAudioDirName: "Diretório de áudios",
  settingAudioDirDesc: "Pasta para salvar áudios importados/gravados.",
  settingTranscriptsDirName: "Diretório de transcrições",
  settingTranscriptsDirDesc: "Pasta para salvar transcrições (.srt e .md).",

  settingTranscriptionModelName: "Modelo de transcrição",
  settingTranscriptionModelDesc:
    "Auto escolhe entre diarize (com falantes, ≤ 23min) e whisper-1 (áudios longos).",
  settingChunkDurationName: "Duração do chunk (min)",
  settingChunkDurationDesc: "Tamanho dos chunks em áudios longos. Típico: 5-20.",

  settingSummaryModelName: "Modelo de resumo",
  settingSummaryModelDesc: "Modelo usado para resumos e criação de projetos.",
  settingTasksModelName: "Modelo de tasks",
  settingTasksModelDesc: "Modelo usado para extração de tasks.",
  settingMindmapModelName: "Modelo de mindmap",
  settingMindmapModelDesc: "Modelo usado para geração de mindmaps.",

  settingOutputLanguageName: "Idioma da saída de IA",
  settingOutputLanguageDesc:
    "Idioma dos resumos/mindmaps/tasks gerados. Auto segue o idioma da transcrição.",
  settingOutputLanguageAuto: "Auto (seguir transcrição)",
  settingOutputLanguagePt: "Português (Brasil)",
  settingOutputLanguageEn: "Inglês",

  settingSummaryTemplateName: "Arquivo de template do resumo",
  settingSummaryTemplateDesc:
    "Caminho para um .md com o prompt do resumo. Vazio ou ausente = default embutido.",

  settingGenerateMdName: "Gerar .md a partir do .srt",
  settingGenerateMdDesc: "Gerar automaticamente um .md limpo ao transcrever.",
  settingShowPreviewName: "Mostrar preview antes de inserir",
  settingShowPreviewDesc: "Exibir preview editável antes de inserir resumo/mindmap.",
  settingShowFileIconsName: "Exibir ícones dos artefatos MT",
  settingShowFileIconsDesc: "Adiciona ícones aos templates e dashboards no explorador. Requer reload do plugin para refletir.",
  settingMinWordsName: "Mínimo de palavras para resumo",
  settingMinWordsDesc: "Transcrições abaixo desse limite geram resumo genérico.",

  // --- Ribbon menu + commands ---
  cmdStartRecording: "Iniciar gravação",
  cmdImportAudio: "Importar áudio",
  cmdTranscribe: "Transcrever áudio",
  cmdSummarize: "Resumir transcrição",
  cmdMindmap: "Gerar mindmap",
  cmdExtractTasks: "Extrair tasks",
  cmdNewProject: "Novo projeto a partir de documento",
  cmdFullPipeline: "Pipeline completo",
  cmdSetupVault: "Setup do vault",
  cmdQuickStartGuide: "Guia rápido",
  modalGuideTitle: "Meeting Tools — Guia rápido",
  btnClose: "Fechar",

  // --- Recorder banner ---
  recordTimerRecording: (elapsed) => `🔴 Gravando ${elapsed}`,
  recordTimerPaused: (elapsed) => `⏸ Pausado ${elapsed}`,
  recordSavingTo: (dir) => `Salvando em ${dir}/`,
  btnPause: "⏸ Pausar",
  btnResume: "▶ Retomar",
  btnStop: "⏹ Parar",
  btnCancel: "✕ Cancelar",

  // --- Cursor banner ---
  cursorBannerMessage: "📌 Posicione o cursor no local de inserção",
  btnContinue: "Continuar",
  btnCancelPlain: "Cancelar",

  // --- Modals ---
  modalInsufficientTitle: "Texto insuficiente no bloco",
  modalInsufficientDesc: (wc, min) =>
    `Texto insuficiente neste bloco para gerar resumo, mindmap ou lista de tasks (${wc} palavras encontradas, mínimo ${min}).`,
  previewFooter: (wc, lines) => `${wc} palavras · ${lines} linhas`,
  modalOpenTranscript: "Abrir transcrição",
  modalPreview: "Preview",
  modalEdit: "Editar",
  modalInsert: "Inserir",

  modalAudioSuggestPlaceholder: "Selecione um arquivo de áudio…",
  modalTranscriptSuggestPlaceholder: "Selecione uma transcrição (.md ou .srt)…",

  // --- Fallbacks ---
  summaryShortFallback: (userName) =>
    `**1. Resumo Executivo**\n- Transcrição curta; conteúdo insuficiente para síntese.\n\n**2. Principais Itens de Ação/Compromissos para ${userName}**\n- Não mencionado\n\n**3. Detalhamento por Tópico**\n- Não mencionado`,

  // --- LLM language instructions ---
  llmLangAutoMatch: "Responda no mesmo idioma da transcrição de entrada.",
  llmLangEnglish: "Respond in English.",
  llmLangPortuguese: "Responda em Português do Brasil.",

  // --- Dashboards / code blocks ---
  emptyTasks: "Nenhuma task encontrada.",
  legendLabelDue: "Prazo",
  legendLabelStatus: "Status",
  legendLabelPriority: "Prioridade",
  legendHint: "Clique nos ícones para alterar status/prioridade.",
  legendItemOverdue: "Atrasado",
  legendItemToday: "Hoje",
  legendItemThisWeek: "Esta semana",
  legendItemFuture: "Futuro",
  legendItemInProgress: "Em progresso",
  legendItemDone: "Concluído",
  legendItemCancelled: "Cancelado",
  legendItemHigh: "Alta",
  legendItemMedium: "Média",
  legendItemLow: "Baixa",
  legendItemNoPriority: "Sem",
  emptyMeetingHistory: "Nenhuma daily note encontrada referenciando este projeto.",

  // --- Gantt date edit modal ---
  ganttEditTitle: (name) => `Editar datas: ${name}`,
  ganttStartLabel: "Data início (⏳)",
  ganttEndLabel: "Data fim (📅)",
  btnSave: "Salvar",

  // --- Errors surfaced to user ---
  errorOpenAICall: "Falha na chamada OpenAI.",
  errorNoPptxSlides: "Nenhum slide encontrado no arquivo PPTX.",
  errorNoPptxText: "Nenhum texto encontrado nos slides do PPTX.",

  // --- OpenAI API error mapping (shown in Notice, duration 10s) ---
  openaiErrorInvalidKey:
    "OpenAI API Key inválida. Configure em Settings → Meeting Tools.",
  openaiErrorForbidden: "OpenAI indisponível no seu país/região.",
  openaiErrorModelNotFound: (model) =>
    `Modelo OpenAI '${model}' não encontrado. Troque em Settings → Meeting Tools (Summary/Tasks/Mindmap Model).`,
  openaiErrorBadRequest: (msg) => `Requisição OpenAI inválida: ${msg}`,
  openaiErrorPayloadTooLarge:
    "Payload excede limite do OpenAI. Use transcrição menor ou reduza contexto.",
  openaiErrorContentFilter: "Conteúdo bloqueado pela moderação da OpenAI.",
  openaiErrorRateLimit: (retryAfterSec) =>
    retryAfterSec != null
      ? `Rate limit OpenAI atingido. Tente novamente em ${retryAfterSec}s.`
      : "Rate limit OpenAI atingido. Tente novamente em alguns segundos.",
  openaiErrorQuotaExceeded:
    "Cota OpenAI esgotada. Verifique billing em platform.openai.com/usage",
  openaiErrorTokensPerMinute:
    "Limite de tokens por minuto da OpenAI atingido. Aguarde alguns segundos e tente de novo.",
  openaiErrorServerError: "Erro interno OpenAI. Tente em alguns segundos.",
  openaiErrorServiceUnavailable:
    "Serviço OpenAI indisponível. Tente em alguns minutos.",
  openaiErrorNetwork: "Erro de rede ao contatar OpenAI. Verifique sua conexão.",
  openaiErrorUnknown: (status, msg) => `Erro OpenAI ${status}: ${msg}`,
};
