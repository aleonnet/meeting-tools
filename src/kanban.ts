import { App, TFile, MarkdownRenderChild } from "obsidian";
import type MeetingToolsPlugin from "./main";
import {
  ParsedTask, parseTasks, getPriorityIcon,
  setTaskStatus,
} from "./task-parser";
import { t } from "./i18n";

const STATUS_COLUMNS: { status: string; label: string }[] = [
  { status: " ", label: "Pendente" },
  { status: "/", label: "Em Progresso" },
  { status: "x", label: "Concluído" },
  { status: "-", label: "Cancelado" },
];

function renderKanban(
  el: HTMLElement,
  app: App,
  tasks: ParsedTask[],
  filterType: string,
  filterValue: string
): void {
  let filtered = tasks;
  if (filterValue && filterValue !== "__all__") {
    if (filterType === "project") {
      filtered = tasks.filter((t) => t.project === filterValue);
    } else if (filterType === "resource") {
      filtered = tasks.filter((t) => t.resource === filterValue);
    }
  }

  const board = el.createDiv({ cls: "mt-kanban-board" });

  for (const col of STATUS_COLUMNS) {
    const colTasks = filtered.filter((t) => t.status === col.status);
    const column = board.createDiv({ cls: "mt-kanban-column" });

    const header = column.createDiv({ cls: "mt-kanban-header" });
    header.setText(`${col.label} (${colTasks.length})`);

    const dropZone = column.createDiv({ cls: "mt-kanban-dropzone" });
    dropZone.setAttribute("data-status", col.status);

    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.addClass("mt-kanban-drag-over");
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.removeClass("mt-kanban-drag-over");
    });

    // Drop handler writes the file; the event bus (metadataCache.changed →
    // "meeting-tools:tasks-changed") refreshes every live render child.
    dropZone.addEventListener("drop", async (e) => {
      e.preventDefault();
      dropZone.removeClass("mt-kanban-drag-over");
      const data = e.dataTransfer?.getData("text/plain");
      if (!data) return;
      const { filePath, lineNumber } = JSON.parse(data);
      await setTaskStatus(app, filePath, lineNumber, col.status);
    });

    for (const task of colTasks) {
      const card = dropZone.createDiv({ cls: "mt-kanban-card" });
      card.setAttribute("draggable", "true");

      card.addEventListener("dragstart", (e) => {
        e.dataTransfer?.setData(
          "text/plain",
          JSON.stringify({ filePath: task.filePath, lineNumber: task.lineNumber })
        );
        card.addClass("mt-kanban-dragging");
      });

      card.addEventListener("dragend", () => {
        card.removeClass("mt-kanban-dragging");
      });

      const titleEl = card.createDiv({ cls: "mt-kanban-card-title" });
      titleEl.setText(task.text);

      const metaEl = card.createDiv({ cls: "mt-kanban-card-meta" });

      if (task.resource) {
        metaEl.createSpan({ text: task.resource, cls: "mt-kanban-badge mt-kanban-badge-resource" });
      }

      if (task.project) {
        metaEl.createSpan({ text: task.project, cls: "mt-kanban-badge mt-kanban-badge-project" });
      }

      metaEl.createSpan({ text: getPriorityIcon(task.priority), cls: "mt-kanban-card-priority" });

      if (task.due) {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const diff = task.dueDateObj
          ? Math.ceil((task.dueDateObj.getTime() - today.getTime()) / 86400000)
          : null;
        const cls = diff !== null && diff < 0 ? "mt-dash-overdue" : diff === 0 ? "mt-dash-today" : "";
        const label = diff !== null
          ? diff < 0 ? `${task.due} (${Math.abs(diff)}d atrás)` : diff === 0 ? `${task.due} (hoje)` : `${task.due} (em ${diff}d)`
          : task.due;
        metaEl.createSpan({ text: label, cls: `mt-kanban-card-due ${cls}` });
      }

      card.addEventListener("dblclick", () => {
        const f = app.vault.getAbstractFileByPath(task.filePath);
        if (f instanceof TFile) app.workspace.getLeaf(false).openFile(f);
      });
    }
  }
}

class KanbanChild extends MarkdownRenderChild {
  private currentFilter = "__all__";

  constructor(
    containerEl: HTMLElement,
    private plugin: MeetingToolsPlugin,
    private filterType: string
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
    el.empty();
    const allTasks = await parseTasks(this.plugin.app);

    if (allTasks.length === 0) {
      el.createEl("p", { text: t().emptyTasks });
      return;
    }

    if (this.filterType !== "all") {
      const toolbar = el.createDiv({ cls: "mt-kanban-toolbar" });
      const label = this.filterType === "project" ? "Projeto:" : "Responsável:";
      toolbar.createSpan({ text: label, cls: "mt-kanban-filter-label" });

      const select = toolbar.createEl("select", { cls: "mt-kanban-filter-select" });
      const optAll = select.createEl("option", { text: "Todos", value: "__all__" });

      const values = new Set<string>();
      for (const task of allTasks) {
        const v = this.filterType === "project" ? task.project : task.resource;
        if (v) values.add(v);
      }

      for (const v of [...values].sort()) {
        const opt = select.createEl("option", { text: v, value: v });
        if (v === this.currentFilter) opt.selected = true;
      }
      if (this.currentFilter === "__all__") optAll.selected = true;

      select.addEventListener("change", () => {
        this.currentFilter = select.value;
        void this.render();
      });
    }

    renderKanban(el, this.plugin.app, allTasks, this.filterType, this.currentFilter);
  }
}

export function registerKanban(plugin: MeetingToolsPlugin): void {
  plugin.registerMarkdownCodeBlockProcessor(
    "meeting-kanban",
    (source, el, ctx) => {
      const params: Record<string, string> = {};
      for (const line of source.trim().split("\n")) {
        const m = line.match(/^(\w+):\s*(.+)$/);
        if (m) params[m[1]] = m[2].trim();
      }
      el.addClass("mt-kanban-container");
      ctx.addChild(new KanbanChild(el, plugin, params.filter || "all"));
    }
  );
}
