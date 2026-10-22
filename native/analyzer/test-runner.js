// Execute verified public and private suites in isolation.
function executeTests() {
  var modules = {};
  for (var file of OST.sources) {
    var name = file.fileName.replace(/^\/project\//, '').replace(/\.tsx?$/, '.js');
    var text = file.text;
    if (name === 'tests/private/stress.js') text = text.replace('const kind = index % STRESS_KINDS;', '__osteanCase(index);\n    const kind = index % STRESS_KINDS;');
    modules[name] = ts.transpileModule(text, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX }
    }).outputText;
  }
  var publicFiles = [];
  var privateFiles = [];
  for (var name of Object.keys(modules)) {
    if (name.startsWith('tests/public/')) publicFiles.push(name);
    if (name.startsWith('tests/private/')) privateFiles.push(name);
  }
  if (!publicFiles.length || !privateFiles.length) {
    diagnose(705, 'tests', null, 'Both public and private suites are required');
    return 2;
  }
  var source = '(' + isolatedTests.toString() + ')(' + JSON.stringify(modules) + ',' + JSON.stringify(publicFiles) + ',' + JSON.stringify(privateFiles) + ',' + JSON.stringify(OST.config.testing) + ')';
  var report = JSON.parse(OST_NATIVE.test(source));
  OST_NATIVE.print(JSON.stringify(report));
  if (!report.ok || report.private.total < OST.config.testing.privateCases) return 1;
  return 0;
}

// Load headless modules without host capabilities.
function isolatedTests(modules, publicFiles, privateFiles, testing) {
  var compile = Function;
  var loaded = {};
  var constructors = {};
  for (var name of Object.keys(modules)) constructors[name] = compile('require', 'exports', 'module', '__osteanCase', modules[name]);
  var executed = 0;
  var categories = [0, 0, 0, 0];
  // Count actual sequential private harness iterations.
  function countCase(index) {
    if (index !== executed) throw new Error('Invalid private execution sequence');
    categories[index % categories.length] += 1;
    executed += 1;
  }
  globalThis.Date = undefined;
  globalThis.eval = undefined;
  globalThis.Function = undefined;
  Math.random = undefined;
  // Resolve and evaluate an internal compiled module.
  function load(name) {
    if (loaded[name]) return loaded[name].exports;
    if (!constructors[name]) throw new Error('Unavailable isolated dependency');
    var module = { exports: {} };
    loaded[name] = module;
    // Resolve a static relative module dependency.
    function require(specifier) {
      if (!specifier.startsWith('.')) throw new Error('External test dependency requires an in-memory adapter');
      var parts = name.split('/');
      parts.pop();
      for (var segment of specifier.split('/')) {
        if (segment === '..') parts.pop();
        else if (segment !== '.' && segment) parts.push(segment);
      }
      return load(parts.join('/'));
    }
    constructors[name](require, module.exports, module, name === 'tests/private/stress.js' ? countCase : undefined);
    return module.exports;
  }
  // Execute canonical report exports from a suite.
  function suite(files, entry) {
    var summary = { ok: true, passed: 0, total: 0 };
    for (var file of files) {
      var result = load(file)[entry](testing.seed);
      if (!result || result.ok !== true || !Number.isInteger(result.total) || result.total !== result.passed) summary.ok = false;
      summary.passed += result?.passed || 0;
      summary.total += result?.total || 0;
    }
    return summary;
  }
  var publicReport = suite(publicFiles, 'runPublic');
  var privateReport = suite(privateFiles, 'runStress');
  privateReport.executed = executed;
  privateReport.categories = categories;
  privateReport.seed = testing.seed;
  privateReport.ok = privateReport.ok && executed === privateReport.total && executed >= testing.privateCases && categories.every(/* Require execution in every stress category. */ function covered(count) { return count > 0; });
  return JSON.stringify({ ok: publicReport.ok && privateReport.ok, public: publicReport, private: privateReport });
}
