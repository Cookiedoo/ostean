import { DEFAULT_SEED, PUBLIC_CASES, VALUE_MAX, VALUE_MIN, monotonicNow, randomUnit, seedRandom } from "../../core/constants.js";
import { Codes } from "../../core/errors.js";
import type { TestReport } from "../../core/schemas.js";
import { clamp } from "../../primitives/clamp.js";
import { parseReading } from "../../components/parse-reading.js";
import { createFaultStore, createValueStore } from "../../services/value-store.js";
import { createFailureLog } from "../../services/failure-log.js";
import { updateReading } from "../../workflows/update-reading.js";

// Verify deterministic public domain contracts.
export function runPublic(): TestReport {
  seedRandom(DEFAULT_SEED);
  const first = randomUnit();
  seedRandom(DEFAULT_SEED);
  const repeated = randomUnit();
  const store = createValueStore({ value: 0 });
  const updated = updateReading({ value: 1 }, store);
  const persisted = store.read();
  const rejected = parseReading({ value: null });
  const fault = updateReading({ value: 1 }, createFaultStore(Codes.SERVICE_EXHAUSTED));
  const failureLog = createFailureLog();
  const isolated = createFailureLog();
  failureLog.record({ code: Codes.METHOD_DISALLOWED });
  const recorded = failureLog.read();
  const checks = [
    first === repeated,
    first >= 0 && first < 1,
    monotonicNow() >= 0,
    clamp(Infinity) === VALUE_MIN,
    clamp(Number.MAX_VALUE) === VALUE_MAX,
    updated.ok && updated.value.value === 1 && persisted.ok && persisted.value.value === 1,
    !rejected.ok && rejected.code === Codes.SCHEMA_MISMATCH,
    !fault.ok && fault.code === Codes.SERVICE_EXHAUSTED,
    recorded?.code === Codes.METHOD_DISALLOWED && isolated.read() === undefined
  ];
  let passed = 0;
  for (const check of checks) if (check) passed += 1;
  return { ok: passed === PUBLIC_CASES, passed, total: PUBLIC_CASES };
}
