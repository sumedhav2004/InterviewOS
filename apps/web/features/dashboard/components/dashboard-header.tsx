"use client";

import { useEffect, useRef, useState } from "react";
import { useUserByEmail } from "../hooks/useUserByEmail";
import { User } from "../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

type DashboardHeaderProps = {
  name: string;
};

export function DashboardHeader({ name }: DashboardHeaderProps) {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const { getUserByEmail, loading, error } = useUserByEmail();

  const handleSearch = async () => {
    if (!email.trim() || loading) return;

    setIsOpen(true);
    setUser(null);

    const result = await getUserByEmail(email.trim());
    setUser(result);
  };

  // Close when clicking outside the search area
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header>
      <div className="flex w-full justify-between">
        <div className="flex flex-col space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Dashboard</p>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome back, {name}
          </h1>

          <p className="max-w-2xl text-muted-foreground">
            Here&apos;s what&apos;s happening with your interviews.
          </p>
        </div>

        <div className="flex w-[50%] items-center justify-center">
          <div ref={searchRef} className="relative w-[70%]">
            <div className="flex items-center">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setUser(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleSearch();
                  }
                }}
                className="h-10 w-full rounded-md border px-3 pr-20"
                placeholder="Search by email..."
              />

              <button
                type="button"
                onClick={() => void handleSearch()}
                disabled={!email.trim() || loading}
                className="absolute right-1 h-8 rounded-md bg-primary px-3 text-sm text-primary-foreground disabled:opacity-50"
              >
                {loading ? "..." : "Search"}
              </button>
            </div>

            {isOpen && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-md border bg-background p-4 shadow-lg">
                {loading && <p className="text-sm text-muted-foreground">Searching for user...</p>}

                {!loading && error && <p className="text-sm text-destructive">{error}</p>}

                {!loading && !error && user && (
                  <Link
                    href={`/user/${user.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted"
                  >
                    <Avatar className="size-9">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>{user.name?.charAt(0).toUpperCase() ?? "U"}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="font-medium">{user.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </Link>
                )}

                {!loading && !error && !user && (
                  <p className="text-sm text-muted-foreground">No user found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
