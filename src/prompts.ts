// Shared task format used by Summary section 2 and Extract Tasks command.
// Single source of truth for the checkbox format consumed by task-parser.ts
// (meeting-tasks / meeting-kanban / meeting-gantt dashboards).
//
// Meeting wikilinks and the project tag are provided in a dynamic "Context"
// preamble that the callers prepend (see buildTaskContextPreamble in
// task-context.ts). The spec below references that Context.
export const TASK_FORMAT_SPEC = `Format each action item EXACTLY like this (one per line):

- [ ] [clear, objective description] [resource:: [owner name]] [priority:: [high/medium/low]] #task <project tag from Context> <meeting wikilinks from Context> 📅 [YYYY-MM-DD]

Rules:
- Include only tasks with an explicit owner named in the text (third-person reference, e.g. "Roger will send...", "Patrícia will write..."). If a statement uses collective forms ("we", "a gente", "let's") or has no clearly identified owner, OMIT the task.
- Do NOT attribute ambiguous or collective statements to the User name from Context. The User name is informational only.
- If an explicit deadline is present, use 📅 YYYY-MM-DD. If not, omit 📅.
- priority: "high" for urgent/critical, "medium" for normal, "low" for nice-to-have. If unclear, use "medium".
- Apply the "Meeting wikilinks" from Context to EVERY task, exactly as written (including document extensions like .pptx).
- If "Project tag" is present in Context, apply it to EVERY task. If not present, omit the #projects/ tag.
- Do not invent information not in the text.
- If no action item qualifies under the rules above (everything is collective or lacks a named owner), output exactly "_(no action items identified)_" instead of any bullet list. Translate the marker into the output language when appropriate.`;

// Summary Template default content lives in src/vault-templates.ts
// (LOCALIZED_ARTIFACTS entry id "summary-template") with both EN and PT-BR
// versions. Placeholders consumed by src/summarize.ts:
//   {{language_instruction}} — injected from settings.outputLanguage
//   {{user_name}}           — from settings.userName
//   {{task_context}}        — Context preamble (user name, wikilinks, project tag)
//   {{task_format_spec}}    — shared TASK_FORMAT_SPEC above
//   {{transcript}}          — the transcript text

export const MINDMAP_PROMPT = `
Convert the meeting into a Mermaid mindmap diagram. Output = ONLY a code block:
- Must start with \`\`\`mermaid and the 1st inner line must be exactly "mindmap".
- Line 2 is the root — a short meeting identifier (not a document section).
- Use 6 to 12 THEMATIC top-level branches under the root (e.g. "Contracts", "Systems", "Risks", "Timeline", "People"). Mermaid auto-colors each top-level branch, so more distinct themes = more visual differentiation.
- NEVER use document-structure labels as branches. Forbidden: "Executive Summary", "Action Items", "Detailed Topics", "Participants", "Summary", "Outcomes". Decompose thematically by subject matter discussed in the meeting.
- If the input is already a structured summary, IGNORE its section layout and RE-ORGANIZE by theme.
- Group related leaves under the thematic branch that best fits (e.g. a task about a contract goes under "Contracts", not a generic "Action Items" branch).
- Indent with 2 spaces per level. One item per line. Be concise.
- NEVER use square brackets [ ] or parentheses ( ) in labels.
- NEVER use colons ":" in labels; use " - " instead.
- Use plain text (no Markdown inside labels).

Minimal example:
\`\`\`mermaid
mindmap
  Meeting
    Contracts
      Review status
      Deadlines
    Systems
      SAP migration
      Licenses
    Risks
      Missing invoices
\`\`\``.trim();

export const EXTRACT_TASKS_PROMPT = `
Extract ALL action items / commitments from the text below.

{{task_context}}

${TASK_FORMAT_SPEC}

Additional rules:
- DO NOT repeat the entire text, only the extracted tasks.
- If no action items exist, respond exactly: "No action items identified."
`.trim();

export const NEW_PROJECT_PROMPT = `
You are an executive assistant specialized in project structuring.
Analyze the document below and extract the information to fill the project note.

Respond EXACTLY in this markdown format (fill what you find; use "[Not mentioned]" for anything not in the document):

# [Project Name]

## Executive Summary
> [Concise 2-4 sentence summary]

## Objectives
- [Objective 1]
- [Objective 2]
- [Continue as needed]

## Workstreams
### 1. [Workstream name]
- Owner: [Name or "Not mentioned"]
- Scope: [Description]

### 2. [Workstream name]
- Owner: [Name or "Not mentioned"]
- Scope: [Description]

[Continue as needed]

## Timeline
[Extract dates, milestones and deadlines. If a schedule is present, describe it.]

## Stakeholders
| Role | Name |
|------|------|
| [Role] | [Name] |

RULES:
- Be factual — do not invent information that isn't in the document.
- Keep the markdown format exactly as specified.
- If the document is very short or vague, fill what you can and mark the rest as "[Not mentioned]".
`.trim();
