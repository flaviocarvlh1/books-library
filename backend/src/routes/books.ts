import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { isAllowedCoverMime } from "../lib/cover-storage.js";
import {
  createBook,
  deleteBook,
  listBooks,
  updateBook,
} from "../repositories/book-repository.js";

const publishedYearSchema = z.preprocess(
  (val) => {
    if (val === "" || val == null) return undefined;
    if (typeof val === "string") {
      const t = val.trim();
      return t === "" ? undefined : Number(t);
    }
    return val;
  },
  z.number().int().min(1000).max(2100),
);

const bookFieldsSchema = z.object({
  title: z.string().trim().min(1),
  author: z.string().trim().min(1),
  publishedYear: publishedYearSchema,
});

const genreFieldSchema = z.union([z.string(), z.null()]).optional();

function normalizeCreateGenre(
  g: string | null | undefined,
): string | undefined {
  if (g == null) return undefined;
  const t = g.trim();
  return t === "" ? undefined : t;
}

function normalizeUpdateGenre(
  g: string | null | undefined,
): string | null | undefined {
  if (g === undefined) return undefined;
  if (g === null) return null;
  const t = g.trim();
  return t === "" ? null : t;
}

const bookJsonCreateSchema = bookFieldsSchema.extend({
  genre: genreFieldSchema,
});

const bookJsonUpdateSchema = bookFieldsSchema.extend({
  genre: genreFieldSchema,
  clearCover: z.boolean().optional(),
});

const bookResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string(),
  genre: z.string().nullable(),
  publishedYear: z.number(),
  coverPath: z.string().nullable(),
});

const paramsSchema = z.object({
  id: z.string().min(1),
});

