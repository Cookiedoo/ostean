import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
fs.mkdirSync('work', { recursive: true });
const scratch = fs.mkdtempSync(path.resolve('work/registry-install-'));
const publication = JSON.parse(fs.readFileSync(path.join(root, 'NPM_PUBLICATION_PROOF.json'), 'utf8'));
assert.equal(publication.exactArchiveVerified, true);
const bases = [path.join(path.dirname(process.execPath), 'node_modules/npm/bin'), path.resolve(path.dirname(process.execPath), '../lib/node_modules/npm/bin')];
const base = bases.find(/* Locate the installed npm CLI directory. */ function installed(name) { return fs.existsSync(path.join(name, 'npx-cli.js')); });
assert.ok(base, 'Installed npm and npx entrypoints required');
const proof = { registry: publication.registry, version: publication.version, archiveSha256: publication.archiveSha256, commands: [] };

// Run public registry commands with a fresh isolated cache.
function execute(entry, args, cwd) {
  const result = spawnSync(process.execPath, [path.join(base, entry), ...args], { cwd, encoding: 'utf8', timeout: 180000, windowsHide: true });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  proof.commands.push({ entry, args, exit: result.status, stdout: result.stdout, stderr: result.stderr });
  console.log(args.join(' ') + ': exit ' + result.status);
  return result.stdout;
}

const cache = path.join(scratch, 'cache');
execute('npx-cli.js', ['--yes', '--prefer-online', '--ignore-scripts', '--cache', cache, 'create-ostean@latest', 'reference', '--lang=ts'], scratch);
const project = path.join(scratch, 'reference');
const prefix = ['exec', '--yes', '--prefer-online', '--ignore-scripts', '--cache', cache, '--package=create-ostean@1.0.0', '--', 'ostean'];
execute('npm-cli.js', [...prefix, 'check'], project);
const tested = execute('npm-cli.js', [...prefix, 'test'], project);
const report = JSON.parse(tested.trim().split(/\r?\n/).at(-1));
assert.equal(report.public.passed, 9);
assert.equal(report.private.executed, 128);
proof.ok = true;
fs.writeFileSync(path.join(root, 'REGISTRY_INSTALL_PROOF.json'), JSON.stringify(proof, null, 2) + '\n');
console.log('Verified public npx installation, native check, and native tests');
