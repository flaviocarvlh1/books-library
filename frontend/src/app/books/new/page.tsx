import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NewBookForm } from "@/features/books/components/new-book-form";

export default function NewBookPage() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <Button asChild variant="ghost" className="mb-6 -ml-2 gap-2">
        <Link href="/">
          <ArrowLeft className="size-4" aria-hidden />
          Voltar à lista
        </Link>
      </Button>
      <NewBookForm />
    </div>
  );
}
