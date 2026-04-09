import { App, TFile } from "obsidian";

export interface ParsedTask {
  text: string;
  raw: string;
  rawLine: string;
  status: string; // " ", "/", "x", "-"
  resource: string | null;
  priority: string | null;
  project: string | null;
  projectLink: string | null;
  workstream: string | null;
  scheduled: string | null;
  scheduledDateObj: Date | null;
  due: string | null;
  dueDateObj: Date | null;
  blockId: string | null;
  filePath: string;
  fileName: string;
  lineNumber: number;
}

export async function parseTasks(app: App): Promise<ParsedTask[]> {
  const tasks: ParsedTask[] = [];
  const files = app.vault.getMarkdownFiles();

  for (const file of files) {
    if (file.basename === "CLAUDE" || file.path.includes("Templates/")) continue;
    const content = await app.vault.cachedRead(file);
    const lines = content.split("\n");

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      const taskMatch = line.match(/^([\s]*- \[)(.)\](\s+.+)$/);
      if (!taskMatch) continue;

      const status = taskMatch[2];
      const body = taskMatch[3].trim();

      if (!body.includes("#task")) continue;

      const resource = extractInlineField(body, "resource");
      const priority = extractInlineField(body, "priority");
      const projectMatch = body.match(/#projects\/([^\s]+)/);
      const project = projectMatch ? projectMatch[1] : null;
      const linkMatch = body.match(/\[\[([^\]]+)\]\]/);
      const projectLink = linkMatch ? linkMatch[1] : null;
      const workstreamMatch = body.match(/#workstream\/([^\s]+)/);
      const workstream = workstreamMatch ? workstreamMatch[1] : null;

      const scheduledMatch = body.match(/⏳\s*(\d{4}-\d{2}-\d{2})/);
      const scheduled = scheduledMatch ? scheduledMatch[1] : null;
      const scheduledDateObj = scheduled ? new Date(scheduled + "T00:00:00") : null;

      const dueMatch = body.match(/📅\s*(\d{4}-\d{2}-\d{2})/);
      const due = dueMatch ? dueMatch[1] : null;
      const dueDateObj = due ? new Date(due + "T00:00:00") : null;

      const blockIdMatch = line.match(/\^([a-zA-Z0-9-]+)\s*$/);
      const blockId = blockIdMatch ? blockIdMatch[1] : null;

      let text = body
        .replace(/\[resource::\s*[^\]]*\]/g, "")
        .replace(/\[priority::\s*[^\]]*\]/g, "")
        .replace(/\[milestone::\s*[^\]]*\]/g, "")
        .replace(/\[scheduled::\s*[^\]]*\]/g, "")
        .replace(/\[due\s*::\s*[^\]]*\]/g, "")
        .replace(/\[depends::\s*[^\]]*\]/g, "")
        .replace(/#task-?\s*/g, "")
        .replace(/#projects\/[^\s]+/g, "")
        .replace(/#workstream\/[^\s]+/g, "")
        .replace(/\[\[[^\]]+\]\]/g, "")
        .replace(/📅\s*\d{4}-\d{2}-\d{2}/g, "")
        .replace(/⏳\s*\d{4}-\d{2}-\d{2}/g, "")
        .replace(/✅\s*\d{4}-\d{2}-\d{2}/g, "")
        .replace(/[⏫🔺🔼🔽]/g, "")
        .replace(/\^[a-zA-Z0-9-]+\s*$/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();

      tasks.push({
        text, raw: body, rawLine: line, status, resource, priority,
        project, projectLink, workstream, scheduled, scheduledDateObj,
        due, dueDateObj, blockId, filePath: file.path,
        fileName: file.basename, lineNumber: lineIdx,
      });
    }
  }

  return tasks;
}

