"use client";

import { ChevronDown } from "lucide-react";
import { PROGRAMMING_LANGUAGES, ProgrammingLanguage } from "../types/programming-language";



type LanguageSelectorProps = {
  value: ProgrammingLanguage;
  onChange: (language: ProgrammingLanguage) => void;
};

export function LanguageSelector({
  value,
  onChange,
}: LanguageSelectorProps) {
  return (
    <div className="relative flex items-center">
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value as ProgrammingLanguage,
          )
        }
        className="h-7 appearance-none border border-border bg-background px-2 pr-7 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground outline-none transition-colors hover:text-foreground focus:border-primary"
      >
        {PROGRAMMING_LANGUAGES.map((language) => (
          <option
            key={language.value}
            value={language.value}
          >
            {language.label}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-2 h-3 w-3 text-muted-foreground" />
    </div>
  );
}