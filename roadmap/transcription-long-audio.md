# Roadmap: Transcrição confiável em áudios longos

Status: **implementado na v2.1.0 (2026-04-15)**. Mantido como referência técnica.
Data do documento original: 2026-04-14.

## Problema original

`whisper-1` entra em loop de alucinação em áudios longos, emitindo blocos contíguos de `...` apesar de haver fala audível. No teste original com um áudio de 74min49s, **1008 de 2063 segmentos** após 00:41:26 vieram como `...`, embora `ffmpeg volumedetect` confirmasse fala (mean_volume −19 a −24 dB) em 41:30, 50:00, 60:00, 70:00.

## Solução atual (implementada)

Adicionado setting `whisperHallucinationPrompt` em `src/settings.ts` com default:

> `"The sentence may be cut off, do not make up words to fill in the rest of the sentence."`

Enviado como campo `prompt` no POST pra `/v1/audio/transcriptions` em `src/transcribe.ts`. Vazio desliga o prompt.

### Resultado verificado (mesmo áudio de 75min, 2026-04-14)

| Métrica | Sem prompt | Com prompt |
|---|---|---|
| Total segmentos | 2063 | 1970 |
| Segmentos `...`-only | 1008 | **0** |
| Loops (3+ repetições) | N/A | 0 |
| Fim do áudio | `...` após 41:26 | fala real até 01:14:48 |

### Limitações conhecidas

1. Teste feito em **1 áudio**. Comunidade OpenAI reporta que prompt mitiga mas **não elimina 100%** — áudios com silêncios muito longos podem ainda disparar loops.
2. `whisper-1` tem limite duro de **25MB** por arquivo. 75min em webm = 9.5MB, mas mp3/wav podem estourar.
3. Sem diarização (identificação de falantes).

## Por que ainda queremos chunking (backlog)

Dois casos em que prompt sozinho não resolve:

### A. Suportar `gpt-4o-transcribe-diarize`

Modelo retorna `diarized_json` com labels de falantes (`A`, `B`, `C`). Interesse do usuário: `**Speaker A:** ...` nos `.md`.

**Bloqueador:** limite duro de **1400s (23min20s)** por chamada, confirmado na API em 2026-04-14:

> `"audio duration 4489.2 seconds is longer than 1400 seconds which is the maximum for this model"`

