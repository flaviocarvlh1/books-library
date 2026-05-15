import type { Book, CreateBookPayload, UpdateBookPayload } from "@/types/book";

export function parsePublishedYear(raw: string): number | null {
  const t = raw.trim();
  if (t === "") return null;
  const n = Number(t);
  if (!Number.isInteger(n) || n < 1000 || n > 2100) return null;
  return n;
}

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (url) return url.replace(/\/$/, "");
  return "http://backend:3333";
}

export function bookCoverSrc(coverPath: string | null): string | null {
  if (!coverPath || !coverPath.startsWith("/uploads/")) return null;
  const base = getBaseUrl();
  return `${base}${coverPath}`;
}

async function readErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const j = JSON.parse(text) as {
      error?: string;
      issues?: { path: (string | number)[]; message: string }[];
    };
    if (j.error) {
      if (j.issues?.length) {
        const first = j.issues[0]!;
        const path = first.path?.filter((p) => p !== "").join(".") || "campo";
        return `${j.error} (${path}: ${first.message})`;
      }
      return j.error;
    }
  } catch {}
  return text || `Erro HTTP ${res.status}`;
}

export async function fetchBooks(): Promise<Book[]> {
  const res = await fetch(`${getBaseUrl()}/books`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return res.json() as Promise<Book[]>;
}

export async function createBook(payload: CreateBookPayload): Promise<Book> {
  const base = getBaseUrl();
  const hasFile = payload.coverFile && payload.coverFile.size > 0;

  if (hasFile) {
    const fd = new FormData();
    fd.append("title", payload.title.trim());
    fd.append("author", payload.author.trim());
    fd.append("publishedYear", String(payload.publishedYear));
    const g = payload.genre?.trim();
    if (g) fd.append("genre", g);
    fd.append("cover", payload.coverFile!);
    const res = await fetch(`${base}/books`, { method: "POST", body: fd });
    if (!res.ok) throw new Error(await readErrorMessage(res));
    return res.json() as Promise<Book>;
  }

  const body: Record<string, string | number> = {
    title: payload.title.trim(),
    author: payload.author.trim(),
    publishedYear: payload.publishedYear,
  };
  const gen = payload.genre?.trim();
  if (gen) body.genre = gen;

  const res = await fetch(`${base}/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json() as Promise<Book>;
}

export async function updateBook(
  id: string,
  payload: UpdateBookPayload,
): Promise<Book> {
  const base = getBaseUrl();
  const hasFile = payload.coverFile && payload.coverFile.size > 0;

  if (hasFile) {
    const fd = new FormData();
    fd.append("title", payload.title.trim());
    fd.append("author", payload.author.trim());
    fd.append("publishedYear", String(payload.publishedYear));
    fd.append("genre", payload.genre?.trim() ?? "");
    if (payload.clearCover) fd.append("clearCover", "true");
    fd.append("cover", payload.coverFile!);
    const res = await fetch(`${base}/books/${id}`, { method: "PUT", body: fd });
    if (!res.ok) throw new Error(await readErrorMessage(res));
    return res.json() as Promise<Book>;
  }

  const body: {
    title: string;
    author: string;
    publishedYear: number;
    genre?: string | null;
    clearCover?: boolean;
  } = {
    title: payload.title.trim(),
    author: payload.author.trim(),
    publishedYear: payload.publishedYear,
  };

  if ("genre" in payload) {
    body.genre =
      payload.genre == null || payload.genre.trim() === ""
        ? null
        : payload.genre.trim();
  }

  if (payload.clearCover) {
    body.clearCover = true;
  }

  const res = await fetch(`${base}/books/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json() as Promise<Book>;
}

export async function deleteBook(id: string): Promise<void> {
  const res = await fetch(`${getBaseUrl()}/books/${id}`, { method: "DELETE" });
  if (res.status === 404) {
    throw new Error("Livro não encontrado.");
  }
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
}
