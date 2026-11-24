import { defineConfig } from "tsdown";

export default defineConfig({
  entry: { index: "src/index.ts", client: "src/client.ts", core: "src/core/index.ts" },
  format: "esm",
  dts: true,
  platform: "neutral",
  tsconfig: "tsconfig.build.json",
  deps: { neverBundle: ["better-auth", "jose"] },
});
