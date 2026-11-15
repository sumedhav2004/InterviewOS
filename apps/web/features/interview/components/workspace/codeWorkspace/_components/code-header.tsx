import { Code2 } from "lucide-react";
import React from "react";
import { LanguageSelector } from "../../../header/_components/language-selector";
import { ProgrammingLanguage } from "@/features/interview/types/programming-language";

type Props = {
  isCandidate: boolean;
  language: ProgrammingLanguage;
  onLanguageChange: (language: ProgrammingLanguage) => void;
};

const CodeHeader = ({ isCandidate, language, onLanguageChange }: Props) => {
  return (
    <div className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-card/40 px-3">
      <div className="flex items-center gap-2">
        <Code2 className="h-3.5 w-3.5 text-primary" />

        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
          Code
        </span>
      </div>

      {isCandidate ? (
        <LanguageSelector value={language} onChange={onLanguageChange} />
      ) : (
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
          {language}
        </span>
      )}
    </div>
  );
};

export default CodeHeader;
