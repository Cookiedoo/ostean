import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destination = path.join(root, 'distribution/create-ostean');
const artifacts = process.argv[2] && path.resolve(process.argv[2]);
const expected = (process.argv[3] || (process.platform + '-' + process.arch)).split(',').sort();
const manifest = { release: 'v_final', platforms: {} };
const inputs = artifacts ? fs.readdirSync(artifacts).map(/* Resolve each platform artifact directory. */ function resolve(name) { return path.join(artifacts, name); }) : [root];

for (const input of inputs) {
  const proof = JSON.parse(fs.readFileSync(path.join(input, 'NATIVE_PROOF.json'), 'utf8'));
  const key = proof.platform + '-' + proof.architecture;
  assert.match(key, /^(win32-x64|linux-(x64|arm64)|darwin-(x64|arm64))$/);
  const filename = proof.platform === 'win32' ? 'ostean.exe' : 'ostean';
  const binary = path.join(input, 'bin', filename);
  const hash = createHash('sha256').update(fs.readFileSync(binary)).digest('hex');
  assert.equal(proof.ok, true, 'Native proof must pass before packaging');
  assert.equal(proof.binarySha256, hash, 'Native binary differs from verified bytes');
  assert.equal(proof.commands, 88, 'Complete native suite required');
  assert.equal(manifest.platforms[key], undefined, 'Duplicate platform artifact');
  const relative = 'native/' + key + '/' + filename;
  fs.mkdirSync(path.join(destination, 'native', key), { recursive: true });
  fs.copyFileSync(binary, path.join(destination, relative));
  fs.chmodSync(path.join(destination, relative), 0o755);
  manifest.platforms[key] = { path: relative, sha256: hash };
}
assert.deepEqual(Object.keys(manifest.platforms).sort(), expected, 'Required platform artifacts missing');
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.cpSync(path.join(root, 'licenses'), path.join(destination, 'licenses'), { recursive: true });
for (const name of ['LICENSE', 'THIRD_PARTY.md']) fs.copyFileSync(path.join(root, name), path.join(destination, name));
fs.writeFileSync(path.join(destination, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('Assembled verified platforms: ' + expected.join(', '));
