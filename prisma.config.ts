// Carrega .env apenas fora de produção (local/dev).
// No Coolify/Docker as variáveis já vêm do ambiente do container.
import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

if (process.env.NODE_ENV !== "production") {
  loadEnv({ quiet: true });
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
