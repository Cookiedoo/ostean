import { Codes } from "../core/errors.js";
import type { RawInput, Reading, Result } from "../core/schemas.js";
import { clamp } from "../primitives/clamp.js";
import { failure, success } from "../primitives/result.js";

// Validate and normalize an untrusted reading.
export function parseReading(input: RawInput): Result<Reading> {
  if (typeof input.value !== "number" || !Number.isFinite(input.value)) {
    return failure(Codes.SCHEMA_MISMATCH);
  }
  const reading: Reading = { value: clamp(input.value) };
  return success(reading);
}
