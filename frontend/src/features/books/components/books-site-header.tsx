"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ListFilter, Plus, Search } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useBooksLibrary } from "../books-context";

export function BooksSiteHeader() {
  const {
    searchQuery,
    setSearchQuery,
    genreFilter,
    setGenreFilter,
    registeredGenres,
  } = useBooksLibrary();

  const [filterOpen, setFilterOpen] = useState(false);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen) return;
    function handlePointerDown(ev: PointerEvent) {
      const el = filterPanelRef.current;
      if (el && !el.contains(ev.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [filterOpen]);

  useEffect(() => {
    if (!filterOpen) return;
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") setFilterOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [filterOpen]);

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <PageContainer className="flex flex-col gap-3 py-4">
        <Link
          href="/"
          className="text-foreground inline-block text-lg font-semibold tracking-tight hover:underline"
        >
          Biblioteca
        </Link>
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <div className="relative min-w-0 flex-1">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Buscar por título, autor ou ano…"
              value={searchQuery}
              onChange={(ev) => setSearchQuery(ev.target.value)}
              className="pl-9"
              aria-label="Buscar livros"
            />
          </div>
          <div className="relative shrink-0" ref={filterPanelRef}>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              aria-expanded={filterOpen}
              aria-haspopup="true"
              aria-controls="genre-filter-panel"
              onClick={() => setFilterOpen((o) => !o)}
              title="Filtrar por gênero"
            >
              <ListFilter className="size-4" />
              <span className="sr-only">Filtrar por gênero</span>
            </Button>
            {filterOpen ? (
              <div
                id="genre-filter-panel"
                role="dialog"
                aria-label="Filtro por gênero"
                className="bg-popover text-popover-foreground absolute top-full right-0 z-50 mt-2 w-64 rounded-md border p-3 shadow-md"
              >
                <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                  Gênero
                </p>
                <div className="flex max-h-56 flex-col gap-1 overflow-y-auto">
                  <FilterOption
                    label="Todos"
                    active={genreFilter == null}
                    onSelect={() => {
                      setGenreFilter(null);
                      setFilterOpen(false);
                    }}
                  />
                  {registeredGenres.length === 0 ? (
                    <p className="text-muted-foreground py-2 text-sm">
                      Nenhum gênero cadastrado nos livros.
                    </p>
                  ) : (
                    registeredGenres.map((g) => (
                      <FilterOption
                        key={g}
                        label={g}
                        active={genreFilter === g}
                        onSelect={() => {
                          setGenreFilter(g);
                          setFilterOpen(false);
                        }}
                      />
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex justify-center sm:justify-start">
          <Button
            asChild
            size="icon"
            className="rounded-full shadow-sm"
            title="Adicionar livro"
          >
            <Link href="/books/new" aria-label="Adicionar novo livro">
              <Plus className="size-5" />
            </Link>
          </Button>
        </div>
      </PageContainer>
    </header>
  );
}

function FilterOption({
  label,
  active,
  onSelect,
}: {
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        active
          ? "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-2 text-left text-sm font-medium"
          : "hover:bg-muted rounded-md px-3 py-2 text-left text-sm"
      }
    >
      {label}
    </button>
  );
}
