import type { BetterAuthClientPlugin } from "better-auth/client";
import type { dbsc } from "./dbsc-plugin.ts";
import { DBSC_ERROR_CODES } from "./error-codes.ts";
import packageJson from "../package.json" with { type: "json" };

export { DBSC_ERROR_CODES };

/**
 * Client half of {@link dbsc}. The browser drives DBSC by itself; this adds
 * `authClient.dbsc.getStatus()` and the plugin's error codes to the client.
 */
export const dbscClient = () =>
  ({
    id: "dbsc",
    version: packageJson.version,
    $InferServerPlugin: {} as ReturnType<typeof dbsc>,
    pathMethods: { "/dbsc/get-status": "GET" },
    $ERROR_CODES: DBSC_ERROR_CODES,
  }) satisfies BetterAuthClientPlugin;
