import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scratch = fs.mkdtempSync(path.resolve('work/finalize-'));
fs.mkdirSync(path.join(scratch, 'distribution/create-ostean'), { recursive: true });
for (const name of ['package.json', 'README.md']) fs.copyFileSync(path.join(root, 'distribution/create-ostean', name), path.join(scratch, 'distribution/create-ostean', name));
fs.copyFileSync(path.join(root, 'distribution/finalize.py'), path.join(scratch, 'distribution/finalize.py'));
const archive = path.join(root, 'dist/create-ostean-1.0.0.tgz');

// Run finalization against isolated package metadata.
function run() {
  return spawnSync('python', [path.join(scratch, 'distribution/finalize.py'), archive], { encoding: 'utf8', windowsHide: true });
}

const valid = run();
assert.equal(valid.status, 0, valid.stdout + valid.stderr);
const proof = JSON.parse(fs.readFileSync(path.join(scratch, 'FINALIZATION_PROOF.json'), 'utf8'));
assert.equal(proof.unchangedExecutablePayload, true);
assert.deepEqual(proof.changedMetadata, ['package.json', 'README.md']);
const output = path.join(scratch, 'dist/create-ostean-1.0.0.tgz');
const before = createHash('sha256').update(fs.readFileSync(output)).digest('hex');
assert.equal(proof.archiveSha256, before);
assert.equal(run().status, 0);
assert.equal(createHash('sha256').update(fs.readFileSync(output)).digest('hex'), before);
const configPath = path.join(scratch, 'distribution/create-ostean/package.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
config.bin.ostean = 'unverified.cjs';
fs.writeFileSync(configPath, JSON.stringify(config));
assert.equal(run().status, 1, 'Executable configuration changes must be rejected');
assert.equal(createHash('sha256').update(fs.readFileSync(output)).digest('hex'), before);
console.log('Verified deterministic metadata finalization and executable-change rejection');
