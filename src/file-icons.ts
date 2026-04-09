import { setIcon } from "obsidian";
import type MeetingToolsPlugin from "./main";

// Map of file basenames to Lucide icon names
const FILE_ICONS: Record<string, string> = {
  "MT Task Dashboard": "list-checks",
  "MT Kanban View": "kanban",
  "MT Gantt View": "gantt-chart",
  "Daily Note Template": "calendar",
  "Project Template": "briefcase",
};

/**
 * Decorates known Meeting Tools files in the file explorer with icons.
 * Runs on layout-ready and whenever the file explorer re-renders.
 */
export function registerFileIcons(plugin: MeetingToolsPlugin): void {
  const applyIcons = () => {
    // Find all file explorer items
    const fileItems = document.querySelectorAll(
      ".nav-file-title-content"
    );

    for (const el of Array.from(fileItems)) {
      const text = el.textContent?.trim() || "";
      const iconName = FILE_ICONS[text];
      if (!iconName) continue;

      const parent = el.parentElement;
      if (!parent || parent.querySelector(".mt-file-icon")) continue;

      // Create icon element before the title
      const iconEl = document.createElement("span");
      iconEl.addClass("mt-file-icon");
      setIcon(iconEl, iconName);
      parent.insertBefore(iconEl, el);
    }
  };

  // Apply on layout ready
  plugin.app.workspace.onLayoutReady(applyIcons);

  // Re-apply when file explorer changes (expand/collapse, file create/delete)
  plugin.registerEvent(
    plugin.app.workspace.on("layout-change", () => {
      setTimeout(applyIcons, 100);
    })
  );

  // Also re-apply when files are created/renamed
  plugin.registerEvent(
    plugin.app.vault.on("create", () => setTimeout(applyIcons, 200))
  );
  plugin.registerEvent(
    plugin.app.vault.on("rename", () => setTimeout(applyIcons, 200))
  );
}
