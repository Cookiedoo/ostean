// Lower numeric bound.
export const VALUE_MIN = -1000;
// Upper numeric bound.
export const VALUE_MAX = 1000;
// Initial stored value.
export const INITIAL_VALUE = 0;
// Demonstration input value.
export const DEMO_VALUE = 7;
// Host element identifier.
export const MOUNT_ID = "root";
// Value presentation class.
export const VALUE_CLASS = "u-value";
// Panel presentation class.
export const PANEL_CLASS = "u-panel";
// Application presentation class.
export const APP_CLASS = "u-app";
// Default deterministic seed.
export const DEFAULT_SEED = 1729;
// Random multiplication factor.
const RNG_MULTIPLIER = 1664525;
// Random additive increment.
const RNG_INCREMENT = 1013904223;
// Unsigned normalization divisor.
const RNG_DIVISOR = 4294967296;
// Public contract count.
export const PUBLIC_CASES = 9;
// Private stress count.
export const PRIVATE_CASES = 128;
// Stress category count.
export const STRESS_KINDS = 4;
// Bipolar random multiplier.
export const BIPOLAR_SCALE = 2;
// Invalid boundary samples.
export const INVALID_VALUES = [null, "", true, false, NaN, Infinity, -Infinity, "\u0000"] as const;
// Numeric extreme samples.
export const EXTREME_VALUES = [Number.MAX_VALUE, -Number.MAX_VALUE] as const;
// Clock hook signature.
export type ClockHook = () => number;
// Initial random state.
let randomState = DEFAULT_SEED;
// Initial monotonic reading.
let lastTime = 0;
// Read the default frozen clock.
let clockHook: ClockHook = (): number => 0;

// Install a deterministic monotonic clock source.
export function installClock(source: ClockHook): void {
  clockHook = source;
  lastTime = 0;
}

// Read a finite nondecreasing timestamp.
export function monotonicNow(): number {
  const sample = clockHook();
  if (Number.isFinite(sample) && sample >= lastTime) lastTime = sample;
  return lastTime;
}

// Reset the deterministic random sequence.
export function seedRandom(seed: number): void {
  randomState = (seed >>> 0) || DEFAULT_SEED;
}

// Advance the deterministic random sequence.
export function randomUnit(): number {
  randomState = (Math.imul(randomState, RNG_MULTIPLIER) + RNG_INCREMENT) >>> 0;
  return randomState / RNG_DIVISOR;
}
