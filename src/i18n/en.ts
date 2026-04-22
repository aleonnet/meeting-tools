export const EN = {
  // --- Notices: common ---
  noticeConfigureApiKey: "Configure the OpenAI API Key in Meeting Tools settings.",
  noticeFileNotFound: (path: string) => `File not found: ${path}`,
  noticeAudioNotFound: (path: string) => `Audio not found: ${path}`,

  // --- Notices: recording ---
  noticeRecordingInProgress: "A recording is already in progress.",
  noticeRecordingCancelled: "Recording cancelled.",
  noticeRecordingStarted: "🔴 Recording started",
  noticeRecordingSaved: (file: string, dur: string, kb: number) =>
    `Recording saved: ${file} (${dur}, ${kb}KB)`,
  noticeStartAutoTranscribe: "Starting automatic transcription…",
  noticeTranscribeComplete: (path: string) => `Transcription complete: ${path}`,
  noticeTranscribeError: (msg: string) => `Transcription error: ${msg}`,
  noticeRecordingError: (msg: string) => `Failed to start recording: ${msg}`,

  // --- Notices: import ---
  noticeImportCancelled: "Import cancelled.",
  noticeAudioImported: (path: string, kb: number) =>
    `Audio imported: ${path} (${kb}KB)`,
  noticeAudioTooLargeMobile: (mb: string) =>
    `File > 25MB (${mb}MB). Compress on desktop before importing.`,
  noticeFfmpegMissing: "ffmpeg not found. Install with: brew install ffmpeg (macOS) or download from ffmpeg.org",
  noticeLargeAudioCompressing: (mb: string) =>
    `Large audio (${mb}MB). Compressing with ffmpeg…`,
  noticeVaultPathMissing: "Could not detect the vault path.",
  noticeFfmpegFailed: "ffmpeg failed. Using the original file.",
  noticeCompressed: (from: string, to: string) => `Compressed: ${from}MB → ${to}MB`,
  noticeCompressedFileMissing: "Compressed file not found. Using original.",

  // --- Notices: transcribe ---
  noticeTranscribingWith: (label: string) => `Transcribing with ${label}…`,
  noticeTranscribingChunk: (i: number, total: number) =>
    `Transcribing chunk ${i}/${total}…`,
  noticeChunkFailed: (i: number) => `Chunk ${i} failed — continuing.`,
  noticeTranscribeFailed: (msg: string) => `Failed to generate transcription: ${msg}`,
  noticeFileExceedsLimit: (mb: string) =>
    `File exceeds 25MB (${mb}MB). Enable chunking (auto mode).`,
  noticeSrtSaved: (path: string) => `SRT saved: ${path}`,
  noticeMdSaved: (path: string) => `MD saved: ${path}`,
  transcriptMdHeader: "# Transcript",
  transcriptEmptyMarker: "_(empty transcript)_",

  // --- Notices: summarize / mindmap / tasks / new-project ---
  noticeGeneratingSummary: "Generating summary…",
  noticeSummaryEmpty: "Summary empty.",
  noticeSummaryInserted: "Summary inserted.",

  noticeGeneratingMindmap: "Generating mindmap…",
  noticeMindmapInserted: "Mindmap inserted.",

  noticeNoInputForTasks: "No text provided for task extraction.",
  noticeContentTooShortForTasks: "Content too short to extract tasks.",
  noticeExtractingTasks: "Extracting tasks…",
  noticeExtractTasksFailed: "Failed to extract tasks.",
  noticeNoTasksFound: "No action items identified in the text.",
  noticeTasksInserted: "Tasks inserted.",

  noticeOperationCancelled: "Operation cancelled.",
  noticeDesktopOnlyExtract: "PDF/PPTX extraction requires desktop. Use a TXT file.",
  noticeReadingDocument: (name: string) => `Reading document: ${name}`,
  noticeDocumentReadError: (msg: string) => `Failed to read document: ${msg}`,
  noticeDocumentTextTooShort: "Could not extract enough text from the document.",
  noticeDocumentSaved: (path: string) => `Document saved at: ${path}`,
  noticeGeneratingProjectNote: "Generating project note…",
  noticeProjectGenerateFailed: "Failed to generate project note.",
  noticeLlmEmpty: "Empty response from LLM.",
  noticeProjectCreated: (path: string) => `Project created: ${path}`,

  // --- Notices: setup vault ---
  noticeSetupComplete: (created: number, skipped: number) =>
    `Setup complete: ${created} file(s) created, ${skipped} already existed.`,
  noticeMissingArtifacts: (n: number) =>
    n === 1
      ? `1 Meeting Tools artifact is missing:`
      : `${n} Meeting Tools artifacts are missing:`,
  noticeMissingArtifactsList: (names: string, more: number) =>
    more > 0 ? `${names} and ${more} more` : names,
  btnRunSetupVault: "Run Setup Vault",
  btnDismiss: "Dismiss",
  btnOpenSettings: "Open Settings",

  // --- Notices: Summary Template compatibility ---
  noticeSummaryTemplateIncompatible: (missing: string) =>
    `Your customized Summary Template is missing required placeholders: ${missing}. Sections relying on them will be empty.`,
  btnRegenerateTemplate: "Reset to default",
  noticeSummaryTemplateRegenerated: "Summary Template reset to current default.",

  // --- Notices: pipeline + status ---
  pipelineStepImport: "Importing audio…",
  pipelineStepTranscribe: "Transcribing…",
  pipelineStepSummarize: "Generating summary…",
  pipelineStepTasks: "Extracting tasks…",
  pipelineStepMindmap: "Generating mindmap…",
  pipelineComplete: "✅ Pipeline complete!",
  pipelineFailed: "❌ Pipeline failed",
  pipelineError: (msg: string) => `Pipeline error: ${msg}`,
  pipelineErrorAt: (step: string, msg: string) =>
    step ? `Pipeline failed at "${step}": ${msg}` : `Pipeline error: ${msg}`,
  pipelineStep: (i: number, n: number, label: string) => `📋 ${i}/${n} ${label}`,

  statusRunning: (label: string) => `⏳ ${label}`,
  statusDone: (label: string) => `✅ ${label} — done`,
  statusError: (label: string) => `❌ ${label} — error`,

  // Labels used by withStatusFeedback
  statusLabelImport: "Importing audio",
  statusLabelTranscribe: "Transcribing audio",
  statusLabelSummarize: "Generating summary",
  statusLabelMindmap: "Generating mindmap",
  statusLabelTasks: "Extracting tasks",
  statusLabelProject: "Creating project",
  statusLabelVault: "Configuring vault",

  // Notice shown when auto-transcribe finishes
  noticeTranscriptSaved: (path: string) => `Transcript saved: ${path}`,

  // --- Settings headers ---
  settingSectionTranscription: "Transcription",
  settingSectionDirs: "Directories",
  settingSectionModels: "OpenAI Models (GPT)",
  settingSectionLanguage: "Language & Templates",
  settingSectionBehavior: "Behavior",

  // --- Settings: fields ---
  settingApiKeyName: "OpenAI API Key",
  settingApiKeyDesc: "Stored securely in the system keychain.",
  settingUserNameName: "User name",
  settingUserNameDesc: "Name used in summaries (e.g. action items for [name]).",
  settingAudioDirName: "Audio directory",
  settingAudioDirDesc: "Folder for imported/recorded audio files.",
  settingTranscriptsDirName: "Transcripts directory",
  settingTranscriptsDirDesc: "Folder for transcriptions (.srt and .md).",

  settingTranscriptionModelName: "Transcription model",
  settingTranscriptionModelDesc:
    "Auto picks diarize (with speakers, ≤ 23min) or whisper-1 (long audio).",
  settingChunkDurationName: "Chunk duration (min)",
  settingChunkDurationDesc: "Chunk size for long audio. Typical: 5-20.",

  settingSummaryModelName: "Summary model",
  settingSummaryModelDesc: "Model used for summaries and project notes.",
  settingTasksModelName: "Tasks model",
  settingTasksModelDesc: "Model used for task extraction.",
  settingMindmapModelName: "Mindmap model",
  settingMindmapModelDesc: "Model used for mindmap generation.",

  settingOutputLanguageName: "AI output language",
  settingOutputLanguageDesc:
    "Language for generated summary/mindmap/tasks. Auto follows the transcript.",
  settingOutputLanguageAuto: "Auto (match transcript)",
  settingOutputLanguagePt: "Portuguese (Brazil)",
  settingOutputLanguageEn: "English",

  settingSummaryTemplateName: "Summary template file",
  settingSummaryTemplateDesc:
    "Path to a .md file with the summary prompt. Empty or missing = built-in default.",

  settingGenerateMdName: "Generate .md from .srt",
  settingGenerateMdDesc: "Automatically create a clean .md when transcribing.",
  settingShowPreviewName: "Show preview before inserting",
  settingShowPreviewDesc: "Display an editable preview before inserting summary/mindmap.",
  settingShowFileIconsName: "Show icons for MT artifacts",
  settingShowFileIconsDesc: "Decorates templates and MT dashboards in the file explorer. Takes effect after plugin reload.",
  settingMinWordsName: "Min words for summary",
  settingMinWordsDesc: "Transcripts below this threshold generate a generic summary.",

  // --- Ribbon menu + commands ---
  cmdStartRecording: "Start Recording",
  cmdImportAudio: "Import Audio",
  cmdTranscribe: "Transcribe Audio",
  cmdSummarize: "Summarize Transcript",
  cmdMindmap: "Generate Mindmap",
  cmdExtractTasks: "Extract Tasks",
  cmdNewProject: "New Project from Document",
  cmdFullPipeline: "Full Pipeline",
  cmdSetupVault: "Setup Vault",
  cmdQuickStartGuide: "Quick Start Guide",
  modalGuideTitle: "Meeting Tools — Quick Start",
  btnClose: "Close",

  // --- Recorder banner ---
  recordTimerRecording: (elapsed: string) => `🔴 Recording ${elapsed}`,
  recordTimerPaused: (elapsed: string) => `⏸ Paused ${elapsed}`,
  recordSavingTo: (dir: string) => `Saving to ${dir}/`,
  btnPause: "⏸ Pause",
  btnResume: "▶ Resume",
  btnStop: "⏹ Stop",
  btnCancel: "✕ Cancel",

  // --- Cursor banner ---
  cursorBannerMessage: "📌 Place the cursor where content should be inserted",
  btnContinue: "Continue",
  btnCancelPlain: "Cancel",

  // --- Modals ---
  modalInsufficientTitle: "Not enough text in block",
  modalInsufficientDesc: (wc: number, min: number) =>
    `Not enough text in this block to generate summary, mindmap or task list (${wc} words found, minimum ${min}).`,
  previewFooter: (wc: number, lines: number) => `${wc} words · ${lines} lines`,
  modalOpenTranscript: "Open transcript",
  modalPreview: "Preview",
  modalEdit: "Edit",
  modalInsert: "Insert",

  modalAudioSuggestPlaceholder: "Select an audio file…",
  modalTranscriptSuggestPlaceholder: "Select a transcript (.md or .srt)…",

  // --- Fallbacks ---
  summaryShortFallback: (userName: string) =>
    `**1. Executive Summary**\n- Transcript too short; not enough content for synthesis.\n\n**2. Key Action Items / Commitments for ${userName}**\n- Not mentioned\n\n**3. Detailed Topics**\n- Not mentioned`,

  // --- LLM language instructions ---
  llmLangAutoMatch: "Respond in the same language as the input transcript.",
  llmLangEnglish: "Respond in English.",
  llmLangPortuguese: "Responda em Português do Brasil.",

  // --- Dashboards / code blocks ---
  emptyTasks: "No tasks found.",
  legendLabelDue: "Due date",
  legendLabelStatus: "Status",
  legendLabelPriority: "Priority",
  legendHint: "Click the icons to change status/priority.",
  legendItemOverdue: "Overdue",
  legendItemToday: "Today",
  legendItemThisWeek: "This week",
  legendItemFuture: "Future",
  legendItemInProgress: "In progress",
  legendItemDone: "Done",
  legendItemCancelled: "Cancelled",
  legendItemHigh: "High",
  legendItemMedium: "Medium",
  legendItemLow: "Low",
  legendItemNoPriority: "None",
  emptyMeetingHistory: "No daily notes reference this project.",

  // --- Gantt date edit modal ---
  ganttEditTitle: (name: string) => `Edit dates: ${name}`,
  ganttStartLabel: "Start date (⏳)",
  ganttEndLabel: "End date (📅)",
  btnSave: "Save",

  // --- Errors surfaced to user ---
  errorOpenAICall: "OpenAI call failed.",
  errorNoPptxSlides: "No slides found in the PPTX file.",
  errorNoPptxText: "No text found in the PPTX slides.",

  // --- OpenAI API error mapping (shown in Notice, duration 10s) ---
  openaiErrorInvalidKey: "Invalid OpenAI API key. Configure it at Settings → Meeting Tools.",
  openaiErrorForbidden: "OpenAI not available in your country/region.",
  openaiErrorModelNotFound: (model: string) =>
    `OpenAI model '${model}' not found. Change it at Settings → Meeting Tools (Summary/Tasks/Mindmap Model).`,
  openaiErrorBadRequest: (msg: string) => `Invalid OpenAI request: ${msg}`,
  openaiErrorPayloadTooLarge:
    "Payload exceeds OpenAI limit. Use a shorter transcript or reduce context.",
  openaiErrorContentFilter: "Content blocked by OpenAI moderation.",
  openaiErrorRateLimit: (retryAfterSec: number | null) =>
    retryAfterSec != null
      ? `OpenAI rate limit reached. Retry in ${retryAfterSec}s.`
      : "OpenAI rate limit reached. Retry in a few seconds.",
  openaiErrorQuotaExceeded:
    "OpenAI quota exhausted. Check billing at platform.openai.com/usage",
  openaiErrorTokensPerMinute:
    "OpenAI tokens-per-minute limit reached. Wait a few seconds and retry.",
  openaiErrorServerError: "OpenAI internal error. Retry in a few seconds.",
  openaiErrorServiceUnavailable:
    "OpenAI service unavailable. Retry in a few minutes.",
  openaiErrorNetwork: "Network error contacting OpenAI. Check your connection.",
  openaiErrorUnknown: (status: number, msg: string) =>
    `OpenAI error ${status}: ${msg}`,
};

export type Strings = typeof EN;
