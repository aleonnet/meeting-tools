import { App, TFile } from "obsidian";

/**
 * Reads a template `.md` from the vault. Returns the fallback if the file is
 * missing, unreadable, or empty. Never throws — absent/broken templates must
 * degrade silently so the commands keep working.
 */
export async function loadTemplate(
  app: App,
  path: string,
  fallback: string
): Promise<string> {
  try {
    const file = app.vault.getAbstractFileByPath(path);
    if (!(file instanceof TFile)) {
      console.warn(`[MeetingTools] Template not found: ${path}. Using built-in default.`);
      return fallback;
    }
    const content = await app.vault.read(file);
    if (!content.trim()) {
      console.warn(`[MeetingTools] Template is empty: ${path}. Using built-in default.`);
      return fallback;
    }
    return content;
  } catch (e) {
    console.error(`[MeetingTools] Failed to read template ${path}:`, e);
    return fallback;
  }
}

/**
 * Substitutes `{{key}}` occurrences in `tpl` using values from `vars`.
 * Unknown placeholders are left intact so users can include literal `{{…}}`.
 *
 * Back-compat: legacy summary templates used `{{task_format_spec}}` to mark
 * where action items should appear. The new architecture uses
 * `{{action_items_block}}`. Map the old token to the new one transparently
 * so users with custom templates don't see broken output.
 */
export function substitute(tpl: string, vars: Record<string, string>): string {
  const migrated = tpl.replace(/\{\{task_format_spec\}\}/g, "{{action_items_block}}");
  return migrated.replace(/\{\{(\w+)\}\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : match
  );
}

/**
 * Returns the subset of `required` keys that do NOT appear as `{{key}}`
 * placeholders in `tpl`. Used to detect customized templates that drifted
 * from the current plugin contract (e.g. missing `{{transcript}}`).
 */
export function findMissingPlaceholders(
  tpl: string,
  required: string[]
): string[] {
  return required.filter((k) => !tpl.includes(`{{${k}}}`));
}
