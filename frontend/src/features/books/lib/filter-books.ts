import type { Book } from "@/types/book";

import { foldAccent } from "@/lib/fold-accent";

/** Gêneros distintos (uma etiqueta por “forma sem acento”), ordenados. */
export function uniqueGenresFromBooks(books: Book[]): string[] {
  const byFold = new Map<string, string>();
  for (const b of books) {
    const g = b.genre?.trim();
    if (!g) continue;
    const k = foldAccent(g);
    if (!byFold.has(k)) byFold.set(k, g);
  }
  return [...byFold.values()].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function filterBooks(
  books: Book[],
  searchQuery: string,
  genreFilter: string | null,
): Book[] {
  const q = searchQuery.trim();
  const fq = foldAccent(q);
  return books.filter((b) => {
    if (genreFilter != null) {
      const g = b.genre?.trim() ?? "";
      if (foldAccent(g) !== foldAccent(genreFilter)) return false;
    }
    if (q === "") return true;
    const hay = [b.title, b.author, b.genre ?? "", String(b.publishedYear)].join(
      " ",
    );
    return foldAccent(hay).includes(fq);
  });
}
