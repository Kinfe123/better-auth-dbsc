export type DbscErrorCode =
  | "MALFORMED_PROOF"
  | "UNSUPPORTED_ALGORITHM"
  | "UNSUPPORTED_TYPE"
  | "INVALID_PUBLIC_KEY"
  | "INVALID_SIGNATURE"
  | "CHALLENGE_MISMATCH"
  | "AUTHORIZATION_MISMATCH"
  | "AUDIENCE_MISMATCH";

/**
 * Thrown when a DBSC proof (`Secure-Session-Response` JWT) cannot be accepted.
 * `code` is stable across releases; `message` says what to fix.
 */
export class DbscError extends Error {
  readonly code: DbscErrorCode;

  constructor(code: DbscErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "DbscError";
    this.code = code;
  }
}

export function isDbscError(error: unknown): error is DbscError {
  return error instanceof DbscError;
}
