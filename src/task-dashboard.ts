import { App, TFile, MarkdownRenderChild } from "obsidian";
import type MeetingToolsPlugin from "./main";
import {
  ParsedTask, parseTasks, getStatusIcon, getPriorityIcon,
  getAgingCategory, getPriorityCategory,
  cycleTaskStatus, cycleTaskPriority,
} from "./task-parser";
import { t } from "./i18n";

function renderGroupedTable(
  el: HTMLElement, app: App, tasks: ParsedTask[],
  groupKey: (t: ParsedTask) => string,
  showColumns: string[]
): void {
  if (tasks.length === 0) {
    el.createEl("p", { text: t().emptyTasks, cls: "mt-dash-empty" });
    return;
  }

  const groups = new Map<string, ParsedTask[]>();
  for (const task of tasks) {
    const key = groupKey(task) || "(sem grupo)";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(task);
  }

  for (const key of [...groups.keys()].sort()) {
    const groupTasks = groups.get(key)!;
    groupTasks.sort((a, b) => {
      if (!a.dueDateObj && !b.dueDateObj) return 0;
      if (!a.dueDateObj) return 1;
      if (!b.dueDateObj) return -1;
      return a.dueDateObj.getTime() - b.dueDateObj.getTime();
    });

    el.createEl("h4", { text: `${key} (${groupTasks.length})`, cls: "mt-dash-group" });

    const table = el.createEl("table", { cls: "mt-dash-table" });
    const headerRow = table.createEl("thead").createEl("tr");
    headerRow.createEl("th", { text: "" }); // status
    headerRow.createEl("th", { text: "Task" });
    if (showColumns.includes("priority")) headerRow.createEl("th", { text: "Pri" });
    if (showColumns.includes("resource")) headerRow.createEl("th", { text: "Responsável" });
    if (showColumns.includes("project")) headerRow.createEl("th", { text: "Projeto" });
    if (showColumns.includes("due")) headerRow.createEl("th", { text: "Prazo" });
    if (showColumns.includes("aging")) headerRow.createEl("th", { text: "Dias" });
    headerRow.createEl("th", { text: "Nota" });

    const tbody = table.createEl("tbody");

    for (const task of groupTasks) {
      const row = tbody.createEl("tr");

      // Status — clickable. No manual refresh: vault.modify fires metadataCache
      // changed → workspace "meeting-tools:tasks-changed" → every render child
      // re-renders itself.
      const checkCell = row.createEl("td", { cls: "mt-dash-status" });
      const checkBtn = checkCell.createEl("span", {
        text: getStatusIcon(task.status, task.dueDateObj),
        cls: "mt-dash-checkbox",
      });
      checkBtn.addEventListener("click", async () => {
        await cycleTaskStatus(app, task.filePath, task.lineNumber);
      });

      // Task text
      row.createEl("td", { text: task.text, cls: "mt-dash-text" });

      // Priority — clickable
      if (showColumns.includes("priority")) {
        const priCell = row.createEl("td", { cls: "mt-dash-priority" });
        const priBtn = priCell.createEl("span", {
          text: getPriorityIcon(task.priority),
          cls: "mt-dash-checkbox",
        });
        priBtn.addEventListener("click", async () => {
          await cycleTaskPriority(app, task.filePath, task.lineNumber);
        });
      }

      if (showColumns.includes("resource"))
        row.createEl("td", { text: task.resource || "-", cls: "mt-dash-resource" });

      if (showColumns.includes("project"))
        row.createEl("td", { text: task.project || "-", cls: "mt-dash-project" });

      if (showColumns.includes("due"))
        row.createEl("td", { text: task.due || "-", cls: "mt-dash-due" });

      if (showColumns.includes("aging")) {
        const agingCell = row.createEl("td", { cls: "mt-dash-aging" });
        if (task.dueDateObj) {
          const today = new Date(); today.setHours(0, 0, 0, 0);
          const diff = Math.ceil((task.dueDateObj.getTime() - today.getTime()) / 86400000);
          if (diff < 0) { agingCell.setText(`${Math.abs(diff)}d atrás`); agingCell.addClass("mt-dash-overdue"); }
          else if (diff === 0) { agingCell.setText("hoje"); agingCell.addClass("mt-dash-today"); }
          else agingCell.setText(`em ${diff}d`);
        } else agingCell.setText("-");
      }

      // Note link
      const noteCell = row.createEl("td", { cls: "mt-dash-note" });
      noteCell.createEl("a", { text: task.fileName, cls: "internal-link" })
        .addEventListener("click", (e) => {
          e.preventDefault();
          const f = app.vault.getAbstractFileByPath(task.filePath);
          if (f instanceof TFile) app.workspace.getLeaf(false).openFile(f);
        });
    }
  }
}

function renderCollapsibleDone(
  el: HTMLElement, app: App, tasks: ParsedTask[],
  groupKey: (t: ParsedTask) => string,
  showColumns: string[],
  initialOpen: boolean,
  onToggle: (open: boolean) => void
): void {
  const details = el.createEl("details", { cls: "mt-dash-done-section" });
  if (initialOpen) details.setAttribute("open", "");
  details.addEventListener("toggle", () => onToggle(details.open));
  details.createEl("summary").setText(`Concluídas / Canceladas (${tasks.length})`);
  renderGroupedTable(details, app, tasks, groupKey, showColumns);
}

