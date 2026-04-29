import { Notice, requestUrl, TFile } from "obsidian";
import type MeetingToolsPlugin from "./main";
import {
  ContextResult,
  srtToPlainText,
  insertAtCursor,
  insertAfterContext,
  showApiKeyMissingNotice,
} from "./file-utils";
import { PreviewModal } from "./modals";
import { TranscriptSuggestModal } from "./modals";
import {
  findArtifactById,
  getArtifactContent,
} from "./vault-templates";
import { loadTemplate, substitute } from "./templates";
import { resolveLanguageInstruction, t } from "./i18n";
import { buildTaskContextPreamble, detectMeetingContext } from "./task-context";
import { parseOpenAIError } from "./openai-errors";
import {
  TASK_EXTRACTION_RULES,
  TASK_ITEM_SCHEMA,
  renderValidatedTasksAsMarkdown,
  type OwnerType,
  type ValidatedTask,
} from "./task-extractor";

/**
 * Combined schema for the hybrid 1-call summarize:
 *   - `freeform_markdown`: the model fills the user's template (free format).
 *   - `tasks`: structured action items with the SAME schema as the standalone
 *              extract-tasks command (single source of truth: TASK_ITEM_SCHEMA).
 *
 * Why hybrid: the user wants summary structure controlled by their template
 * (free), but tasks have a strict format the rest of the plugin parses
 * (task-parser, dashboards). Having both fields in one schema lets us do
 * both in a SINGLE OpenAI call — no second round-trip — while still getting
 * the same evidence_quote validation that protects against hallucinations.
 */
const SUMMARY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["freeform_markdown", "tasks"],
  properties: {
    freeform_markdown: {
      type: "string",
      description:
        "The full meeting summary as markdown, following the template provided in the user message. Wherever the literal token {{action_items_block}} appears in the template, KEEP IT VERBATIM (do not generate any action item bullets in this field — they will be inserted programmatically).",
    },
    tasks: {
      type: "array",
      items: TASK_ITEM_SCHEMA,
    },
  },
};

const ACTION_ITEMS_PLACEHOLDER = "{{action_items_block}}";

interface StructuredSummaryResponse {
  freeform_markdown: string;
  tasks: unknown[];
}

async function openaiChatStructured(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userContent: string
): Promise<StructuredSummaryResponse> {
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
        model,
        temperature: 0.0,
        top_p: 1,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "meeting_summary",
            strict: true,
            schema: SUMMARY_SCHEMA,
          },
        },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
      }),
      throw: false,
    });
  } catch (e) {
    const err = parseOpenAIError(null, e);
    console.error("[MeetingTools] summarize network error:", err);
    new Notice(err.friendly, 10000);
    throw new Error(err.code ?? "network_error");
  }
  if (res.status >= 400 || res.json?.error) {
    const err = parseOpenAIError({ status: res.status, json: res.json, text: res.text });
    console.error("[MeetingTools] summarize error:", err);
    new Notice(err.friendly, 10000);
    throw new Error(err.code ?? "openai_error");
  }
  const content = res.json?.choices?.[0]?.message?.content ?? "{}";
  let parsed: StructuredSummaryResponse;
  try {
    parsed = JSON.parse(content);
  } catch {
    console.error("[MeetingTools] summarize failed to parse JSON:", content);
    return { freeform_markdown: "", tasks: [] };
  }
  return {
    freeform_markdown: String(parsed.freeform_markdown ?? ""),
    tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
  };
}

export async function summarizeTranscript(
  plugin: MeetingToolsPlugin,
  transcriptPath?: string,
  context?: ContextResult
): Promise<void> {
  const { app, settings } = plugin;
  const apiKey = plugin.getApiKey();
  if (!apiKey) {
    showApiKeyMissingNotice(plugin);
    return;
  }

  let plain: string;

  if (context) {
    plain = context.text;
  } else if (transcriptPath) {
    const file = app.vault.getAbstractFileByPath(transcriptPath);
    if (!file || !(file instanceof TFile)) {
      new Notice(t().noticeFileNotFound(transcriptPath));
      return;
    }
    const raw = await app.vault.read(file);
    const ext = (file.extension || "").toLowerCase();
    plain = ext === "srt" ? srtToPlainText(raw) : raw;
  } else {
    const path = await new Promise<string | null>((resolve) => {
      new TranscriptSuggestModal(app, settings.transcriptsDir, (p) =>
        resolve(p)
      ).open();
    });
    if (!path) return;
    const file = app.vault.getAbstractFileByPath(path);
    if (!file || !(file instanceof TFile)) {
      new Notice(t().noticeFileNotFound(path));
      return;
    }
    const raw = await app.vault.read(file);
    const ext = (file.extension || "").toLowerCase();
    plain = ext === "srt" ? srtToPlainText(raw) : raw;
  }

  const wc = plain.trim().split(/\s+/).filter(Boolean).length;

  let finalText: string;

  if (wc < settings.minWordsForSummary) {
    finalText = t().summaryShortFallback(settings.userName);
  } else {
    new Notice(t().noticeGeneratingSummary);

    // Load the user's summary template (or built-in default). The template
    // controls the freeform structure (sections, headings, ordering) — only
    // the action items block is replaced by deterministically-rendered tasks.
    const summaryArtifact = findArtifactById("summary-template");
    const embeddedDefault = summaryArtifact
      ? getArtifactContent(summaryArtifact)
      : "";
    const tpl = await loadTemplate(
      app,
      settings.summaryTemplatePath,
      embeddedDefault
    );
    const meetingContext = detectMeetingContext(plugin);

    // Substitute regular placeholders. {{action_items_block}} is intentionally
    // NOT in the vars map — it stays literal in the rendered template, gets
    // sent to the model as part of the user message, and the model is told to
    // preserve it verbatim. After the call we replace it with rendered tasks.
    const renderedTemplate = substitute(tpl, {
      language_instruction: resolveLanguageInstruction(settings.outputLanguage),
      user_name: settings.userName,
      task_context: buildTaskContextPreamble(meetingContext),
      transcript: plain.slice(-120000),
    });

    const systemPrompt = buildSystemPrompt();

    let response: StructuredSummaryResponse;
    try {
      response = await openaiChatStructured(
        apiKey,
        settings.summaryModel,
        systemPrompt,
        renderedTemplate
      );
    } catch {
      // openaiChatStructured already showed its own Notice on API errors.
      return;
    }

    if (!response.freeform_markdown) {
      new Notice(t().noticeSummaryEmpty);
      return;
    }

    const tasks = coerceSummaryTasks(response.tasks);
    const tasksMarkdown = renderTasks(tasks, meetingContext);
    finalText = injectActionItems(response.freeform_markdown, tasksMarkdown);
  }

  if (settings.showPreview) {
    const modal = new PreviewModal(app, t().modalPreview, finalText);
    modal.open();
    const result = await modal.waitForResult();
    if (result === null) return;
    finalText = result;
  }

  const inserted = context
    ? insertAfterContext(app, finalText, context)
    : insertAtCursor(app, finalText);
  if (inserted) new Notice(t().noticeSummaryInserted);
}

