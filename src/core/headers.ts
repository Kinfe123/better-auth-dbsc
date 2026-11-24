import type { DbscAlgorithm } from "./proof.ts";

/**
 * Which response header names to send.
 *
 * - `"standard"`: `Secure-Session-Registration` / `Secure-Session-Challenge`, as in the
 *   W3C draft and shipping Chrome.
 * - `"legacy"`: `Sec-Session-Registration` / `Sec-Session-Challenge`, from the original
 *   Chrome origin trial.
 * - `"both"`: send both. A browser registers once because the challenge is single-use.
 */
export type DbscHeaderNames = "standard" | "legacy" | "both";

export const DBSC_HEADERS = {
  registration: { standard: "Secure-Session-Registration", legacy: "Sec-Session-Registration" },
  challenge: { standard: "Secure-Session-Challenge", legacy: "Sec-Session-Challenge" },
  response: { standard: "Secure-Session-Response", legacy: "Sec-Session-Response" },
  sessionId: { standard: "Sec-Secure-Session-Id", legacy: "Sec-Session-Id" },
} as const;

type HeaderKind = keyof typeof DBSC_HEADERS;

/** Response header names to write for `kind`, in send order. */
export function getDbscHeaderNames(kind: HeaderKind, names: DbscHeaderNames): string[] {
  const pair = DBSC_HEADERS[kind];
  if (names === "standard") return [pair.standard];
  if (names === "legacy") return [pair.legacy];
  return [pair.standard, pair.legacy];
}

/** Reads a request header, preferring the standard name over the legacy one. */
export function readDbscHeader(headers: Headers, kind: HeaderKind): string | null {
  const pair = DBSC_HEADERS[kind];
  return headers.get(pair.standard) ?? headers.get(pair.legacy);
}

export interface DbscRegistrationHeaderInput {
  algorithms: readonly DbscAlgorithm[];
  challenge: string;
  /** Registration endpoint, absolute path or URL. */
  path: string;
  /** Opaque value the browser copies into the registration JWT as `authorization`. */
  authorization?: string;
}

/**
 * Formats a `Secure-Session-Registration` value (RFC 8941 structured field):
 * `(ES256 RS256);path="/api/auth/dbsc/register";challenge="..."`.
 */
export function formatRegistrationHeader(input: DbscRegistrationHeaderInput): string {
  if (input.algorithms.length === 0) {
    throw new TypeError("`algorithms` must list at least one of `ES256` or `RS256`.");
  }
  let value = `(${input.algorithms.join(" ")});path=${sfString(input.path)};challenge=${sfString(input.challenge)}`;
  if (input.authorization !== undefined) value += `;authorization=${sfString(input.authorization)}`;
  return value;
}

export interface DbscChallengeHeaderInput {
  challenge: string;
  sessionId: string;
}

/** Formats a `Secure-Session-Challenge` value: `"<challenge>";id="<session id>"`. */
export function formatChallengeHeader(input: DbscChallengeHeaderInput): string {
  return `${sfString(input.challenge)};id=${sfString(input.sessionId)}`;
}

/**
 * Reads an RFC 8941 sf-string such as the `Sec-Secure-Session-Id` value. Bare tokens are
 * accepted too, since older Chrome builds sent the id unquoted.
 */
export function parseSfString(value: string | null): string | null {
  if (value === null) return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith('"')) return trimmed || null;
  let out = "";
  for (let i = 1; i < trimmed.length; i++) {
    const char = trimmed[i];
    if (char === "\\") {
      const next = trimmed[i + 1];
      if (next !== '"' && next !== "\\") return null;
      out += next;
      i++;
      continue;
    }
    if (char === '"') return i === trimmed.length - 1 ? out : null;
    out += char;
  }
  return null;
}

function sfString(value: string): string {
  // RFC 8941 sf-string: printable ASCII only, with `"` and `\` escaped.
  if (!/^[\x20-\x7e]*$/.test(value)) {
    throw new TypeError(
      `DBSC header values must be printable ASCII, got ${JSON.stringify(value)}.`,
    );
  }
  return `"${value.replace(/[\\"]/g, (char) => `\\${char}`)}"`;
}
