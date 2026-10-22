import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wrapper = path.join(root, 'distribution/create-ostean');
const archive = path.join(root, 'dist/create-ostean-1.0.0.tgz');
const scratchRoot = path.resolve(process.argv[2] || 'work');
fs.mkdirSync(scratchRoot, { recursive: true });
const scratch = fs.mkdtempSync(path.join(scratchRoot, 'npm-proof-'));
const require = createRequire(import.meta.url);
const source = fs.readFileSync(path.join(wrapper, 'bin/dispatch.cjs'), 'utf8');
const proof = { archiveSha256: createHash('sha256').update(fs.readFileSync(archive)).digest('hex'), dispatcher: [], commands: [] };

// Verify dispatch failures and exact native exit propagation.
function dispatcher(platform, status, tampered, initialize) {
  let invoked = null;
  let diagnostic = '';
  const simulated = { platform, arch: 'x64', exitCode: 0, stderr: { write: /* Capture canonical dispatcher diagnostics. */ function write(text) { diagnostic += text; } } };
  const context = { module: { exports: {} }, __dirname: path.join(wrapper, 'bin'), process: simulated,
    // Supply controlled process and integrity boundaries.
    require: function dependency(name) {
      if (name === 'node:child_process') return {
        // Capture forwarding without executing the native binary.
        spawnSync: function spawn(binary, args, options) { invoked = { binary, args, options }; return { status }; }
      };
      if (name === 'node:fs' && tampered) return {
        // Corrupt manifest integrity without changing release bytes.
        readFileSync: function read(file, encoding) {
          if (!file.endsWith('manifest.json')) return fs.readFileSync(file, encoding);
          const manifest = JSON.parse(fs.readFileSync(file, encoding));
          manifest.platforms['win32-x64'].sha256 = '0'.repeat(64);
          return JSON.stringify(manifest);
        }
      };
      return require(name);
    }
  };
  vm.runInNewContext(source, context, { timeout: 10000 });
  context.module.exports.dispatch(['sample'], initialize);
  if (platform === 'unsupported' || tampered) {
    assert.equal(simulated.exitCode, 2);
    assert.equal(invoked, null);
    assert.match(diagnostic, /ERR_705_UNVERIFIABLE_CONSTRUCT/);
  } else {
    assert.equal(simulated.exitCode, status);
    assert.equal(JSON.stringify(invoked.args), JSON.stringify(initialize ? ['init', 'sample'] : ['sample']));
    assert.equal(invoked.options.shell, false);
  }
  proof.dispatcher.push({ platform, status, tampered, initialize, exit: simulated.exitCode });
}
dispatcher('win32', 0, false, true);
dispatcher('win32', 1, false, false);
dispatcher('win32', 2, false, false);
dispatcher('win32', 0, true, false);
dispatcher('unsupported', 0, false, true);

const candidates = [process.env.npm_execpath, path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
  path.resolve(path.dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js')];
const npm = candidates.find(/* Locate an installed npm JavaScript entrypoint. */ function exists(file) { return file && fs.existsSync(file); });
assert.ok(npm, 'npm CLI JavaScript entrypoint is required');

// Execute a packed local package through npm's npx pathway.
function execute(command, cwd, expected) {
  const args = [npm, 'exec', '--offline', '--yes', '--ignore-scripts', '--cache', path.join(scratch, 'cache'), '--package', archive, '--', ...command];
  const result = spawnSync(process.execPath, args, { cwd, encoding: 'utf8', timeout: 180000, windowsHide: true });
  assert.equal(result.status, expected, command.join(' ') + '\n' + result.stdout + result.stderr);
  proof.commands.push({ command, exit: result.status, stdout: result.stdout, stderr: result.stderr });
  console.log(command.join(' ') + ': exit ' + result.status);
}
execute(['create-ostean', 'reference', '--lang=ts'], scratch, 0);
execute(['ostean', 'check'], path.join(scratch, 'reference'), 0);
execute(['ostean', 'test'], path.join(scratch, 'reference'), 0);
execute(['create-ostean', 'unsupported', '--lang=py'], scratch, 2);
proof.ok = true;
fs.writeFileSync(path.join(root, 'DISTRIBUTION_PROOF.json'), JSON.stringify(proof, null, 2) + '\n');
console.log('Verified packed npm execution and five dispatcher controls');
