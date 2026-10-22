import { VALUE_MAX, VALUE_MIN } from "../core/constants.js";

// Clamp finite values within canonical bounds.
export function clamp(value: number): number {
  return Number.isFinite(value) ? Math.min(VALUE_MAX, Math.max(VALUE_MIN, value)) : VALUE_MIN;
}