function exportTasksToCsv(tasks: ParsedTask[]): string {
  const sl: Record<string, string> = { " ": "Pendente", "/": "Em progresso", x: "Concluído", "-": "Cancelado" };
  const header = "Status,Task,Responsável,Projeto,Prioridade,Prazo,Aging,Nota";
  const rows = tasks.map((t) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let aging = "";
    if (t.dueDateObj) {
      const d = Math.ceil((t.dueDateObj.getTime() - today.getTime()) / 86400000);
      aging = d < 0 ? `${Math.abs(d)}d atrás` : d === 0 ? "hoje" : `em ${d}d`;
    }
    const esc = (s: string) => `"${(s || "").replace(/"/g, '""')}"`;
    return [esc(sl[t.status]||t.status), esc(t.text), esc(t.resource||""), esc(t.project||""), esc(t.priority||""), esc(t.due||""), esc(aging), esc(t.fileName)].join(",");
  });
  return header + "\n" + rows.join("\n");
}

function downloadCsv(content: string, filename: string): void {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

class TaskDashboardChild extends MarkdownRenderChild {
  private doneSectionOpen = false;

  constructor(
    containerEl: HTMLElement,
    private plugin: MeetingToolsPlugin,
    private view: string
  ) {
    super(containerEl);
  }

  onload() {
    void this.render();
    this.registerEvent(
      this.plugin.app.workspace.on(
        "meeting-tools:tasks-changed" as any,
        () => void this.render()
      )
    );
  }

  async render(): Promise<void> {
    const el = this.containerEl;

    // Preserve the <details> open state across re-renders.
    const existingDetails = el.querySelector(
      "details.mt-dash-done-section"
    ) as HTMLDetailsElement | null;
    if (existingDetails) this.doneSectionOpen = existingDetails.open;

    el.empty();

    const s = t();
    const legend = el.createDiv({ cls: "mt-dash-legend" });
    const addRow = (label: string, items: string[]) => {
      const row = legend.createDiv({ cls: "mt-dash-legend-row" });
      row.createEl("span", {
        text: label + ":",
        cls: "mt-dash-legend-label",
      });
      for (const it of items) row.createEl("span", { text: it });
    };
    addRow(s.legendLabelDue, [
      `🔴 ${s.legendItemOverdue}`,
      `🟠 ${s.legendItemToday}`,
      `🔵 ${s.legendItemThisWeek}`,
      `⚪ ${s.legendItemFuture}`,
    ]);
    addRow(s.legendLabelStatus, [
      `🟡 ${s.legendItemInProgress}`,
      `🟢 ${s.legendItemDone}`,
      `⚫ ${s.legendItemCancelled}`,
    ]);
    addRow(s.legendLabelPriority, [
      `⏫ ${s.legendItemHigh}`,
      `🔼 ${s.legendItemMedium}`,
      `🔽 ${s.legendItemLow}`,
      `➖ ${s.legendItemNoPriority}`,
    ]);
    legend.createEl("span", {
      text: s.legendHint,
      cls: "mt-dash-legend-hint",
    });

    const allTasks = await parseTasks(this.plugin.app);

    if (allTasks.length > 0) {
      el.createEl("button", { text: "📥 Exportar CSV", cls: "mt-dash-export-btn" })
        .addEventListener("click", () => {
          downloadCsv(
            exportTasksToCsv(allTasks),
            `tasks-${new Date().toISOString().slice(0, 10)}.csv`
          );
        });
    }

    if (allTasks.length === 0) {
      el.createEl("p", { text: t().emptyTasks });
      return;
    }

    const open = allTasks.filter((t) => t.status !== "x" && t.status !== "-");
    const done = allTasks.filter((t) => t.status === "x" || t.status === "-");
    const cols = (extra: string[]) => ["priority", ...extra];
    const onToggle = (isOpen: boolean) => { this.doneSectionOpen = isOpen; };
    const app = this.plugin.app;

    switch (this.view) {
      case "project":
        renderGroupedTable(el, app, open, (t) => t.project || "(sem projeto)", cols(["resource", "due", "aging"]));
        if (done.length) renderCollapsibleDone(el, app, done, (t) => t.project || "(sem projeto)", cols(["resource", "due"]), this.doneSectionOpen, onToggle);
        break;
      case "resource":
        renderGroupedTable(el, app, open, (t) => t.resource || "(sem responsável)", cols(["project", "due", "aging"]));
        if (done.length) renderCollapsibleDone(el, app, done, (t) => t.resource || "(sem responsável)", cols(["project", "due"]), this.doneSectionOpen, onToggle);
        break;
      case "aging":
        renderGroupedTable(el, app, open, (t) => getAgingCategory(t), cols(["resource", "project", "due"]));
        if (done.length) renderCollapsibleDone(el, app, done, () => "Concluídas/Canceladas", cols(["resource", "project", "due"]), this.doneSectionOpen, onToggle);
        break;
      case "priority":
        renderGroupedTable(el, app, open, (t) => getPriorityCategory(t), ["resource", "project", "due", "aging"]);
        if (done.length) renderCollapsibleDone(el, app, done, () => "Concluídas/Canceladas", ["resource", "project", "due"], this.doneSectionOpen, onToggle);
        break;
      case "all":
      default:
        renderGroupedTable(el, app, open, () => "Pendentes", cols(["resource", "project", "due", "aging"]));
        if (done.length) renderCollapsibleDone(el, app, done, () => "Concluídas/Canceladas", cols(["resource", "project", "due"]), this.doneSectionOpen, onToggle);
        break;
    }
  }
}

export function registerTaskDashboard(plugin: MeetingToolsPlugin): void {
  plugin.registerMarkdownCodeBlockProcessor(
    "meeting-tasks",
    (source, el, ctx) => {
      const params: Record<string, string> = {};
      for (const line of source.trim().split("\n")) {
        const m = line.match(/^(\w+):\s*(.+)$/);
        if (m) params[m[1]] = m[2].trim();
      }
      el.addClass("mt-dashboard");
      ctx.addChild(new TaskDashboardChild(el, plugin, params.view || "all"));
    }
  );
}
