"use client";

import Editor, { BeforeMount } from "@monaco-editor/react";
import { useState } from "react";
import { spaceCadetTheme } from "@/lib/monaco/themes/space-cadet";

const DEFAULT_CODE = `function solution() {
  // Start coding...
}`;

const handleBeforeMount: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("space-cadet", spaceCadetTheme);
};

export function CodeWorkspace() {
  const [code, setCode] = useState(DEFAULT_CODE);

  return (
    <div className="h-full min-h-0 overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage="typescript"
        value={code}
        onChange={(value) => setCode(value ?? "")}
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