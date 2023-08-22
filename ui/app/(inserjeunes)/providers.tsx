"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

function Providers({ children, session }: { children: React.ReactNode; session: Session | null }) {
  return (
    <SessionProvider session={session} basePath="/api/inserjeunes/auth">
      {children}
    </SessionProvider>
  );
}

export default Providers;
