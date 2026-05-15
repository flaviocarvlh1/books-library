"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBook, parsePublishedYear } from "@/lib/books-api";

import { useBooksLibrary } from "../books-context";

export function NewBookForm() {
  const router = useRouter();
  const { addBook } = useBooksLibrary();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publishedYear, setPublishedYear] = useState("");
  const [genre, setGenre] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createCoverInputRef = useRef<HTMLInputElement>(null);

  const coverPreviewUrl = useMemo(
    () => (coverFile ? URL.createObjectURL(coverFile) : null),
    [coverFile],
  );

  useEffect(() => {
    if (!coverPreviewUrl) return;
    return () => URL.revokeObjectURL(coverPreviewUrl);
  }, [coverPreviewUrl]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const year = parsePublishedYear(publishedYear);
    if (!title.trim() || !author.trim() || year == null) {
      setError("Preencha título, autor e um ano válido (1000 a 2100).");
      return;
    }
    setSaving(true);
    try {
      const book = await createBook({
        title: title.trim(),
        author: author.trim(),
        publishedYear: year,
        genre: genre.trim() || undefined,
        coverFile,
      });
      addBook(book);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardHeader>
        <CardTitle>Novo livro</CardTitle>
        <CardDescription>
          Título, autor, ano e capa opcional (foto do aparelho).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-destructive mb-4 text-sm" role="alert">
            {error}
          </p>
        ) : null}
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="new-title">Título</Label>
            <Input
              id="new-title"
              name="title"
              value={title}
              onChange={(ev) => setTitle(ev.target.value)}
              autoComplete="off"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-author">Autor</Label>
            <Input
              id="new-author"
              name="author"
              value={author}
              onChange={(ev) => setAuthor(ev.target.value)}
              autoComplete="off"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-genre">Gênero (opcional)</Label>
            <Input
              id="new-genre"
              name="genre"
              value={genre}
              onChange={(ev) => setGenre(ev.target.value)}
              autoComplete="off"
              placeholder="Romance, ficção…"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-year">Ano de publicação</Label>
            <Input
              id="new-year"
              name="publishedYear"
              type="number"
              inputMode="numeric"
              value={publishedYear}
              onChange={(ev) => setPublishedYear(ev.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label>Capa (opcional)</Label>
            <input
              ref={createCoverInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(ev) => setCoverFile(ev.target.files?.[0] ?? null)}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => createCoverInputRef.current?.click()}
              >
                Escolher foto da capa
              </Button>
              {coverFile ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => {
                    setCoverFile(null);
                    if (createCoverInputRef.current) {
                      createCoverInputRef.current.value = "";
                    }
                  }}
                >
                  Remover
                </Button>
              ) : null}
            </div>
            {coverFile ? (
              <p className="text-muted-foreground text-xs">{coverFile.name}</p>
            ) : (
              <p className="text-muted-foreground text-xs">
                Galeria ou câmera, conforme o aparelho.
              </p>
            )}
            {coverPreviewUrl ? (
              <div className="bg-muted relative mt-1 aspect-[3/4] max-h-40 w-28 overflow-hidden rounded-md border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverPreviewUrl}
                  alt=""
                  className="size-full object-cover"
                />
              </div>
            ) : null}
          </div>
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="animate-spin" />
                Salvando
              </>
            ) : (
              "Cadastrar"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
