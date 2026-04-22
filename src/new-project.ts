import { Notice, Platform, requestUrl, TFile } from "obsidian";
import type MeetingToolsPlugin from "./main";
import { ensureFolder, saveArrayBufferToVault, showApiKeyMissingNotice } from "./file-utils";
import { PreviewModal } from "./modals";
import { NEW_PROJECT_PROMPT } from "./prompts";
import { resolveLanguageInstruction, t } from "./i18n";
import { parseOpenAIError } from "./openai-errors";

/**
 * Extracts text from a File object based on its type.
 * - TXT/MD: direct read
 * - PDF: uses pdftotext CLI (poppler) for reliable extraction
 * - PPTX: decompresses ZIP with Node zlib, parses XML slides
 * - PPT (legacy binary): not supported, instructs user to convert
 */
async function extractTextFromFile(
  file: File,
  vaultBasePath: string
): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".txt") || name.endsWith(".md")) {
    return await file.text();
  }

  if (name.endsWith(".pdf")) {
    const buf = await file.arrayBuffer();
    return await extractTextFromPdf(buf, vaultBasePath, file.name);
  }

  if (name.endsWith(".pptx")) {
    const buf = await file.arrayBuffer();
    return extractTextFromPptx(buf);
  }

  if (name.endsWith(".ppt")) {
    throw new Error(
      "Formato .ppt (legacy) não é suportado. Salve como .pptx no PowerPoint e tente novamente."
    );
  }

  return await file.text();
}

/**
 * PDF text extraction via pdftotext CLI (poppler-utils).
 * Writes the buffer to a temp file, runs pdftotext, reads output.
 * Falls back to basic regex if pdftotext is not installed.
 */
async function extractTextFromPdf(
  buf: ArrayBuffer,
  vaultBasePath: string,
  originalName: string
): Promise<string> {
  const fs = require("fs") as typeof import("fs");
  const path = require("path") as typeof import("path");
  const { execFile } = require("child_process") as typeof import("child_process");
  const os = require("os") as typeof import("os");

  const tmpDir = os.tmpdir();
  const tmpPdf = path.join(tmpDir, `meeting-tools-${Date.now()}.pdf`);
  const tmpTxt = tmpPdf.replace(".pdf", ".txt");

  try {
    // Write PDF to temp
    fs.writeFileSync(tmpPdf, Buffer.from(buf));

    // Try pdftotext
    const result = await new Promise<string>((resolve, reject) => {
      execFile(
        "pdftotext",
        ["-layout", tmpPdf, tmpTxt],
        { timeout: 30000 },
        (err: any) => {
          if (err) {
            reject(err);
            return;
          }
          try {
            const text = fs.readFileSync(tmpTxt, "utf-8");
            resolve(text);
          } catch (readErr: any) {
            reject(readErr);
          }
        }
      );
    });

    return result.trim();
  } catch (e: any) {
    console.warn("[MeetingTools] pdftotext failed, using fallback:", e.message);
    // Fallback: regex extraction from raw PDF bytes
    return extractTextFromPdfFallback(buf);
  } finally {
    // Cleanup temp files
    try { fs.unlinkSync(tmpPdf); } catch {}
    try { fs.unlinkSync(tmpTxt); } catch {}
  }
}

function extractTextFromPdfFallback(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let raw = "";
  for (let i = 0; i < bytes.length; i++) {
    raw += String.fromCharCode(bytes[i]);
  }
  const textParts: string[] = [];
  const btEtRegex = /BT\s([\s\S]*?)ET/g;
  let match;
  while ((match = btEtRegex.exec(raw)) !== null) {
    const block = match[1];
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      textParts.push(tjMatch[1]);
    }
    const tjArrayRegex = /\[([^\]]*)\]\s*TJ/gi;
    let arrMatch;
    while ((arrMatch = tjArrayRegex.exec(block)) !== null) {
      const innerArr = arrMatch[1];
      const strRegex = /\(([^)]*)\)/g;
      let sMatch;
      while ((sMatch = strRegex.exec(innerArr)) !== null) {
        textParts.push(sMatch[1]);
      }
    }
  }
  return textParts.join(" ").replace(/\s{2,}/g, " ").trim();
}

/**
 * PPTX text extraction.
 * PPTX is a ZIP (PK header). We decompress using Node's zlib,
 * find slide XML files, and extract <a:t> text runs.
 */
function extractTextFromPptx(buf: ArrayBuffer): string {
  const zlib = require("zlib") as typeof import("zlib");
  const data = Buffer.from(buf);

  // Parse ZIP central directory to find slide XML entries
  const files = parseZipEntries(data);
  const slideFiles = files
    .filter((f) => /^ppt\/slides\/slide\d+\.xml$/i.test(f.name))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  if (slideFiles.length === 0) {
    throw new Error(t().errorNoPptxSlides);
  }

  const textParts: string[] = [];

  for (const entry of slideFiles) {
    let xml: string;
    if (entry.compressionMethod === 0) {
      // Stored (no compression)
      xml = entry.data.toString("utf-8");
    } else {
      // Deflated
      xml = zlib.inflateRawSync(entry.data).toString("utf-8");
    }

    // Extract text from <a:t>...</a:t> tags
    const tagRegex = /<a:t>([^<]*)<\/a:t>/g;
    let match;
    while ((match = tagRegex.exec(xml)) !== null) {
      const text = match[1].trim();
      if (text) textParts.push(text);
    }
  }

  if (textParts.length === 0) {
    throw new Error(t().errorNoPptxText);
  }

  return textParts.join(" ");
}

