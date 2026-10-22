import type { RawInput, Reading, Result, ValueStore } from "../core/schemas.js";
import { parseReading } from "../components/parse-reading.js";

// Validate and commit a domain reading.
export function updateReading(input: RawInput, store: ValueStore): Result<Reading> {
  const parsed = parseReading(input);
  if (!parsed.ok) return parsed;
  return store.write(parsed.value);
}
