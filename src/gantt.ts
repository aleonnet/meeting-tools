import { App, MarkdownRenderChild, Modal, Setting, MarkdownRenderer } from "obsidian";
import type MeetingToolsPlugin from "./main";
import { ParsedTask, parseTasks, setTaskDate } from "./task-parser";
import { t } from "./i18n";

class DateEditModal extends Modal {
  private task: ParsedTask;
  private appRef: App;

  constructor(app: App, task: ParsedTask) {
    super(app);
    this.task = task;
    this.appRef = app;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    const s = t();
    contentEl.createEl("h3", { text: s.ganttEditTitle(this.task.text) });

    let newScheduled = this.task.scheduled || "";
    let newDue = this.task.due || "";

    new Setting(contentEl)
      .setName(s.ganttStartLabel)
      .addText((text) =>
        text.setPlaceholder("YYYY-MM-DD").setValue(newScheduled)
          .onChange((v) => { newScheduled = v; })
      );

    new Setting(contentEl)
      .setName(s.ganttEndLabel)
      .addText((text) =>
        text.setPlaceholder("YYYY-MM-DD").setValue(newDue)
          .onChange((v) => { newDue = v; })
      );

    new Setting(contentEl)
      .addButton((btn) =>
        btn.setButtonText(s.btnSave).setCta().onClick(async () => {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (newScheduled && dateRegex.test(newScheduled)) {
            await setTaskDate(this.appRef, this.task.filePath, this.task.lineNumber, "scheduled", newScheduled);
          }
          if (newDue && dateRegex.test(newDue)) {
            await setTaskDate(this.appRef, this.task.filePath, this.task.lineNumber, "due", newDue);
          }
          this.close();
        })
      )
      .addButton((btn) =>
        btn.setButtonText(s.btnCancelPlain).onClick(() => this.close())
      );
  }

  onClose() {
    this.contentEl.empty();
  }
}

function generateMermaidGantt(tasks: ParsedTask[], title: string): string {
  const validTasks = tasks.filter((t) => t.dueDateObj && t.status !== "-");

  if (validTasks.length === 0) {
    return "```mermaid\ngantt\n    dateFormat YYYY-MM-DD\n    title " + title + "\n    section Sem tasks\n    Nenhuma task com prazo :a1, 2024-01-01, 1d\n```";
  }

  let mermaid = "```mermaid\ngantt\n    dateFormat YYYY-MM-DD\n    title " + title + "\n";

  const groups = new Map<string, ParsedTask[]>();
  for (const t of validTasks) {
    const section = t.workstream || t.project || "Geral";
    if (!groups.has(section)) groups.set(section, []);
    groups.get(section)!.push(t);
  }

  let taskId = 0;
  for (const [section, sectionTasks] of groups) {
    mermaid += `    section ${sanitizeLabel(section)}\n`;

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
  return text
    .replace(/[:;#\[\]\(\)]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function defaultStart(dueDate: string): string {
  const d = new Date(dueDate + "T00:00:00");
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
}

class GanttChild extends MarkdownRenderChild {
  private currentFilter: string;

  constructor(
    containerEl: HTMLElement,
    private plugin: MeetingToolsPlugin,
    private filterType: string,
    private filterValue: string
  ) {
    super(containerEl);
    this.currentFilter = filterValue || "__all__";
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
    el.empty();
    const allTasks = await parseTasks(this.plugin.app);
    const openTasks = allTasks.filter((t) => t.status !== "x" && t.status !== "-");
    const tasksWithDue = openTasks.filter((t) => t.dueDateObj);
    const tasksWithoutDue = openTasks.filter((t) => !t.dueDateObj);

    if (openTasks.length === 0) {
      el.createEl("p", { text: t().emptyTasks });
      return;
    }

    if (this.filterType !== "all" && !this.filterValue) {
      const toolbar = el.createDiv({ cls: "mt-gantt-toolbar" });
      const label = this.filterType === "project" ? "Projeto:" : "Responsável:";
      toolbar.createSpan({ text: label });

      const select = toolbar.createEl("select", { cls: "mt-kanban-filter-select" });
      select.createEl("option", { text: "Todos", value: "__all__" });

      const values = new Set<string>();
      for (const task of openTasks) {
        const v = this.filterType === "project" ? task.project : task.resource;
        if (v) values.add(v);
      }
      for (const v of [...values].sort()) {
        const opt = select.createEl("option", { text: v, value: v });
        if (v === this.currentFilter) opt.selected = true;
      }

      select.addEventListener("change", () => {
        this.currentFilter = select.value;
        void this.render();
      });
    }

    const applyFilter = (tasks: ParsedTask[]) => {
      if (!this.currentFilter || this.currentFilter === "__all__") return tasks;
      if (this.filterType === "project") return tasks.filter((t) => t.project === this.currentFilter);
      if (this.filterType === "resource") return tasks.filter((t) => t.resource === this.currentFilter);
      return tasks;
    };

    const filteredWithDue = applyFilter(tasksWithDue);
    const filteredWithoutDue = applyFilter(tasksWithoutDue);

    const title = this.currentFilter && this.currentFilter !== "__all__"
      ? `Tasks - ${this.currentFilter}`
      : "Tasks - Timeline";

    if (filteredWithDue.length > 0) {
      const mermaidMd = generateMermaidGantt(filteredWithDue, title);
      const chartDiv = el.createDiv({ cls: "mt-gantt-chart" });
      await MarkdownRenderer.renderMarkdown(mermaidMd, chartDiv, "", this.plugin);
    }

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
            new DateEditModal(this.plugin.app, task).open();
          });
      }
    };

    if (filteredWithDue.length > 0) {
      const listDiv = el.createDiv({ cls: "mt-gantt-list" });
      listDiv.createEl("h4", { text: `Tasks com prazo (${filteredWithDue.length})` });
      renderDateTable(listDiv, filteredWithDue);
    }

    if (filteredWithoutDue.length > 0) {
      const noDatesDiv = el.createDiv({ cls: "mt-gantt-list mt-gantt-no-dates" });
      noDatesDiv.createEl("h4", { text: `Tasks sem prazo — adicione datas (${filteredWithoutDue.length})` });
      renderDateTable(noDatesDiv, filteredWithoutDue);
    }
  }
}

export function registerGantt(plugin: MeetingToolsPlugin): void {
  plugin.registerMarkdownCodeBlockProcessor(
    "meeting-gantt",
    (source, el, ctx) => {
      const params: Record<string, string> = {};
      for (const line of source.trim().split("\n")) {
        const m = line.match(/^(\w+):\s*(.+)$/);
        if (m) params[m[1]] = m[2].trim();
      }
      el.addClass("mt-gantt-container");
      ctx.addChild(
        new GanttChild(
          el,
          plugin,
          params.filter || "all",
          params.value || ""
        )
      );
    }
  );
}
