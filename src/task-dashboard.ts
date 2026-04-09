import { App, TFile, MarkdownPostProcessorContext } from "obsidian";
import type MeetingToolsPlugin from "./main";
import {
  ParsedTask, parseTasks, getStatusIcon, getPriorityIcon,
  getAgingCategory, getPriorityCategory,
  cycleTaskStatus, cycleTaskPriority,
} from "./task-parser";

// Global registry of all active dashboard render functions
const activeDashboards: Set<() => Promise<void>> = new Set();

async function refreshAllDashboards(): Promise<void> {
  for (const render of activeDashboards) {
    await render();
  }
}

function renderGroupedTable(
  el: HTMLElement, app: App, tasks: ParsedTask[],
  groupKey: (t: ParsedTask) => string,
  showColumns: string[], onRefresh: () => void
): void {
  if (tasks.length === 0) {
    el.createEl("p", { text: "Nenhuma task encontrada.", cls: "mt-dash-empty" });
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

      // Status — clickable
      const checkCell = row.createEl("td", { cls: "mt-dash-status" });
      const checkBtn = checkCell.createEl("span", {
        text: getStatusIcon(task.status, task.dueDateObj),
        cls: "mt-dash-checkbox",
      });
      checkBtn.addEventListener("click", async () => {
        await cycleTaskStatus(app, task.filePath, task.lineNumber);
        onRefresh();
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
          onRefresh();
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
  showColumns: string[], onRefresh: () => void
): void {
  const details = el.createEl("details", { cls: "mt-dash-done-section" });
  details.createEl("summary").setText(`Concluídas / Canceladas (${tasks.length})`);
  renderGroupedTable(details, app, tasks, groupKey, showColumns, onRefresh);
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

export function registerTaskDashboard(plugin: MeetingToolsPlugin): void {
  plugin.registerMarkdownCodeBlockProcessor(
    "meeting-tasks",
    async (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
      const params: Record<string, string> = {};
      for (const line of source.trim().split("\n")) {
        const m = line.match(/^(\w+):\s*(.+)$/);
        if (m) params[m[1]] = m[2].trim();
      }

      const view = params.view || "all";
      el.addClass("mt-dashboard");

      const render = async () => {
        el.empty();

        // Legend
        el.createDiv({ cls: "mt-dash-legend" }).innerHTML = `
          <span>🔴 Atrasado</span><span>🟠 Hoje</span><span>🔵 Esta semana</span><span>⚪ Futuro</span>
          <span>🟡 Em progresso</span><span>🟢 Concluído</span><span>⚫ Cancelado</span>
          <span>|</span><span>⏫ Alta</span><span>🔼 Média</span><span>🔽 Baixa</span><span>➖ Sem</span>
          <span class="mt-dash-legend-hint">Clique nos ícones para alterar status/prioridade</span>`;

        const allTasks = await parseTasks(plugin.app);

        if (allTasks.length > 0) {
          el.createEl("button", { text: "📥 Exportar CSV", cls: "mt-dash-export-btn" })
            .addEventListener("click", () => {
              downloadCsv(exportTasksToCsv(allTasks), `tasks-${new Date().toISOString().slice(0,10)}.csv`);
            });
        }

        if (allTasks.length === 0) {
          el.createEl("p", { text: "Nenhuma task encontrada." });
          return;
        }

        const open = allTasks.filter((t) => t.status !== "x" && t.status !== "-");
        const done = allTasks.filter((t) => t.status === "x" || t.status === "-");
        const ref = refreshAllDashboards;
        const cols = (extra: string[]) => ["priority", ...extra];

        switch (view) {
          case "project":
            renderGroupedTable(el, plugin.app, open, (t) => t.project || "(sem projeto)", cols(["resource", "due", "aging"]), ref);
            if (done.length) renderCollapsibleDone(el, plugin.app, done, (t) => t.project || "(sem projeto)", cols(["resource", "due"]), ref);
            break;
          case "resource":
            renderGroupedTable(el, plugin.app, open, (t) => t.resource || "(sem responsável)", cols(["project", "due", "aging"]), ref);
            if (done.length) renderCollapsibleDone(el, plugin.app, done, (t) => t.resource || "(sem responsável)", cols(["project", "due"]), ref);
            break;
          case "aging":
            renderGroupedTable(el, plugin.app, open, (t) => getAgingCategory(t), cols(["resource", "project", "due"]), ref);
            if (done.length) renderCollapsibleDone(el, plugin.app, done, () => "Concluídas/Canceladas", cols(["resource", "project", "due"]), ref);
            break;
          case "priority":
            renderGroupedTable(el, plugin.app, open, (t) => getPriorityCategory(t), ["resource", "project", "due", "aging"], ref);
            if (done.length) renderCollapsibleDone(el, plugin.app, done, () => "Concluídas/Canceladas", ["resource", "project", "due"], ref);
            break;
          case "all":
          default:
            renderGroupedTable(el, plugin.app, open, () => "Pendentes", cols(["resource", "project", "due", "aging"]), ref);
            if (done.length) renderCollapsibleDone(el, plugin.app, done, () => "Concluídas/Canceladas", cols(["resource", "project", "due"]), ref);
            break;
        }
      };

      activeDashboards.add(render);
      const obs = new MutationObserver(() => {
        if (!el.isConnected) { activeDashboards.delete(render); obs.disconnect(); }
      });
      obs.observe(el.parentElement || document.body, { childList: true, subtree: true });

      await render();
    }
  );
}
