import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get('/books', async (req, res) => {
  const books = await prisma.book.findMany();
  res.json(books);
});

app.post('/books', async (req, res) => {
  const { title, author } = req.body;
  const newBook = await prisma.book.create({
    data: {
      title,
      author,
    },
  });
  res.status(201).json(newBook);
});

app.listen(3001, () => {
  console.log('Backend server is running on http://localhost:3001');
});