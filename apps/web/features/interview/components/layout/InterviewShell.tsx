import React from "react";

const InterviewShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      {children}
    </main>
  );
};

export default InterviewShell;
