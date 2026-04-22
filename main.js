var Oe=Object.defineProperty;var fn=Object.getOwnPropertyDescriptor;var hn=Object.getOwnPropertyNames;var Tn=Object.prototype.hasOwnProperty;var yn=(e,n)=>{for(var t in n)Oe(e,t,{get:n[t],enumerable:!0})},wn=(e,n,t,o)=>{if(n&&typeof n=="object"||typeof n=="function")for(let i of hn(n))!Tn.call(e,i)&&i!==t&&Oe(e,i,{get:()=>n[i],enumerable:!(o=fn(n,i))||o.enumerable});return e};var bn=e=>wn(Oe({},"__esModule",{value:!0}),e);var ki={};yn(ki,{default:()=>Be});module.exports=bn(ki);var x=require("obsidian");var M=require("obsidian");var mt={noticeConfigureApiKey:"Configure the OpenAI API Key in Meeting Tools settings.",noticeFileNotFound:e=>`File not found: ${e}`,noticeAudioNotFound:e=>`Audio not found: ${e}`,noticeRecordingInProgress:"A recording is already in progress.",noticeRecordingCancelled:"Recording cancelled.",noticeRecordingStarted:"\u{1F534} Recording started",noticeRecordingSaved:(e,n,t)=>`Recording saved: ${e} (${n}, ${t}KB)`,noticeStartAutoTranscribe:"Starting automatic transcription\u2026",noticeTranscribeComplete:e=>`Transcription complete: ${e}`,noticeTranscribeError:e=>`Transcription error: ${e}`,noticeRecordingError:e=>`Failed to start recording: ${e}`,noticeImportCancelled:"Import cancelled.",noticeAudioImported:(e,n)=>`Audio imported: ${e} (${n}KB)`,noticeAudioTooLargeMobile:e=>`File > 25MB (${e}MB). Compress on desktop before importing.`,noticeFfmpegMissing:"ffmpeg not found. Install with: brew install ffmpeg (macOS) or download from ffmpeg.org",noticeLargeAudioCompressing:e=>`Large audio (${e}MB). Compressing with ffmpeg\u2026`,noticeVaultPathMissing:"Could not detect the vault path.",noticeFfmpegFailed:"ffmpeg failed. Using the original file.",noticeCompressed:(e,n)=>`Compressed: ${e}MB \u2192 ${n}MB`,noticeCompressedFileMissing:"Compressed file not found. Using original.",noticeTranscribingWith:e=>`Transcribing with ${e}\u2026`,noticeTranscribingChunk:(e,n)=>`Transcribing chunk ${e}/${n}\u2026`,noticeChunkFailed:e=>`Chunk ${e} failed \u2014 continuing.`,noticeTranscribeFailed:e=>`Failed to generate transcription: ${e}`,noticeFileExceedsLimit:e=>`File exceeds 25MB (${e}MB). Enable chunking (auto mode).`,noticeSrtSaved:e=>`SRT saved: ${e}`,noticeMdSaved:e=>`MD saved: ${e}`,transcriptMdHeader:"# Transcript",transcriptEmptyMarker:"_(empty transcript)_",noticeGeneratingSummary:"Generating summary\u2026",noticeSummaryEmpty:"Summary empty.",noticeSummaryInserted:"Summary inserted.",noticeGeneratingMindmap:"Generating mindmap\u2026",noticeMindmapInserted:"Mindmap inserted.",noticeNoInputForTasks:"No text provided for task extraction.",noticeContentTooShortForTasks:"Content too short to extract tasks.",noticeExtractingTasks:"Extracting tasks\u2026",noticeExtractTasksFailed:"Failed to extract tasks.",noticeNoTasksFound:"No action items identified in the text.",noticeTasksInserted:"Tasks inserted.",noticeOperationCancelled:"Operation cancelled.",noticeDesktopOnlyExtract:"PDF/PPTX extraction requires desktop. Use a TXT file.",noticeReadingDocument:e=>`Reading document: ${e}`,noticeDocumentReadError:e=>`Failed to read document: ${e}`,noticeDocumentTextTooShort:"Could not extract enough text from the document.",noticeDocumentSaved:e=>`Document saved at: ${e}`,noticeGeneratingProjectNote:"Generating project note\u2026",noticeProjectGenerateFailed:"Failed to generate project note.",noticeLlmEmpty:"Empty response from LLM.",noticeProjectCreated:e=>`Project created: ${e}`,noticeSetupComplete:(e,n)=>`Setup complete: ${e} file(s) created, ${n} already existed.`,noticeMissingArtifacts:e=>e===1?"1 Meeting Tools artifact is missing:":`${e} Meeting Tools artifacts are missing:`,noticeMissingArtifactsList:(e,n)=>n>0?`${e} and ${n} more`:e,btnRunSetupVault:"Run Setup Vault",btnDismiss:"Dismiss",btnOpenSettings:"Open Settings",noticeSummaryTemplateIncompatible:e=>`Your customized Summary Template is missing required placeholders: ${e}. Sections relying on them will be empty.`,btnRegenerateTemplate:"Reset to default",noticeSummaryTemplateRegenerated:"Summary Template reset to current default.",pipelineStepImport:"Importing audio\u2026",pipelineStepTranscribe:"Transcribing\u2026",pipelineStepSummarize:"Generating summary\u2026",pipelineStepTasks:"Extracting tasks\u2026",pipelineStepMindmap:"Generating mindmap\u2026",pipelineComplete:"\u2705 Pipeline complete!",pipelineFailed:"\u274C Pipeline failed",pipelineError:e=>`Pipeline error: ${e}`,pipelineErrorAt:(e,n)=>e?`Pipeline failed at "${e}": ${n}`:`Pipeline error: ${n}`,pipelineStep:(e,n,t)=>`\u{1F4CB} ${e}/${n} ${t}`,statusRunning:e=>`\u23F3 ${e}`,statusDone:e=>`\u2705 ${e} \u2014 done`,statusError:e=>`\u274C ${e} \u2014 error`,statusLabelImport:"Importing audio",statusLabelTranscribe:"Transcribing audio",statusLabelSummarize:"Generating summary",statusLabelMindmap:"Generating mindmap",statusLabelTasks:"Extracting tasks",statusLabelProject:"Creating project",statusLabelVault:"Configuring vault",noticeTranscriptSaved:e=>`Transcript saved: ${e}`,settingSectionTranscription:"Transcription",settingSectionDirs:"Directories",settingSectionModels:"OpenAI Models (GPT)",settingSectionLanguage:"Language & Templates",settingSectionBehavior:"Behavior",settingApiKeyName:"OpenAI API Key",settingApiKeyDesc:"Stored securely in the system keychain.",settingUserNameName:"User name",settingUserNameDesc:"Name used in summaries (e.g. action items for [name]).",settingAudioDirName:"Audio directory",settingAudioDirDesc:"Folder for imported/recorded audio files.",settingTranscriptsDirName:"Transcripts directory",settingTranscriptsDirDesc:"Folder for transcriptions (.srt and .md).",settingTranscriptionModelName:"Transcription model",settingTranscriptionModelDesc:"Auto picks diarize (with speakers, \u2264 23min) or whisper-1 (long audio).",settingChunkDurationName:"Chunk duration (min)",settingChunkDurationDesc:"Chunk size for long audio. Typical: 5-20.",settingSummaryModelName:"Summary model",settingSummaryModelDesc:"Model used for summaries and project notes.",settingTasksModelName:"Tasks model",settingTasksModelDesc:"Model used for task extraction.",settingMindmapModelName:"Mindmap model",settingMindmapModelDesc:"Model used for mindmap generation.",settingOutputLanguageName:"AI output language",settingOutputLanguageDesc:"Language for generated summary/mindmap/tasks. Auto follows the transcript.",settingOutputLanguageAuto:"Auto (match transcript)",settingOutputLanguagePt:"Portuguese (Brazil)",settingOutputLanguageEn:"English",settingSummaryTemplateName:"Summary template file",settingSummaryTemplateDesc:"Path to a .md file with the summary prompt. Empty or missing = built-in default.",settingGenerateMdName:"Generate .md from .srt",settingGenerateMdDesc:"Automatically create a clean .md when transcribing.",settingShowPreviewName:"Show preview before inserting",settingShowPreviewDesc:"Display an editable preview before inserting summary/mindmap.",settingShowFileIconsName:"Show icons for MT artifacts",settingShowFileIconsDesc:"Decorates templates and MT dashboards in the file explorer. Takes effect after plugin reload.",settingMinWordsName:"Min words for summary",settingMinWordsDesc:"Transcripts below this threshold generate a generic summary.",cmdStartRecording:"Start Recording",cmdImportAudio:"Import Audio",cmdTranscribe:"Transcribe Audio",cmdSummarize:"Summarize Transcript",cmdMindmap:"Generate Mindmap",cmdExtractTasks:"Extract Tasks",cmdNewProject:"New Project from Document",cmdFullPipeline:"Full Pipeline",cmdSetupVault:"Setup Vault",cmdQuickStartGuide:"Quick Start Guide",modalGuideTitle:"Meeting Tools \u2014 Quick Start",btnClose:"Close",recordTimerRecording:e=>`\u{1F534} Recording ${e}`,recordTimerPaused:e=>`\u23F8 Paused ${e}`,recordSavingTo:e=>`Saving to ${e}/`,btnPause:"\u23F8 Pause",btnResume:"\u25B6 Resume",btnStop:"\u23F9 Stop",btnCancel:"\u2715 Cancel",cursorBannerMessage:"\u{1F4CC} Place the cursor where content should be inserted",btnContinue:"Continue",btnCancelPlain:"Cancel",modalInsufficientTitle:"Not enough text in block",modalInsufficientDesc:(e,n)=>`Not enough text in this block to generate summary, mindmap or task list (${e} words found, minimum ${n}).`,previewFooter:(e,n)=>`${e} words \xB7 ${n} lines`,modalOpenTranscript:"Open transcript",modalPreview:"Preview",modalEdit:"Edit",modalInsert:"Insert",modalAudioSuggestPlaceholder:"Select an audio file\u2026",modalTranscriptSuggestPlaceholder:"Select a transcript (.md or .srt)\u2026",summaryShortFallback:e=>`**1. Executive Summary**
- Transcript too short; not enough content for synthesis.

**2. Key Action Items / Commitments for ${e}**
- Not mentioned

**3. Detailed Topics**
- Not mentioned`,llmLangAutoMatch:"Respond in the same language as the input transcript.",llmLangEnglish:"Respond in English.",llmLangPortuguese:"Responda em Portugu\xEAs do Brasil.",emptyTasks:"No tasks found.",legendLabelDue:"Due date",legendLabelStatus:"Status",legendLabelPriority:"Priority",legendHint:"Click the icons to change status/priority.",legendItemOverdue:"Overdue",legendItemToday:"Today",legendItemThisWeek:"This week",legendItemFuture:"Future",legendItemInProgress:"In progress",legendItemDone:"Done",legendItemCancelled:"Cancelled",legendItemHigh:"High",legendItemMedium:"Medium",legendItemLow:"Low",legendItemNoPriority:"None",emptyMeetingHistory:"No daily notes reference this project.",ganttEditTitle:e=>`Edit dates: ${e}`,ganttStartLabel:"Start date (\u23F3)",ganttEndLabel:"End date (\u{1F4C5})",btnSave:"Save",errorOpenAICall:"OpenAI call failed.",errorNoPptxSlides:"No slides found in the PPTX file.",errorNoPptxText:"No text found in the PPTX slides.",openaiErrorInvalidKey:"Invalid OpenAI API key. Configure it at Settings \u2192 Meeting Tools.",openaiErrorForbidden:"OpenAI not available in your country/region.",openaiErrorModelNotFound:e=>`OpenAI model '${e}' not found. Change it at Settings \u2192 Meeting Tools (Summary/Tasks/Mindmap Model).`,openaiErrorBadRequest:e=>`Invalid OpenAI request: ${e}`,openaiErrorPayloadTooLarge:"Payload exceeds OpenAI limit. Use a shorter transcript or reduce context.",openaiErrorContentFilter:"Content blocked by OpenAI moderation.",openaiErrorRateLimit:e=>e!=null?`OpenAI rate limit reached. Retry in ${e}s.`:"OpenAI rate limit reached. Retry in a few seconds.",openaiErrorQuotaExceeded:"OpenAI quota exhausted. Check billing at platform.openai.com/usage",openaiErrorTokensPerMinute:"OpenAI tokens-per-minute limit reached. Wait a few seconds and retry.",openaiErrorServerError:"OpenAI internal error. Retry in a few seconds.",openaiErrorServiceUnavailable:"OpenAI service unavailable. Retry in a few minutes.",openaiErrorNetwork:"Network error contacting OpenAI. Check your connection.",openaiErrorUnknown:(e,n)=>`OpenAI error ${e}: ${n}`};var pt={noticeConfigureApiKey:"Configure a OpenAI API Key nas settings do Meeting Tools.",noticeFileNotFound:e=>`Arquivo n\xE3o encontrado: ${e}`,noticeAudioNotFound:e=>`\xC1udio n\xE3o encontrado: ${e}`,noticeRecordingInProgress:"J\xE1 existe uma grava\xE7\xE3o em andamento.",noticeRecordingCancelled:"Grava\xE7\xE3o cancelada.",noticeRecordingStarted:"\u{1F534} Grava\xE7\xE3o iniciada",noticeRecordingSaved:(e,n,t)=>`Grava\xE7\xE3o salva: ${e} (${n}, ${t}KB)`,noticeStartAutoTranscribe:"Iniciando transcri\xE7\xE3o autom\xE1tica\u2026",noticeTranscribeComplete:e=>`Transcri\xE7\xE3o completa: ${e}`,noticeTranscribeError:e=>`Erro na transcri\xE7\xE3o: ${e}`,noticeRecordingError:e=>`Erro ao iniciar grava\xE7\xE3o: ${e}`,noticeImportCancelled:"Importa\xE7\xE3o cancelada.",noticeAudioImported:(e,n)=>`\xC1udio importado: ${e} (${n}KB)`,noticeAudioTooLargeMobile:e=>`Arquivo > 25MB (${e}MB). Comprima no desktop antes de importar.`,noticeFfmpegMissing:"ffmpeg n\xE3o encontrado. Instale com: brew install ffmpeg (macOS) ou baixe em ffmpeg.org",noticeLargeAudioCompressing:e=>`\xC1udio grande (${e}MB). Comprimindo com ffmpeg\u2026`,noticeVaultPathMissing:"N\xE3o foi poss\xEDvel detectar o caminho do vault.",noticeFfmpegFailed:"ffmpeg falhou. Usando arquivo original.",noticeCompressed:(e,n)=>`Comprimido: ${e}MB \u2192 ${n}MB`,noticeCompressedFileMissing:"Arquivo comprimido n\xE3o encontrado. Usando original.",noticeTranscribingWith:e=>`Transcrevendo com ${e}\u2026`,noticeTranscribingChunk:(e,n)=>`Transcrevendo chunk ${e}/${n}\u2026`,noticeChunkFailed:e=>`Chunk ${e} falhou \u2014 continuando.`,noticeTranscribeFailed:e=>`Falha ao gerar transcri\xE7\xE3o: ${e}`,noticeFileExceedsLimit:e=>`Arquivo excede 25MB (${e}MB). Ative chunking (modo auto).`,noticeSrtSaved:e=>`SRT salvo: ${e}`,noticeMdSaved:e=>`MD salvo: ${e}`,transcriptMdHeader:"# Transcri\xE7\xE3o",transcriptEmptyMarker:"_(transcri\xE7\xE3o vazia)_",noticeGeneratingSummary:"Gerando resumo\u2026",noticeSummaryEmpty:"Resumo vazio.",noticeSummaryInserted:"Resumo inserido.",noticeGeneratingMindmap:"Gerando mindmap\u2026",noticeMindmapInserted:"Mapa mental inserido.",noticeNoInputForTasks:"Nenhum texto fornecido para extra\xE7\xE3o de tasks.",noticeContentTooShortForTasks:"Conte\xFAdo muito curto para extrair tasks.",noticeExtractingTasks:"Extraindo tasks\u2026",noticeExtractTasksFailed:"Falha ao extrair tasks.",noticeNoTasksFound:"Nenhum item de a\xE7\xE3o identificado no texto.",noticeTasksInserted:"Tasks inseridas.",noticeOperationCancelled:"Opera\xE7\xE3o cancelada.",noticeDesktopOnlyExtract:"Extra\xE7\xE3o de PDF/PPTX requer desktop. Use um arquivo TXT.",noticeReadingDocument:e=>`Lendo documento: ${e}`,noticeDocumentReadError:e=>`Erro ao ler documento: ${e}`,noticeDocumentTextTooShort:"N\xE3o foi poss\xEDvel extrair texto suficiente do documento.",noticeDocumentSaved:e=>`Documento salvo em: ${e}`,noticeGeneratingProjectNote:"Gerando nota do projeto\u2026",noticeProjectGenerateFailed:"Falha ao gerar nota do projeto.",noticeLlmEmpty:"Resposta vazia do LLM.",noticeProjectCreated:e=>`Projeto criado: ${e}`,noticeSetupComplete:(e,n)=>`Setup completo: ${e} arquivo(s) criado(s), ${n} j\xE1 existente(s).`,noticeMissingArtifacts:e=>e===1?"1 artefato do Meeting Tools est\xE1 faltando:":`${e} artefatos do Meeting Tools est\xE3o faltando:`,noticeMissingArtifactsList:(e,n)=>n>0?`${e} e mais ${n}`:e,btnRunSetupVault:"Rodar Setup Vault",btnDismiss:"Dispensar",btnOpenSettings:"Abrir Settings",noticeSummaryTemplateIncompatible:e=>`Seu Summary Template customizado est\xE1 sem placeholders necess\xE1rios: ${e}. Se\xE7\xF5es que dependem deles ficar\xE3o vazias.`,btnRegenerateTemplate:"Restaurar padr\xE3o",noticeSummaryTemplateRegenerated:"Summary Template restaurado para o padr\xE3o atual.",pipelineStepImport:"Importando \xE1udio\u2026",pipelineStepTranscribe:"Transcrevendo\u2026",pipelineStepSummarize:"Gerando resumo\u2026",pipelineStepTasks:"Extraindo tasks\u2026",pipelineStepMindmap:"Gerando mindmap\u2026",pipelineComplete:"\u2705 Pipeline completo!",pipelineFailed:"\u274C Pipeline falhou",pipelineError:e=>`Erro no pipeline: ${e}`,pipelineErrorAt:(e,n)=>e?`Pipeline falhou em "${e}": ${n}`:`Erro no pipeline: ${n}`,pipelineStep:(e,n,t)=>`\u{1F4CB} ${e}/${n} ${t}`,statusRunning:e=>`\u23F3 ${e}`,statusDone:e=>`\u2705 ${e} \u2014 conclu\xEDdo`,statusError:e=>`\u274C ${e} \u2014 erro`,statusLabelImport:"Importando \xE1udio",statusLabelTranscribe:"Transcrevendo \xE1udio",statusLabelSummarize:"Gerando resumo",statusLabelMindmap:"Gerando mindmap",statusLabelTasks:"Extraindo tasks",statusLabelProject:"Criando projeto",statusLabelVault:"Configurando vault",noticeTranscriptSaved:e=>`Transcri\xE7\xE3o salva: ${e}`,settingSectionTranscription:"Transcri\xE7\xE3o",settingSectionDirs:"Diret\xF3rios",settingSectionModels:"Modelos OpenAI (GPT)",settingSectionLanguage:"Idioma e Templates",settingSectionBehavior:"Comportamento",settingApiKeyName:"OpenAI API Key",settingApiKeyDesc:"Armazenada de forma segura no keychain do sistema.",settingUserNameName:"Nome do usu\xE1rio",settingUserNameDesc:"Nome usado nos resumos (ex: itens de a\xE7\xE3o para [nome]).",settingAudioDirName:"Diret\xF3rio de \xE1udios",settingAudioDirDesc:"Pasta para salvar \xE1udios importados/gravados.",settingTranscriptsDirName:"Diret\xF3rio de transcri\xE7\xF5es",settingTranscriptsDirDesc:"Pasta para salvar transcri\xE7\xF5es (.srt e .md).",settingTranscriptionModelName:"Modelo de transcri\xE7\xE3o",settingTranscriptionModelDesc:"Auto escolhe entre diarize (com falantes, \u2264 23min) e whisper-1 (\xE1udios longos).",settingChunkDurationName:"Dura\xE7\xE3o do chunk (min)",settingChunkDurationDesc:"Tamanho dos chunks em \xE1udios longos. T\xEDpico: 5-20.",settingSummaryModelName:"Modelo de resumo",settingSummaryModelDesc:"Modelo usado para resumos e cria\xE7\xE3o de projetos.",settingTasksModelName:"Modelo de tasks",settingTasksModelDesc:"Modelo usado para extra\xE7\xE3o de tasks.",settingMindmapModelName:"Modelo de mindmap",settingMindmapModelDesc:"Modelo usado para gera\xE7\xE3o de mindmaps.",settingOutputLanguageName:"Idioma da sa\xEDda de IA",settingOutputLanguageDesc:"Idioma dos resumos/mindmaps/tasks gerados. Auto segue o idioma da transcri\xE7\xE3o.",settingOutputLanguageAuto:"Auto (seguir transcri\xE7\xE3o)",settingOutputLanguagePt:"Portugu\xEAs (Brasil)",settingOutputLanguageEn:"Ingl\xEAs",settingSummaryTemplateName:"Arquivo de template do resumo",settingSummaryTemplateDesc:"Caminho para um .md com o prompt do resumo. Vazio ou ausente = default embutido.",settingGenerateMdName:"Gerar .md a partir do .srt",settingGenerateMdDesc:"Gerar automaticamente um .md limpo ao transcrever.",settingShowPreviewName:"Mostrar preview antes de inserir",settingShowPreviewDesc:"Exibir preview edit\xE1vel antes de inserir resumo/mindmap.",settingShowFileIconsName:"Exibir \xEDcones dos artefatos MT",settingShowFileIconsDesc:"Adiciona \xEDcones aos templates e dashboards no explorador. Requer reload do plugin para refletir.",settingMinWordsName:"M\xEDnimo de palavras para resumo",settingMinWordsDesc:"Transcri\xE7\xF5es abaixo desse limite geram resumo gen\xE9rico.",cmdStartRecording:"Iniciar grava\xE7\xE3o",cmdImportAudio:"Importar \xE1udio",cmdTranscribe:"Transcrever \xE1udio",cmdSummarize:"Resumir transcri\xE7\xE3o",cmdMindmap:"Gerar mindmap",cmdExtractTasks:"Extrair tasks",cmdNewProject:"Novo projeto a partir de documento",cmdFullPipeline:"Pipeline completo",cmdSetupVault:"Setup do vault",cmdQuickStartGuide:"Guia r\xE1pido",modalGuideTitle:"Meeting Tools \u2014 Guia r\xE1pido",btnClose:"Fechar",recordTimerRecording:e=>`\u{1F534} Gravando ${e}`,recordTimerPaused:e=>`\u23F8 Pausado ${e}`,recordSavingTo:e=>`Salvando em ${e}/`,btnPause:"\u23F8 Pausar",btnResume:"\u25B6 Retomar",btnStop:"\u23F9 Parar",btnCancel:"\u2715 Cancelar",cursorBannerMessage:"\u{1F4CC} Posicione o cursor no local de inser\xE7\xE3o",btnContinue:"Continuar",btnCancelPlain:"Cancelar",modalInsufficientTitle:"Texto insuficiente no bloco",modalInsufficientDesc:(e,n)=>`Texto insuficiente neste bloco para gerar resumo, mindmap ou lista de tasks (${e} palavras encontradas, m\xEDnimo ${n}).`,previewFooter:(e,n)=>`${e} palavras \xB7 ${n} linhas`,modalOpenTranscript:"Abrir transcri\xE7\xE3o",modalPreview:"Preview",modalEdit:"Editar",modalInsert:"Inserir",modalAudioSuggestPlaceholder:"Selecione um arquivo de \xE1udio\u2026",modalTranscriptSuggestPlaceholder:"Selecione uma transcri\xE7\xE3o (.md ou .srt)\u2026",summaryShortFallback:e=>`**1. Resumo Executivo**
- Transcri\xE7\xE3o curta; conte\xFAdo insuficiente para s\xEDntese.

**2. Principais Itens de A\xE7\xE3o/Compromissos para ${e}**
- N\xE3o mencionado

**3. Detalhamento por T\xF3pico**
- N\xE3o mencionado`,llmLangAutoMatch:"Responda no mesmo idioma da transcri\xE7\xE3o de entrada.",llmLangEnglish:"Respond in English.",llmLangPortuguese:"Responda em Portugu\xEAs do Brasil.",emptyTasks:"Nenhuma task encontrada.",legendLabelDue:"Prazo",legendLabelStatus:"Status",legendLabelPriority:"Prioridade",legendHint:"Clique nos \xEDcones para alterar status/prioridade.",legendItemOverdue:"Atrasado",legendItemToday:"Hoje",legendItemThisWeek:"Esta semana",legendItemFuture:"Futuro",legendItemInProgress:"Em progresso",legendItemDone:"Conclu\xEDdo",legendItemCancelled:"Cancelado",legendItemHigh:"Alta",legendItemMedium:"M\xE9dia",legendItemLow:"Baixa",legendItemNoPriority:"Sem",emptyMeetingHistory:"Nenhuma daily note encontrada referenciando este projeto.",ganttEditTitle:e=>`Editar datas: ${e}`,ganttStartLabel:"Data in\xEDcio (\u23F3)",ganttEndLabel:"Data fim (\u{1F4C5})",btnSave:"Salvar",errorOpenAICall:"Falha na chamada OpenAI.",errorNoPptxSlides:"Nenhum slide encontrado no arquivo PPTX.",errorNoPptxText:"Nenhum texto encontrado nos slides do PPTX.",openaiErrorInvalidKey:"OpenAI API Key inv\xE1lida. Configure em Settings \u2192 Meeting Tools.",openaiErrorForbidden:"OpenAI indispon\xEDvel no seu pa\xEDs/regi\xE3o.",openaiErrorModelNotFound:e=>`Modelo OpenAI '${e}' n\xE3o encontrado. Troque em Settings \u2192 Meeting Tools (Summary/Tasks/Mindmap Model).`,openaiErrorBadRequest:e=>`Requisi\xE7\xE3o OpenAI inv\xE1lida: ${e}`,openaiErrorPayloadTooLarge:"Payload excede limite do OpenAI. Use transcri\xE7\xE3o menor ou reduza contexto.",openaiErrorContentFilter:"Conte\xFAdo bloqueado pela modera\xE7\xE3o da OpenAI.",openaiErrorRateLimit:e=>e!=null?`Rate limit OpenAI atingido. Tente novamente em ${e}s.`:"Rate limit OpenAI atingido. Tente novamente em alguns segundos.",openaiErrorQuotaExceeded:"Cota OpenAI esgotada. Verifique billing em platform.openai.com/usage",openaiErrorTokensPerMinute:"Limite de tokens por minuto da OpenAI atingido. Aguarde alguns segundos e tente de novo.",openaiErrorServerError:"Erro interno OpenAI. Tente em alguns segundos.",openaiErrorServiceUnavailable:"Servi\xE7o OpenAI indispon\xEDvel. Tente em alguns minutos.",openaiErrorNetwork:"Erro de rede ao contatar OpenAI. Verifique sua conex\xE3o.",openaiErrorUnknown:(e,n)=>`Erro OpenAI ${e}: ${n}`};var kn={en:mt,"pt-BR":pt};function _e(){let e=(window.localStorage.getItem("language")||"").trim();return e==="pt-BR"||e==="pt"||e.startsWith("pt-")?"pt-BR":"en"}var ze=_e();function gt(e){ze=e}function ye(){return ze}function g(){return kn[ze]}function Y(e){let n=g();return e==="pt-BR"?n.llmLangPortuguese:e==="en"?n.llmLangEnglish:n.llmLangAutoMatch}var ft="meeting-tools-openai-key",Ve={openaiApiKey:"",audioDir:"Vault/Audios",transcriptsDir:"Vault/Transcripts",transcriptionModel:"auto",chunkDurationMin:10,summaryModel:"gpt-4.1",tasksModel:"gpt-4.1",mindmapModel:"gpt-4.1",outputLanguage:"auto",summaryTemplatePath:"Vault/Templates/Summary Template.md",generateMdFromSrt:!0,showPreview:!0,showFileIcons:!0,minWordsForSummary:60,userName:"user",dismissedArtifacts:[],onboardingShown:!1,summaryTemplateCompatDismissed:!1};function ht(e){return e.settings.openaiApiKey||""}function Tt(e,n){let t=e.app.secretStorage;return n.openaiApiKey&&t?(t.setSecret(ft,n.openaiApiKey),n.openaiApiKey="",!0):!1}function yt(e,n){var o;let t=e.app.secretStorage;t&&(n.openaiApiKey=(o=t.getSecret(ft))!=null?o:"")}async function wt(e){let n=Object.assign({},Ve,await e.loadData());return Tt(e,n)&&await e.saveData(n),yt(e,n),n}async function S(e,n){Tt(e,n),await e.saveData(n),yt(e,n)}var we=class extends M.PluginSettingTab{constructor(n,t){super(n,t),this.plugin=t}display(){let{containerEl:n}=this,t=g();n.empty(),n.createEl("h2",{text:"Meeting Tools"}),new M.Setting(n).setName(t.settingApiKeyName).setDesc(t.settingApiKeyDesc).addText(o=>{o.setPlaceholder("sk-..."),o.setValue(this.plugin.settings.openaiApiKey),o.inputEl.type="password",o.onChange(async i=>{this.plugin.settings.openaiApiKey=i,await S(this.plugin,this.plugin.settings)})}),new M.Setting(n).setName(t.settingUserNameName).setDesc(t.settingUserNameDesc).addText(o=>o.setValue(this.plugin.settings.userName).onChange(async i=>{this.plugin.settings.userName=i,await S(this.plugin,this.plugin.settings)})),n.createEl("h3",{text:t.settingSectionDirs}),new M.Setting(n).setName(t.settingAudioDirName).setDesc(t.settingAudioDirDesc).addText(o=>o.setPlaceholder("Vault/Audios").setValue(this.plugin.settings.audioDir).onChange(async i=>{this.plugin.settings.audioDir=i,await S(this.plugin,this.plugin.settings)})),new M.Setting(n).setName(t.settingTranscriptsDirName).setDesc(t.settingTranscriptsDirDesc).addText(o=>o.setPlaceholder("Vault/Transcripts").setValue(this.plugin.settings.transcriptsDir).onChange(async i=>{this.plugin.settings.transcriptsDir=i,await S(this.plugin,this.plugin.settings)})),n.createEl("h3",{text:t.settingSectionTranscription}),new M.Setting(n).setName(t.settingTranscriptionModelName).setDesc(t.settingTranscriptionModelDesc).addDropdown(o=>o.addOption("auto","Auto").addOption("whisper-1","whisper-1").addOption("gpt-4o-transcribe-diarize","gpt-4o-transcribe-diarize").setValue(this.plugin.settings.transcriptionModel).onChange(async i=>{this.plugin.settings.transcriptionModel=i,await S(this.plugin,this.plugin.settings)})),new M.Setting(n).setName(t.settingChunkDurationName).setDesc(t.settingChunkDurationDesc).addText(o=>o.setValue(String(this.plugin.settings.chunkDurationMin)).onChange(async i=>{let s=parseInt(i,10);!isNaN(s)&&s>0&&(this.plugin.settings.chunkDurationMin=s,await S(this.plugin,this.plugin.settings))})),n.createEl("h3",{text:t.settingSectionModels}),new M.Setting(n).setName(t.settingSummaryModelName).setDesc(t.settingSummaryModelDesc).addText(o=>o.setValue(this.plugin.settings.summaryModel).onChange(async i=>{this.plugin.settings.summaryModel=i,await S(this.plugin,this.plugin.settings)})),new M.Setting(n).setName(t.settingTasksModelName).setDesc(t.settingTasksModelDesc).addText(o=>o.setValue(this.plugin.settings.tasksModel).onChange(async i=>{this.plugin.settings.tasksModel=i,await S(this.plugin,this.plugin.settings)})),new M.Setting(n).setName(t.settingMindmapModelName).setDesc(t.settingMindmapModelDesc).addText(o=>o.setValue(this.plugin.settings.mindmapModel).onChange(async i=>{this.plugin.settings.mindmapModel=i,await S(this.plugin,this.plugin.settings)})),n.createEl("h3",{text:t.settingSectionLanguage}),new M.Setting(n).setName(t.settingOutputLanguageName).setDesc(t.settingOutputLanguageDesc).addDropdown(o=>o.addOption("auto",t.settingOutputLanguageAuto).addOption("pt-BR",t.settingOutputLanguagePt).addOption("en",t.settingOutputLanguageEn).setValue(this.plugin.settings.outputLanguage).onChange(async i=>{this.plugin.settings.outputLanguage=i,await S(this.plugin,this.plugin.settings)})),new M.Setting(n).setName(t.settingSummaryTemplateName).setDesc(t.settingSummaryTemplateDesc).addText(o=>o.setPlaceholder("Vault/Templates/Summary Template.md").setValue(this.plugin.settings.summaryTemplatePath).onChange(async i=>{this.plugin.settings.summaryTemplatePath=i,await S(this.plugin,this.plugin.settings)})),n.createEl("h3",{text:t.settingSectionBehavior}),new M.Setting(n).setName(t.settingGenerateMdName).setDesc(t.settingGenerateMdDesc).addToggle(o=>o.setValue(this.plugin.settings.generateMdFromSrt).onChange(async i=>{this.plugin.settings.generateMdFromSrt=i,await S(this.plugin,this.plugin.settings)})),new M.Setting(n).setName(t.settingShowPreviewName).setDesc(t.settingShowPreviewDesc).addToggle(o=>o.setValue(this.plugin.settings.showPreview).onChange(async i=>{this.plugin.settings.showPreview=i,await S(this.plugin,this.plugin.settings)})),new M.Setting(n).setName(t.settingShowFileIconsName).setDesc(t.settingShowFileIconsDesc).addToggle(o=>o.setValue(this.plugin.settings.showFileIcons).onChange(async i=>{this.plugin.settings.showFileIcons=i,await S(this.plugin,this.plugin.settings)})),new M.Setting(n).setName(t.settingMinWordsName).setDesc(t.settingMinWordsDesc).addText(o=>o.setValue(String(this.plugin.settings.minWordsForSummary)).onChange(async i=>{let s=parseInt(i,10);!isNaN(s)&&s>0&&(this.plugin.settings.minWordsForSummary=s,await S(this.plugin,this.plugin.settings))}))}};var K=require("obsidian");function $(e){let n=g(),t=new K.Notice("",0),o=t.noticeEl;o.empty(),o.addClass("mt-missing-notice"),o.createEl("div",{text:n.noticeConfigureApiKey});let i=o.createDiv({cls:"mt-notice-btn-row"});i.createEl("button",{text:n.btnOpenSettings,cls:"mod-cta"}).addEventListener("click",()=>{var c;t.hide();let a=e.app.setting;a!=null&&a.open&&(a.open(),(c=a.openTabById)==null||c.call(a,e.manifest.id))}),i.createEl("button",{text:n.btnDismiss}).addEventListener("click",()=>t.hide())}async function bt(e){let n=URL.createObjectURL(e);return await new Promise(t=>{let o=!1,i=r=>{o||(o=!0,URL.revokeObjectURL(n),t(r))},s=new Audio;s.preload="metadata",s.onloadedmetadata=()=>{if(isFinite(s.duration)&&s.duration>0){i(s.duration);return}s.currentTime=Number.MAX_SAFE_INTEGER,s.onseeked=()=>{isFinite(s.duration)&&s.duration>0?i(s.duration):i(null)}},s.onerror=()=>i(null),s.src=n,setTimeout(()=>i(null),1e4)})}async function F(e,n){e.vault.getAbstractFileByPath(n)||await e.vault.createFolder(n).catch(()=>{})}function ce(e){let n=e.lastIndexOf("/"),t=n>=0?e.slice(n+1):e,o=t.lastIndexOf(".");return o>=0?t.slice(0,o):t}function U(e){if(!e)return"";let n=e.replace(/\r/g,"").replace(/\u2028|\u2029/g,`
`).trim();return n=n.replace(/^\s*\d+\s*$/gm,""),n=n.replace(/\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}(?:.*)?$/gm,""),n=n.replace(/<[^>]+>/g,""),n=n.split(`
`).map(t=>t.trim()).filter(t=>t.length).join(" "),n=n.replace(/\s{2,}/g," ").trim(),n}async function kt(e){let n=e.workspace.getActiveViewOfType(K.MarkdownView);return n!=null&&n.containerEl?new Promise(t=>{let o=!1,i=document.createElement("div");i.className="mt-insert-banner";let s=g(),r=document.createElement("span");r.textContent=s.cursorBannerMessage,i.appendChild(r);let a=document.createElement("div");a.className="mt-insert-banner-buttons";let c=document.createElement("button");c.textContent=s.btnCancelPlain,c.className="mt-insert-cancel";let d=document.createElement("button");d.textContent=s.btnContinue,d.className="mt-insert-confirm",a.appendChild(c),a.appendChild(d),i.appendChild(a);let p=m=>{o||(o=!0,i.remove(),t(m))};c.addEventListener("click",()=>p(!1)),d.addEventListener("click",()=>p(!0)),n.containerEl.prepend(i)}):!0}function J(e,n){let t=e.workspace.getActiveViewOfType(K.MarkdownView);return t!=null&&t.editor?(t.editor.replaceSelection(`
`+n+`
`),!0):!1}async function le(e,n,t,o){await F(e,n);let i=t.lastIndexOf("."),s=i>=0?t.slice(0,i):t,r=i>=0?t.slice(i+1).toLowerCase():"",a=(s.replace(/[\\/:*?"<>|]/g,"-").replace(/\s+/g," ").trim()||"audio")+(r?"."+r:""),c=`${n}/${a}`,d=1;for(;e.vault.getAbstractFileByPath(c);){let p=i>=0?a.slice(0,a.lastIndexOf(".")):a,m=i>=0?"."+a.slice(a.lastIndexOf(".")+1):"";c=`${n}/${p} (${d})${m}`,d++}return await e.vault.adapter.writeBinary(c,new Uint8Array(o)),c}function be(e,n){let t=e.workspace.getActiveViewOfType(K.MarkdownView);if(!(t!=null&&t.editor))return{result:null,insufficientBlock:!1};let o=t.editor,i=o.getSelection();if(i&&i.trim().length>0){let m=i.trim().split(/\s+/).filter(Boolean).length;if(m>=n){let u=o.listSelections()[0],f=Math.max(u.head.line,u.anchor.line);return{result:{text:i,mode:"selection",insertLine:f},insufficientBlock:!1}}return{result:null,insufficientBlock:!0,wordCount:m}}let s=o.getCursor(),r=o.getValue().split(`
`),a=r.length,c=/### \d{2}:\d{2}/,d=-1,p=a;for(let m=s.line;m>=0;m--)if(c.test(r[m])){d=m;break}if(d>=0){for(let u=d+1;u<a;u++)if(c.test(r[u])){p=u;break}let m=r.slice(d,p).join(`
`).trim(),l=m.split(/\s+/).filter(Boolean).length;return l>=n?{result:{text:m,mode:"timeblock",insertLine:p},insufficientBlock:!1}:{result:null,insufficientBlock:!0,wordCount:l}}return{result:null,insufficientBlock:!1}}function Q(e,n,t){let o=e.workspace.getActiveViewOfType(K.MarkdownView);if(!(o!=null&&o.editor))return!1;let i=o.editor,s=`
---

`+n+`
`;if(t.mode==="selection"){let r=i.getLine(t.insertLine);return i.replaceRange(s,{line:t.insertLine,ch:r.length}),!0}return t.mode==="timeblock"?(i.replaceRange(s,{line:t.insertLine,ch:0}),!0):!1}async function j(e,n,t){let o=e.addStatusBarItem(),i=g();o.setText(i.statusRunning(n)),o.style.fontWeight="600";try{let s=await t();return o.setText(i.statusDone(n)),setTimeout(()=>o.remove(),3e3),s}catch(s){throw o.setText(i.statusError(n)),setTimeout(()=>o.remove(),5e3),s}}var v=require("obsidian");async function vt(e,n=16e3){let t=await e.arrayBuffer(),o=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!o)throw new Error("OfflineAudioContext n\xE3o dispon\xEDvel");return await new o(1,1,n).decodeAudioData(t)}function xt(e,n){let t=e.sampleRate,o=e.numberOfChannels,i=Math.floor(n*t),s=e.length,r=[],a=window.AudioContext||window.webkitAudioContext,c=new a;try{for(let d=0;d<s;d+=i){let p=Math.min(i,s-d),m=c.createBuffer(o,p,t);for(let l=0;l<o;l++){let u=e.getChannelData(l).subarray(d,d+p);m.copyToChannel(u,l,0)}r.push(m)}}finally{typeof c.close=="function"&&c.close()}return r}function Pt(e){let n=e.numberOfChannels,t=e.sampleRate,o=e.length,s=n*2,r=t*s,a=o*s,c=44+a,d=new ArrayBuffer(c),p=new DataView(d);ke(p,0,"RIFF"),p.setUint32(4,c-8,!0),ke(p,8,"WAVE"),ke(p,12,"fmt "),p.setUint32(16,16,!0),p.setUint16(20,1,!0),p.setUint16(22,n,!0),p.setUint32(24,t,!0),p.setUint32(28,r,!0),p.setUint16(32,s,!0),p.setUint16(34,16,!0),ke(p,36,"data"),p.setUint32(40,a,!0);let m=[];for(let u=0;u<n;u++)m.push(e.getChannelData(u));let l=44;for(let u=0;u<o;u++)for(let f=0;f<n;f++){let h=m[f][u];h>1?h=1:h<-1&&(h=-1),p.setInt16(l,h<0?h*32768:h*32767,!0),l+=2}return new Blob([d],{type:"audio/wav"})}function ke(e,n,t){for(let o=0;o<t.length;o++)e.setUint8(n+o,t.charCodeAt(o))}var vn=/try again in (\d+(?:\.\d+)?)\s*(ms|s)?/i;function xn(e){let n=e.match(vn);if(!n)return null;let t=parseFloat(n[1]),i=(n[2]||"s").toLowerCase()==="ms"?t/1e3:t;return Math.max(1,Math.ceil(i))}function E(e,n){var d,p,m,l;if(e===null)return{status:null,code:null,message:n instanceof Error?n.message:String(n!=null?n:""),friendly:g().openaiErrorNetwork};let t=e.status,o=e.json,i=o==null?void 0:o.error,s=(p=(d=i==null?void 0:i.code)!=null?d:i==null?void 0:i.type)!=null?p:null,r=(l=(m=i==null?void 0:i.message)!=null?m:typeof e.text=="string"?e.text:"")!=null?l:"",a=g(),c;if(t===401)c=a.openaiErrorInvalidKey;else if(t===403)c=a.openaiErrorForbidden;else if(t===404){let u=r.match(/model\s+[`'"]?([\w.\-:/]+)[`'"]?/i),f=u?u[1]:"?";c=a.openaiErrorModelNotFound(f)}else t===413?c=a.openaiErrorPayloadTooLarge:t===422||s==="content_filter"?c=a.openaiErrorContentFilter:t===429?s==="insufficient_quota"?c=a.openaiErrorQuotaExceeded:s==="tokens_exceeded"||s==="tokens"||/tokens per minute/i.test(r)?c=a.openaiErrorTokensPerMinute:c=a.openaiErrorRateLimit(xn(r)):t>=400&&t<500?c=a.openaiErrorBadRequest(r||String(t)):t===500?c=a.openaiErrorServerError:t===502||t===503||t===504?c=a.openaiErrorServiceUnavailable:c=a.openaiErrorUnknown(t,r||"(no message)");return{status:t,code:s,message:r,friendly:c}}var Pn={webm:"audio/webm",m4a:"audio/mp4",mp3:"audio/mpeg",wav:"audio/wav",ogg:"audio/ogg",mp4:"audio/mp4"},Mn="The sentence may be cut off, do not make up words to fill in the rest of the sentence.",Mt=1400,Ct=25*1024*1024;async function de(e,n){var w;let{app:t,settings:o}=e,i=e.getApiKey();if(!i)return $(e),null;let s=t.vault.getAbstractFileByPath(n);if(!s||!(s instanceof v.TFile))return new v.Notice(g().noticeAudioNotFound(n)),null;let r=(s.extension||"").toLowerCase(),a=Pn[r]||"application/octet-stream",c=await t.vault.adapter.readBinary(n),d=new Blob([c],{type:a}),p=await bt(d),m=Sn(o.transcriptionModel,p);await F(t,o.transcriptsDir);let l,u,f;try{if(m==="whisper-chunked")f="whisper-1 (chunked)",new v.Notice(g().noticeTranscribingWith(f)),l=(await En(e,i,d,o.chunkDurationMin)).srt,u=U(l)||g().transcriptEmptyMarker;else if(m==="diarize-single"){f="gpt-4o-transcribe-diarize",new v.Notice(g().noticeTranscribingWith(f));let b=await It(i,d,s.name);l=Et(b),u=At(b)||"_(transcri\xE7\xE3o vazia)_"}else if(m==="diarize-chunked"){f="gpt-4o-transcribe-diarize (chunked)",new v.Notice(g().noticeTranscribingWith(f));let b=await An(e,i,d,o.chunkDurationMin);l=Et(b),u=At(b)||"_(transcri\xE7\xE3o vazia)_"}else{if(f="whisper-1",new v.Notice(g().noticeTranscribingWith(f)),c.byteLength>Ct)return new v.Notice(g().noticeFileExceedsLimit((c.byteLength/1024/1024).toFixed(1))),null;l=await Dt(i,d,s.name),u=U(l)||g().transcriptEmptyMarker}}catch(b){return console.error("[MeetingTools] Transcription error:",b),new v.Notice(g().noticeTranscribeFailed((w=b==null?void 0:b.message)!=null?w:String(b))),null}let h=`${o.transcriptsDir}/${ce(n)}.srt`,T=t.vault.getAbstractFileByPath(h);T instanceof v.TFile?await t.vault.modify(T,l):await t.vault.create(h,l),new v.Notice(g().noticeSrtSaved(h));let y=null;if(o.generateMdFromSrt){y=`${o.transcriptsDir}/${ce(n)}.md`;let b=`${g().transcriptMdHeader}

![[${n}]]

${u}`,N=t.vault.getAbstractFileByPath(y);N instanceof v.TFile?await t.vault.modify(N,b):await t.vault.create(y,b),new v.Notice(g().noticeMdSaved(y))}return{srtPath:h,mdPath:y}}function Sn(e,n){let t=n!=null?n:1/0;return e==="whisper-1"?"whisper-chunked":e==="gpt-4o-transcribe-diarize"?t>Mt?"diarize-chunked":"diarize-single":t>Mt?"whisper-chunked":"diarize-single"}async function Dt(e,n,t){var s,r;let o=new FormData;o.append("file",n,t),o.append("model","whisper-1"),o.append("response_format","srt"),o.append("temperature","0"),o.append("prompt",Mn);let i;try{i=await fetch("https://api.openai.com/v1/audio/transcriptions",{method:"POST",headers:{Authorization:"Bearer "+e},body:o})}catch(a){let c=E(null,a);throw console.error("[MeetingTools] whisper network error:",c),new v.Notice(c.friendly,1e4),new Error((s=c.code)!=null?s:"network_error")}if(!i.ok){let a=await i.json().catch(()=>null),c=E({status:i.status,json:a});throw console.error("[MeetingTools] whisper error:",c),new v.Notice(c.friendly,1e4),new Error((r=c.code)!=null?r:"openai_error")}return await i.text()}async function En(e,n,t,o){let i=await Ft(t,o),s=o*60,r=[];for(let a=0;a<i.length;a++){new v.Notice(g().noticeTranscribingChunk(a+1,i.length));try{let c=await Lt(async()=>Dt(n,i[a],`chunk-${a+1}.wav`));r.push(c)}catch(c){let d=a*s,p=d+s;console.error(`[MeetingTools] chunk ${a+1} failed:`,c),new v.Notice(g().noticeChunkFailed(a+1)),r.push(`1
${q(0)} --> ${q(p-d)}
[chunk ${a+1} falhou: ${q(d)}\u2013${q(p)}]
`)}}return{srt:Dn(r,s)}}async function It(e,n,t){var s,r;let o=new FormData;o.append("file",n,t),o.append("model","gpt-4o-transcribe-diarize"),o.append("response_format","diarized_json"),o.append("chunking_strategy","auto"),o.append("temperature","0");let i;try{i=await fetch("https://api.openai.com/v1/audio/transcriptions",{method:"POST",headers:{Authorization:"Bearer "+e},body:o})}catch(a){let c=E(null,a);throw console.error("[MeetingTools] diarize network error:",c),new v.Notice(c.friendly,1e4),new Error((s=c.code)!=null?s:"network_error")}if(!i.ok){let a=await i.json().catch(()=>null),c=E({status:i.status,json:a});throw console.error("[MeetingTools] diarize error:",c),new v.Notice(c.friendly,1e4),new Error((r=c.code)!=null?r:"openai_error")}return await i.json()}async function An(e,n,t,o){var c,d,p,m;let i=await Ft(t,o),s=o*60,r=[],a="";for(let l=0;l<i.length;l++){new v.Notice(g().noticeTranscribingChunk(l+1,i.length));try{let u=await Lt(async()=>It(n,i[l],`chunk-${l+1}.wav`)),f=l*s;for(let h of(c=u.segments)!=null?c:[])r.push({start:((d=h.start)!=null?d:0)+f,end:((p=h.end)!=null?p:0)+f,text:(m=h.text)!=null?m:"",speaker:h.speaker});u.text&&(a+=(a?" ":"")+u.text)}catch(u){console.error(`[MeetingTools] diarize chunk ${l+1} failed:`,u),new v.Notice(g().noticeChunkFailed(l+1));let f=l*s;r.push({start:f,end:f+s,text:`[chunk ${l+1} falhou]`})}}return{segments:r,text:a}}async function Ft(e,n){let t=await vt(e,16e3),i=xt(t,n*60).map(s=>Pt(s));for(let s of i)if(s.size>Ct)throw new Error(`Chunk excede 25MB (${(s.size/1024/1024).toFixed(1)}MB). Reduza Chunk duration.`);return i}async function Lt(e){try{return await e()}catch(n){return await new Promise(t=>setTimeout(t,2e3)),await e()}}function q(e){(!isFinite(e)||e<0)&&(e=0);let n=Math.floor(e/3600),t=Math.floor(e%3600/60),o=Math.floor(e%60),i=Math.floor((e-Math.floor(e))*1e3);return`${Ge(n)}:${Ge(t)}:${Ge(o)},${Cn(i)}`}function St(e){let n=e.match(/^(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})$/);return n?parseInt(n[1],10)*3600+parseInt(n[2],10)*60+parseInt(n[3],10)+parseInt(n[4],10)/1e3:0}function Ge(e){return e<10?"0"+e:String(e)}function Cn(e){return e<10?"00"+e:e<100?"0"+e:String(e)}function Dn(e,n){let t=[],o=1;return e.forEach((i,s)=>{let r=s*n,a=i.replace(/\r/g,"").trim().split(/\n\n+/);for(let c of a){let d=c.split(`
`);if(d.length<2)continue;let p=0;/^\d+$/.test(d[0].trim())&&(p=1);let l=d[p].match(/^(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})/);if(!l)continue;let u=St(l[1])+r,f=St(l[2])+r,h=d.slice(p+1).join(`
`).trim();t.push(`${o}
${q(u)} --> ${q(f)}
${h}`),o++}}),t.join(`

`)+`
`}function Rt(e){if(!e)return"Speaker ?";if(/^[A-Z]$/.test(e))return`Speaker ${e}`;let n=e.match(/^speaker[_-]?(\d+)$/i);return n?`Speaker ${parseInt(n[1],10)+1}`:e.charAt(0).toUpperCase()+e.slice(1)}function Et(e){var o;let n=(o=e.segments)!=null?o:[];if(n.length===0)return e.text?`1
00:00:00,000 --> 00:00:00,000
${e.text.trim()}
`:"";let t=[];return n.forEach((i,s)=>{var c;let r=Rt(i.speaker),a=((c=i.text)!=null?c:"").trim();t.push(`${s+1}
${q(i.start)} --> ${q(i.end)}
[${r}] ${a}`)}),t.join(`

`)+`
`}function At(e){var o,i,s;let n=(o=e.segments)!=null?o:[];if(n.length===0)return((i=e.text)!=null?i:"").trim();let t=[];for(let r of n){let a=Rt(r.speaker),c=((s=r.text)!=null?s:"").trim();if(!c)continue;let d=t[t.length-1];d&&d.speaker===a?d.text+=" "+c:t.push({speaker:a,text:c})}return t.map(r=>`**${r.speaker}:** ${r.text}`).join(`

`)}var R=require("obsidian");var L=require("obsidian");var ve=class extends L.FuzzySuggestModal{constructor(n,t,o,i){super(n),this.folderPath=t,this.extensions=o,this.onChoose=i}getItems(){let n=this.app.vault.getAbstractFileByPath(this.folderPath);return!n||!(n instanceof L.TFolder)?[]:n.children.filter(t=>t instanceof L.TFile&&this.extensions.has((t.extension||"").toLowerCase())).sort((t,o)=>o.stat.mtime-t.stat.mtime)}getItemText(n){return n.name}onChooseItem(n){this.onChoose(n.path)}onClose(){}},xe=class extends ve{constructor(n,t,o){super(n,t,new Set(["webm","m4a","mp3","wav","ogg","mp4"]),o),this.setPlaceholder(g().modalAudioSuggestPlaceholder)}},H=class extends ve{constructor(n,t,o){super(n,t,new Set(["md","srt"]),o),this.setPlaceholder(g().modalTranscriptSuggestPlaceholder)}},z=class extends L.Modal{constructor(t,o,i){super(t);this.resolved=!1;this.resolvePromise=null;this.title=o,this.content=i}doResolve(t){var o;this.resolved||(this.resolved=!0,(o=this.resolvePromise)==null||o.call(this,t))}onOpen(){let{contentEl:t,modalEl:o,containerEl:i}=this;t.empty(),i.addEventListener("click",T=>{T.target===i&&(T.stopPropagation(),T.preventDefault())},!0),o.addClass("meeting-tools-modal");let s=t.createEl("h3",{text:this.title});s.style.margin="0 0 8px 0",s.style.flex="0 0 auto";let r=t.createEl("textarea",{cls:"meeting-tools-textarea"});r.value=this.content;let a=t.createDiv({cls:"meeting-tools-preview"});a.style.display="none";let c=t.createDiv({cls:"meeting-tools-preview-footer"}),d=g(),p=()=>{let T=r.value,y=T.trim().split(/\s+/).filter(Boolean).length,w=T.split(`
`).length;c.setText(d.previewFooter(y,w))};r.addEventListener("input",p),p();let m=t.createDiv({cls:"meeting-tools-btn-row"});m.createEl("button",{text:d.btnCancelPlain}).addEventListener("click",()=>{this.doResolve(null),this.close()});let u=m.createEl("button",{text:d.modalPreview}),f=!1;u.onclick=async()=>{f?(r.value=this.content,a.style.display="none",r.style.display="block",u.textContent=d.modalPreview,f=!1,r.focus()):(this.content=r.value,r.style.display="none",a.style.display="block",u.textContent=d.modalEdit,f=!0,a.empty(),await L.MarkdownRenderer.renderMarkdown(this.content,a,"",this))},m.createEl("button",{text:d.modalInsert,cls:"mod-cta"}).addEventListener("click",()=>{this.content=f?this.content:r.value,this.doResolve(this.content),this.close()}),setTimeout(()=>r.focus(),50)}onClose(){this.doResolve(null),this.contentEl.empty()}waitForResult(){return new Promise(t=>{this.resolvePromise=t})}},ue=class extends L.Modal{constructor(n,t,o){super(n),this.title=t,this.content=o}onOpen(){let{contentEl:n,modalEl:t}=this;n.empty(),t.addClass("meeting-tools-modal");let o=n.createEl("h3",{text:this.title});o.style.margin="0 0 8px 0",o.style.flex="0 0 auto";let i=n.createDiv({cls:"meeting-tools-preview"});i.style.display="block",L.MarkdownRenderer.renderMarkdown(this.content,i,"",this),n.createDiv({cls:"meeting-tools-btn-row"}).createEl("button",{text:g().btnClose,cls:"mod-cta"}).addEventListener("click",()=>this.close())}onClose(){this.contentEl.empty()}},Pe=class extends L.Modal{constructor(t,o,i){super(t);this.resolved=!1;this.resolvePromise=null;this.wordCount=o,this.minWords=i}doResolve(t){var o;this.resolved||(this.resolved=!0,(o=this.resolvePromise)==null||o.call(this,t))}onOpen(){let{contentEl:t}=this;t.empty();let o=g();t.createEl("h3",{text:o.modalInsufficientTitle}),t.createEl("p",{text:o.modalInsufficientDesc(this.wordCount,this.minWords)});let i=t.createDiv({cls:"meeting-tools-btn-row"});i.createEl("button",{text:o.btnCancelPlain}).addEventListener("click",()=>{this.doResolve(!1),this.close()}),i.createEl("button",{text:o.modalOpenTranscript,cls:"mod-cta"}).addEventListener("click",()=>{this.doResolve(!0),this.close()})}onClose(){this.doResolve(!1),this.contentEl.empty()}waitForResult(){return new Promise(t=>{this.resolvePromise=t})}};var Me=`Format each action item EXACTLY like this (one per line):

- [ ] [clear, objective description] [resource:: [owner name]] [priority:: [high/medium/low]] #task <project tag from Context> <meeting wikilinks from Context> \u{1F4C5} [YYYY-MM-DD]

Rules:
- Include only tasks with an explicit owner named in the text (third-person reference, e.g. "Roger will send...", "Patr\xEDcia will write..."). If a statement uses collective forms ("we", "a gente", "let's") or has no clearly identified owner, OMIT the task.
- Do NOT attribute ambiguous or collective statements to the User name from Context. The User name is informational only.
- If an explicit deadline is present, use \u{1F4C5} YYYY-MM-DD. If not, omit \u{1F4C5}.
- priority: "high" for urgent/critical, "medium" for normal, "low" for nice-to-have. If unclear, use "medium".
- Apply the "Meeting wikilinks" from Context to EVERY task, exactly as written (including document extensions like .pptx).
- If "Project tag" is present in Context, apply it to EVERY task. If not present, omit the #projects/ tag.
- Do not invent information not in the text.
- If no action item qualifies under the rules above (everything is collective or lacks a named owner), output exactly "_(no action items identified)_" instead of any bullet list. Translate the marker into the output language when appropriate.`,Nt=`
Convert the meeting into a Mermaid mindmap diagram. Output = ONLY a code block:
- Must start with \`\`\`mermaid and the 1st inner line must be exactly "mindmap".
- Line 2 is the root \u2014 a short meeting identifier (not a document section).
- Use 6 to 12 THEMATIC top-level branches under the root (e.g. "Contracts", "Systems", "Risks", "Timeline", "People"). Mermaid auto-colors each top-level branch, so more distinct themes = more visual differentiation.
- NEVER use document-structure labels as branches. Forbidden: "Executive Summary", "Action Items", "Detailed Topics", "Participants", "Summary", "Outcomes". Decompose thematically by subject matter discussed in the meeting.
- If the input is already a structured summary, IGNORE its section layout and RE-ORGANIZE by theme.
- Group related leaves under the thematic branch that best fits (e.g. a task about a contract goes under "Contracts", not a generic "Action Items" branch).
- Indent with 2 spaces per level. One item per line. Be concise.
- NEVER use square brackets [ ] or parentheses ( ) in labels.
- NEVER use colons ":" in labels; use " - " instead.
- Use plain text (no Markdown inside labels).

Minimal example:
\`\`\`mermaid
mindmap
  Meeting
    Contracts
      Review status
      Deadlines
    Systems
      SAP migration
      Licenses
    Risks
      Missing invoices
\`\`\``.trim(),$t=`
Extract ALL action items / commitments from the text below.

{{task_context}}

${Me}

Additional rules:
- DO NOT repeat the entire text, only the extracted tasks.
- If no action items exist, respond exactly: "No action items identified."
`.trim(),Bt=`
You are an executive assistant specialized in project structuring.
Analyze the document below and extract the information to fill the project note.

Respond EXACTLY in this markdown format (fill what you find; use "[Not mentioned]" for anything not in the document):

# [Project Name]

## Executive Summary
> [Concise 2-4 sentence summary]

## Objectives
- [Objective 1]
- [Objective 2]
- [Continue as needed]

## Workstreams
### 1. [Workstream name]
- Owner: [Name or "Not mentioned"]
- Scope: [Description]

### 2. [Workstream name]
- Owner: [Name or "Not mentioned"]
- Scope: [Description]

[Continue as needed]

## Timeline
[Extract dates, milestones and deadlines. If a schedule is present, describe it.]

## Stakeholders
| Role | Name |
|------|------|
| [Role] | [Name] |

RULES:
- Be factual \u2014 do not invent information that isn't in the document.
- Keep the markdown format exactly as specified.
- If the document is very short or vague, fill what you can and mark the rest as "[Not mentioned]".
`.trim();var In=`
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
`.trim(),Fn=`
{{language_instruction}}

Voc\xEA \xE9 um(a) assistente executivo(a) com 20+ anos de experi\xEAncia.
Transforme a transcri\xE7\xE3o abaixo em notas de reuni\xE3o, seguindo este formato exato:

**[T\xEDtulo da Reuni\xE3o]**
**Data:** [Inserir data]
**Participantes:** [Lista]

## 1. Resumo Executivo
- Vis\xE3o concisa do prop\xF3sito, principais t\xF3picos e outcomes.

## 2. Itens de A\xE7\xE3o
Extraia TODOS os itens de a\xE7\xE3o e compromissos da transcri\xE7\xE3o (para cada participante, n\xE3o apenas {{user_name}}), seguindo o formato abaixo.

{{task_context}}

{{task_format_spec}}

## 3. T\xF3picos Detalhados
### T\xF3pico 1: [Nome]
- Pontos discutidos
- Decis\xF5es tomadas
- Itens de a\xE7\xE3o e respons\xE1veis

### T\xF3pico 2: [Nome]
- (repita conforme necess\xE1rio)

REGRAS:
- N\xC3O invente. Se algo estiver ausente, escreva literalmente "N\xE3o mencionado".
- Identifique participantes a partir da transcri\xE7\xE3o; caso contr\xE1rio, "N\xE3o mencionado".
- Tom profissional, claro e objetivo. Use bullets e negrito em cabe\xE7alhos.

---

Transcri\xE7\xE3o:
{{transcript}}
`.trim(),Ln=`# {{date:YYYY-MM-DD}}

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
`,Rn=`# {{date:YYYY-MM-DD}}

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
## Notas e Observa\xE7\xF5es
`,Nn=`# {{title}}

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
`,$n=`# {{title}}

## Resumo Executivo
>

## Objetivos
-

## Workstreams
### 1.
- Respons\xE1vel:
- Escopo:

## Timeline


## Stakeholders
| Papel | Nome |
|-------|------|
|       |      |

## Documentos Base
-

## Task List


## Hist\xF3rico de Reuni\xF5es
\`\`\`meeting-history
\`\`\`
`,Bn=`# MT Task Dashboard

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
`,jn=`# MT Task Dashboard

## Por Projeto
\`\`\`meeting-tasks
view: project
\`\`\`

---

## Por Respons\xE1vel
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
`,On=`# MT Kanban View

## By Project
\`\`\`meeting-kanban
filter: project
\`\`\`

---

## By Resource
\`\`\`meeting-kanban
filter: resource
\`\`\`
`,_n=`# MT Kanban View

## Por Projeto
\`\`\`meeting-kanban
filter: project
\`\`\`

---

## Por Respons\xE1vel
\`\`\`meeting-kanban
filter: resource
\`\`\`
`,zn=`# MT Gantt View

## By Project
\`\`\`meeting-gantt
filter: project
\`\`\`

---

## By Resource
\`\`\`meeting-gantt
filter: resource
\`\`\`
`,Vn=`# MT Gantt View

## Por Projeto
\`\`\`meeting-gantt
filter: project
\`\`\`

---

## Por Respons\xE1vel
\`\`\`meeting-gantt
filter: resource
\`\`\`
`,ee=[{id:"summary-template",path:"Vault/Templates/Summary Template.md",legacyPtBrPath:"Vault/Templates/Modelo de Resumo.md",enContent:In,ptBrContent:Fn},{id:"daily-note-template",path:"Vault/Templates/Daily Note Template.md",legacyPtBrPath:"Vault/Templates/Template de Daily Note.md",enContent:Ln,ptBrContent:Rn},{id:"project-template",path:"Vault/Templates/Project Template.md",legacyPtBrPath:"Vault/Templates/Template de Projeto.md",enContent:Nn,ptBrContent:$n},{id:"task-dashboard",path:"Vault/MT Task Dashboard.md",legacyPtBrPath:"Vault/Dashboard de Tasks MT.md",enContent:Bn,ptBrContent:jn},{id:"kanban-view",path:"Vault/MT Kanban View.md",legacyPtBrPath:"Vault/Kanban MT.md",enContent:On,ptBrContent:_n},{id:"gantt-view",path:"Vault/MT Gantt View.md",legacyPtBrPath:"Vault/Gantt MT.md",enContent:zn,ptBrContent:Vn}];function te(e){return e.path}function X(e){return ye()==="pt-BR"?e.ptBrContent:e.enContent}function Ke(e){return e.legacyPtBrPath?[e.legacyPtBrPath]:[]}function Ue(e,n){let t=n.trim();return t===e.enContent.trim()||t===e.ptBrContent.trim()}function me(e){return ee.find(n=>n.id===e)}var jt=require("obsidian");async function Ot(e,n,t){try{let o=e.vault.getAbstractFileByPath(n);if(!(o instanceof jt.TFile))return console.warn(`[MeetingTools] Template not found: ${n}. Using built-in default.`),t;let i=await e.vault.read(o);return i.trim()?i:(console.warn(`[MeetingTools] Template is empty: ${n}. Using built-in default.`),t)}catch(o){return console.error(`[MeetingTools] Failed to read template ${n}:`,o),t}}function _t(e,n){return e.replace(/\{\{(\w+)\}\}/g,(t,o)=>Object.prototype.hasOwnProperty.call(n,o)?n[o]:t)}function zt(e,n){return n.filter(t=>!e.includes(`{{${t}}}`))}var ne=require("obsidian"),Gn="Vault/Projects",Kn=/### \d{2}:\d{2}/;function We(e){return e.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()}function Un(e){return We(e).replace(/\s+/g,"-")}function Wn(e){let n=e.app.workspace.getActiveViewOfType(ne.MarkdownView);if(!(n!=null&&n.editor))return"";let t=n.editor,o=t.getCursor(),i=t.getValue().split(`
`);for(let s=o.line;s>=0;s--)if(Kn.test(i[s]))return i[s];return""}function Se(e){let{app:n,settings:t}=e,o=Wn(e),i=[];if(o){let r=/\[\[([^\]]+)\]\]/g,a;for(;(a=r.exec(o))!==null;)i.push(a[1])}let s=null;if(i.length>0){let r=n.vault.getAbstractFileByPath(Gn);if(r instanceof ne.TFolder){let a=We(i[0]),c=r.children.find(d=>d instanceof ne.TFile&&d.extension==="md"&&We(d.basename)===a);c&&(s=Un(c.basename))}}return{userName:t.userName,wikilinks:i,projectSlug:s}}function Ee(e){let n=e.wikilinks.length>0?e.wikilinks.map(o=>`[[${o}]]`).join(" "):"[[No project]]",t=["Context:",`- User name: ${e.userName}`,`- Meeting wikilinks (apply to EVERY task, exactly as written): ${n}`];return e.projectSlug&&t.push(`- Project tag (apply to EVERY task): #projects/${e.projectSlug}`),t.join(`
`)}async function Yn(e,n,t,o){var s,r,a,c,d,p,m,l;let i;try{i=await(0,R.requestUrl)({url:"https://api.openai.com/v1/chat/completions",method:"POST",headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"},body:JSON.stringify({model:n,temperature:0,top_p:1,messages:[{role:"system",content:t},{role:"user",content:o}]}),throw:!1})}catch(u){let f=E(null,u);throw console.error("[MeetingTools] OpenAI network error:",f),new R.Notice(f.friendly,1e4),new Error((s=f.code)!=null?s:"network_error")}if(i.status>=400||(r=i.json)!=null&&r.error){let u=E({status:i.status,json:i.json,text:i.text});throw console.error("[MeetingTools] OpenAI error:",u),new R.Notice(u.friendly,1e4),new Error((a=u.code)!=null?a:"openai_error")}return(l=(m=(p=(d=(c=i.json)==null?void 0:c.choices)==null?void 0:d[0])==null?void 0:p.message)==null?void 0:m.content)!=null?l:""}async function Ae(e,n,t){let{app:o,settings:i}=e,s=e.getApiKey();if(!s){$(e);return}let r;if(t)r=t.text;else if(n){let m=o.vault.getAbstractFileByPath(n);if(!m||!(m instanceof R.TFile)){new R.Notice(g().noticeFileNotFound(n));return}let l=await o.vault.read(m);r=(m.extension||"").toLowerCase()==="srt"?U(l):l}else{let m=await new Promise(h=>{new H(o,i.transcriptsDir,T=>h(T)).open()});if(!m)return;let l=o.vault.getAbstractFileByPath(m);if(!l||!(l instanceof R.TFile)){new R.Notice(g().noticeFileNotFound(m));return}let u=await o.vault.read(l);r=(l.extension||"").toLowerCase()==="srt"?U(u):u}let a=r.trim().split(/\s+/).filter(Boolean).length,c;if(a<i.minWordsForSummary)c=g().summaryShortFallback(i.userName);else{new R.Notice(g().noticeGeneratingSummary);let m=me("summary-template"),l=m?X(m):"",u=await Ot(o,i.summaryTemplatePath,l),f=Se(e),h=_t(u,{language_instruction:Y(i.outputLanguage),user_name:i.userName,task_context:Ee(f),task_format_spec:Me,transcript:r.slice(-12e4)});c=await Yn(s,i.summaryModel,h,"")}if(!c){new R.Notice(g().noticeSummaryEmpty);return}let d=c;if(i.showPreview){let m=new z(o,g().modalPreview,d);m.open();let l=await m.waitForResult();if(l===null)return;d=l}(t?Q(o,d,t):J(o,d))&&new R.Notice(g().noticeSummaryInserted)}var B=require("obsidian");function qn(e){if(!e)return"";let n=e.replace(/\r/g,"").replace(/\u00A0/g," ").replace(/[–—]/g,"-");return n=n.replace(/[:]/g," - ").replace(/[\[\]\(\)]/g,""),n=n.split(`
`).map(t=>{let o=t.match(/^(\s*)(.*)$/);if(!o)return t;let i=o[1]||"",s=(o[2]||"").replace(/[ \t]{2,}/g," ").replace(/[ \t]+$/,"");return i+s}).join(`
`),n.trim()}function Hn(e){if(!e)return Vt();let n=e,t=e.match(/^```mermaid[^\n]*\n([\s\S]*?)\n```$/i),o=e.match(/^```mindmap[^\n]*\n([\s\S]*?)\n```$/i);t?n=t[1]:o&&(n=o[1]),n=qn(n);let i=n.split(`
`).filter(r=>r.trim().length>0);return(i.length===0||!/^mindmap\s*$/i.test(i[0]))&&i.unshift("mindmap"),"```mermaid\n"+i.join(`
`)+"\n```"}function Vt(){return"```mermaid\nmindmap\n  Meeting\n    Not enough data\n```"}async function Xn(e,n,t,o){var s,r,a,c,d,p,m,l;let i;try{i=await(0,B.requestUrl)({url:"https://api.openai.com/v1/chat/completions",method:"POST",headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"},body:JSON.stringify({model:n,temperature:0,top_p:1,messages:[{role:"system",content:t},{role:"user",content:o}]}),throw:!1})}catch(u){let f=E(null,u);throw console.error("[MeetingTools] OpenAI network error:",f),new B.Notice(f.friendly,1e4),new Error((s=f.code)!=null?s:"network_error")}if(i.status>=400||(r=i.json)!=null&&r.error){let u=E({status:i.status,json:i.json,text:i.text});throw console.error("[MeetingTools] OpenAI error:",u),new B.Notice(u.friendly,1e4),new Error((a=u.code)!=null?a:"openai_error")}return(l=(m=(p=(d=(c=i.json)==null?void 0:c.choices)==null?void 0:d[0])==null?void 0:p.message)==null?void 0:m.content)!=null?l:""}async function Ce(e,n,t){let{app:o,settings:i}=e,s=e.getApiKey();if(!s){$(e);return}let r;if(t)r=t.text;else if(n){let m=o.vault.getAbstractFileByPath(n);if(!m||!(m instanceof B.TFile)){new B.Notice(g().noticeFileNotFound(n));return}let l=await o.vault.read(m);r=(m.extension||"").toLowerCase()==="srt"?U(l):l}else{let m=await new Promise(h=>{new H(o,i.transcriptsDir,T=>h(T)).open()});if(!m)return;let l=o.vault.getAbstractFileByPath(m);if(!l||!(l instanceof B.TFile)){new B.Notice(g().noticeFileNotFound(m));return}let u=await o.vault.read(l);r=(l.extension||"").toLowerCase()==="srt"?U(u):u}new B.Notice(g().noticeGeneratingMindmap);let a=Y(i.outputLanguage)+`

`+Nt,c=await Xn(s,i.mindmapModel,a,`Transcript:
"""${r.slice(-12e4)}"""`);c=Hn(c),(!c||c.trim().length<16)&&(c=Vt());let d=c;if(i.showPreview){let m=new z(o,g().modalPreview,d);m.open();let l=await m.waitForResult();if(l===null)return;d=l}(t?Q(o,d,t):J(o,d))&&new B.Notice(g().noticeMindmapInserted)}var C=require("obsidian");var Zn=25*1024*1024;function Jn(e){var n;try{let t=(n=e.vault)==null?void 0:n.adapter;return(t==null?void 0:t.basePath)||(typeof(t==null?void 0:t.getBasePath)=="function"?t.getBasePath():"")}catch(t){return""}}var Qn=["/opt/homebrew/bin/ffmpeg","/usr/local/bin/ffmpeg","/usr/bin/ffmpeg","ffmpeg"],Ye=null;async function ei(){if(Ye)return Ye;let{execFile:e}=require("child_process");for(let n of Qn)if(await new Promise(o=>{e(n,["-version"],{timeout:5e3},i=>o(!i))}))return Ye=n,n;return null}function ti(e,n){return new Promise(t=>{let{execFile:o}=require("child_process");o(e,n,{timeout:3e5},(i,s,r)=>{var a;t({code:i?(a=i.code)!=null?a:1:0,stderr:r||""})})})}async function qe(e){let{app:n,settings:t}=e,o=await new Promise(T=>{let y=document.createElement("input");y.type="file",y.accept="audio/*,.m4a,.mp3,.wav,.ogg,.webm,.mp4",y.style.display="none",document.body.appendChild(y);let w=!1,b=()=>{if(!w){w=!0;try{document.body.removeChild(y)}catch(N){}T(null)}};y.onchange=N=>{var W,G;w=!0;try{document.body.removeChild(y)}catch(re){}let Z=N.target;T((G=(W=Z.files)==null?void 0:W[0])!=null?G:null)},y.addEventListener("cancel",b),window.addEventListener("focus",()=>setTimeout(b,300),{once:!0}),y.click()});if(!o)return new C.Notice(g().noticeImportCancelled),null;await F(n,t.audioDir);let i=await o.arrayBuffer();if(i.byteLength<=Zn){let T=await le(n,t.audioDir,o.name,i),y=Math.round(i.byteLength/1024);return new C.Notice(g().noticeAudioImported(T,y)),T}let s=(i.byteLength/(1024*1024)).toFixed(1);if(C.Platform.isMobile)return new C.Notice(g().noticeAudioTooLargeMobile(s)),null;let r=await ei();if(!r)return new C.Notice(g().noticeFfmpegMissing),null;new C.Notice(g().noticeLargeAudioCompressing(s));let a=await le(n,t.audioDir,o.name,i),c=Jn(n);if(!c)return new C.Notice(g().noticeVaultPathMissing),a;let d=`${c}/${a}`,p=ce(o.name)+".webm",m=`${t.audioDir}/${p}`,l=`${c}/${m}`,u=await ti(r,["-hide_banner","-loglevel","error","-y","-i",d,"-vn","-ac","1","-ar","16000","-c:a","libopus","-b:a","12k","-vbr","on","-application","voip","-frame_duration","60",l]);if(u.code!==0)return console.error("[MeetingTools] ffmpeg error:",u.stderr),new C.Notice(g().noticeFfmpegFailed),a;await new Promise(T=>setTimeout(T,500));let f=n.vault.getAbstractFileByPath(m),h=n.vault.getAbstractFileByPath(a);if(f instanceof C.TFile){let T=(f.stat.size/1048576).toFixed(1);return new C.Notice(g().noticeCompressed(s,T)),h instanceof C.TFile&&a!==m&&await n.vault.trash(h,!0),m}return new C.Notice(g().noticeCompressedFileMissing),a}var D=require("obsidian");function ni(e,n){let o=e.app.vault.getAbstractFileByPath("Vault/Projects");if(!o||!(o instanceof D.TFolder))return n;let i=o.children.filter(s=>s instanceof D.TFile&&s.extension==="md").map(s=>s.basename);return n.replace(/\[\[([^\]]+)\]\]/g,(s,r)=>{if(i.includes(r))return s;let a=r.toLowerCase(),c=i.find(p=>p.toLowerCase()===a);if(c)return`[[${c}]]`;let d=i.find(p=>p.toLowerCase().includes(a)||a.includes(p.toLowerCase()));return d?`[[${d}]]`:s})}async function He(e,n,t){var l,u,f,h,T,y;let o=e.getApiKey();if(!o){$(e);return}if(!n){new D.Notice(g().noticeNoInputForTasks);return}let i=n;if(i.trim().split(/\s+/).length<10){new D.Notice(g().noticeContentTooShortForTasks);return}new D.Notice(g().noticeExtractingTasks);let s=Se(e),r=Ee(s),a=Y(e.settings.outputLanguage)+`

`+$t.replace("{{task_context}}",r),c;try{c=await(0,D.requestUrl)({url:"https://api.openai.com/v1/chat/completions",method:"POST",headers:{Authorization:"Bearer "+o,"Content-Type":"application/json"},body:JSON.stringify({model:e.settings.tasksModel,temperature:0,top_p:1,messages:[{role:"system",content:a},{role:"user",content:i}]}),throw:!1})}catch(w){let b=E(null,w);console.error("[MeetingTools] OpenAI network error:",b),new D.Notice(b.friendly,1e4);return}if(c.status>=400||(l=c.json)!=null&&l.error){let w=E({status:c.status,json:c.json,text:c.text});console.error("[MeetingTools] Extract tasks error:",w),new D.Notice(w.friendly,1e4);return}let d=(y=(T=(h=(f=(u=c.json)==null?void 0:u.choices)==null?void 0:f[0])==null?void 0:h.message)==null?void 0:T.content)!=null?y:"";if(!d||/no action items identified/i.test(d)||d.includes("Nenhum item de a\xE7\xE3o identificado")){new D.Notice(g().noticeNoTasksFound);return}d=ni(e,d);let p=d;if(e.settings.showPreview){let w=new z(e.app,g().modalPreview,d);w.open();let b=await w.waitForResult();if(b===null)return;p=b}(t?Q(e.app,p,t):J(e.app,p))&&new D.Notice(g().noticeTasksInserted)}var P=require("obsidian");async function ii(e,n){let t=e.name.toLowerCase();if(t.endsWith(".txt")||t.endsWith(".md"))return await e.text();if(t.endsWith(".pdf")){let o=await e.arrayBuffer();return await oi(o,n,e.name)}if(t.endsWith(".pptx")){let o=await e.arrayBuffer();return ri(o)}if(t.endsWith(".ppt"))throw new Error("Formato .ppt (legacy) n\xE3o \xE9 suportado. Salve como .pptx no PowerPoint e tente novamente.");return await e.text()}async function oi(e,n,t){let o=require("fs"),i=require("path"),{execFile:s}=require("child_process"),a=require("os").tmpdir(),c=i.join(a,`meeting-tools-${Date.now()}.pdf`),d=c.replace(".pdf",".txt");try{return o.writeFileSync(c,Buffer.from(e)),(await new Promise((m,l)=>{s("pdftotext",["-layout",c,d],{timeout:3e4},u=>{if(u){l(u);return}try{let f=o.readFileSync(d,"utf-8");m(f)}catch(f){l(f)}})})).trim()}catch(p){return console.warn("[MeetingTools] pdftotext failed, using fallback:",p.message),si(e)}finally{try{o.unlinkSync(c)}catch(p){}try{o.unlinkSync(d)}catch(p){}}}function si(e){let n=new Uint8Array(e),t="";for(let r=0;r<n.length;r++)t+=String.fromCharCode(n[r]);let o=[],i=/BT\s([\s\S]*?)ET/g,s;for(;(s=i.exec(t))!==null;){let r=s[1],a=/\(([^)]*)\)\s*Tj/g,c;for(;(c=a.exec(r))!==null;)o.push(c[1]);let d=/\[([^\]]*)\]\s*TJ/gi,p;for(;(p=d.exec(r))!==null;){let m=p[1],l=/\(([^)]*)\)/g,u;for(;(u=l.exec(m))!==null;)o.push(u[1])}}return o.join(" ").replace(/\s{2,}/g," ").trim()}function ri(e){let n=require("zlib"),t=Buffer.from(e),i=ai(t).filter(r=>/^ppt\/slides\/slide\d+\.xml$/i.test(r.name)).sort((r,a)=>r.name.localeCompare(a.name,void 0,{numeric:!0}));if(i.length===0)throw new Error(g().errorNoPptxSlides);let s=[];for(let r of i){let a;r.compressionMethod===0?a=r.data.toString("utf-8"):a=n.inflateRawSync(r.data).toString("utf-8");let c=/<a:t>([^<]*)<\/a:t>/g,d;for(;(d=c.exec(a))!==null;){let p=d[1].trim();p&&s.push(p)}}if(s.length===0)throw new Error(g().errorNoPptxText);return s.join(" ")}function ai(e){let n=[],t=0;for(;t<e.length-4&&e.readUInt32LE(t)===67324752;){let i=e.readUInt16LE(t+8),s=e.readUInt32LE(t+18),r=e.readUInt16LE(t+26),a=e.readUInt16LE(t+28),c=e.toString("utf-8",t+30,t+30+r),d=t+30+r+a,p=e.subarray(d,d+s);n.push({name:c,compressionMethod:i,data:p}),t=d+s}return n}function Gt(e){return e.replace(/[\\/:*?"<>|]/g,"-").replace(/\s+/g," ").trim()}async function Kt(e){var Z,W,G,re,ae,he,Te;let{app:n,settings:t}=e,o=e.getApiKey();if(!o){$(e);return}let i=await new Promise(I=>{let A=document.createElement("input");A.type="file",A.accept=".pdf,.pptx,.ppt,.txt,.md",A.style.display="none",document.body.appendChild(A);let je=!1,ct=()=>{if(!je){je=!0;try{document.body.removeChild(A)}catch(lt){}I(null)}};A.onchange=lt=>{var dt,ut;je=!0;try{document.body.removeChild(A)}catch(vi){}let gn=lt.target;I((ut=(dt=gn.files)==null?void 0:dt[0])!=null?ut:null)},A.addEventListener("cancel",ct),window.addEventListener("focus",()=>setTimeout(ct,300),{once:!0}),A.click()});if(!i){new P.Notice(g().noticeOperationCancelled);return}let s=((Z=i.name.split(".").pop())==null?void 0:Z.toLowerCase())||"";if(P.Platform.isMobile&&["pdf","pptx","ppt"].includes(s)){new P.Notice(g().noticeDesktopOnlyExtract);return}new P.Notice(g().noticeReadingDocument(i.name));let r=n.vault.adapter,a=(r==null?void 0:r.basePath)||(typeof(r==null?void 0:r.getBasePath)=="function"?r.getBasePath():""),c;try{c=await ii(i,a)}catch(I){new P.Notice(g().noticeDocumentReadError(I.message)),console.error("[MeetingTools]",I);return}if(!c||c.trim().length<20){new P.Notice(g().noticeDocumentTextTooShort);return}let d="Vault/Projects",p="Vault/Projects/Documents";await F(n,d),await F(n,p);let m=await i.arrayBuffer(),l=await le(n,p,i.name,m);console.log("[MeetingTools] Documento salvo em:",l),new P.Notice(g().noticeDocumentSaved(l)),new P.Notice(g().noticeGeneratingProjectNote);let u=Y(t.outputLanguage)+`

`+Bt,f;try{f=await(0,P.requestUrl)({url:"https://api.openai.com/v1/chat/completions",method:"POST",headers:{Authorization:"Bearer "+o,"Content-Type":"application/json"},body:JSON.stringify({model:t.summaryModel,temperature:0,top_p:1,messages:[{role:"system",content:u},{role:"user",content:c.slice(0,12e4)}]}),throw:!1})}catch(I){let A=E(null,I);console.error("[MeetingTools] OpenAI network error:",A),new P.Notice(A.friendly,1e4);return}if(f.status>=400||(W=f.json)!=null&&W.error){let I=E({status:f.status,json:f.json,text:f.text});console.error("[MeetingTools] New project error:",I),new P.Notice(I.friendly,1e4);return}let h=(Te=(he=(ae=(re=(G=f.json)==null?void 0:G.choices)==null?void 0:re[0])==null?void 0:ae.message)==null?void 0:he.content)!=null?Te:"";if(!h){new P.Notice(g().noticeLlmEmpty);return}if(h+=`

## Documentos Base
- ![[${l.split("/").pop()}]]

## Task List


## Hist\xF3rico de Reuni\xF5es
\`\`\`meeting-history
\`\`\`
`,t.showPreview){let I=new z(n,g().modalPreview,h);I.open();let A=await I.waitForResult();if(A===null)return;h=A}let T=h.match(/^#\s+(.+)$/m),y=Gt(T?T[1]:i.name.replace(/\.[^.]+$/,"")),w=`${d}/${y}.md`,b=n.vault.getAbstractFileByPath(w);b instanceof P.TFile?await n.vault.modify(b,h):await n.vault.create(w,h),new P.Notice(g().noticeProjectCreated(w));let N=n.vault.getAbstractFileByPath(w);N instanceof P.TFile&&await n.workspace.getLeaf(!1).openFile(N)}var Ie=require("obsidian");var pe=require("obsidian");async function ie(e){let n=[],t=e.vault.getMarkdownFiles();for(let o of t){if(o.basename==="CLAUDE"||o.path.includes("Templates/"))continue;let s=(await e.vault.cachedRead(o)).split(`
`);for(let r=0;r<s.length;r++){let a=s[r],c=a.match(/^([\s]*- \[)(.)\](\s+.+)$/);if(!c)continue;let d=c[2],p=c[3].trim();if(!p.includes("#task"))continue;let m=Ut(p,"resource"),l=Ut(p,"priority"),u=p.match(/#projects\/([^\s]+)/),f=u?u[1]:null,h=p.match(/\[\[([^\]]+)\]\]/),T=h?h[1]:null,y=p.match(/#workstream\/([^\s]+)/),w=y?y[1]:null,b=p.match(/⏳\s*(\d{4}-\d{2}-\d{2})/),N=b?b[1]:null,Z=N?new Date(N+"T00:00:00"):null,W=p.match(/📅\s*(\d{4}-\d{2}-\d{2})/),G=W?W[1]:null,re=G?new Date(G+"T00:00:00"):null,ae=a.match(/\^([a-zA-Z0-9-]+)\s*$/),he=ae?ae[1]:null,Te=p.replace(/\[resource::\s*[^\]]*\]/g,"").replace(/\[priority::\s*[^\]]*\]/g,"").replace(/\[milestone::\s*[^\]]*\]/g,"").replace(/\[scheduled::\s*[^\]]*\]/g,"").replace(/\[due\s*::\s*[^\]]*\]/g,"").replace(/\[depends::\s*[^\]]*\]/g,"").replace(/#task-?\s*/g,"").replace(/#projects\/[^\s]+/g,"").replace(/#workstream\/[^\s]+/g,"").replace(/\[\[[^\]]+\]\]/g,"").replace(/📅\s*\d{4}-\d{2}-\d{2}/g,"").replace(/⏳\s*\d{4}-\d{2}-\d{2}/g,"").replace(/✅\s*\d{4}-\d{2}-\d{2}/g,"").replace(/[⏫🔺🔼🔽]/g,"").replace(/\^[a-zA-Z0-9-]+\s*$/g,"").replace(/\s{2,}/g," ").trim();n.push({text:Te,raw:p,rawLine:a,status:d,resource:m,priority:l,project:f,projectLink:T,workstream:w,scheduled:N,scheduledDateObj:Z,due:G,dueDateObj:re,blockId:he,filePath:o.path,fileName:o.basename,lineNumber:r})}}return n}function Ut(e,n){let t=new RegExp(`\\[${n}::\\s*([^\\]]+)\\]`),o=e.match(t);return o?o[1].trim():null}function Wt(e,n){if(e==="x")return"\u{1F7E2}";if(e==="-")return"\u26AB";if(e==="/")return"\u{1F7E1}";if(!n)return"\u26AA";let t=new Date;t.setHours(0,0,0,0);let o=Math.ceil((n.getTime()-t.getTime())/(1e3*60*60*24));return o<0?"\u{1F534}":o===0?"\u{1F7E0}":o<=7?"\u{1F535}":"\u26AA"}function De(e){return e==="high"?"\u23EB":e==="medium"?"\u{1F53C}":e==="low"?"\u{1F53D}":"\u2796"}function Yt(e){if(!e.dueDateObj)return"\u26AA Sem prazo";let n=new Date;n.setHours(0,0,0,0);let t=Math.ceil((e.dueDateObj.getTime()-n.getTime())/(1e3*60*60*24));return t<0?"\u{1F534} Atrasado":t===0?"\u{1F7E0} Hoje":t<=7?"\u{1F535} Esta semana":"\u26AA Futuro"}function qt(e){return e.priority==="high"?"\u23EB Alta":e.priority==="medium"?"\u{1F53C} M\xE9dia":e.priority==="low"?"\u{1F53D} Baixa":"\u2796 Sem prioridade"}async function Ht(e,n,t){let o=e.vault.getAbstractFileByPath(n);if(!o||!(o instanceof pe.TFile))return" ";let s=(await e.vault.read(o)).split(`
`);if(t>=s.length)return" ";let a=s[t].match(/^([\s]*- \[)(.)(\].*)$/);if(!a)return" ";let d={" ":"/","/":"x",x:"-","-":" "}[a[2]]||" ";return s[t]=a[1]+d+a[3],await e.vault.modify(o,s.join(`
`)),d}async function Xt(e,n,t,o){let i=e.vault.getAbstractFileByPath(n);if(!i||!(i instanceof pe.TFile))return;let r=(await e.vault.read(i)).split(`
`);if(t>=r.length)return;let c=r[t].match(/^([\s]*- \[)(.)(\].*)$/);c&&(r[t]=c[1]+o+c[3],await e.vault.modify(i,r.join(`
`)))}async function Zt(e,n,t){let o=e.vault.getAbstractFileByPath(n);if(!o||!(o instanceof pe.TFile))return null;let s=(await e.vault.read(o)).split(`
`);if(t>=s.length)return null;let r=s[t],a=r.match(/\[priority::\s*([^\]]+)\]/),c=a?a[1].trim():null,d={high:"medium",medium:"low",low:"high"},p;return c?(p=d[c]||"high",r=r.replace(/\[priority::\s*[^\]]+\]/,`[priority:: ${p}]`)):(p="high",r=r.replace(/(#task\S*)/,`$1 [priority:: ${p}]`)),s[t]=r,await e.vault.modify(o,s.join(`
`)),p}async function Xe(e,n,t,o,i){let s=e.vault.getAbstractFileByPath(n);if(!s||!(s instanceof pe.TFile))return;let a=(await e.vault.read(s)).split(`
`);if(t>=a.length)return;let c=a[t],d=o==="scheduled"?"\u23F3":"\u{1F4C5}",p=new RegExp(`${d}\\s*\\d{4}-\\d{2}-\\d{2}`);p.test(c)?c=c.replace(p,`${d} ${i}`):c=c.replace(/(\s*\^[a-zA-Z0-9-]+)?$/,` ${d} ${i}$1`),a[t]=c,await e.vault.modify(s,a.join(`
`))}function oe(e,n,t,o,i){if(t.length===0){e.createEl("p",{text:g().emptyTasks,cls:"mt-dash-empty"});return}let s=new Map;for(let r of t){let a=o(r)||"(sem grupo)";s.has(a)||s.set(a,[]),s.get(a).push(r)}for(let r of[...s.keys()].sort()){let a=s.get(r);a.sort((m,l)=>!m.dueDateObj&&!l.dueDateObj?0:m.dueDateObj?l.dueDateObj?m.dueDateObj.getTime()-l.dueDateObj.getTime():-1:1),e.createEl("h4",{text:`${r} (${a.length})`,cls:"mt-dash-group"});let c=e.createEl("table",{cls:"mt-dash-table"}),d=c.createEl("thead").createEl("tr");d.createEl("th",{text:""}),d.createEl("th",{text:"Task"}),i.includes("priority")&&d.createEl("th",{text:"Pri"}),i.includes("resource")&&d.createEl("th",{text:"Respons\xE1vel"}),i.includes("project")&&d.createEl("th",{text:"Projeto"}),i.includes("due")&&d.createEl("th",{text:"Prazo"}),i.includes("aging")&&d.createEl("th",{text:"Dias"}),d.createEl("th",{text:"Nota"});let p=c.createEl("tbody");for(let m of a){let l=p.createEl("tr");if(l.createEl("td",{cls:"mt-dash-status"}).createEl("span",{text:Wt(m.status,m.dueDateObj),cls:"mt-dash-checkbox"}).addEventListener("click",async()=>{await Ht(n,m.filePath,m.lineNumber)}),l.createEl("td",{text:m.text,cls:"mt-dash-text"}),i.includes("priority")&&l.createEl("td",{cls:"mt-dash-priority"}).createEl("span",{text:De(m.priority),cls:"mt-dash-checkbox"}).addEventListener("click",async()=>{await Zt(n,m.filePath,m.lineNumber)}),i.includes("resource")&&l.createEl("td",{text:m.resource||"-",cls:"mt-dash-resource"}),i.includes("project")&&l.createEl("td",{text:m.project||"-",cls:"mt-dash-project"}),i.includes("due")&&l.createEl("td",{text:m.due||"-",cls:"mt-dash-due"}),i.includes("aging")){let T=l.createEl("td",{cls:"mt-dash-aging"});if(m.dueDateObj){let y=new Date;y.setHours(0,0,0,0);let w=Math.ceil((m.dueDateObj.getTime()-y.getTime())/864e5);w<0?(T.setText(`${Math.abs(w)}d atr\xE1s`),T.addClass("mt-dash-overdue")):w===0?(T.setText("hoje"),T.addClass("mt-dash-today")):T.setText(`em ${w}d`)}else T.setText("-")}l.createEl("td",{cls:"mt-dash-note"}).createEl("a",{text:m.fileName,cls:"internal-link"}).addEventListener("click",T=>{T.preventDefault();let y=n.vault.getAbstractFileByPath(m.filePath);y instanceof Ie.TFile&&n.workspace.getLeaf(!1).openFile(y)})}}}function ge(e,n,t,o,i,s,r){let a=e.createEl("details",{cls:"mt-dash-done-section"});s&&a.setAttribute("open",""),a.addEventListener("toggle",()=>r(a.open)),a.createEl("summary").setText(`Conclu\xEDdas / Canceladas (${t.length})`),oe(a,n,t,o,i)}function ci(e){let n={" ":"Pendente","/":"Em progresso",x:"Conclu\xEDdo","-":"Cancelado"},t="Status,Task,Respons\xE1vel,Projeto,Prioridade,Prazo,Aging,Nota",o=e.map(i=>{let s=new Date;s.setHours(0,0,0,0);let r="";if(i.dueDateObj){let c=Math.ceil((i.dueDateObj.getTime()-s.getTime())/864e5);r=c<0?`${Math.abs(c)}d atr\xE1s`:c===0?"hoje":`em ${c}d`}let a=c=>`"${(c||"").replace(/"/g,'""')}"`;return[a(n[i.status]||i.status),a(i.text),a(i.resource||""),a(i.project||""),a(i.priority||""),a(i.due||""),a(r),a(i.fileName)].join(",")});return t+`
`+o.join(`
`)}function li(e,n){let t=new Blob(["\uFEFF"+e],{type:"text/csv;charset=utf-8;"}),o=URL.createObjectURL(t),i=document.createElement("a");i.href=o,i.download=n,i.click(),URL.revokeObjectURL(o)}var Ze=class extends Ie.MarkdownRenderChild{constructor(t,o,i){super(t);this.plugin=o;this.view=i;this.doneSectionOpen=!1}onload(){this.render(),this.registerEvent(this.plugin.app.workspace.on("meeting-tools:tasks-changed",()=>void this.render()))}async render(){let t=this.containerEl,o=t.querySelector("details.mt-dash-done-section");o&&(this.doneSectionOpen=o.open),t.empty();let i=g(),s=t.createDiv({cls:"mt-dash-legend"}),r=(u,f)=>{let h=s.createDiv({cls:"mt-dash-legend-row"});h.createEl("span",{text:u+":",cls:"mt-dash-legend-label"});for(let T of f)h.createEl("span",{text:T})};r(i.legendLabelDue,[`\u{1F534} ${i.legendItemOverdue}`,`\u{1F7E0} ${i.legendItemToday}`,`\u{1F535} ${i.legendItemThisWeek}`,`\u26AA ${i.legendItemFuture}`]),r(i.legendLabelStatus,[`\u{1F7E1} ${i.legendItemInProgress}`,`\u{1F7E2} ${i.legendItemDone}`,`\u26AB ${i.legendItemCancelled}`]),r(i.legendLabelPriority,[`\u23EB ${i.legendItemHigh}`,`\u{1F53C} ${i.legendItemMedium}`,`\u{1F53D} ${i.legendItemLow}`,`\u2796 ${i.legendItemNoPriority}`]),s.createEl("span",{text:i.legendHint,cls:"mt-dash-legend-hint"});let a=await ie(this.plugin.app);if(a.length>0&&t.createEl("button",{text:"\u{1F4E5} Exportar CSV",cls:"mt-dash-export-btn"}).addEventListener("click",()=>{li(ci(a),`tasks-${new Date().toISOString().slice(0,10)}.csv`)}),a.length===0){t.createEl("p",{text:g().emptyTasks});return}let c=a.filter(u=>u.status!=="x"&&u.status!=="-"),d=a.filter(u=>u.status==="x"||u.status==="-"),p=u=>["priority",...u],m=u=>{this.doneSectionOpen=u},l=this.plugin.app;switch(this.view){case"project":oe(t,l,c,u=>u.project||"(sem projeto)",p(["resource","due","aging"])),d.length&&ge(t,l,d,u=>u.project||"(sem projeto)",p(["resource","due"]),this.doneSectionOpen,m);break;case"resource":oe(t,l,c,u=>u.resource||"(sem respons\xE1vel)",p(["project","due","aging"])),d.length&&ge(t,l,d,u=>u.resource||"(sem respons\xE1vel)",p(["project","due"]),this.doneSectionOpen,m);break;case"aging":oe(t,l,c,u=>Yt(u),p(["resource","project","due"])),d.length&&ge(t,l,d,()=>"Conclu\xEDdas/Canceladas",p(["resource","project","due"]),this.doneSectionOpen,m);break;case"priority":oe(t,l,c,u=>qt(u),["resource","project","due","aging"]),d.length&&ge(t,l,d,()=>"Conclu\xEDdas/Canceladas",["resource","project","due"],this.doneSectionOpen,m);break;case"all":default:oe(t,l,c,()=>"Pendentes",p(["resource","project","due","aging"])),d.length&&ge(t,l,d,()=>"Conclu\xEDdas/Canceladas",p(["resource","project","due"]),this.doneSectionOpen,m);break}}};function Jt(e){e.registerMarkdownCodeBlockProcessor("meeting-tasks",(n,t,o)=>{let i={};for(let s of n.trim().split(`
`)){let r=s.match(/^(\w+):\s*(.+)$/);r&&(i[r[1]]=r[2].trim())}t.addClass("mt-dashboard"),o.addChild(new Ze(t,e,i.view||"all"))})}var Fe=require("obsidian");var di=[{status:" ",label:"Pendente"},{status:"/",label:"Em Progresso"},{status:"x",label:"Conclu\xEDdo"},{status:"-",label:"Cancelado"}];function ui(e,n,t,o,i){let s=t;i&&i!=="__all__"&&(o==="project"?s=t.filter(a=>a.project===i):o==="resource"&&(s=t.filter(a=>a.resource===i)));let r=e.createDiv({cls:"mt-kanban-board"});for(let a of di){let c=s.filter(l=>l.status===a.status),d=r.createDiv({cls:"mt-kanban-column"});d.createDiv({cls:"mt-kanban-header"}).setText(`${a.label} (${c.length})`);let m=d.createDiv({cls:"mt-kanban-dropzone"});m.setAttribute("data-status",a.status),m.addEventListener("dragover",l=>{l.preventDefault(),m.addClass("mt-kanban-drag-over")}),m.addEventListener("dragleave",()=>{m.removeClass("mt-kanban-drag-over")}),m.addEventListener("drop",async l=>{var T;l.preventDefault(),m.removeClass("mt-kanban-drag-over");let u=(T=l.dataTransfer)==null?void 0:T.getData("text/plain");if(!u)return;let{filePath:f,lineNumber:h}=JSON.parse(u);await Xt(n,f,h,a.status)});for(let l of c){let u=m.createDiv({cls:"mt-kanban-card"});u.setAttribute("draggable","true"),u.addEventListener("dragstart",T=>{var y;(y=T.dataTransfer)==null||y.setData("text/plain",JSON.stringify({filePath:l.filePath,lineNumber:l.lineNumber})),u.addClass("mt-kanban-dragging")}),u.addEventListener("dragend",()=>{u.removeClass("mt-kanban-dragging")}),u.createDiv({cls:"mt-kanban-card-title"}).setText(l.text);let h=u.createDiv({cls:"mt-kanban-card-meta"});if(l.resource&&h.createSpan({text:l.resource,cls:"mt-kanban-badge mt-kanban-badge-resource"}),l.project&&h.createSpan({text:l.project,cls:"mt-kanban-badge mt-kanban-badge-project"}),h.createSpan({text:De(l.priority),cls:"mt-kanban-card-priority"}),l.due){let T=new Date;T.setHours(0,0,0,0);let y=l.dueDateObj?Math.ceil((l.dueDateObj.getTime()-T.getTime())/864e5):null,w=y!==null&&y<0?"mt-dash-overdue":y===0?"mt-dash-today":"",b=y!==null?y<0?`${l.due} (${Math.abs(y)}d atr\xE1s)`:y===0?`${l.due} (hoje)`:`${l.due} (em ${y}d)`:l.due;h.createSpan({text:b,cls:`mt-kanban-card-due ${w}`})}u.addEventListener("dblclick",()=>{let T=n.vault.getAbstractFileByPath(l.filePath);T instanceof Fe.TFile&&n.workspace.getLeaf(!1).openFile(T)})}}}var Je=class extends Fe.MarkdownRenderChild{constructor(t,o,i){super(t);this.plugin=o;this.filterType=i;this.currentFilter="__all__"}onload(){this.render(),this.registerEvent(this.plugin.app.workspace.on("meeting-tools:tasks-changed",()=>void this.render()))}async render(){let t=this.containerEl;t.empty();let o=await ie(this.plugin.app);if(o.length===0){t.createEl("p",{text:g().emptyTasks});return}if(this.filterType!=="all"){let i=t.createDiv({cls:"mt-kanban-toolbar"}),s=this.filterType==="project"?"Projeto:":"Respons\xE1vel:";i.createSpan({text:s,cls:"mt-kanban-filter-label"});let r=i.createEl("select",{cls:"mt-kanban-filter-select"}),a=r.createEl("option",{text:"Todos",value:"__all__"}),c=new Set;for(let d of o){let p=this.filterType==="project"?d.project:d.resource;p&&c.add(p)}for(let d of[...c].sort()){let p=r.createEl("option",{text:d,value:d});d===this.currentFilter&&(p.selected=!0)}this.currentFilter==="__all__"&&(a.selected=!0),r.addEventListener("change",()=>{this.currentFilter=r.value,this.render()})}ui(t,this.plugin.app,o,this.filterType,this.currentFilter)}};function Qt(e){e.registerMarkdownCodeBlockProcessor("meeting-kanban",(n,t,o)=>{let i={};for(let s of n.trim().split(`
`)){let r=s.match(/^(\w+):\s*(.+)$/);r&&(i[r[1]]=r[2].trim())}t.addClass("mt-kanban-container"),o.addChild(new Je(t,e,i.filter||"all"))})}var V=require("obsidian");var Qe=class extends V.Modal{constructor(n,t){super(n),this.task=t,this.appRef=n}onOpen(){let{contentEl:n}=this;n.empty();let t=g();n.createEl("h3",{text:t.ganttEditTitle(this.task.text)});let o=this.task.scheduled||"",i=this.task.due||"";new V.Setting(n).setName(t.ganttStartLabel).addText(s=>s.setPlaceholder("YYYY-MM-DD").setValue(o).onChange(r=>{o=r})),new V.Setting(n).setName(t.ganttEndLabel).addText(s=>s.setPlaceholder("YYYY-MM-DD").setValue(i).onChange(r=>{i=r})),new V.Setting(n).addButton(s=>s.setButtonText(t.btnSave).setCta().onClick(async()=>{let r=/^\d{4}-\d{2}-\d{2}$/;o&&r.test(o)&&await Xe(this.appRef,this.task.filePath,this.task.lineNumber,"scheduled",o),i&&r.test(i)&&await Xe(this.appRef,this.task.filePath,this.task.lineNumber,"due",i),this.close()})).addButton(s=>s.setButtonText(t.btnCancelPlain).onClick(()=>this.close()))}onClose(){this.contentEl.empty()}};function mi(e,n){let t=e.filter(r=>r.dueDateObj&&r.status!=="-");if(t.length===0)return"```mermaid\ngantt\n    dateFormat YYYY-MM-DD\n    title "+n+"\n    section Sem tasks\n    Nenhuma task com prazo :a1, 2024-01-01, 1d\n```";let o="```mermaid\ngantt\n    dateFormat YYYY-MM-DD\n    title "+n+`
`,i=new Map;for(let r of t){let a=r.workstream||r.project||"Geral";i.has(a)||i.set(a,[]),i.get(a).push(r)}let s=0;for(let[r,a]of i){o+=`    section ${en(r)}
`,a.sort((c,d)=>{let p=c.scheduledDateObj||c.dueDateObj,m=d.scheduledDateObj||d.dueDateObj;return p.getTime()-m.getTime()});for(let c of a){s++;let d=`t${s}`,p=en(c.text.slice(0,50)),m="";c.status==="x"?m="done, ":c.status==="/"&&(m="active, ");let l=c.scheduled||pi(c.due),u=c.due;o+=`    ${p} :${m}${d}, ${l}, ${u}
`}}return o+="```",o}function en(e){return e.replace(/[:;#\[\]\(\)]/g," ").replace(/\s{2,}/g," ").trim()}function pi(e){let n=new Date(e+"T00:00:00");return n.setDate(n.getDate()-7),n.toISOString().slice(0,10)}var et=class extends V.MarkdownRenderChild{constructor(t,o,i,s){super(t);this.plugin=o;this.filterType=i;this.filterValue=s;this.currentFilter=s||"__all__"}onload(){this.render(),this.registerEvent(this.plugin.app.workspace.on("meeting-tools:tasks-changed",()=>void this.render()))}async render(){let t=this.containerEl;t.empty();let i=(await ie(this.plugin.app)).filter(l=>l.status!=="x"&&l.status!=="-"),s=i.filter(l=>l.dueDateObj),r=i.filter(l=>!l.dueDateObj);if(i.length===0){t.createEl("p",{text:g().emptyTasks});return}if(this.filterType!=="all"&&!this.filterValue){let l=t.createDiv({cls:"mt-gantt-toolbar"}),u=this.filterType==="project"?"Projeto:":"Respons\xE1vel:";l.createSpan({text:u});let f=l.createEl("select",{cls:"mt-kanban-filter-select"});f.createEl("option",{text:"Todos",value:"__all__"});let h=new Set;for(let T of i){let y=this.filterType==="project"?T.project:T.resource;y&&h.add(y)}for(let T of[...h].sort()){let y=f.createEl("option",{text:T,value:T});T===this.currentFilter&&(y.selected=!0)}f.addEventListener("change",()=>{this.currentFilter=f.value,this.render()})}let a=l=>!this.currentFilter||this.currentFilter==="__all__"?l:this.filterType==="project"?l.filter(u=>u.project===this.currentFilter):this.filterType==="resource"?l.filter(u=>u.resource===this.currentFilter):l,c=a(s),d=a(r),p=this.currentFilter&&this.currentFilter!=="__all__"?`Tasks - ${this.currentFilter}`:"Tasks - Timeline";if(c.length>0){let l=mi(c,p),u=t.createDiv({cls:"mt-gantt-chart"});await V.MarkdownRenderer.renderMarkdown(l,u,"",this.plugin)}let m=(l,u)=>{let f=l.createEl("table",{cls:"mt-dash-table"}),h=f.createEl("thead").createEl("tr");h.createEl("th",{text:"Task"}),h.createEl("th",{text:"Projeto"}),h.createEl("th",{text:"In\xEDcio (\u23F3)"}),h.createEl("th",{text:"Fim (\u{1F4C5})"}),h.createEl("th",{text:""});let T=f.createEl("tbody");for(let y of u){let w=T.createEl("tr");w.createEl("td",{text:y.text.slice(0,60),cls:"mt-dash-text"}),w.createEl("td",{text:y.project||"-"}),w.createEl("td",{text:y.scheduled||"-"}),w.createEl("td",{text:y.due||"-"}),w.createEl("td").createEl("button",{text:"\u270F\uFE0F",cls:"mt-gantt-edit-btn"}).addEventListener("click",()=>{new Qe(this.plugin.app,y).open()})}};if(c.length>0){let l=t.createDiv({cls:"mt-gantt-list"});l.createEl("h4",{text:`Tasks com prazo (${c.length})`}),m(l,c)}if(d.length>0){let l=t.createDiv({cls:"mt-gantt-list mt-gantt-no-dates"});l.createEl("h4",{text:`Tasks sem prazo \u2014 adicione datas (${d.length})`}),m(l,d)}}};function tn(e){e.registerMarkdownCodeBlockProcessor("meeting-gantt",(n,t,o)=>{let i={};for(let s of n.trim().split(`
`)){let r=s.match(/^(\w+):\s*(.+)$/);r&&(i[r[1]]=r[2].trim())}t.addClass("mt-gantt-container"),o.addChild(new et(t,e,i.filter||"all",i.value||""))})}var O=require("obsidian");var k=null,tt=[],nt=0,it=0,fe=0,Le=null,_=null,Re=!1;function ot(e){let n=Math.floor(e/1e3),t=Math.floor(n/60),o=n%60;return`${t.toString().padStart(2,"0")}:${o.toString().padStart(2,"0")}`}function st(){if(!nt)return 0;let e=Date.now(),n=(k==null?void 0:k.state)==="paused"?e-fe:0;return e-nt-it-n}function gi(){return k!==null&&(k.state==="recording"||k.state==="paused")}async function nn(e){if(gi()){new O.Notice(g().noticeRecordingInProgress);return}try{let n=await navigator.mediaDevices.getUserMedia({audio:!0}),t=["audio/webm;codecs=opus","audio/webm","audio/ogg;codecs=opus","audio/mp4"],o="";for(let i of t)if(MediaRecorder.isTypeSupported(i)){o=i;break}tt=[],Re=!1,it=0,fe=0,k=new MediaRecorder(n,{...o?{mimeType:o}:{},audioBitsPerSecond:16e3}),k.ondataavailable=i=>{i.data.size>0&&tt.push(i.data)},k.onstop=async()=>{if(n.getTracks().forEach(u=>u.stop()),sn(),on(),Re){new O.Notice(g().noticeRecordingCancelled),k=null;return}let i=new Blob(tt,{type:(k==null?void 0:k.mimeType)||"audio/webm"}),s=((k==null?void 0:k.mimeType)||"").includes("mp4")?"m4a":"webm",r=new Date,a=u=>u.toString().padStart(2,"0"),c=`${r.getFullYear()}-${a(r.getMonth()+1)}-${a(r.getDate())}_${a(r.getHours())}h${a(r.getMinutes())}m${a(r.getSeconds())}s.${s}`;await F(e.app,e.settings.audioDir);let d=await i.arrayBuffer(),p=`${e.settings.audioDir}/${c}`;await e.app.vault.adapter.writeBinary(p,new Uint8Array(d));let m=ot(st()),l=Math.round(d.byteLength/1024);new O.Notice(g().noticeRecordingSaved(c,m,l)),k=null,new O.Notice(g().noticeStartAutoTranscribe);try{let u=await de(e,p);u&&new O.Notice(g().noticeTranscribeComplete(u.mdPath||u.srtPath))}catch(u){new O.Notice(g().noticeTranscribeError(u.message)),console.error("[MeetingTools] Auto-transcribe error:",u)}},k.start(1e3),nt=Date.now(),fi(e),Ti(),new O.Notice(g().noticeRecordingStarted)}catch(n){new O.Notice(g().noticeRecordingError(n.message)),console.error("[MeetingTools] Recording error:",n)}}function fi(e){let n=e.app.workspace.getActiveViewOfType(O.MarkdownView);if(!(n!=null&&n.containerEl))return;on(),_=document.createElement("div"),_.className="mt-record-banner";let t=g(),o=document.createElement("span");o.className="mt-record-dest",o.textContent=t.recordSavingTo(e.settings.audioDir),_.appendChild(o);let i=document.createElement("span");i.className="mt-record-timer",i.textContent=t.recordTimerRecording("00:00"),_.appendChild(i);let s=document.createElement("div");s.className="mt-record-buttons";let r=document.createElement("button");r.textContent=t.btnPause,r.className="mt-record-btn",r.addEventListener("click",()=>{k&&(k.state==="recording"?(k.pause(),fe=Date.now(),r.textContent=t.btnResume,i.textContent=t.recordTimerPaused(ot(st()))):k.state==="paused"&&(it+=Date.now()-fe,fe=0,k.resume(),r.textContent=t.btnPause))});let a=document.createElement("button");a.textContent=t.btnStop,a.className="mt-record-btn mt-record-btn-stop",a.addEventListener("click",()=>{k&&(Re=!1,k.stop())});let c=document.createElement("button");c.textContent=t.btnCancel,c.className="mt-record-btn mt-record-btn-cancel",c.addEventListener("click",()=>{k&&(Re=!0,k.stop())}),s.appendChild(r),s.appendChild(a),s.appendChild(c),_.appendChild(s),n.containerEl.prepend(_)}function on(){_&&(_.remove(),_=null)}function hi(){if(!_||!k)return;let e=_.querySelector(".mt-record-timer");e&&k.state==="recording"&&(e.textContent=g().recordTimerRecording(ot(st())))}function Ti(){sn(),Le=setInterval(hi,1e3)}function sn(){Le&&(clearInterval(Le),Le=null)}var $e=require("obsidian");var rn=`# Meeting Tools \u2014 Guide

## First time
1. Settings \u2192 Meeting Tools \u2192 set your **OpenAI API Key**
2. Run **Setup Vault** (creates folders, templates and dashboards)

## Meeting workflow
1. In a note (e.g. daily note), add a time block:
   \`### 10:00 - Status meeting [[ProjectName]]\`
2. Place the cursor **inside** that block
3. **Start Recording** (or **Import Audio**) \u2014 transcription runs automatically when recording stops
4. With the cursor still in the block, run:
   - **Summarize** \u2014 summary + parseable tasks
   - **Extract Tasks** \u2014 tasks only
   - **Generate Mindmap** \u2014 Mermaid diagram
5. Or **Full Pipeline** \u2014 chains Import \u2192 Transcribe \u2192 Summarize \u2192 Mindmap

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
Full documentation in the plugin's \`README.md\`, or Settings \u2192 Meeting Tools.`,an=`# Meeting Tools \u2014 Guia

## Primeira vez
1. Settings \u2192 Meeting Tools \u2192 configure sua **OpenAI API Key**
2. Rode **Setup do vault** (cria pastas, templates e dashboards)

## Fluxo de reuni\xE3o
1. Em uma nota (ex: daily note), crie um time block:
   \`### 10:00 - Reuni\xE3o de status [[NomeDoProjeto]]\`
2. Posicione o cursor **dentro** desse bloco
3. **Iniciar grava\xE7\xE3o** (ou **Importar \xE1udio**) \u2014 ao parar, transcreve automaticamente
4. Ainda com cursor no bloco, rode:
   - **Resumir transcri\xE7\xE3o** \u2014 resumo + tasks parse\xE1veis
   - **Extrair tasks** \u2014 s\xF3 a lista de tasks
   - **Gerar mindmap** \u2014 diagrama Mermaid
5. Ou **Pipeline completo** \u2014 encadeia Importar \u2192 Transcrever \u2192 Resumir \u2192 Mindmap

## Atribui\xE7\xE3o de projeto (tasks)
O wikilink no **header do time block** \xE9 aplicado a todas as tasks geradas:

| Header do time block | Task gerada |
|---|---|
| \`### 10:00 [[NomeDoProjeto]]\` + \`Vault/Projects/NomeDoProjeto.md\` existe | \`#task #projects/nomedoprojeto [[NomeDoProjeto]]\` |
| \`### 10:00 [[GenericFile.pptx]]\` (sem nota de projeto) | \`#task [[GenericFile.pptx]]\` (sem tag) |
| \`### 10:00\` (sem wikilink) | \`#task [[No project]]\` |

## Dashboards
Abra \`MT Task Dashboard\`, \`MT Kanban View\` ou \`MT Gantt View\` (criados pelo Setup do vault). Agrupam por \`#projects/\` e \`[resource::]\`.

## Mais
Documenta\xE7\xE3o completa no \`README.md\` do plugin ou Settings \u2192 Meeting Tools.`;function se(){return ye()==="pt-BR"?an:rn}function Ne(){return"Vault/Meeting Tools \u2014 Guide.md"}var rt="Vault/Meeting Tools \u2014 Guia.md";function cn(e){let n=e.trim();return n===rn.trim()||n===an.trim()}var yi=["Vault","Vault/Templates","Vault/Daily Notes","Vault/Projects","Vault/Projects/Documents","Vault/Audios","Vault/Transcripts","Vault/Resources","Vault/Contacts","Vault/Archive"];function at(){let e=ee.map(t=>({path:te(t),content:X(t)})),n={path:Ne(),content:se()};return[...e,n]}async function ln(e){let{app:n}=e,t=0,o=0;for(let s of yi)await F(n,s);for(let s of at()){if(n.vault.getAbstractFileByPath(s.path)){o++;continue}let a=s.path.lastIndexOf("/");a>0&&await F(n,s.path.slice(0,a)),await n.vault.create(s.path,s.content),t++}new $e.Notice(g().noticeSetupComplete(t,o));let i=ee.find(s=>s.id==="task-dashboard");if(i){let s=n.vault.getAbstractFileByPath(te(i));s instanceof $e.TFile&&await n.workspace.getLeaf(!1).openFile(s)}}var dn=require("obsidian");function wi(e,n){let t=e.split(`
`),o=[],i=n.toLowerCase(),s=/^### (\d{2}:\d{2}\s*-.*)$/;for(let r=0;r<t.length;r++){let a=t[r].match(s);if(!a)continue;let c=a[1],d=c;for(let l=r+1;l<t.length&&!(/^### \d{2}:\d{2}/.test(t[l])||/^---/.test(t[l])||/^## /.test(t[l]));l++)d+=`
`+t[l];let p=d.includes(`[[${n}]]`),m=d.toLowerCase().includes(`#projects/${i}`);(p||m)&&o.push(c.trim())}return o}function un(e){e.registerMarkdownCodeBlockProcessor("meeting-history",async(n,t,o)=>{let i=e.app,s=i.vault.getAbstractFileByPath(o.sourcePath);if(!s||!(s instanceof dn.TFile)){t.createEl("p",{text:"N\xE3o foi poss\xEDvel identificar a nota atual."});return}let r=s.basename,c=i.vault.getMarkdownFiles().filter(m=>m.path.includes("Daily Notes/")),d=[];for(let m of c){let l=await i.vault.cachedRead(m),u=l.includes(`[[${r}]]`),f=l.toLowerCase().includes(`#projects/${r.toLowerCase()}`);if(u||f){let h=wi(l,r);d.push({file:m,date:m.basename,timeBlocks:h})}}if(d.sort((m,l)=>l.date.localeCompare(m.date)),d.length===0){t.createEl("p",{text:g().emptyMeetingHistory,cls:"mt-dash-empty"});return}t.createEl("p",{text:`${d.length} reuni\xE3o(\xF5es) encontrada(s)`,cls:"mt-history-count"});let p=t.createEl("ul",{cls:"mt-history-list"});for(let m of d){let l=p.createEl("li");if(l.createEl("a",{text:m.date,cls:"internal-link mt-history-date"}).addEventListener("click",f=>{f.preventDefault(),i.workspace.getLeaf(!1).openFile(m.file)}),m.timeBlocks.length>0){let f=l.createEl("ul",{cls:"mt-history-blocks"});for(let h of m.timeBlocks)f.createEl("li",{text:h,cls:"mt-history-block"})}}})}var mn=require("obsidian"),bi={"MT Task Dashboard":"list-checks","MT Kanban View":"kanban","MT Gantt View":"gantt-chart","Daily Note Template":"calendar","Project Template":"briefcase","Summary Template":"clipboard-list","Meeting Tools \u2014 Guide":"book-open"};function pn(e){let n=()=>{var o;let t=document.querySelectorAll(".nav-file-title-content");for(let i of Array.from(t)){let s=((o=i.textContent)==null?void 0:o.trim())||"",r=bi[s];if(!r)continue;let a=i.parentElement;if(!a||a.querySelector(".mt-file-icon"))continue;let c=document.createElement("span");c.addClass("mt-file-icon"),(0,mn.setIcon)(c,r),a.insertBefore(c,i)}};e.app.workspace.onLayoutReady(n),e.registerEvent(e.app.workspace.on("layout-change",()=>{setTimeout(n,100)})),e.registerEvent(e.app.vault.on("create",()=>setTimeout(n,200))),e.registerEvent(e.app.vault.on("rename",()=>setTimeout(n,200)))}var Be=class extends x.Plugin{constructor(){super(...arguments);this.settings=Ve}async onload(){gt(_e()),await this.loadSettings(),this.addSettingTab(new we(this.app,this)),Jt(this),Qt(this),tn(this),un(this);let t=(0,x.debounce)(()=>this.app.workspace.trigger("meeting-tools:tasks-changed"),250,!0);this.registerEvent(this.app.metadataCache.on("changed",(i,s,r)=>{var c;((c=r==null?void 0:r.tags)==null?void 0:c.some(d=>d.tag==="#task"))&&t()})),this.registerEvent(this.app.vault.on("delete",()=>t())),this.registerEvent(this.app.vault.on("rename",()=>t())),this.settings.showFileIcons&&pn(this),this.app.workspace.onLayoutReady(async()=>{await this.migrateGuideIfNeeded(),await this.migrateArtifactsIfNeeded(),this.checkMissingArtifacts(),await this.checkSummaryTemplateCompat(),await this.maybeShowOnboarding()}),this.addRibbonIcon("briefcase","Meeting Tools",i=>{let s=g(),r=new x.Menu;r.addItem(a=>a.setTitle(s.cmdStartRecording).setIcon("mic").onClick(()=>this.record())),r.addItem(a=>a.setTitle(s.cmdImportAudio).setIcon("download").onClick(()=>this.doImportAudio())),r.addSeparator(),r.addItem(a=>a.setTitle(s.cmdTranscribe).setIcon("file-text").onClick(()=>this.doTranscribe())),r.addItem(a=>a.setTitle(s.cmdSummarize).setIcon("clipboard-list").onClick(()=>this.doSummarize())),r.addItem(a=>a.setTitle(s.cmdMindmap).setIcon("git-branch").onClick(()=>this.doMindmap())),r.addItem(a=>a.setTitle(s.cmdExtractTasks).setIcon("check-square").onClick(()=>this.doExtractTasks())),r.addSeparator(),r.addItem(a=>a.setTitle(s.cmdNewProject).setIcon("folder-plus").onClick(()=>this.doNewProject())),r.addItem(a=>a.setTitle(s.cmdFullPipeline).setIcon("zap").onClick(()=>this.doFullPipeline())),r.addSeparator(),r.addItem(a=>a.setTitle(s.cmdSetupVault).setIcon("settings").onClick(()=>this.doSetupVault())),r.addItem(a=>a.setTitle(s.cmdQuickStartGuide).setIcon("book-open").onClick(()=>this.doShowGuide())),r.showAtMouseEvent(i)});let o=g();this.addCommand({id:"record",name:o.cmdStartRecording,callback:()=>this.record()}),this.addCommand({id:"import-audio",name:o.cmdImportAudio,callback:()=>this.doImportAudio()}),this.addCommand({id:"transcribe",name:o.cmdTranscribe,callback:()=>this.doTranscribe()}),this.addCommand({id:"summarize",name:o.cmdSummarize,callback:()=>this.doSummarize()}),this.addCommand({id:"mindmap",name:o.cmdMindmap,callback:()=>this.doMindmap()}),this.addCommand({id:"extract-tasks",name:o.cmdExtractTasks,callback:()=>this.doExtractTasks()}),this.addCommand({id:"new-project",name:o.cmdNewProject,callback:()=>this.doNewProject()}),this.addCommand({id:"full-pipeline",name:o.cmdFullPipeline,callback:()=>this.doFullPipeline()}),this.addCommand({id:"setup-vault",name:o.cmdSetupVault,callback:()=>this.doSetupVault()}),this.addCommand({id:"quick-start-guide",name:o.cmdQuickStartGuide,callback:()=>this.doShowGuide()})}async loadSettings(){this.settings=await wt(this)}async saveSettings(){await S(this,this.settings)}getApiKey(){return ht(this)}async record(){await nn(this)}async doImportAudio(){await j(this,g().statusLabelImport,async()=>{await qe(this)})}async doTranscribe(t){if(!this.getApiKey()){$(this);return}let i=t!=null?t:await new Promise(s=>{new xe(this.app,this.settings.audioDir,r=>s(r)).open()});i&&await j(this,g().statusLabelTranscribe,async()=>{let s=await de(this,i);s&&new x.Notice(g().noticeTranscriptSaved(s.srtPath))})}async fallbackToFuzzyModal(t){var o;if(t.insufficientBlock){let i=new Pe(this.app,(o=t.wordCount)!=null?o:0,this.settings.minWordsForSummary);if(i.open(),!await i.waitForResult())return null}else if(!await kt(this.app))return null;return await new Promise(i=>{new H(this.app,this.settings.transcriptsDir,s=>i(s)).open()})}async doSummarize(t){let o=be(this.app,this.settings.minWordsForSummary);if(o.result)await j(this,g().statusLabelSummarize,async()=>{await Ae(this,void 0,o.result)});else{let i=t!=null?t:await this.fallbackToFuzzyModal(o);if(!i)return;await j(this,g().statusLabelSummarize,async()=>{await Ae(this,i)})}}async doMindmap(t){let o=be(this.app,this.settings.minWordsForSummary);if(o.result)await j(this,g().statusLabelMindmap,async()=>{await Ce(this,void 0,o.result)});else{let i=t!=null?t:await this.fallbackToFuzzyModal(o);if(!i)return;await j(this,g().statusLabelMindmap,async()=>{await Ce(this,i)})}}async doExtractTasks(){let t=be(this.app,this.settings.minWordsForSummary);if(t.result)await j(this,g().statusLabelTasks,async()=>{await He(this,t.result.text,t.result)});else{let o=await this.fallbackToFuzzyModal(t);if(!o)return;let i=this.app.vault.getAbstractFileByPath(o);if(!i||!(i instanceof x.TFile))return;let s=await this.app.vault.read(i);await j(this,g().statusLabelTasks,async()=>{await He(this,s)})}}async doNewProject(){await j(this,g().statusLabelProject,async()=>{await Kt(this)})}async doFullPipeline(){var r;let t=g(),o=this.addStatusBarItem();o.style.fontWeight="600";let i="",s=(a,c,d)=>{i=d;let p=t.pipelineStep(a,c,d);o.setText(p),new x.Notice(p,1e4)};try{s(1,4,t.pipelineStepImport);let a=await qe(this);if(!a){o.remove();return}s(2,4,t.pipelineStepTranscribe);let c=await de(this,a);if(!c){o.remove();return}let d=(r=c.mdPath)!=null?r:c.srtPath;s(3,4,t.pipelineStepSummarize),await Ae(this,d),s(4,4,t.pipelineStepMindmap),await Ce(this,d),o.setText(t.pipelineComplete),new x.Notice(t.pipelineComplete,5e3),setTimeout(()=>o.remove(),8e3)}catch(a){o.setText(i?`${t.pipelineFailed} \u2014 ${i}`:t.pipelineFailed),new x.Notice(t.pipelineErrorAt(i,a.message),1e4),console.error("[MeetingTools]",a),setTimeout(()=>o.remove(),8e3)}}async doSetupVault(){await j(this,g().statusLabelVault,async()=>{await ln(this)})}async doShowGuide(){new ue(this.app,g().modalGuideTitle,se()).open()}async maybeShowOnboarding(){this.settings.onboardingShown||(this.getApiKey()||new ue(this.app,g().modalGuideTitle,se()).open(),this.settings.onboardingShown=!0,await this.saveSettings())}async migrateGuideIfNeeded(){let t=Ne(),o=se(),i=this.app.vault.getAbstractFileByPath(rt);i instanceof x.TFile&&(this.app.vault.getAbstractFileByPath(t)?console.warn(`[MeetingTools] Both guide paths exist (${rt} and ${t}); skipping rename. Resolve manually.`):await this.app.vault.rename(i,t));let s=this.app.vault.getAbstractFileByPath(t);if(s instanceof x.TFile){let r=await this.app.vault.read(s);cn(r)&&r.trim()!==o.trim()&&await this.app.vault.modify(s,o)}}async migrateArtifactsIfNeeded(){for(let o of ee){let i=te(o),s=X(o),r=Ke(o);for(let c of r){let d=this.app.vault.getAbstractFileByPath(c);if(!(d instanceof x.TFile))continue;if(this.app.vault.getAbstractFileByPath(i)){console.warn(`[MeetingTools] Both paths exist for ${o.id} (${c} and ${i}); skipping rename. Resolve manually.`);continue}let m=i.lastIndexOf("/");if(m>0){let l=i.slice(0,m);this.app.vault.getAbstractFileByPath(l)||await this.app.vault.createFolder(l).catch(()=>{})}await this.app.vault.rename(d,i)}let a=this.app.vault.getAbstractFileByPath(i);if(a instanceof x.TFile){let c=await this.app.vault.read(a);Ue(o,c)&&c.trim()!==s.trim()&&await this.app.vault.modify(a,s)}}let t=me("summary-template");if(t){let o=te(t);Ke(t).includes(this.settings.summaryTemplatePath)&&this.settings.summaryTemplatePath!==o&&(this.settings.summaryTemplatePath=o,await this.saveSettings())}}async checkSummaryTemplateCompat(){if(this.settings.summaryTemplateCompatDismissed)return;let t=this.settings.summaryTemplatePath,o=this.app.vault.getAbstractFileByPath(t);if(!(o instanceof x.TFile))return;let i=me("summary-template");if(!i)return;let s=await this.app.vault.read(o);if(Ue(i,s))return;let a=zt(s,["transcript","task_format_spec"]);if(a.length===0)return;let c=g(),d=a.map(h=>`{{${h}}}`).join(", "),p=new x.Notice("",0),m=p.noticeEl;m.empty(),m.addClass("mt-missing-notice"),m.createEl("div",{text:c.noticeSummaryTemplateIncompatible(d)});let l=m.createDiv({cls:"mt-notice-btn-row"});l.createEl("button",{text:c.btnRegenerateTemplate,cls:"mod-cta"}).addEventListener("click",async()=>{await this.app.vault.modify(o,X(i)),new x.Notice(c.noticeSummaryTemplateRegenerated,5e3),p.hide()}),l.createEl("button",{text:c.btnDismiss}).addEventListener("click",async()=>{this.settings.summaryTemplateCompatDismissed=!0,await this.saveSettings(),p.hide()})}checkMissingArtifacts(){let t=at().map(u=>u.path).filter(u=>!this.app.vault.getAbstractFileByPath(u)&&!this.settings.dismissedArtifacts.includes(u));if(t.length===0)return;let o=g(),i=new x.Notice("",0),s=i.noticeEl;s.empty(),s.addClass("mt-missing-notice"),s.createEl("div",{text:o.noticeMissingArtifacts(t.length)});let r=t.map(u=>{let f=u.lastIndexOf("/"),h=f>=0?u.slice(f+1):u;return h.endsWith(".md")?h.slice(0,-3):h}),a=r.slice(0,3).join(", "),c=Math.max(0,r.length-3),d=s.createEl("div",{text:o.noticeMissingArtifactsList(a,c)});d.style.fontSize="0.9em",d.style.color="var(--text-muted)",d.style.marginBottom="4px";let p=s.createDiv({cls:"mt-notice-btn-row"});p.createEl("button",{text:o.btnRunSetupVault,cls:"mod-cta"}).addEventListener("click",async()=>{i.hide(),await this.doSetupVault(),this.settings.dismissedArtifacts=this.settings.dismissedArtifacts.filter(u=>!this.app.vault.getAbstractFileByPath(u)),await this.saveSettings()}),p.createEl("button",{text:o.btnDismiss}).addEventListener("click",async()=>{i.hide(),this.settings.dismissedArtifacts=Array.from(new Set([...this.settings.dismissedArtifacts,...t])),await this.saveSettings()})}};
