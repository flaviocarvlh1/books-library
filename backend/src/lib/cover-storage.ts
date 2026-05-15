import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

const MIME_TO_EXT = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

export function isAllowedCoverMime(mime: string): boolean {
  return MIME_TO_EXT.has(mime);
}

export async function saveCoverFile(
  buffer: Buffer,
  mime: string,
): Promise<string> {
  const ext = MIME_TO_EXT.get(mime);
  if (!ext) {
    throw new Error("Tipo de imagem não permitido (use JPEG, PNG, WebP ou GIF).");
  }
  const dir = join(process.cwd(), "uploads", "covers");
  await mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}${ext}`;
  await writeFile(join(dir, filename), buffer);
  return `/uploads/covers/${filename}`;
}

export function isStoredUploadPath(url: string | null | undefined): boolean {
  return Boolean(url?.startsWith("/uploads/covers/"));
}

export async function deleteStoredCover(
  coverUrl: string | null | undefined,
): Promise<void> {
  if (!isStoredUploadPath(coverUrl)) return;
  const name = coverUrl!.slice("/uploads/covers/".length);
  if (!name || name.includes("/") || name.includes("..")) return;
  try {
    await unlink(join(process.cwd(), "uploads", "covers", name));
  } catch {
    // arquivo já removido ou inexistente
  }
}
