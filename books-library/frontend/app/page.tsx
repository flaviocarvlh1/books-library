import React from 'react';

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">Welcome to the Books Library</h1>
      <p className="mb-6">Explore our collection of books and add new ones to the library.</p>
      <Link href="/books/new" className="text-blue-500 hover:underline">
        Add a New Book
      </Link>
    </div>
  );
}