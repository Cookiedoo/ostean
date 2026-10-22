import type { FailureCode } from "../core/errors.js";
import type { Failure, Success } from "../core/schemas.js";

// Wrap a canonical successful value.
export function success<T>(value: T): Success<T> {
  return { ok: true, value };
}

// Wrap a canonical numerical failure.
export function failure(code: FailureCode): Failure {
  return { ok: false, code };
}
