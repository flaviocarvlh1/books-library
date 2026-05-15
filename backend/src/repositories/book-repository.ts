import { randomUUID } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getPool } from "../db/pool.js";
import {
  deleteStoredCover,
  saveCoverFile,
} from "../lib/cover-storage.js";
import type { Book, CreateBookInput, UpdateBookInput } from "../types/book.js";

function mapRow(row: RowDataPacket): Book {
  const raw =
    row.cover_path == null || row.cover_path === ""
      ? null
      : String(row.cover_path);
  return {
    id: String(row.id),
    title: row.title as string,
    author: row.author as string,
    genre: row.genre == null || row.genre === "" ? null : String(row.genre),
    publishedYear: Number(row.published_year),
    coverPath: raw,
  };
}

export async function listBooks(): Promise<Book[]> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, title, author, genre, published_year, cover_path FROM books ORDER BY created_at DESC",
  );
  return rows.map(mapRow);
}

export async function getBookById(id: string): Promise<Book | null> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, title, author, genre, published_year, cover_path FROM books WHERE id = ? LIMIT 1",
    [id],
  );
  if (rows.length === 0) return null;
  return mapRow(rows[0]!);
}

export async function createBook(input: CreateBookInput): Promise<Book> {
  const pool = getPool();
  const id = randomUUID();

  let coverPath: string | null = null;
  if (input.coverFile) {
    coverPath = await saveCoverFile(input.coverFile.buffer, input.coverFile.mime);
  }

  const genre =
    input.genre != null && String(input.genre).trim() !== ""
      ? String(input.genre).trim()
      : null;

  await pool.execute(
    `INSERT INTO books (id, title, author, genre, published_year, cover_path)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, input.title, input.author, genre, input.publishedYear, coverPath],
  );

  const book = await getBookById(id);
  if (!book) throw new Error("Falha ao criar livro.");
  return book;
}

export async function updateBook(
  id: string,
  input: UpdateBookInput,
): Promise<Book | null> {
  const existing = await getBookById(id);
  if (!existing) return null;

  let coverPath = existing.coverPath;

  if (input.clearCover) {
    await deleteStoredCover(coverPath);
    coverPath = null;
  } else if (input.coverFile) {
    await deleteStoredCover(coverPath);
    coverPath = await saveCoverFile(input.coverFile.buffer, input.coverFile.mime);
  }

  const genre =
    input.genre === undefined
      ? existing.genre
      : input.genre === null || String(input.genre).trim() === ""
        ? null
        : String(input.genre).trim();

  const pool = getPool();
  await pool.execute(
    `UPDATE books SET title = ?, author = ?, genre = ?, published_year = ?, cover_path = ? WHERE id = ?`,
    [input.title, input.author, genre, input.publishedYear, coverPath, id],
  );

  return getBookById(id);
}

export async function deleteBook(id: string): Promise<boolean> {
  const existing = await getBookById(id);
  if (!existing) return false;
  await deleteStoredCover(existing.coverPath);
  const pool = getPool();
  const [result] = await pool.execute<ResultSetHeader>(
    "DELETE FROM books WHERE id = ?",
    [id],
  );
  return result.affectedRows > 0;
}
