"use client";

import { SignIn } from "@clerk/nextjs";

export function SignInFeature() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}