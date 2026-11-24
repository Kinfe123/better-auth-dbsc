import { DatabaseSync } from "node:sqlite";
import { betterAuth } from "better-auth";
import { dbsc } from "../src/index.ts";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-only-secret-change-me-0123456789abcdef",
  database: new DatabaseSync(process.env.DATABASE_PATH ?? "example.db"),
  emailAndPassword: { enabled: true },
  plugins: [dbsc()],
});
