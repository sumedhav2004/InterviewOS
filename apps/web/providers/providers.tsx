import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

import { AuthProvider } from "./auth-provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ClerkProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ClerkProvider>
  );
}