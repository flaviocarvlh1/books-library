export type Book = {
  id: string;
  title: string;
  author: string;
  genre: string | null;
  publishedYear: number;
  /** Caminho do arquivo no servidor (ex.: `/uploads/covers/...`), ou null. */
  coverPath: string | null;
};

export type CreateBookPayload = {
  title: string;
  author: string;
  publishedYear: number;
  genre?: string | null;
  coverFile?: File | null;
};

export type UpdateBookPayload = CreateBookPayload & {
  clearCover?: boolean;
};