export function extractInlineField(text: string, field: string): string | null {
  const regex = new RegExp(`\\[${field}::\\s*([^\\]]+)\\]`);
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

export function getStatusIcon(status: string, dueDateObj: Date | null): string {
  if (status === "x") return "🟢";
  if (status === "-") return "⚫";
  if (status === "/") return "🟡";
  if (!dueDateObj) return "⚪";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((dueDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "🔴";
  if (diff === 0) return "🟠";
  if (diff <= 7) return "🔵";
  return "⚪";
}

export function getPriorityIcon(priority: string | null): string {
  if (priority === "high") return "⏫";
  if (priority === "medium") return "🔼";
  if (priority === "low") return "🔽";
  return "➖";
}

export function getAgingCategory(task: ParsedTask): string {
  if (!task.dueDateObj) return "⚪ Sem prazo";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((task.dueDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "🔴 Atrasado";
  if (diff === 0) return "🟠 Hoje";
  if (diff <= 7) return "🔵 Esta semana";
  return "⚪ Futuro";
}

export function getPriorityCategory(task: ParsedTask): string {
  if (task.priority === "high") return "⏫ Alta";
  if (task.priority === "medium") return "🔼 Média";
  if (task.priority === "low") return "🔽 Baixa";
  return "➖ Sem prioridade";
}

export async function cycleTaskStatus(
  app: App, filePath: string, lineNumber: number
): Promise<string> {
  const file = app.vault.getAbstractFileByPath(filePath);
  if (!file || !(file instanceof TFile)) return " ";
  const content = await app.vault.read(file);
  const lines = content.split("\n");
  if (lineNumber >= lines.length) return " ";
  const line = lines[lineNumber];
  const match = line.match(/^([\s]*- \[)(.)(\].*)$/);
  if (!match) return " ";
  const cycle: Record<string, string> = { " ": "/", "/": "x", x: "-", "-": " " };
  const newStatus = cycle[match[2]] || " ";
  lines[lineNumber] = match[1] + newStatus + match[3];
  await app.vault.modify(file, lines.join("\n"));
  return newStatus;
}

export async function setTaskStatus(
  app: App, filePath: string, lineNumber: number, newStatus: string
): Promise<void> {
  const file = app.vault.getAbstractFileByPath(filePath);
  if (!file || !(file instanceof TFile)) return;
  const content = await app.vault.read(file);
  const lines = content.split("\n");
  if (lineNumber >= lines.length) return;
  const line = lines[lineNumber];
  const match = line.match(/^([\s]*- \[)(.)(\].*)$/);
  if (!match) return;
  lines[lineNumber] = match[1] + newStatus + match[3];
  await app.vault.modify(file, lines.join("\n"));
}

export async function cycleTaskPriority(
  app: App, filePath: string, lineNumber: number
): Promise<string | null> {
  const file = app.vault.getAbstractFileByPath(filePath);
  if (!file || !(file instanceof TFile)) return null;
  const content = await app.vault.read(file);
  const lines = content.split("\n");
  if (lineNumber >= lines.length) return null;
  let line = lines[lineNumber];

  const currentMatch = line.match(/\[priority::\s*([^\]]+)\]/);
  const current = currentMatch ? currentMatch[1].trim() : null;

  const cycle: Record<string, string> = { high: "medium", medium: "low", low: "high" };
  let newPriority: string;

  if (!current) {
    // No priority → add high
    newPriority = "high";
    line = line.replace(/(#task\S*)/, `$1 [priority:: ${newPriority}]`);
  } else {
    newPriority = cycle[current] || "high";
    line = line.replace(/\[priority::\s*[^\]]+\]/, `[priority:: ${newPriority}]`);
  }

  lines[lineNumber] = line;
  await app.vault.modify(file, lines.join("\n"));
  return newPriority;
}

export async function setTaskDate(
  app: App, filePath: string, lineNumber: number,
  field: "scheduled" | "due", date: string
): Promise<void> {
  const file = app.vault.getAbstractFileByPath(filePath);
  if (!file || !(file instanceof TFile)) return;
  const content = await app.vault.read(file);
  const lines = content.split("\n");
  if (lineNumber >= lines.length) return;
  let line = lines[lineNumber];

  const emoji = field === "scheduled" ? "⏳" : "📅";
  const regex = new RegExp(`${emoji}\\s*\\d{4}-\\d{2}-\\d{2}`);

  if (regex.test(line)) {
    line = line.replace(regex, `${emoji} ${date}`);
  } else {
    // Add before the end of the line (or before ^blockId)
    line = line.replace(/(\s*\^[a-zA-Z0-9-]+)?$/, ` ${emoji} ${date}$1`);
  }

  lines[lineNumber] = line;
  await app.vault.modify(file, lines.join("\n"));
}
