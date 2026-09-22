"use client";

import Editor, { BeforeMount } from "@monaco-editor/react";
import { spaceCadetTheme } from "@/lib/monaco/themes/space-cadet";

const handleBeforeMount: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("space-cadet", spaceCadetTheme);
};

type CodeWorkspaceProps = {
  code: string;
  onCodeChange: (code: string) => void;
};

export function CodeWorkspace({
  code,
  onCodeChange,
}: CodeWorkspaceProps) {
  return (
    <div className="h-full min-h-0 overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage="typescript"
        value={code}
        onChange={(value) => onCodeChange(value ?? "")}
        beforeMount={handleBeforeMount}
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