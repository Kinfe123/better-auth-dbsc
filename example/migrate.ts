import { getMigrations } from "better-auth/db/migration";
import { auth } from "./auth.ts";

const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(auth.options);
if (toBeCreated.length === 0 && toBeAdded.length === 0) {
  console.log("Schema is up to date.");
} else {
  await runMigrations();
  console.log(
    `Migrated: ${[...toBeCreated, ...toBeAdded].map((table) => table.table).join(", ")}.`,
  );
}
