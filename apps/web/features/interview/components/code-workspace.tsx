"use client";

import Editor, {
  BeforeMount,
  OnMount,
} from "@monaco-editor/react";

import { spaceCadetTheme } from "@/lib/monaco/themes/space-cadet";
import { PROGRAMMING_LANGUAGES, ProgrammingLanguage } from "../types/programming-language";

const handleBeforeMount: BeforeMount = (monaco) => {
  monaco.editor.defineTheme(
    "space-cadet",
    spaceCadetTheme,
  );
};

type CodeWorkspaceProps = {
  code: string;
  onCodeChange: (code: string) => void;
  language: ProgrammingLanguage;
};

export function CodeWorkspace({
  code,
  onCodeChange,
  language
}: CodeWorkspaceProps) {
  const handleMount: OnMount = (editor) => {
    requestAnimationFrame(() => {
      editor.layout();
    });
  };

  const monacoLanguage =
    PROGRAMMING_LANGUAGES.find(
      (item) => item.value === language,
    )?.monacoLanguage ?? "plaintext";

  return (
    <div className="relative flex h-full min-h-0 w-full min-w-0">
      <Editor
        height="100%"
        width="100%"
        defaultLanguage="python"
        language={monacoLanguage}
        value={code}
        onChange={(value) =>
          onCodeChange(value ?? "")
        }
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        theme="space-cadet"
        options={{
          minimap: {
            enabled: false,
          },

          fontSize: 13,

          lineNumbers: "on",

          padding: {
            top: 16,
            bottom: 16,
          },

          automaticLayout: true,

          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
}