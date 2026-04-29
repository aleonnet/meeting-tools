// Task extraction (formerly TASK_FORMAT_SPEC + EXTRACT_TASKS_PROMPT) was
// rewritten as structured output (json_schema + citation validation) — see
// task-extractor.ts. The free-text spec was removed because (a) gpt-4.1
// followed it conservatively to the point of returning zero tasks, (b)
// gpt-5.4 followed it loosely enough to attribute actions to whisper
// artifacts ("Dinheiro" as owner). Schema + deterministic substring check
// replaced both behaviors.

// Summary Template default content lives in src/vault-templates.ts
// (LOCALIZED_ARTIFACTS entry id "summary-template") with both EN and PT-BR
// versions. Placeholders consumed by src/summarize.ts:
//   {{language_instruction}} — injected from settings.outputLanguage
//   {{user_name}}           — from settings.userName
//   {{task_context}}        — Context preamble (user name, wikilinks, project tag)
//   {{action_items_block}}  — preserved literal in the model output, replaced
//                              after the call with deterministically-rendered
//                              tasks from task-extractor.ts
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
