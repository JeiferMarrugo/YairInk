"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PublicContent } from "@/types/content";

const PublicContentContext = createContext<PublicContent | null>(null);

export function PublicContentProvider({
  content,
  children,
}: {
  content: PublicContent;
  children: ReactNode;
}) {
  return (
    <PublicContentContext.Provider value={content}>
      {children}
    </PublicContentContext.Provider>
  );
}

export function usePublicContent(): PublicContent {
  const ctx = useContext(PublicContentContext);
  if (!ctx) {
    throw new Error("usePublicContent debe usarse dentro de PublicContentProvider");
  }
  return ctx;
}
