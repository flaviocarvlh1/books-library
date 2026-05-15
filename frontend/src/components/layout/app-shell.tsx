"use client";

import type { ReactNode } from "react";

import { PageContainer } from "@/components/layout/page-container";

import { BooksLibraryProvider } from "@/features/books/books-context";
import { BooksSiteHeader } from "@/features/books/components/books-site-header";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <BooksLibraryProvider>
      <div className="flex min-h-0 flex-1 flex-col">
        <BooksSiteHeader />
        <main className="flex-1">
          <PageContainer className="py-8">{children}</PageContainer>
        </main>
      </div>
    </BooksLibraryProvider>
  );
}
