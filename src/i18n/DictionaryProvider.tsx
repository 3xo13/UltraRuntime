"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Dictionary } from "./types";

const DictionaryContext = createContext<Dictionary | null>(null);

export function DictionaryProvider({ dictionary, children }: {
  dictionary: Dictionary;
  children: ReactNode;
}) {
  return <DictionaryContext.Provider value={dictionary}>{children}</DictionaryContext.Provider>;
}

export function useDictionary(): Dictionary {
  const dictionary = useContext(DictionaryContext);
  if (!dictionary) throw new Error("useDictionary must be used inside DictionaryProvider");
  return dictionary;
}
