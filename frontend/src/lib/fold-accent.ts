/**
 * Texto em minúsculas e sem marcas diacríticas (NFD), para busca e comparação.
 * Cobre bem português (ã, ç, ê, etc.).
 */
export function foldAccent(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
