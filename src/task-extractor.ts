import { Notice, requestUrl } from "obsidian";
import type MeetingToolsPlugin from "./main";
import type { MeetingContext } from "./task-context";
import { resolveLanguageInstruction, t } from "./i18n";
import { parseOpenAIError } from "./openai-errors";

/**
 * Structured task extraction via OpenAI's response_format=json_schema (strict).
 *
 * Approach: trust the briefing (TASK_EXTRACTION_RULES) and the schema. The
 * schema enforces structure (description, owner, owner_type, evidence_quote,
 * priority, deadline). The briefing guides what counts as a valid task.
 *
 * Earlier versions of this file added a deterministic validation pass that
 * checked evidence_quote and owner against the transcript. That extra pass
 * was removed because it was rejecting legitimate tasks with derived/team
 * owners (e.g. "Time de tecnologia" inferred from "perímetro de TI") faster
 * than it caught the rare hallucination. If hallucinations become a real
 * problem, validation can be reintroduced surgically — but the default is
 * to trust the model's structured output.
 */

export type OwnerType = "person" | "team" | "unassigned";

export interface ValidatedTask {
  description: string;
  owner: string;
  owner_type: OwnerType;
  evidence_quote: string;
  priority: "high" | "medium" | "low";
  deadline: string | null;
}

export interface ExtractionResult {
  tasks: ValidatedTask[];
}

/**
 * Schema for a single task object — exported so summarize.ts can embed it
 * inside its combined response_format schema (1-call hybrid summary). Both
 * paths use IDENTICAL task structure → same downstream validation.
 */
export const TASK_ITEM_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["description", "owner", "owner_type", "evidence_quote", "priority", "deadline"],
  properties: {
    description: {
      type: "string",
      description:
        "Concise, objective description of the action item, in the same language as the transcript.",
    },
    owner: {
      type: "string",
      description:
        "The owner string. For owner_type=person, this is the proper name(s) (e.g. 'Manuela', 'Ricardo, Valéria e Carlos'). For owner_type=team, this is the area/team name(s) (e.g. 'Time trabalhista', 'RH / TI / LG', 'Time de tecnologia'). For owner_type=unassigned, use 'TBD'.",
    },
    owner_type: {
      type: "string",
      enum: ["person", "team", "unassigned"],
      description:
        "person = a named individual (or several individuals); team = an area/team/department without a specific named individual; unassigned = the action is committed but the responsible person depends on a future decision.",
    },
    evidence_quote: {
      type: "string",
      description:
        "EXACT verbatim substring of the transcript that justifies this task. Must be present character-for-character (apart from whitespace). Pick the most attribution-bearing span, max ~200 chars.",
    },
    priority: { type: "string", enum: ["high", "medium", "low"] },
    deadline: {
      type: ["string", "null"],
      description: "YYYY-MM-DD if explicitly mentioned in the transcript, else null.",
    },
  },
};

/**
 * Common system instruction explaining the rules for selecting and citing
 * tasks. Exported so summarize.ts can append it to its own system prompt
 * — the rules must match exactly between standalone Extract Tasks and
 * the Summary's tasks block.
 */
export const TASK_EXTRACTION_RULES = `INCLUDE a task when ALL three are true:
1. There is an OWNER (see "OWNER TYPES" below — can be a person, a team/area, or unassigned).
2. A COMMITMENT VERB applied to the owner. Accepted in PT-BR (case-insensitive): "vai", "irá", "fará", "ficou de", "deve", "precisa", "tem que", "ia" + infinitive, "vamos pedir/checar/levar X", "[Owner] checa/leva/valida/envia". Accepted in EN: "will", "shall", "is going to", "needs to", "must", "is responsible for". The PT-BR imperfect "ia" counts when context shows the owner accepted the task.
3. A CONCRETE action object exists.

OWNER TYPES (set owner_type accordingly):

A) owner_type = "person" — the action is attributed to one or more named individuals.
   Owner string = the names verbatim. Multiple names stay together: "Ricardo, Valéria e Carlos".
   Examples:
   - "Manuela, que ia checar essa questão" → owner: "Manuela", owner_type: "person".
   - "Tatiana, vocês podem levar isso" → owner: "Tatiana", owner_type: "person" (vocative + collective verb attributes to the vocative).
   - "Deixa, Helena, a gente podia dar uma olhadinha no VDR" → owner: "Helena", owner_type: "person".

B) owner_type = "team" — the action is attributed to an area/team/department with no specific named individual.
   Owner string = the team/area name(s) verbatim. Use slashes for multiple areas: "RH / TI / LG".
   Examples:
   - "a gente vai ter que discutir esse perímetro de TI" → owner: "Time de tecnologia", owner_type: "team".
   - "a gente sempre contrata o nosso parceiro do sistema de folha, que é a LG, monta um time multidisciplinar com pessoas do RH, de TI e da própria LG" → owner: "RH / TI / LG", owner_type: "team".
   - "a migração dos CNPJs da Oi para o CNPJ que vai ser utilizado para essa UTI" → owner: "RH / TI / LG", owner_type: "team".

C) owner_type = "unassigned" — the commitment is clear but the responsible person depends on a future decision.
   Owner string = "TBD" (literal).
   Example:
   - "se tiver alguma orientação contrária, eu peço que vocês nos informem o mais rápido possível" → owner: "TBD", owner_type: "unassigned".

REJECT when:
- The action ALREADY HAPPENED or is currently in execution.
- The statement is a question, doubt, or hypothetical.
- The statement is pure background/context with no commitment to act now.
- For owner_type=person: name found NOWHERE in transcript. For owner_type=team: NONE of team-name terms appear.

OWNER ATTRIBUTION GUIDELINES:
- Prefer "person" when there is a named individual. Only use "team" when the action is genuinely team-level (no individual named).
- Vocative + collective verb attributes to the vocative as a person: "Tatiana, vocês levam isso" → owner: "Tatiana", owner_type: "person".
- Do NOT attribute to first-person ("eu", "nós") or to the transcript's user — only to named third parties or named teams.
- "Time da Oi", "Time trabalhista", "Time de tecnologia", "Time do projeto", "RH", "TI", "LG", "RH / time VDR", etc. are valid team owners when the team name (or one of its terms) appears in the transcript.

evidence_quote RULES (CRITICAL):
- MUST be a verbatim contiguous substring of the transcript, character-for-character (whitespace can be normalized but words and punctuation must match).
- Do NOT paraphrase, summarize, or reword.
- Pick the span that contains the owner mention AND the commitment verb together when possible.
- Maximum ~200 characters.`;

