import { t } from "./i18n";

/**
 * Structured representation of an OpenAI API failure. Produced by parseOpenAIError().
 */
export interface ParsedOpenAIError {
  status: number | null;
  code: string | null;
  message: string;
  friendly: string;
}

interface ResponseLike {
  status: number;
  json?: unknown;
  text?: string;
}

const OPENAI_RETRY_REGEX = /try again in (\d+(?:\.\d+)?)\s*(ms|s)?/i;

function extractRetryAfterSec(msg: string): number | null {
  const m = msg.match(OPENAI_RETRY_REGEX);
  if (!m) return null;
  const value = parseFloat(m[1]);
  const unit = (m[2] || "s").toLowerCase();
  const sec = unit === "ms" ? value / 1000 : value;
  // Round up so user sees a natural retry window (≥ 1s for UX).
  return Math.max(1, Math.ceil(sec));
}

/**
 * Reads the OpenAI error body (whether from requestUrl({throw:false}) response
 * or from a native fetch response), then maps to a localized, actionable
 * friendly message.
 *
 * Call sites:
 *   - Chat completions (summarize, mindmap, extract-tasks, new-project)
 *   - Audio transcription (whisper-1, gpt-4o-transcribe-diarize)
 *
 * Network errors (no HTTP response) should pass `response=null, rawError=<err>`.
 */
export function parseOpenAIError(
  response: ResponseLike | null,
  rawError?: unknown
): ParsedOpenAIError {
  if (response === null) {
    return {
      status: null,
      code: null,
      message: rawError instanceof Error ? rawError.message : String(rawError ?? ""),
      friendly: t().openaiErrorNetwork,
    };
  }

  const status = response.status;
  const body = response.json as any;
  const errObj = body?.error;
  const code: string | null = errObj?.code ?? errObj?.type ?? null;
  const message: string =
    errObj?.message ?? (typeof response.text === "string" ? response.text : "") ?? "";

  const s = t();
  let friendly: string;

  if (status === 401) {
    friendly = s.openaiErrorInvalidKey;
  } else if (status === 403) {
    friendly = s.openaiErrorForbidden;
  } else if (status === 404) {
    // Try to extract model name from "The model `gpt-99` does not exist..."
    const m = message.match(/model\s+[`'"]?([\w.\-:/]+)[`'"]?/i);
    const model = m ? m[1] : "?";
    friendly = s.openaiErrorModelNotFound(model);
  } else if (status === 413) {
    friendly = s.openaiErrorPayloadTooLarge;
  } else if (status === 422 || code === "content_filter") {
    friendly = s.openaiErrorContentFilter;
  } else if (status === 429) {
    if (code === "insufficient_quota") {
      friendly = s.openaiErrorQuotaExceeded;
    } else if (
      code === "tokens_exceeded" ||
      code === "tokens" ||
      /tokens per minute/i.test(message)
    ) {
      friendly = s.openaiErrorTokensPerMinute;
    } else {
      friendly = s.openaiErrorRateLimit(extractRetryAfterSec(message));
    }
  } else if (status >= 400 && status < 500) {
    friendly = s.openaiErrorBadRequest(message || String(status));
  } else if (status === 500) {
    friendly = s.openaiErrorServerError;
  } else if (status === 502 || status === 503 || status === 504) {
    friendly = s.openaiErrorServiceUnavailable;
  } else {
    friendly = s.openaiErrorUnknown(status, message || "(no message)");
  }

  return { status, code, message, friendly };
}

/**
 * Convenience getter for the friendly message when callers only care about the
 * text to display.
 */
export function formatOpenAIError(e: ParsedOpenAIError): string {
  return e.friendly;
}