async function parseCreateMultipart(request: FastifyRequest) {
  let title = "";
  let author = "";
  let publishedYearRaw = "";
  let genre = "";
  let coverFile: { buffer: Buffer; mime: string } | undefined;

  const parts = request.parts({
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  for await (const part of parts) {
    if (part.type === "file" && part.fieldname === "cover") {
      const mime = part.mimetype ?? "application/octet-stream";
      const buffer = await part.toBuffer();
      if (buffer.length === 0) continue;
      if (!isAllowedCoverMime(mime)) {
        throw new Error("INVALID_COVER_TYPE");
      }
      coverFile = { buffer, mime };
    } else if (part.type === "field") {
      const v = String(part.value);
      if (part.fieldname === "title") title = v;
      if (part.fieldname === "author") author = v;
      if (part.fieldname === "publishedYear") publishedYearRaw = v;
      if (part.fieldname === "genre") genre = v;
    }
  }

  const publishedYear = Number(publishedYearRaw);
  const parsed = bookFieldsSchema.safeParse({
    title,
    author,
    publishedYear,
  });
  if (!parsed.success) {
    throw new Error("INVALID_BOOK_FIELDS");
  }
  const genreNorm =
    genre.trim() === "" ? undefined : genre.trim();
  return { ...parsed.data, genre: genreNorm, coverFile };
}

async function parseUpdateMultipart(request: FastifyRequest) {
  let title = "";
  let author = "";
  let publishedYearRaw = "";
  let genreFieldSeen = false;
  let genre = "";
  let clearCover = false;
  let coverFile: { buffer: Buffer; mime: string } | undefined;

  const parts = request.parts({
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  for await (const part of parts) {
    if (part.type === "file" && part.fieldname === "cover") {
      const mime = part.mimetype ?? "application/octet-stream";
      const buffer = await part.toBuffer();
      if (buffer.length === 0) continue;
      if (!isAllowedCoverMime(mime)) {
        throw new Error("INVALID_COVER_TYPE");
      }
      coverFile = { buffer, mime };
    } else if (part.type === "field") {
      const v = String(part.value);
      if (part.fieldname === "title") title = v;
      if (part.fieldname === "author") author = v;
      if (part.fieldname === "publishedYear") publishedYearRaw = v;
      if (part.fieldname === "genre") {
        genreFieldSeen = true;
        genre = v;
      }
      if (part.fieldname === "clearCover") {
        clearCover = v === "true" || v === "1";
      }
    }
  }

  const publishedYear = Number(publishedYearRaw);
  const parsed = bookFieldsSchema.safeParse({
    title,
    author,
    publishedYear,
  });
  if (!parsed.success) {
    throw new Error("INVALID_BOOK_FIELDS");
  }
  const genreUpdate = !genreFieldSeen
    ? undefined
    : genre.trim() === ""
      ? null
      : genre.trim();
  return { ...parsed.data, genre: genreUpdate, coverFile, clearCover };
}

export const booksRoutes: FastifyPluginAsync = async (app) => {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    "/books",
    {
      schema: {
        response: {
          200: z.array(bookResponseSchema),
        },
      },
    },
    async () => listBooks(),
  );

  r.post(
    "/books",
    async (request, reply) => {
      try {
        if (request.isMultipart()) {
          const data = await parseCreateMultipart(request);
          const book = await createBook({
            title: data.title,
            author: data.author,
            publishedYear: data.publishedYear,
            genre: data.genre,
            coverFile: data.coverFile,
          });
          return reply.status(201).send(book);
        }

        const body = bookJsonCreateSchema.parse(request.body);
        const book = await createBook({
          title: body.title,
          author: body.author,
          publishedYear: body.publishedYear,
          genre: normalizeCreateGenre(body.genre),
        });
        return reply.status(201).send(book);
      } catch (e) {
        if (e instanceof z.ZodError) {
          return reply.status(400).send({ error: "Payload inválido.", issues: e.issues });
        }
        if (e instanceof Error) {
          if (e.message === "INVALID_COVER_TYPE") {
            return reply.status(400).send({ error: "Use JPEG, PNG, WebP ou GIF para a capa." });
          }
          if (e.message === "INVALID_BOOK_FIELDS") {
            return reply.status(400).send({ error: "Título, autor e ano de publicação são obrigatórios." });
          }
          request.log.error(e);
          return reply.status(400).send({ error: e.message });
        }
        throw e;
      }
    },
  );

  r.put(
    "/books/:id",
    {
      schema: {
        params: paramsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      try {
        if (request.isMultipart()) {
          const data = await parseUpdateMultipart(request);
          const book = await updateBook(id, {
            title: data.title,
            author: data.author,
            publishedYear: data.publishedYear,
            genre: data.genre,
            coverFile: data.coverFile,
            clearCover: data.clearCover,
          });
          if (!book) return reply.status(404).send({ error: "Livro não encontrado." });
          return book;
        }

        const body = bookJsonUpdateSchema.parse(request.body);
        const book = await updateBook(id, {
          title: body.title,
          author: body.author,
          publishedYear: body.publishedYear,
          genre: normalizeUpdateGenre(body.genre),
          clearCover: body.clearCover,
        });
        if (!book) return reply.status(404).send({ error: "Livro não encontrado." });
        return book;
      } catch (e) {
        if (e instanceof z.ZodError) {
          return reply.status(400).send({ error: "Payload inválido.", issues: e.issues });
        }
        if (e instanceof Error) {
          if (e.message === "INVALID_COVER_TYPE") {
            return reply.status(400).send({ error: "Use JPEG, PNG, WebP ou GIF para a capa." });
          }
          if (e.message === "INVALID_BOOK_FIELDS") {
            return reply.status(400).send({ error: "Título, autor e ano de publicação são obrigatórios." });
          }
          request.log.error(e);
          return reply.status(400).send({ error: e.message });
        }
        throw e;
      }
    },
  );

  r.delete(
    "/books/:id",
    {
      schema: {
        params: paramsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const ok = await deleteBook(id);
      if (!ok) return reply.status(404).send({ error: "Livro não encontrado." });
      return reply.status(204).send();
    },
  );
};
