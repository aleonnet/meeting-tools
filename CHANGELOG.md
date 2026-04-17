# Changelog

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
