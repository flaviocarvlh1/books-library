"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  bookCoverSrc,
  deleteBook,
  parsePublishedYear,
  updateBook,
} from "@/lib/books-api";
import type { Book } from "@/types/book";

import { useBooksLibrary } from "../books-context";

export function BooksList() {
  const {
    books,
    filteredBooks,
    loading,
    error,
    removeBookFromList,
    updateBookInList,
  } = useBooksLibrary();

  const [editing, setEditing] = useState<Book | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editGenre, setEditGenre] = useState("");
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editClearCover, setEditClearCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const editCoverInputRef = useRef<HTMLInputElement>(null);

  const editCoverPreviewUrl = useMemo(
    () => (editCoverFile ? URL.createObjectURL(editCoverFile) : null),
    [editCoverFile],
  );

  useEffect(() => {
    if (!editCoverPreviewUrl) return;
    return () => URL.revokeObjectURL(editCoverPreviewUrl);
  }, [editCoverPreviewUrl]);

  function openEdit(book: Book) {
    setEditing(book);
    setEditTitle(book.title);
    setEditAuthor(book.author);
    setEditYear(String(book.publishedYear));
    setEditGenre(book.genre ?? "");
    setEditCoverFile(null);
    setEditClearCover(false);
    setLocalError(null);
    if (editCoverInputRef.current) editCoverInputRef.current.value = "";
  }

  function closeEdit() {
    setEditing(null);
    setEditCoverFile(null);
    setEditClearCover(false);
    setLocalError(null);
    if (editCoverInputRef.current) editCoverInputRef.current.value = "";
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setLocalError(null);
    const year = parsePublishedYear(editYear);
    if (!editTitle.trim() || !editAuthor.trim() || year == null) {
      setLocalError("Preencha título, autor e um ano válido (1000 a 2100).");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateBook(editing.id, {
        title: editTitle.trim(),
        author: editAuthor.trim(),
        publishedYear: year,
        genre: editGenre.trim() === "" ? null : editGenre.trim(),
        coverFile: editCoverFile,
        clearCover: editClearCover,
      });
      updateBookInList(updated);
      closeEdit();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Erro ao atualizar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(book: Book) {
    if (!globalThis.confirm(`Excluir o livro “${book.title}”?`)) return;
    setLocalError(null);
    try {
      await deleteBook(book.id);
      removeBookFromList(book.id);
      if (editing?.id === book.id) closeEdit();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Erro ao excluir.");
    }
  }

  const topAlert = error ?? (!editing ? localError : null);

  return (
    <>
      {topAlert ? (
        <p className="text-destructive mb-4 text-sm" role="alert">
          {topAlert}
        </p>
      ) : null}

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Livros cadastrados
        </h2>

        {loading ? (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Carregando…
          </div>
        ) : books.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nenhum livro cadastrado ainda. Use o botão + no topo para adicionar.
          </p>
        ) : filteredBooks.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nenhum livro corresponde à busca ou ao filtro de gênero.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredBooks.map((b) => {
              const coverSrc = bookCoverSrc(b.coverPath);
              return (
                <Card key={b.id} className="overflow-hidden pt-0">
                  <div className="bg-muted relative aspect-[3/4] w-full border-b">
                    {coverSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={coverSrc}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full flex-col bg-blue-300 text-white items-center justify-center gap-2 p-6 text-center">
                        <p className="text-5xl font-semibold leading-tight">
                          {b.title}
                        </p>
                        <p className="text-muted-foreground text-white text-2xl font-semibold">{b.author}</p>
                        
                        <p className="text-muted-foreground text-white text-lg tabular-nums">
                          {b.publishedYear}
                        </p>
                      </div>
                    )}
                  </div>
                  {coverSrc ? (
                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-2 text-base leading-snug">
                        {b.title}
                      </CardTitle>
                      <CardDescription>
                        {[b.genre, `${b.author} · ${b.publishedYear}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </CardDescription>
                    </CardHeader>
                  ) : null}
                  <CardFooter
                    className={`flex gap-2 ${coverSrc ? "pt-0" : "pt-4"}`}
                  >
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => openEdit(b)}
                    >
                      <Pencil className="size-4" />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive flex-1 gap-2"
                      onClick={() => void handleDelete(b)}
                    >
                      <Trash2 className="size-4" />
                      Excluir
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {editing ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEdit();
          }}
        >
          <Card className="max-h-[90vh] w-full max-w-md overflow-y-auto shadow-lg">
            <CardHeader>
              <CardTitle>Editar livro</CardTitle>
              <CardDescription>
                Altere os dados e a capa, se quiser.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {localError ? (
                <p className="text-destructive mb-4 text-sm" role="alert">
                  {localError}
                </p>
              ) : null}
              <form className="grid gap-4" onSubmit={handleUpdate}>
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Título</Label>
                  <Input
                    id="edit-title"
                    value={editTitle}
                    onChange={(ev) => setEditTitle(ev.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-author">Autor</Label>
                  <Input
                    id="edit-author"
                    value={editAuthor}
                    onChange={(ev) => setEditAuthor(ev.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-genre">Gênero (opcional)</Label>
                  <Input
                    id="edit-genre"
                    value={editGenre}
                    onChange={(ev) => setEditGenre(ev.target.value)}
                    placeholder="Vazio remove o gênero"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-year">Ano</Label>
                  <Input
                    id="edit-year"
                    type="number"
                    inputMode="numeric"
                    value={editYear}
                    onChange={(ev) => setEditYear(ev.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="edit-clear"
                    type="checkbox"
                    checked={editClearCover}
                    onChange={(ev) => {
                      setEditClearCover(ev.target.checked);
                      if (ev.target.checked) {
                        setEditCoverFile(null);
                        if (editCoverInputRef.current) {
                          editCoverInputRef.current.value = "";
                        }
                      }
                    }}
                    className="size-4 rounded border"
                  />
                  <Label htmlFor="edit-clear" className="font-normal">
                    Remover capa atual
                  </Label>
                </div>
                {!editClearCover ? (
                  <div className="grid gap-2">
                    <Label>Nova capa (opcional)</Label>
                    <input
                      ref={editCoverInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(ev) =>
                        setEditCoverFile(ev.target.files?.[0] ?? null)
                      }
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => editCoverInputRef.current?.click()}
                      >
                        Escolher nova foto
                      </Button>
                      {editCoverFile ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                          onClick={() => {
                            setEditCoverFile(null);
                            if (editCoverInputRef.current) {
                              editCoverInputRef.current.value = "";
                            }
                          }}
                        >
                          Remover
                        </Button>
                      ) : null}
                    </div>
                    {editCoverFile ? (
                      <p className="text-muted-foreground text-xs">
                        {editCoverFile.name}
                      </p>
                    ) : (
                      <p className="text-muted-foreground text-xs">
                        Deixe em branco para manter a capa atual.
                      </p>
                    )}
                    {editCoverPreviewUrl ? (
                      <div className="bg-muted relative mt-1 aspect-[3/4] max-h-40 w-28 overflow-hidden rounded-md border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={editCoverPreviewUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button type="submit" disabled={saving} className="gap-2">
                    {saving ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Salvando
                      </>
                    ) : (
                      "Salvar"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeEdit}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