const TASK_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["tasks"],
  properties: {
    tasks: {
      type: "array",
      items: TASK_ITEM_SCHEMA,
    },
  },
};

const SYSTEM_INSTRUCTION =
  `You are a meeting action item extractor. Read the meeting transcript and produce a JSON object matching the provided schema.\n\n` +
  TASK_EXTRACTION_RULES +
  `\n\nIf no task qualifies, return {"tasks": []}.`;

export async function extractStructuredTasks(
  plugin: MeetingToolsPlugin,
  apiKey: string,
  transcript: string
): Promise<ExtractionResult> {
  const langInstruction = resolveLanguageInstruction(plugin.settings.outputLanguage);
  const systemPrompt = langInstruction + "\n\n" + SYSTEM_INSTRUCTION;

  const body = {
    model: plugin.settings.tasksModel,
    temperature: 0,
    top_p: 1,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "meeting_tasks",
        strict: true,
        schema: TASK_JSON_SCHEMA,
      },
    },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: transcript },
    ],
  };

  let res;
  try {
    res = await requestUrl({
      url: "https://api.openai.com/v1/chat/completions",
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      throw: false,
    });
  } catch (e) {
    const err = parseOpenAIError(null, e);
    console.error("[MeetingTools] task-extractor network error:", err);
    new Notice(err.friendly, 10000);
    throw new Error(err.code ?? "network_error");
  }

  if (res.status >= 400 || res.json?.error) {
    const err = parseOpenAIError({ status: res.status, json: res.json, text: res.text });
    console.error("[MeetingTools] task-extractor error:", err);
    new Notice(err.friendly, 10000);
    throw new Error(err.code ?? "openai_error");
  }

  const content = res.json?.choices?.[0]?.message?.content ?? "{}";
  let parsed: { tasks?: unknown[] };
  try {
    parsed = JSON.parse(content);
  } catch {
    console.error("[MeetingTools] task-extractor failed to parse JSON:", content);
    return { tasks: [] };
  }

  return { tasks: coerceTasks(parsed.tasks ?? []) };
}

/**
 * Light coercion to enforce TS types on the JSON the OpenAI API returned.
 * The schema strict mode already guarantees structure — we just normalize
 * priority/owner_type to the union types and trim strings. NO content
 * validation: trust the briefing + schema.
 */
function coerceTasks(candidates: unknown[]): ValidatedTask[] {
  const out: ValidatedTask[] = [];
  for (const raw of candidates) {
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
 * Renders validated tasks in the same markdown checkbox format the rest of
 * the plugin (task-parser, dashboards) consumes. Layout matches the legacy
 * TASK_FORMAT_SPEC output exactly so existing parsing keeps working.
 */
export function renderValidatedTasksAsMarkdown(
  tasks: ValidatedTask[],
  meetingContext: MeetingContext,
  emptyMarker: string
): string {
  if (tasks.length === 0) return emptyMarker;

  const wikilinks =
    meetingContext.wikilinks.length > 0
      ? meetingContext.wikilinks.map((w) => `[[${w}]]`).join(" ")
      : "[[No project]]";
  const projectTag = meetingContext.projectSlug
    ? `#projects/${meetingContext.projectSlug}`
    : "";

  return tasks
    .map((task) => {
      const tagsPart = ["#task", projectTag].filter(Boolean).join(" ");
      const deadlinePart = task.deadline ? ` 📅 ${task.deadline}` : "";
      return `- [ ] ${task.description} [resource:: ${task.owner}] [priority:: ${task.priority}] ${tagsPart} ${wikilinks}${deadlinePart}`;
    })
    .join("\n");
}

/**
 * Convenience wrapper used by both extract-tasks command and the summarize
 * pipeline. Returns the rendered markdown ready to insert.
 */
export async function extractAndRenderTasks(
  plugin: MeetingToolsPlugin,
  apiKey: string,
  transcript: string,
  meetingContext: MeetingContext
): Promise<{ markdown: string }> {
  const { tasks } = await extractStructuredTasks(plugin, apiKey, transcript);
  const emptyMarker = t().noticeNoTasksFound;
  const markdown = renderValidatedTasksAsMarkdown(
    tasks,
    meetingContext,
    "_(" + emptyMarker.toLowerCase() + ")_"
  );
  return { markdown };
}
