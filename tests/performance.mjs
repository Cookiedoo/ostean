import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const binary = path.resolve(process.argv[2] || path.join(root, 'bin', process.platform === 'win32' ? 'ostean.exe' : 'ostean'));
fs.mkdirSync('work', { recursive: true });
const scratch = fs.mkdtempSync(path.resolve('work/latency-'));
const samples = [];

// Measure complete process execution and require successful output.
function measure(args, cwd) {
  const started = performance.now();
  const result = spawnSync(binary, args, { cwd, encoding: 'utf8', windowsHide: true, timeout: 180000 });
  const milliseconds = performance.now() - started;
  assert.equal(result.status, 0, result.stdout + result.stderr);
  return { milliseconds, output: result.stdout };
}

for (let index = 0; index < 5; index++) samples.push(measure(['init', 'sample-' + index], scratch).milliseconds);
const checked = measure(['check'], path.join(scratch, 'sample-0'));
const ordered = [...samples].sort(/* Order measured durations numerically. */ function compare(left, right) { return left - right; });
const report = { platform: process.platform, architecture: process.arch, scope: 'Fresh process; local reference tree; filesystem cache uncontrolled',
  init: { samples, medianMilliseconds: ordered[2], targetMilliseconds: 10, targetMet: ordered[2] < 10 },
  check: { milliseconds: checked.milliseconds, targetMilliseconds: 20, targetMet: checked.milliseconds < 20 } };
console.log(JSON.stringify(report, null, 2));
if (process.argv.includes('--enforce')) assert.ok(report.init.targetMet && report.check.targetMet, 'Original latency targets are unmet');
