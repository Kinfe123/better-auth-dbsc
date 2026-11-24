import type { BetterAuthClientPlugin } from "better-auth/client";
import type { dbsc } from "./dbsc-plugin.ts";

/**
 * Client half of {@link dbsc}. The browser drives DBSC by itself; this adds
 * `authClient.dbsc.status()` and the plugin's error codes to the client's types.
 */
export const dbscClient = () =>
  ({
    id: "dbsc",
    $InferServerPlugin: {} as ReturnType<typeof dbsc>,
    pathMethods: { "/dbsc/status": "GET" },
  }) satisfies BetterAuthClientPlugin;
