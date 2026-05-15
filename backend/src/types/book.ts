export type Book = {
  id: string;
  title: string;
  author: string;
  genre: string | null;
  publishedYear: number;
  /** Caminho relativo do arquivo salvo no servidor, ex.: `/uploads/covers/....jpg`, ou null. */
  coverPath: string | null;
};

export type CreateBookInput = {
  title: string;
  author: string;
  publishedYear: number;
  genre?: string | null;
  coverFile?: { buffer: Buffer; mime: string };
};

export type UpdateBookInput = {
  title: string;
  author: string;
  publishedYear: number;
  /** Omitir = manter; null ou "" = limpar */
  genre?: string | null;
  coverFile?: { buffer: Buffer; mime: string };
  clearCover?: boolean;
};
