import { App, TFile, MarkdownPostProcessorContext, Modal, Setting, MarkdownRenderer } from "obsidian";
import type MeetingToolsPlugin from "./main";
import { ParsedTask, parseTasks, setTaskDate } from "./task-parser";

class DateEditModal extends Modal {
  private task: ParsedTask;
  private appRef: App;
  private onSave: () => void;

  constructor(app: App, task: ParsedTask, onSave: () => void) {
    super(app);
    this.task = task;
    this.appRef = app;
    this.onSave = onSave;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h3", { text: `Editar datas: ${this.task.text}` });

    let newScheduled = this.task.scheduled || "";
    let newDue = this.task.due || "";

    new Setting(contentEl)
      .setName("Data início (⏳)")
      .addText((text) =>
        text.setPlaceholder("YYYY-MM-DD").setValue(newScheduled)
          .onChange((v) => { newScheduled = v; })
      );

    new Setting(contentEl)
      .setName("Data fim (📅)")
      .addText((text) =>
        text.setPlaceholder("YYYY-MM-DD").setValue(newDue)
          .onChange((v) => { newDue = v; })
      );

    new Setting(contentEl)
      .addButton((btn) =>
        btn.setButtonText("Salvar").setCta().onClick(async () => {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (newScheduled && dateRegex.test(newScheduled)) {
            await setTaskDate(this.appRef, this.task.filePath, this.task.lineNumber, "scheduled", newScheduled);
          }
          if (newDue && dateRegex.test(newDue)) {
            await setTaskDate(this.appRef, this.task.filePath, this.task.lineNumber, "due", newDue);
          }
          this.close();
          this.onSave();
        })
      )
      .addButton((btn) =>
        btn.setButtonText("Cancelar").onClick(() => this.close())
      );
  }

  onClose() {
    this.contentEl.empty();
  }
}

function generateMermaidGantt(tasks: ParsedTask[], title: string): string {
  // Filter tasks that have at least a due date
  const validTasks = tasks.filter((t) => t.dueDateObj && t.status !== "-");

  if (validTasks.length === 0) {
    return "```mermaid\ngantt\n    dateFormat YYYY-MM-DD\n    title " + title + "\n    section Sem tasks\n    Nenhuma task com prazo :a1, 2024-01-01, 1d\n```";
  }

  let mermaid = "```mermaid\ngantt\n    dateFormat YYYY-MM-DD\n    title " + title + "\n";

  // Group by workstream or project
  const groups = new Map<string, ParsedTask[]>();
  for (const t of validTasks) {
    const section = t.workstream || t.project || "Geral";
    if (!groups.has(section)) groups.set(section, []);
    groups.get(section)!.push(t);
  }

  let taskId = 0;
  for (const [section, sectionTasks] of groups) {
    mermaid += `    section ${sanitizeLabel(section)}\n`;

    // Sort by start date then due date
    sectionTasks.sort((a, b) => {
      const aStart = a.scheduledDateObj || a.dueDateObj!;
      const bStart = b.scheduledDateObj || b.dueDateObj!;
      return aStart.getTime() - bStart.getTime();
    });

    for (const t of sectionTasks) {
      taskId++;
      const id = `t${taskId}`;
      const label = sanitizeLabel(t.text.slice(0, 50));

      let statusTag = "";
      if (t.status === "x") statusTag = "done, ";
      else if (t.status === "/") statusTag = "active, ";

      const startDate = t.scheduled || defaultStart(t.due!);
      const endDate = t.due!;

      mermaid += `    ${label} :${statusTag}${id}, ${startDate}, ${endDate}\n`;
    }
  }

  mermaid += "```";
  return mermaid;
}

