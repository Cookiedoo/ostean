import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspace = path.resolve(process.argv[2] || 'work');
const toolchain = path.join(workspace, 'toolchain/node_modules');
const { default: ts } = await import(pathToFileURL(path.join(toolchain, 'typescript/lib/typescript.js')));
const template = path.join(root, 'templates/ts');
const configuration = JSON.parse(fs.readFileSync(path.join(template, 'ostean.json'), 'utf8'));
assert.equal(ts.version, configuration.languageSocket.version);
assert.equal(process.versions.node, configuration.runtimeVersion);
const build = fs.mkdtempSync(path.join(workspace, 'socket-build-'));
const configPath = path.join(template, 'tsconfig.json');
const config = ts.readConfigFile(configPath, ts.sys.readFile);
assert.equal(config.error, undefined);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, template);
const options = { ...parsed.options, outDir: build, typeRoots: [path.join(toolchain, '@types')] };
const host = ts.createCompilerHost(options);

// Resolve the pinned scratch compiler's declared dependencies.
function resolve(names, containing) {
  const result = [];
  for (const name of names) {
    let module = ts.resolveModuleName(name, containing, options, host).resolvedModule;
    if (!module && !name.startsWith('.')) module = ts.resolveModuleName(name, path.join(workspace, 'toolchain/probe.ts'), options, host).resolvedModule;
    result.push(module);
  }
  return result;
}
host.resolveModuleNames = resolve;
const program = ts.createProgram(parsed.fileNames, options, host);
const diagnostics = ts.getPreEmitDiagnostics(program);
assert.equal(diagnostics.length, 0, diagnostics.map(/* Format compiler diagnostics for failed proofs. */ function message(item) { return ts.flattenDiagnosticMessageText(item.messageText, ' '); }).join('\n'));
assert.equal(program.emit().emitSkipped, false);
fs.writeFileSync(path.join(build, 'package.json'), JSON.stringify({ type: 'module' }));
const base = pathToFileURL(build + path.sep).href;
const constants = await import(base + 'core/constants.js');
const { runPublic } = await import(base + 'tests/public/contracts.js');
const { runStress } = await import(base + 'tests/private/stress.js');
const publicReport = runPublic();
const privateReport = runStress();
assert.deepEqual(publicReport, { ok: true, passed: 9, total: 9 });
assert.deepEqual(privateReport, { ok: true, passed: 128, total: 128 });
assert.deepEqual(runStress(), privateReport);
const timestamps = [1, -1, NaN, Infinity, 0, 1];
let cursor = 0;

// Inject backward and nonfinite clock samples.
function sampleClock() { return timestamps[cursor++]; }
constants.installClock(sampleClock);
for (const expected of [1, 1, 1, 1, 1, 1]) assert.equal(constants.monotonicNow(), expected);
const proof = { typescript: ts.version, files: parsed.fileNames.length, public: publicReport, private: privateReport, clockChecks: timestamps.length,
  architecturalVerification: 'See NATIVE_PROOF.json for native verification of the emitted socket' };
fs.writeFileSync(path.join(root, 'SOCKET_BUILD_PROOF.json'), JSON.stringify(proof, null, 2) + '\n');
console.log(JSON.stringify(proof));
