import type { FailureLog, FailureNotice } from "../core/schemas.js";

// Create a mockable canonical failure sink.
export function createFailureLog(): FailureLog {
  let latest: FailureNotice | undefined;
  // Retain the latest canonical failure.
  function record(notice: FailureNotice): void {
    latest = notice;
  }
  // Read the retained canonical failure.
  function read(): FailureNotice | undefined {
    return latest;
  }
  return { record, read };
}