function sanitizeLabel(text: string): string {
  // Mermaid Gantt doesn't allow colons, semicolons, or special chars in labels
  return text
    .replace(/[:;#\[\]\(\)]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function defaultStart(dueDate: string): string {
  // If no start date, assume 7 days before due
  const d = new Date(dueDate + "T00:00:00");
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
}

// Global registry for gantt refresh
const activeGantts: Set<() => Promise<void>> = new Set();

async function refreshAllGantts(): Promise<void> {
  for (const render of activeGantts) {
    await render();
  }
}

export function registerGantt(plugin: MeetingToolsPlugin): void {
  plugin.registerMarkdownCodeBlockProcessor(
    "meeting-gantt",
    async (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
      const params: Record<string, string> = {};
      for (const line of source.trim().split("\n")) {
        const m = line.match(/^(\w+):\s*(.+)$/);
        if (m) params[m[1]] = m[2].trim();
      }

      const filterType = params.filter || "all";
      const filterValue = params.value || "";
      el.addClass("mt-gantt-container");

      let currentFilter = filterValue || "__all__";

      const render = async () => {
        el.empty();
        const allTasks = await parseTasks(plugin.app);
        // Only open tasks (not done/cancelled)
        const openTasks = allTasks.filter((t) => t.status !== "x" && t.status !== "-");
        const tasksWithDue = openTasks.filter((t) => t.dueDateObj);
        const tasksWithoutDue = openTasks.filter((t) => !t.dueDateObj);

        if (openTasks.length === 0) {
          el.createEl("p", { text: "Nenhuma task encontrada." });
          return;
        }

        // Filter combo
        if (filterType !== "all" && !filterValue) {
          const toolbar = el.createDiv({ cls: "mt-gantt-toolbar" });
          const label = filterType === "project" ? "Projeto:" : "Responsável:";
          toolbar.createSpan({ text: label });

          const select = toolbar.createEl("select", { cls: "mt-kanban-filter-select" });
          select.createEl("option", { text: "Todos", value: "__all__" });

          const values = new Set<string>();
          for (const t of openTasks) {
            const v = filterType === "project" ? t.project : t.resource;
            if (v) values.add(v);
          }
          for (const v of [...values].sort()) {
            const opt = select.createEl("option", { text: v, value: v });
            if (v === currentFilter) opt.selected = true;
          }

          select.addEventListener("change", () => {
            currentFilter = select.value;
            render();
          });
        }

        // Apply filter
        const applyFilter = (tasks: ParsedTask[]) => {
          if (!currentFilter || currentFilter === "__all__") return tasks;
          if (filterType === "project") return tasks.filter((t) => t.project === currentFilter);
          if (filterType === "resource") return tasks.filter((t) => t.resource === currentFilter);
          return tasks;
        };

        const filteredWithDue = applyFilter(tasksWithDue);
        const filteredWithoutDue = applyFilter(tasksWithoutDue);

        const title = currentFilter && currentFilter !== "__all__"
          ? `Tasks - ${currentFilter}`
          : "Tasks - Timeline";

        // Render Mermaid chart (only tasks with due dates)
        if (filteredWithDue.length > 0) {
          const mermaidMd = generateMermaidGantt(filteredWithDue, title);
          const chartDiv = el.createDiv({ cls: "mt-gantt-chart" });
          await MarkdownRenderer.renderMarkdown(mermaidMd, chartDiv, "", plugin);
        }

        // Helper to render a date-edit table
        const renderDateTable = (container: HTMLElement, tasks: ParsedTask[]) => {
          const table = container.createEl("table", { cls: "mt-dash-table" });
          const headerRow = table.createEl("thead").createEl("tr");
          headerRow.createEl("th", { text: "Task" });
          headerRow.createEl("th", { text: "Projeto" });
          headerRow.createEl("th", { text: "Início (⏳)" });
          headerRow.createEl("th", { text: "Fim (📅)" });
          headerRow.createEl("th", { text: "" });

          const tbody = table.createEl("tbody");
          for (const task of tasks) {
            const row = tbody.createEl("tr");
            row.createEl("td", { text: task.text.slice(0, 60), cls: "mt-dash-text" });
            row.createEl("td", { text: task.project || "-" });
            row.createEl("td", { text: task.scheduled || "-" });
            row.createEl("td", { text: task.due || "-" });
            row.createEl("td").createEl("button", { text: "✏️", cls: "mt-gantt-edit-btn" })
              .addEventListener("click", () => {
                new DateEditModal(plugin.app, task, refreshAllGantts).open();
              });
          }
        };

        // Tasks with dates
        if (filteredWithDue.length > 0) {
          const listDiv = el.createDiv({ cls: "mt-gantt-list" });
          listDiv.createEl("h4", { text: `Tasks com prazo (${filteredWithDue.length})` });
          renderDateTable(listDiv, filteredWithDue);
        }

        // Tasks without dates
        if (filteredWithoutDue.length > 0) {
          const noDatesDiv = el.createDiv({ cls: "mt-gantt-list mt-gantt-no-dates" });
          noDatesDiv.createEl("h4", { text: `Tasks sem prazo — adicione datas (${filteredWithoutDue.length})` });
          renderDateTable(noDatesDiv, filteredWithoutDue);
        }
      };

      activeGantts.add(render);
      const obs = new MutationObserver(() => {
        if (!el.isConnected) { activeGantts.delete(render); obs.disconnect(); }
      });
      obs.observe(el.parentElement || document.body, { childList: true, subtree: true });

      await render();
    }
  );
}