interface ZipEntry {
  name: string;
  compressionMethod: number;
  data: Buffer;
}

/**
 * Minimal ZIP parser — reads local file headers to extract entries.
 * Supports Store (0) and Deflate (8) methods.
 */
function parseZipEntries(buf: Buffer): ZipEntry[] {
  const entries: ZipEntry[] = [];
  let offset = 0;

  while (offset < buf.length - 4) {
    // Local file header signature = 0x04034b50 (PK\x03\x04)
    const sig = buf.readUInt32LE(offset);
    if (sig !== 0x04034b50) break;

    const compressionMethod = buf.readUInt16LE(offset + 8);
    const compressedSize = buf.readUInt32LE(offset + 18);
    const fileNameLength = buf.readUInt16LE(offset + 26);
    const extraFieldLength = buf.readUInt16LE(offset + 28);

    const fileName = buf.toString("utf-8", offset + 30, offset + 30 + fileNameLength);
    const dataStart = offset + 30 + fileNameLength + extraFieldLength;
    const data = buf.subarray(dataStart, dataStart + compressedSize);

    entries.push({ name: fileName, compressionMethod, data });

    offset = dataStart + compressedSize;
  }

  return entries;
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

export async function newProjectFromDocument(
  plugin: MeetingToolsPlugin
): Promise<void> {
  const { app, settings } = plugin;
  const apiKey = plugin.getApiKey();
  if (!apiKey) {
    showApiKeyMissingNotice(plugin);
    return;
  }

  // File picker
  const chosen = await new Promise<File | null>((resolve) => {
    const picker = document.createElement("input");
    picker.type = "file";
    picker.accept = ".pdf,.pptx,.ppt,.txt,.md";
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
    new Notice(t().noticeOperationCancelled);
    return;
  }

  const ext = chosen.name.split(".").pop()?.toLowerCase() || "";
  if (Platform.isMobile && ["pdf", "pptx", "ppt"].includes(ext)) {
    new Notice(t().noticeDesktopOnlyExtract);
    return;
  }

  new Notice(t().noticeReadingDocument(chosen.name));

  // Get vault base path for temp file operations
  const adapter = app.vault.adapter as any;
  const vaultBasePath: string =
    adapter?.basePath ||
    (typeof adapter?.getBasePath === "function" ? adapter.getBasePath() : "");

  // Extract text
  let docText: string;
  try {
    docText = await extractTextFromFile(chosen, vaultBasePath);
  } catch (e: any) {
    new Notice(t().noticeDocumentReadError(e.message));
    console.error("[MeetingTools]", e);
    return;
  }

  if (!docText || docText.trim().length < 20) {
    new Notice(t().noticeDocumentTextTooShort);
    return;
  }

  // Save original document to vault
  const projectsDir = "Vault/Projects";
  const documentsDir = "Vault/Projects/Documents";
  await ensureFolder(app, projectsDir);
  await ensureFolder(app, documentsDir);
  const docBuf = await chosen.arrayBuffer();
  const savedDocPath = await saveArrayBufferToVault(
    app,
    documentsDir,
    chosen.name,
    docBuf
  );
  console.log("[MeetingTools] Documento salvo em:", savedDocPath);
  new Notice(t().noticeDocumentSaved(savedDocPath));

  new Notice(t().noticeGeneratingProjectNote);

  const systemPrompt =
    resolveLanguageInstruction(settings.outputLanguage) +
    "\n\n" +
    NEW_PROJECT_PROMPT;

  let res;
  try {
    res = await requestUrl({
      url: "https://api.openai.com/v1/chat/completions",
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: settings.summaryModel,
        temperature: 0.0,
        top_p: 1,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: docText.slice(0, 120000) },
        ],
      }),
      throw: false,
    });
  } catch (e) {
    const err = parseOpenAIError(null, e);
    console.error("[MeetingTools] OpenAI network error:", err);
    new Notice(err.friendly, 10000);
    return;
  }

  if (res.status >= 400 || res.json?.error) {
    const err = parseOpenAIError({ status: res.status, json: res.json, text: res.text });
    console.error("[MeetingTools] New project error:", err);
    new Notice(err.friendly, 10000);
    return;
  }

  let projectContent = res.json?.choices?.[0]?.message?.content ?? "";
  if (!projectContent) {
    new Notice(t().noticeLlmEmpty);
    return;
  }

  // Append document embed and meeting history query
  projectContent += `

## Documentos Base
- ![[${savedDocPath.split("/").pop()}]]

## Task List


## Histórico de Reuniões
\`\`\`meeting-history
\`\`\`
`;

  if (settings.showPreview) {
    const modal = new PreviewModal(app, t().modalPreview, projectContent);
    modal.open();
    const result = await modal.waitForResult();
    if (result === null) return;
    projectContent = result;
  }

  // Extract project name from first heading
  const nameMatch = projectContent.match(/^#\s+(.+)$/m);
  const projectName = nameMatch
    ? sanitizeFileName(nameMatch[1])
    : sanitizeFileName(chosen.name.replace(/\.[^.]+$/, ""));

  // Save project note
  const projectPath = `${projectsDir}/${projectName}.md`;
  const existing = app.vault.getAbstractFileByPath(projectPath);
  if (existing instanceof TFile) {
    await app.vault.modify(existing, projectContent);
  } else {
    await app.vault.create(projectPath, projectContent);
  }

  new Notice(t().noticeProjectCreated(projectPath));

  // Open the new project note
  const newFile = app.vault.getAbstractFileByPath(projectPath);
  if (newFile instanceof TFile) {
    await app.workspace.getLeaf(false).openFile(newFile);
  }
}
