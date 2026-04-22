import { EN, type Strings } from "./en";
import { PT_BR } from "./pt-BR";

const CATALOGS = {
  en: EN,
  "pt-BR": PT_BR,
} as const;

export type SupportedLocale = keyof typeof CATALOGS;

/**
 * Reads Obsidian's UI locale from localStorage and maps to a supported catalog.
 * Unsupported codes fall back to English.
 */
export function resolveLocale(): SupportedLocale {
  const raw = (window.localStorage.getItem("language") || "").trim();
  if (raw === "pt-BR" || raw === "pt" || raw.startsWith("pt-")) return "pt-BR";
  return "en";
}

let currentLocale: SupportedLocale = resolveLocale();

export function setLocale(l: SupportedLocale): void {
  currentLocale = l;
}

export function getLocale(): SupportedLocale {
  return currentLocale;
}

/**
 * Returns the active string catalog. Call as `t()` at usage sites so settings
 * changes reflect without caching a stale reference.
 */
export function t(): Strings {
  return CATALOGS[currentLocale];
}

export type OutputLanguage = "auto" | "en" | "pt-BR";

/**
 * Maps the user's outputLanguage setting to an LLM instruction string.
 * Used by summarize/mindmap/tasks/new-project prompts.
 */
export function resolveLanguageInstruction(setting: OutputLanguage): string {
  const strings = t();
  if (setting === "pt-BR") return strings.llmLangPortuguese;
  if (setting === "en") return strings.llmLangEnglish;
  return strings.llmLangAutoMatch;
}
