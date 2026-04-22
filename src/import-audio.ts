import { Notice, Platform, TFile } from "obsidian";
import type MeetingToolsPlugin from "./main";
import { baseName, ensureFolder, saveArrayBufferToVault } from "./file-utils";
import { t } from "./i18n";

const WHISPER_MAX_BYTES = 25 * 1024 * 1024; // 25MB

function getVaultBasePath(app: any): string {
  try {
    const ad = app.vault?.adapter;
    return ad?.basePath || (typeof ad?.getBasePath === "function" ? ad.getBasePath() : "");
  } catch { return ""; }
}

const FFMPEG_PATHS = [
  "/opt/homebrew/bin/ffmpeg",
  "/usr/local/bin/ffmpeg",
  "/usr/bin/ffmpeg",
  "ffmpeg",
];

let resolvedFfmpegPath: string | null = null;

async function findFfmpeg(): Promise<string | null> {
  if (resolvedFfmpegPath) return resolvedFfmpegPath;
  const { execFile } = require("child_process") as typeof import("child_process");
  for (const p of FFMPEG_PATHS) {
    const ok = await new Promise<boolean>((resolve) => {
      execFile(p, ["-version"], { timeout: 5000 }, (err: any) => resolve(!err));
    });
    if (ok) {
      resolvedFfmpegPath = p;
      return p;
    }
  }
  return null;
}

function runFfmpeg(ffmpegPath: string, args: string[]): Promise<{ code: number; stderr: string }> {
  return new Promise((resolve) => {
    const { execFile } = require("child_process") as typeof import("child_process");
    execFile(ffmpegPath, args, { timeout: 300000 }, (err: any, _stdout: string, stderr: string) => {
      resolve({ code: err ? (err.code ?? 1) : 0, stderr: stderr || "" });
    });
  });
}

export async function importAudio(
  plugin: MeetingToolsPlugin
): Promise<string | null> {
  const { app, settings } = plugin;

  const chosen = await new Promise<File | null>((resolve) => {
    const picker = document.createElement("input");
    picker.type = "file";
    picker.accept = "audio/*,.m4a,.mp3,.wav,.ogg,.webm,.mp4";
    picker.style.display = "none";
    document.body.appendChild(picker);

    let resolved = false;
    const cleanup = () => {
      if (resolved) return;
      resolved = true;
      try { document.body.removeChild(picker); } catch {}
      resolve(null);
    };

    picker.onchange = (e: Event) => {
      resolved = true;
      try { document.body.removeChild(picker); } catch {}
      const target = e.target as HTMLInputElement;
      resolve(target.files?.[0] ?? null);
    };

    picker.addEventListener("cancel", cleanup);
    window.addEventListener("focus", () => setTimeout(cleanup, 300), { once: true });
    picker.click();
  });

  if (!chosen) {
    new Notice(t().noticeImportCancelled);
    return null;
  }

  await ensureFolder(app, settings.audioDir);
  const buf = await chosen.arrayBuffer();

  if (buf.byteLength <= WHISPER_MAX_BYTES) {
    const savedPath = await saveArrayBufferToVault(app, settings.audioDir, chosen.name, buf);
    const sizeKB = Math.round(buf.byteLength / 1024);
    new Notice(t().noticeAudioImported(savedPath, sizeKB));
    return savedPath;
  }

  const originalMB = (buf.byteLength / (1024 * 1024)).toFixed(1);

  if (Platform.isMobile) {
    new Notice(t().noticeAudioTooLargeMobile(originalMB));
    return null;
  }

  const ffmpegPath = await findFfmpeg();
  if (!ffmpegPath) {
    new Notice(t().noticeFfmpegMissing);
    return null;
  }

  new Notice(t().noticeLargeAudioCompressing(originalMB));

  // Save original to temp location in vault
  const tempPath = await saveArrayBufferToVault(app, settings.audioDir, chosen.name, buf);

  const vaultAbs = getVaultBasePath(app);
  if (!vaultAbs) {
    new Notice(t().noticeVaultPathMissing);
    return tempPath;
  }

  const srcAbs = `${vaultAbs}/${tempPath}`;
  const outName = baseName(chosen.name) + ".webm";
  const outRel = `${settings.audioDir}/${outName}`;
  const outAbs = `${vaultAbs}/${outRel}`;

  const result = await runFfmpeg(ffmpegPath, [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", srcAbs,
    "-vn", "-ac", "1", "-ar", "16000",
    "-c:a", "libopus", "-b:a", "12k",
    "-vbr", "on", "-application", "voip", "-frame_duration", "60",
    outAbs,
  ]);

  if (result.code !== 0) {
    console.error("[MeetingTools] ffmpeg error:", result.stderr);
    new Notice(t().noticeFfmpegFailed);
    return tempPath;
  }

  // Wait for vault to detect new file
  await new Promise((r) => setTimeout(r, 500));

  const webmFile = app.vault.getAbstractFileByPath(outRel);
  const tempFile = app.vault.getAbstractFileByPath(tempPath);

  if (webmFile instanceof TFile) {
    const compressedMB = (webmFile.stat.size / (1024 * 1024)).toFixed(1);
    new Notice(t().noticeCompressed(originalMB, compressedMB));
    if (tempFile instanceof TFile && tempPath !== outRel) {
      await app.vault.trash(tempFile, true);
    }
    return outRel;
  }

  new Notice(t().noticeCompressedFileMissing);
  return tempPath;
}
