import type { FailureCode } from "./errors.js";

// Canonical successful result envelope.
export interface Success<T> {
  readonly ok: true;
  readonly value: T;
}

// Canonical failed result envelope.
export interface Failure {
  readonly ok: false;
  readonly code: FailureCode;
}

// Canonical operation result union.
export type Result<T> = Success<T> | Failure;

// Untrusted boundary request envelope.
export type RawValue = string | number | boolean | null | undefined;

// Untrusted scalar request envelope.
export interface RawInput {
  readonly value: RawValue;
}

// Validated numeric domain value.
export interface Reading {
  readonly value: number;
}

// Mockable state boundary contract.
export interface ValueStore {
  // Read the current stored value.
  read(): Result<Reading>;
  // Replace the current stored value.
  write(next: Reading): Result<Reading>;
}

// Canonical failure notification envelope.
export interface FailureNotice {
  readonly code: FailureCode;
}

// Mockable canonical failure sink.
export interface FailureLog {
  // Retain a canonical failure notice.
  record(notice: FailureNotice): void;
  // Read the retained failure notice.
  read(): FailureNotice | undefined;
}

// Canonical test execution summary.
export interface TestReport {
  readonly ok: boolean;
  readonly passed: number;
  readonly total: number;
}