/**
 * Builds the system prompt that tells the model how to fill the structured
 * response. Two responsibilities, made explicit so the model treats them as
 * orthogonal: render the template (freeform) AND extract tasks (structured).
 */
function buildSystemPrompt(): string {
  return [
    "You are an executive assistant. Produce a JSON object matching the provided schema with TWO independent fields:",
    "",
    "1) `freeform_markdown` — fill the meeting summary template provided in the user message. Follow that template's structure, headings, and language. CRITICAL: wherever the literal token `" +
      ACTION_ITEMS_PLACEHOLDER +
      "` appears in the template, copy it VERBATIM into your output. Do NOT generate action item bullets there. Do NOT mention this rule in the output.",
    "",
    "2) `tasks` — extract structured action items from the transcript using the rules below.",
    "",
    TASK_EXTRACTION_RULES,
    "",
    "If no task qualifies, return tasks: []. Always produce the freeform_markdown even if tasks is empty.",
  ].join("\n");
}

/**
 * Light coercion to TS types for the JSON the OpenAI API returned. Schema
 * strict already guarantees structure — we just trim strings and normalize
 * the priority/owner_type unions. NO content validation.
 */
function coerceSummaryTasks(rawTasks: unknown[]): ValidatedTask[] {
  const out: ValidatedTask[] = [];
  for (const raw of rawTasks) {
    const c = raw as Record<string, unknown>;
    const description = String(c.description ?? "").trim();
    const owner = String(c.owner ?? "").trim();
    const evidence = String(c.evidence_quote ?? "").trim();
    const priorityRaw = String(c.priority ?? "medium");
    const priority: ValidatedTask["priority"] =
      priorityRaw === "high" || priorityRaw === "low" ? priorityRaw : "medium";
    const deadline =
      c.deadline === null || c.deadline === undefined ? null : String(c.deadline);
    const ownerTypeRaw = String(c.owner_type ?? "person");
    const owner_type: OwnerType =
      ownerTypeRaw === "team" || ownerTypeRaw === "unassigned"
        ? ownerTypeRaw
        : "person";
    if (!description || !owner) continue;
    out.push({
      description,
      owner,
      owner_type,
      evidence_quote: evidence,
      priority,
      deadline,
    });
  }
  return out;
}

/**
 * Renders validated tasks using the same path as the standalone Extract Tasks
 * command — keeps the markdown checkbox format aligned with task-parser.ts.
 */
function renderTasks(
  tasks: ValidatedTask[],
  meetingContext: ReturnType<typeof detectMeetingContext>
): string {
  const emptyMarker = "_(" + t().noticeNoTasksFound.toLowerCase() + ")_";
  return renderValidatedTasksAsMarkdown(tasks, meetingContext, emptyMarker);
}

/**
 * Substitutes the {{action_items_block}} placeholder in the model-generated
 * freeform_markdown with the deterministically-rendered tasks markdown.
 *
 * If the placeholder is missing (model dropped it, or user's template doesn't
 * include it), append the tasks under a default `## Action Items` heading so
 * they're never silently lost.
 */
function injectActionItems(freeformMarkdown: string, tasksMarkdown: string): string {
  if (freeformMarkdown.includes(ACTION_ITEMS_PLACEHOLDER)) {
    return freeformMarkdown.split(ACTION_ITEMS_PLACEHOLDER).join(tasksMarkdown);
  }
  // Fallback: placeholder missing. Append rather than lose tasks.
  return freeformMarkdown.replace(/\s+$/, "") + "\n\n## Action Items\n\n" + tasksMarkdown + "\n";
}
