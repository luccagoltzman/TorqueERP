"use client";

import { createContext, useContext } from "react";

import type { SessionContext } from "@/types/session";

const SessionContextProvider = createContext<SessionContext | null>(null);

export function SessionProvider({
  session,
  children,
}: {
  session: SessionContext;
  children: React.ReactNode;
}) {
  return (
    <SessionContextProvider value={session}>{children}</SessionContextProvider>
  );
}

export function useSession() {
  const session = useContext(SessionContextProvider);
  if (!session) {
    throw new Error("useSession deve ser usado dentro de SessionProvider");
  }
  return session;
}
