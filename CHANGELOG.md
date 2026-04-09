# Changelog

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
