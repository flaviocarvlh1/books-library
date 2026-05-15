"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { fetchBooks } from "@/lib/books-api";
import { foldAccent } from "@/lib/fold-accent";
import type { Book } from "@/types/book";

import { filterBooks, uniqueGenresFromBooks } from "./lib/filter-books";

type BooksLibraryContextValue = {
  books: Book[];
  filteredBooks: Book[];
  registeredGenres: string[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  genreFilter: string | null;
  setGenreFilter: (genre: string | null) => void;
  refetch: () => Promise<void>;
  addBook: (book: Book) => void;
  updateBookInList: (book: Book) => void;
  removeBookFromList: (id: string) => void;
};

const BooksLibraryContext = createContext<BooksLibraryContextValue | null>(
  null,
);

export function BooksLibraryProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setError(null);

    try {
      const data = await fetchBooks();
      setBooks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      void refetch();
    });
  }, [refetch]);

  const registeredGenres = useMemo(() => uniqueGenresFromBooks(books), [books]);

  const resolvedGenreFilter =
    genreFilter != null
      ? (registeredGenres.find(
          (g) => foldAccent(g) === foldAccent(genreFilter),
        ) ?? null)
      : null;

  const filteredBooks = useMemo(
    () => filterBooks(books, searchQuery, resolvedGenreFilter),
    [books, searchQuery, resolvedGenreFilter],
  );

  const addBook = useCallback((book: Book) => {
    setBooks((prev) => [book, ...prev]);
  }, []);

  const updateBookInList = useCallback((book: Book) => {
    setBooks((prev) => prev.map((b) => (b.id === book.id ? book : b)));
  }, []);

  const removeBookFromList = useCallback((id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      books,
      filteredBooks,
      registeredGenres,
      loading,
      error,
      searchQuery,
      setSearchQuery,
      genreFilter: resolvedGenreFilter,
      setGenreFilter,
      refetch,
      addBook,
      updateBookInList,
      removeBookFromList,
    }),
    [
      books,
      filteredBooks,
      registeredGenres,
      loading,
      error,
      searchQuery,
      resolvedGenreFilter,
      refetch,
      addBook,
      updateBookInList,
      removeBookFromList,
    ],
  );

  return (
    <BooksLibraryContext.Provider value={value}>
      {children}
    </BooksLibraryContext.Provider>
  );
}

export function useBooksLibrary(): BooksLibraryContextValue {
  const context = useContext(BooksLibraryContext);

  if (!context) {
    throw new Error(
      "useBooksLibrary deve ser usado dentro de BooksLibraryProvider.",
    );
  }

  return context;
}
