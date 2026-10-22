// Build a typed program with confined filesystem access.
function buildProgram() {
  OST.files = OST_NATIVE.list();
  var roots = [];
  for (var name of OST.files) {
    var layer = layerOf(name);
    if (/^core\/(?:utils|helpers)(?:\/|$)/.test(name)) { diagnose(701, name, null, 'Core helper directories are prohibited'); continue; }
    if (!/\.(?:tsx?|css|md|json)$/.test(name) && !['.gitignore', '.cursorrules'].includes(name)) diagnose(705, name, null, 'Unsupported project artifact format');
    if (/\.tsx?$/.test(name)) {
      if (!layer) diagnose(705, name, null, 'Source is outside anatomical directories');
      else if (name.endsWith('.d.ts')) diagnose(705, name, null, 'Project ambient declarations are unsupported');
      else roots.push('/project/' + name);
    }
    if (layer === 'runtime' && name !== 'runtime/main.ts' && !name.endsWith('.md')) diagnose(701, name, null, 'Runtime permits main.ts only');
    if (layer === 'core' && name !== 'core/README.md' && !OST.config.verification.canonicalCoreFiles.includes(name.slice('core/'.length))) diagnose(701, name, null, 'Noncanonical core source');
    if (name.endsWith('.css') && name !== 'core/styles.css') diagnose(701, name, null, 'Styles must reside in core/styles.css');
  }
  var settings = JSON.parse(OST_TEMPLATES['tsconfig.json']).compilerOptions;
  var converted = ts.convertCompilerOptionsFromJson(settings, '/project');
  var options = converted.options;
  options.noEmit = true;
  options.types = ['node'];
  var directories = new Set();
  var probes = new Map();
  for (var name of Object.keys(OST_LIBRARIES).concat(OST.files.map(/* Resolve project sources into compiler paths. */ function absolute(name) { return '/project/' + name; }))) {
    var parent = parentPath(name);
    while (parent) {
      directories.add(parent + '/');
      parent = parentPath(parent);
    }
    directories.add('/');
  }
  var host = {
    // Read a fully parsed source file.
    getSourceFile: function getSourceFile(name, version) {
      var text = readSource(name);
      return text === undefined ? undefined : ts.createSourceFile(name, text, version, true);
    },
    // Resolve the pinned standard library entry.
    getDefaultLibFileName: function getDefaultLibFileName() { return '/__ostean__/lib.es2022.full.d.ts'; },
    // Suppress compilation output during verification.
    writeFile: function writeFile() {},
    // Return the portable compiler root.
    getCurrentDirectory: function getCurrentDirectory() { return '/project'; },
    // Preserve case-sensitive architectural paths.
    getCanonicalFileName: function getCanonicalFileName(name) { return normalizePath(name); },
    // Require case-sensitive module identities.
    useCaseSensitiveFileNames: function useCaseSensitiveFileNames() { return true; },
    // Emit deterministic line separators.
    getNewLine: function getNewLine() { return '\n'; },
    // Test confined file existence.
    fileExists: function fileExists(name) { return readSource(name) !== undefined; },
    // Read a confined compiler input.
    readFile: readSource,
    // Recognize embedded and project directories.
    directoryExists: function directoryExists(name) {
      var prefix = normalizePath(name).replace(/\/$/, '') + '/';
      if (directories.has(prefix)) return true;
      if (!probes.has(prefix)) probes.set(prefix, readSource(prefix + 'package.json') !== undefined);
      return probes.get(prefix);
    },
    // Keep automatic ambient packages disabled.
    getDirectories: function getDirectories() { return []; },
    // Resolve static project and dependency imports.
    resolveModuleNames: function resolveModuleNames(names, containing) {
      var result = [];
      for (var specifier of names) result.push(ts.resolveModuleName(specifier, containing, options, host).resolvedModule);
      return result;
    }
  };
  OST.program = ts.createProgram(roots, options, host);
  OST.checker = OST.program.getTypeChecker();
  for (var dependency of OST.program.getSourceFiles()) {
    if (dependency.fileName.startsWith('/project/') && !dependency.fileName.includes('/node_modules/') && !roots.includes(dependency.fileName)) diagnose(705, dependency, null, 'Dependency is outside verified source inventory');
  }
  for (var root of roots) {
    var file = OST.program.getSourceFile(root);
    if (!file) diagnose(705, root, null, 'Source could not be parsed');
    else OST.sources.push(file);
  }
}

// Report semantic diagnostics after validating dependency edges.
function verifyTypeDiagnostics() {
  for (var diagnostic of ts.getPreEmitDiagnostics(OST.program)) {
    var file = diagnostic.file;
    var line = file ? file.getLineAndCharacterOfPosition(diagnostic.start || 0).line + 1 : 1;
    var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ');
    OST.diagnostics.push({ code: 705, file: file ? file.fileName.replace(/^\/project\//, '') : 'tsconfig.json', line: line, reason: 'TS' + diagnostic.code + ': ' + message });
  }
}
