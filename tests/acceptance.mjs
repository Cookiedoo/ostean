import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const binary = path.resolve(process.argv[2] || path.join(root, 'bin', process.platform === 'win32' ? 'ostean.exe' : 'ostean'));
const workspace = path.resolve(process.argv[3] || 'work');
fs.mkdirSync(workspace, { recursive: true });
const scratch = fs.mkdtempSync(path.join(workspace, 'proof-'));
const fixtures = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures.json'), 'utf8'));
const proof = { platform: process.platform, architecture: process.arch, binarySha256: digest(binary), results: [] };

// Hash a release artifact's exact bytes.
function digest(file) { return createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }

// Run the native executable with bounded captured output.
function run(args, cwd) {
  return new Promise(/* Capture a bounded native command execution. */ function execution(resolve, reject) {
    const started = performance.now();
    const child = spawn(binary, args, { cwd, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    // Capture native diagnostic text without interpretation.
    function capture(chunk) { output += chunk; if (output.length > 2000000) child.kill(); }
    child.stdout.on('data', capture);
    child.stderr.on('data', capture);
    const deadline = setTimeout(/* Terminate commands exceeding the verification deadline. */ function expire() { child.kill(); }, 180000);
    child.on('error', reject);
    // Preserve process status and measured execution duration.
    child.on('close', function closed(status, signal) {
      clearTimeout(deadline);
      resolve({ args, exit: status, signal, milliseconds: Math.round(performance.now() - started), output });
    });
  });
}

// Record an asserted command result.
function record(name, result, expected, code) {
  assert.equal(result.exit, expected, name + '\n' + result.output);
  if (code) assert.match(result.output, new RegExp(':[1-9][0-9]*: ERR_' + code + '_'), name);
  proof.results.push({ name, ...result });
  console.log(name + ': exit ' + result.exit);
}

// Apply declarative adversarial mutations to a fresh project.
function mutate(directory, fixture) {
  for (const name of fixture.directories || []) fs.mkdirSync(path.join(directory, name), { recursive: true });
  for (const [name, text] of Object.entries(fixture.writes || {})) {
    const file = path.join(directory, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text);
  }
  for (const [name, text] of Object.entries(fixture.append || {})) fs.appendFileSync(path.join(directory, name), text);
  for (const [name, before, after] of fixture.replace || []) {
    const file = path.join(directory, name);
    const source = fs.readFileSync(file, 'utf8');
    assert.ok(source.includes(before), fixture.name + ' mutation target');
    fs.writeFileSync(file, source.replace(before, after));
  }
  for (const [name, keys, value] of fixture.json || []) {
    const file = path.join(directory, name);
    const object = JSON.parse(fs.readFileSync(file, 'utf8'));
    let cursor = object;
    for (const key of keys.slice(0, -1)) cursor = cursor[key];
    cursor[keys.at(-1)] = value;
    fs.writeFileSync(file, JSON.stringify(object, null, 2) + '\n');
  }
}

// Enumerate deterministic template bytes recursively.
function tree(directory, prefix = '') {
  const result = {};
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const name = prefix + entry.name;
    if (entry.isDirectory()) Object.assign(result, tree(path.join(directory, entry.name), name + '/'));
    else result[name] = digest(path.join(directory, entry.name));
  }
  return result;
}

const reference = path.join(scratch, 'reference');
record('init_reference', await run(['init', 'reference', '--lang=ts'], scratch), 0);
assert.deepEqual(tree(reference), tree(path.join(root, 'templates/ts')));
record('check_reference', await run(['check'], reference), 0);
const tested = await run(['test'], reference);
record('test_reference', tested, 0);
const report = JSON.parse(tested.output.trim().split(/\r?\n/).at(-1));
assert.equal(report.private.executed, 128);
assert.deepEqual(report.private.categories, [32, 32, 32, 32]);
record('reject_overwrite', await run(['init', 'reference'], scratch), 2, 705);
assert.deepEqual(tree(reference), tree(path.join(root, 'templates/ts')));
record('reject_language', await run(['init', 'python', '--lang=py'], scratch), 2, 705);
record('init_default', await run(['init'], scratch), 0);

// Verify independent fixtures with bounded native concurrency.
async function worker(offset) {
  for (let index = offset; index < fixtures.length; index += 2) {
    const fixture = fixtures[index];
    const directory = path.join(scratch, fixture.name);
    fs.cpSync(reference, directory, { recursive: true });
    mutate(directory, fixture);
    record(fixture.name, await run([fixture.command || 'check'], directory), fixture.exit, fixture.code);
  }
}
await Promise.all([worker(0), worker(1)]);
proof.results.sort(/* Order proof results by stable fixture names. */ function compare(left, right) { return left.name.localeCompare(right.name); });
proof.commands = proof.results.length;
proof.ok = true;
fs.writeFileSync(path.join(root, 'NATIVE_PROOF.json'), JSON.stringify(proof, null, 2) + '\n');
console.log('Verified ' + proof.commands + ' native command outcomes');
