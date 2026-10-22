import { BIPOLAR_SCALE, DEFAULT_SEED, EXTREME_VALUES, INVALID_VALUES, PRIVATE_CASES, STRESS_KINDS, VALUE_MAX, VALUE_MIN, randomUnit, seedRandom } from "../../core/constants.js";
import { Codes } from "../../core/errors.js";
import type { TestReport } from "../../core/schemas.js";
import { createFaultStore, createValueStore } from "../../services/value-store.js";
import { updateReading } from "../../workflows/update-reading.js";

// Exercise seeded hostile boundary payloads.
export function runStress(seed: number = DEFAULT_SEED): TestReport {
  seedRandom(seed);
  let passed = 0;
  for (let index = 0; index < PRIVATE_CASES; index += 1) {
    const kind = index % STRESS_KINDS;
    const sampleIndex = Math.floor(index / STRESS_KINDS);
    const store = createValueStore({ value: 0 });
    if (kind === 0) {
      const input = (randomUnit() * BIPOLAR_SCALE - 1) * VALUE_MAX;
      const result = updateReading({ value: input }, store);
      if (result.ok && result.value.value >= VALUE_MIN && result.value.value <= VALUE_MAX) passed += 1;
    } else if (kind === 1) {
      const sample = INVALID_VALUES[sampleIndex % INVALID_VALUES.length];
      const result = updateReading({ value: sample }, store);
      if (!result.ok && result.code === Codes.SCHEMA_MISMATCH) passed += 1;
    } else if (kind === BIPOLAR_SCALE) {
      const extreme = EXTREME_VALUES[sampleIndex % EXTREME_VALUES.length] ?? VALUE_MAX;
      const result = updateReading({ value: extreme }, store);
      if (result.ok && Number.isFinite(result.value.value)) passed += 1;
    } else {
      const result = updateReading({ value: 0 }, createFaultStore(Codes.UPSTREAM_FAILURE));
      if (!result.ok && result.code === Codes.UPSTREAM_FAILURE) passed += 1;
    }
  }
  return { ok: passed === PRIVATE_CASES, passed, total: PRIVATE_CASES };
}
