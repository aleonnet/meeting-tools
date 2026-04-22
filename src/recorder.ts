import { MarkdownView, Notice } from "obsidian";
import type MeetingToolsPlugin from "./main";
import { ensureFolder } from "./file-utils";
import { transcribeAudio } from "./transcribe";
import { t } from "./i18n";

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let recordingStartTime: number = 0;
let pausedDuration: number = 0;
let pauseStartTime: number = 0;
let timerInterval: ReturnType<typeof setInterval> | null = null;
let bannerEl: HTMLElement | null = null;
let cancelled = false;

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function getElapsed(): number {
  if (!recordingStartTime) return 0;
  const now = Date.now();
  const paused = mediaRecorder?.state === "paused" ? now - pauseStartTime : 0;
  return now - recordingStartTime - pausedDuration - paused;
}

export function isRecording(): boolean {
  return mediaRecorder !== null && (mediaRecorder.state === "recording" || mediaRecorder.state === "paused");
}

export async function startRecordingWithControls(plugin: MeetingToolsPlugin): Promise<void> {
  if (isRecording()) {
    new Notice(t().noticeRecordingInProgress);
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mimeTypes = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
    ];
    let mimeType = "";
    for (const mt of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mt)) {
        mimeType = mt;
        break;
      }
    }

    audioChunks = [];
    cancelled = false;
    pausedDuration = 0;
    pauseStartTime = 0;

    mediaRecorder = new MediaRecorder(stream, {
      ...(mimeType ? { mimeType } : {}),
      audioBitsPerSecond: 16000,
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      clearTimer();
      removeBanner();

      if (cancelled) {
        new Notice(t().noticeRecordingCancelled);
        mediaRecorder = null;
        return;
      }

      const blob = new Blob(audioChunks, {
        type: mediaRecorder?.mimeType || "audio/webm",
      });
      const ext = (mediaRecorder?.mimeType || "").includes("mp4") ? "m4a" : "webm";

      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const fileName = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}h${pad(now.getMinutes())}m${pad(now.getSeconds())}s.${ext}`;

      await ensureFolder(plugin.app, plugin.settings.audioDir);
      const arrayBuf = await blob.arrayBuffer();
      const filePath = `${plugin.settings.audioDir}/${fileName}`;

      await (plugin.app.vault.adapter as any).writeBinary(
        filePath,
        new Uint8Array(arrayBuf)
      );

      const duration = formatDuration(getElapsed());
      const sizeKB = Math.round(arrayBuf.byteLength / 1024);
      new Notice(t().noticeRecordingSaved(fileName, duration, sizeKB));

      mediaRecorder = null;

      new Notice(t().noticeStartAutoTranscribe);
      try {
        const result = await transcribeAudio(plugin, filePath);
        if (result) {
          new Notice(t().noticeTranscribeComplete(result.mdPath || result.srtPath));
        }
      } catch (e: any) {
        new Notice(t().noticeTranscribeError(e.message));
        console.error("[MeetingTools] Auto-transcribe error:", e);
      }
    };

    mediaRecorder.start(1000);
    recordingStartTime = Date.now();

    showBanner(plugin);
    startTimer();

    new Notice(t().noticeRecordingStarted);
  } catch (e: any) {
    new Notice(t().noticeRecordingError(e.message));
    console.error("[MeetingTools] Recording error:", e);
  }
}

// --- Banner ---

function showBanner(plugin: MeetingToolsPlugin): void {
  const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
  if (!view?.containerEl) return;

  removeBanner();

  bannerEl = document.createElement("div");
  bannerEl.className = "mt-record-banner";

  const s = t();
  const destLine = document.createElement("span");
  destLine.className = "mt-record-dest";
  destLine.textContent = s.recordSavingTo(plugin.settings.audioDir);
  bannerEl.appendChild(destLine);

  const timerSpan = document.createElement("span");
  timerSpan.className = "mt-record-timer";
  timerSpan.textContent = s.recordTimerRecording("00:00");
  bannerEl.appendChild(timerSpan);

  const btnRow = document.createElement("div");
  btnRow.className = "mt-record-buttons";

  const pauseBtn = document.createElement("button");
  pauseBtn.textContent = s.btnPause;
  pauseBtn.className = "mt-record-btn";
  pauseBtn.addEventListener("click", () => {
    if (!mediaRecorder) return;
    if (mediaRecorder.state === "recording") {
      mediaRecorder.pause();
      pauseStartTime = Date.now();
      pauseBtn.textContent = s.btnResume;
      timerSpan.textContent = s.recordTimerPaused(formatDuration(getElapsed()));
    } else if (mediaRecorder.state === "paused") {
      pausedDuration += Date.now() - pauseStartTime;
      pauseStartTime = 0;
      mediaRecorder.resume();
      pauseBtn.textContent = s.btnPause;
    }
  });

  const stopBtn = document.createElement("button");
  stopBtn.textContent = s.btnStop;
  stopBtn.className = "mt-record-btn mt-record-btn-stop";
  stopBtn.addEventListener("click", () => {
    if (!mediaRecorder) return;
    cancelled = false;
    mediaRecorder.stop();
  });

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = s.btnCancel;
  cancelBtn.className = "mt-record-btn mt-record-btn-cancel";
  cancelBtn.addEventListener("click", () => {
    if (!mediaRecorder) return;
    cancelled = true;
    mediaRecorder.stop();
  });

  btnRow.appendChild(pauseBtn);
  btnRow.appendChild(stopBtn);
  btnRow.appendChild(cancelBtn);
  bannerEl.appendChild(btnRow);

  view.containerEl.prepend(bannerEl);
}

function removeBanner(): void {
  if (bannerEl) {
    bannerEl.remove();
    bannerEl = null;
  }
}

function updateBannerTimer(): void {
  if (!bannerEl || !mediaRecorder) return;
  const timerSpan = bannerEl.querySelector(".mt-record-timer");
  if (!timerSpan) return;
  if (mediaRecorder.state === "recording") {
    timerSpan.textContent = t().recordTimerRecording(formatDuration(getElapsed()));
  }
}

// --- Timer ---

function startTimer(): void {
  clearTimer();
  timerInterval = setInterval(updateBannerTimer, 1000);
}

function clearTimer(): void {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}
