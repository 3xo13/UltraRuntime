import "server-only";
import type { Locale } from "./config";
import type { Dictionary } from "./types";

const dictionaries = {
  en: () => import("./dictionaries/en").then((module) => module.default),
  ar: () => import("./dictionaries/ar").then((module) => module.default),
} satisfies Record<Locale, () => Promise<Dictionary>>;

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
