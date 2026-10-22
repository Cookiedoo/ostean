const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { spawnSync } = require('node:child_process');

// Verify platform integrity and dispatch the native command.
function dispatch(args, initialize) {
  try {
    const directory = path.resolve(__dirname, '..');
    const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
    const platform = process.platform + '-' + process.arch;
    const entry = manifest.platforms[platform];
    if (manifest.release !== 'v_final' || !entry) throw new Error('No bundled native executable for ' + platform);
    const binary = path.resolve(directory, entry.path);
    if (!binary.startsWith(directory + path.sep) || !/^[a-f0-9]{64}$/.test(entry.sha256)) throw new Error('Invalid native manifest');
    const hash = createHash('sha256').update(fs.readFileSync(binary)).digest('hex');
    if (hash !== entry.sha256) throw new Error('Native executable checksum mismatch');
    const forwarded = initialize ? ['init', ...args] : args;
    const result = spawnSync(binary, forwarded, { stdio: 'inherit', shell: false, windowsHide: true });
    if (result.error) throw result.error;
    process.exitCode = Number.isInteger(result.status) ? result.status : 2;
  } catch (error) {
    process.stderr.write('<dispatcher>:1: ERR_705_UNVERIFIABLE_CONSTRUCT: ' + error.message + '\n');
    process.exitCode = 2;
  }
}

module.exports = { dispatch };
