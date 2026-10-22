import type { FailureCode } from "../core/errors.js";
import type { Reading, Result, ValueStore } from "../core/schemas.js";
import { clamp } from "../primitives/clamp.js";
import { failure, success } from "../primitives/result.js";

// Create a mockable in-memory value store.
export function createValueStore(initial: Reading): ValueStore {
  let current: Reading = { value: clamp(initial.value) };
  // Read the current canonical value.
  function read(): Result<Reading> {
    return success(current);
  }
  // Store a bounded canonical value.
  function write(next: Reading): Result<Reading> {
    current = { value: clamp(next.value) };
    return success(current);
  }
  return { read, write };
}

// Create a deterministic service fault mock.
export function createFaultStore(code: FailureCode): ValueStore {
  // Return the configured canonical fault.
  function fault(): Result<Reading> {
    return failure(code);
  }
  return { read: fault, write: fault };
}