Comunidade ([thread 1](https://community.openai.com/t/gpt-4o-transcribe-audio-length-limits/1148374), [thread 2](https://community.openai.com/t/gpt4-0-transcribe-max-1500-seconds/1306684)) reporta 1500s em tiers diferentes; design defensivo = 1400s.

Sem chunking, diarize fica limitado a áudios curtos.

### B. Backup quando prompt falhar

Se aparecer áudio em que prompt não resolve (silêncios patológicos), chunking fresh evita acúmulo de contexto ruim no modelo.

## Estratégia proposta: chunking universal via Web Audio API

Única implementação que roda em desktop (Electron) **e** mobile (iOS/Android Obsidian). Sem ffmpeg, sem `child_process`.

### Algoritmo

1. `OfflineAudioContext(1, 1, 16000).decodeAudioData(arrayBuffer)` — decodifica em PCM 16kHz mono (reduz memória, casa com sample rate interno do whisper)
2. Slice do `AudioBuffer` em N chunks de `chunkDurationMin * 60` segundos
3. Encode cada chunk em WAV 16-bit PCM (header 44 bytes + PCM16) → Blob
4. POST sequencial pra `/v1/audio/transcriptions` com `response_format=srt` (whisper) ou `diarized_json` (diarize)
5. Merge dos outputs:
   - **SRT:** parse, offset timestamps por `i * chunkDurationMin * 60`, renumerar índices, concatenar
   - **Diarized JSON:** concatenar segmentos, offsetear `start`/`end`

### Teste-piloto realizado (2026-04-14)

- Decode 75min webm → PCM 16kHz mono: **7.4s**
- Slice em 8 chunks de 10min: instantâneo
- Encode WAV 16-bit PCM: **90ms** por chunk
- Tamanho do chunk 10min WAV 16kHz mono: **18.31MB** (margem de 6.7MB vs limite de 25MB)
- POST do chunk 40-50min (região problemática) → HTTP 200, 26.4s, **118 entradas com texto real**

### Memória esperada

75min decoded 16kHz mono float32 ≈ **288MB de pico** durante decode.
- Desktop Electron: sem problema
- iPhone ≥ 2019 / Android ≥ 4GB RAM: aguentam
- iPhone < 2019 (2GB RAM): risco em áudios > 60min — **limitação aceita**, documentar no README

### Limitação conhecida: consistência de falantes entre chunks (diarize)

Cada chunk é chamada independente. `Speaker A` do chunk 1 pode não ser o mesmo do chunk 2. Mitigações possíveis (fora de escopo): voice fingerprinting local, ou `known_speaker_names[]` da API exigindo nomes pré-definidos.

Em reuniões típicas (3-5 participantes), a ordem de fala costuma se manter razoavelmente consistente.

## Settings a adicionar

```ts
transcriptionModel: "auto" | "whisper-1" | "gpt-4o-transcribe-diarize"  // default "auto"
chunkDurationMin: number  // default 10 (18.31MB por chunk, dentro do limite de 25MB)
```

Roteamento em `auto`:
- duração ≤ 1400s → diarize single-call (falantes + sem chunking)
- duração > 1400s → whisper-1 chunked com prompt mitigante

Override explícito sempre respeitado. Sem hardcode — segue regra de `CLAUDE.md`.

## Arquivos a modificar/criar (quando implementar)

### `src/audio-chunking.ts` (novo)
Funções puras:
- `decodeAudioToBuffer(blob: Blob, targetSampleRate = 16000): Promise<AudioBuffer>`
- `sliceBufferToChunks(buffer: AudioBuffer, chunkSec: number): AudioBuffer[]`
- `encodeWav16(buffer: AudioBuffer): Blob`

### `src/file-utils.ts`
Adicionar `getAudioDurationSec(blob: Blob): Promise<number | null>` usando HTML5 `<audio>` — funciona desktop e mobile, testado em Playwright com webm de 75min (retornou 4489.132s, ~0.05s de diferença do ffmpeg, em ~300ms).

### `src/transcribe.ts`
Expandir com:
- Roteamento por modelo/duração
- Branch diarize: single-call + `diarizedToSrt` + `diarizedToMd` (mesclar segmentos consecutivos do mesmo speaker)
- Branch whisper-1 chunked: decode → slice → encode → POST sequencial → `mergeSrts`
- Retry 1x por chunk com delay 2s; placeholder `[chunk N falhou]` se 2ª falha, continua

### `src/settings.ts`
- Dropdown `transcriptionModel`
- Campo numérico `chunkDurationMin`

## Verificação (quando implementar)

1. Build `npm run build` limpo
2. Áudio 5min em `auto` → diarize single-call, `.srt` + `.md` com falantes
3. Áudio 75min em `auto` → whisper-1 chunked (8 chunks), notice de progresso, `.srt` merged cobre 00:00–01:14:49, nenhum `...` contíguo
4. Override explícito `gpt-4o-transcribe-diarize` em áudio 75min → chunked diarize, `.md` com blocos `**Speaker A:** ...`
5. Mobile (iOS Simulator ou device): áudio 30min → chunking Web Audio funciona, memória OK
6. Regressão mobile curto: áudio 10min iOS em `auto` → diarize single-call igual desktop
7. Playwright end-to-end com o `2026-04-14_15h18m13s.webm` + mock da OpenAI → SRT válido, timestamps crescentes

## Fora de escopo

- Detecção de silêncios pra cortar em fronteiras naturais (complexo; prompt + chunks curtos já mitigam)
- Chunking paralelo (rate limit OpenAI 3-50 RPM dependendo do tier; sequencial é seguro)
- Detecção de loop dentro de chunk (chunks curtos + prompt é defesa suficiente)
- Providers alternativos (Groq, AssemblyAI, etc.)
- iPhones < 2019 transcrevendo > 60min (limitação aceita)
- Correlação de speakers entre chunks (voice fingerprinting)

## Fatos verificados neste trabalho (2026-04-14)

1. `gpt-4o-transcribe*` limite duro 1400s (API rejeitou áudio de 4489s).
2. `whisper-1` sem prompt: 1008/2063 `...` após 00:41:26 no áudio de 75min.
3. `whisper-1` com prompt mitigante: 0 `...` em 1970 segmentos, fala real até o fim.
4. Community: hallucinations disparadas por silêncios/cortes, não por duração absoluta.
5. Web Audio `decodeAudioData` funciona em webm do MediaRecorder. `<audio>.duration` funciona em desktop e mobile.
6. Chunk de 10min WAV 16kHz mono = 18.31MB (abaixo de 25MB).
7. POST chunk da região problemática pro whisper-1 retornou texto real em 26.4s.

## Referências

- [OpenAI community: how to avoid hallucinations in whisper](https://community.openai.com/t/how-to-avoid-hallucinations-in-whisper-transcriptions/125300)
- [whisper/discussions/29 — stops working after long gap](https://github.com/openai/whisper/discussions/29)
- [OpenAI community: gpt-4o-transcribe audio length limits](https://community.openai.com/t/gpt-4o-transcribe-audio-length-limits/1148374)
- [OpenAI community: gpt-4.0-transcribe max 1500 seconds](https://community.openai.com/t/gpt4-0-transcribe-max-1500-seconds/1306684)
