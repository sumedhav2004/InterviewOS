"use client";

import { SignUp } from "@clerk/nextjs";

export function SignUpFeature() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}