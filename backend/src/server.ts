import { envLoadInfo } from "./load-env.js";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { booksRoutes } from "./routes/books.js";

const PORT = Number(process.env.PORT ?? 3333);
const HOST = process.env.HOST ?? "0.0.0.0";

mkdirSync(join(process.cwd(), "uploads", "covers"), { recursive: true });

const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.log.info(
  {
    envFile: envLoadInfo.loadedPath,
    mysqlUser: envLoadInfo.mysqlUser,
    mysqlPasswordConfigured: envLoadInfo.mysqlPasswordConfigured,
  },
  "Ambiente MySQL",
);
if (!envLoadInfo.mysqlPasswordConfigured) {
  app.log.warn(
    "MYSQL_PASSWORD está vazio ou não foi carregado. O cliente MySQL envia 'sem senha' e o servidor pode responder Access denied. Crie ou edite o arquivo .env na pasta backend com MYSQL_PASSWORD=sua_senha (a mesma do Workbench) e reinicie.",
  );
}

await app.register(cors, {
  origin: true,
});

await app.register(multipart, {
  limits: { fileSize: 5 * 1024 * 1024 },
});

await app.register(fastifyStatic, {
  root: join(process.cwd(), "uploads"),
  prefix: "/uploads/",
});

await app.register(booksRoutes);

try {
  await app.listen({ port: PORT, host: HOST });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
