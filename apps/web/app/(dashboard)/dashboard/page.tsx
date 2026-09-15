"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { userApi } from "@/lib/api";
import { Container, Page, Stack } from "@/components/layout";

export default function DashboardPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user: clerkUser } = useUser();

  const [backendUser, setBackendUser] = useState<any>(null);

  useEffect(() => {
    async function run() {
      console.log("===== FRONTEND AUTH =====");
      console.log("loaded:", isLoaded);
      console.log("signed in:", isSignedIn);
      console.log("clerk user:", clerkUser);

      const token = await getToken();

      console.log("token:", token);

      try {
        const me = await userApi.getMe();
        console.log("backend:", me);
        setBackendUser(me);
      } catch (e) {
        console.error("backend error", e);
      }
    }

    if (isLoaded) {
      run();
    }
  }, [isLoaded]);

  return (
    <Page>
      <Container>
        <Stack gap="xl">
          <Stack gap="sm">
            <h1>Interview Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your upcoming interviews and candidate evaluations.
            </p>
          </Stack>

          <section>
            <h2>Upcoming interviews</h2>
          </section>
        </Stack>
      </Container>
    </Page>
  );
}