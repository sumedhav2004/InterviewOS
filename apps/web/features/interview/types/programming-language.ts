// types/programming-language.ts

export type ProgrammingLanguage =
  | "JAVASCRIPT"
  | "PYTHON"
  | "JAVA"
  | "CPP"
  | "C"
  | "RUST"
  | "GO";

export const PROGRAMMING_LANGUAGES: {
  value: ProgrammingLanguage;
  label: string;
  monacoLanguage: string;
}[] = [
  {
    value: "JAVASCRIPT",
    label: "JavaScript",
    monacoLanguage: "javascript",
  },
  {
    value: "PYTHON",
    label: "Python",
    monacoLanguage: "python",
  },
  {
    value: "JAVA",
    label: "Java",
    monacoLanguage: "java",
  },
  {
    value: "CPP",
    label: "C++",
    monacoLanguage: "cpp",
  },
  {
    value: "C",
    label: "C",
    monacoLanguage: "c",
  },
  {
    value: "RUST",
    label: "Rust",
    monacoLanguage: "rust",
  },
  {
    value: "GO",
    label: "Go",
    monacoLanguage: "go",
  },
];