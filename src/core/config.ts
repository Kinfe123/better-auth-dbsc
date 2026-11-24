/** A rule in `scope.scope_specification`. */
export interface DbscScopeRule {
  type: "include" | "exclude";
  /** Host pattern such as `example.com` or `*.example.com`. Defaults to every host. */
  domain?: string;
  /** Path prefix. Defaults to `/`. */
  path?: string;
}

export interface DbscCredential {
  type: "cookie";
  name: string;
  /** Must match the bound cookie's `Set-Cookie` attributes, without `Max-Age`/`Expires`. */
  attributes: string;
}

/** The session config JSON returned from registration and refresh (W3C DBSC §9.6). */
export interface DbscSessionConfig {
  session_identifier: string;
  refresh_url: string;
  scope: {
    origin?: string;
    include_site: boolean;
    scope_specification?: DbscScopeRule[];
  };
  credentials: DbscCredential[];
  allowed_refresh_initiators?: string[];
}

/** The body that tells the browser to drop the DBSC session. */
export const DBSC_TERMINATE = { continue: false } as const;

export interface DbscCookieAttributes {
  domain?: string | undefined;
  path?: string | undefined;
  secure?: boolean | undefined;
  httpOnly?: boolean | undefined;
  sameSite?: string | undefined;
}

/**
 * Serializes cookie attributes in the form DBSC compares against `Set-Cookie`:
 * `Domain=…; Path=/; HttpOnly; Secure; SameSite=Lax`. `Max-Age` and `Expires` are
 * left out on purpose; they change on every refresh.
 */
export function formatCookieAttributes(attributes: DbscCookieAttributes): string {
  const parts: string[] = [];
  if (attributes.domain) parts.push(`Domain=${attributes.domain}`);
  parts.push(`Path=${attributes.path ?? "/"}`);
  if (attributes.httpOnly) parts.push("HttpOnly");
  if (attributes.secure) parts.push("Secure");
  if (attributes.sameSite) {
    const value = attributes.sameSite.toLowerCase();
    parts.push(`SameSite=${value.charAt(0).toUpperCase()}${value.slice(1)}`);
  }
  return parts.join("; ");
}
