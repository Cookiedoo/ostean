var OST = { diagnostics: [], files: [], sources: [], edges: new Map(), reads: new Map(), program: null, checker: null };
var OST_CODES = {
  701: 'ERR_701_LAYER_BREACH', 702: 'ERR_702_WEIGHT_EXCEEDED',
  703: 'ERR_703_NONDETERMINISTIC_CALL', 704: 'ERR_704_DUPLICATION_BREACH',
  705: 'ERR_705_UNVERIFIABLE_CONSTRUCT'
};

// Normalize portable project-relative paths.
function normalizePath(value) {
  var parts = [];
  for (var part of value.replace(/\\/g, '/').split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') parts.pop(); else parts.push(part);
  }
  return (value.startsWith('/') ? '/' : '') + parts.join('/');
}

// Return a normalized parent directory.
function parentPath(value) {
  var normalized = normalizePath(value);
  var slash = normalized.lastIndexOf('/');
  return slash < 0 ? '' : normalized.slice(0, slash);
}

// Read embedded libraries or confined project files.
function readSource(name) {
  var key = normalizePath(name);
  if (Object.hasOwn(OST_LIBRARIES, key)) return OST_LIBRARIES[key];
  if (key.startsWith('/project/')) key = key.slice('/project/'.length);
  else if (key.startsWith('/') || /^[A-Za-z]:/.test(key)) return undefined;
  if (!OST.reads.has(key)) OST.reads.set(key, OST_NATIVE.read(key));
  return OST.reads.get(key);
}

// Record a stable architectural diagnostic.
function diagnose(code, file, node, reason) {
  var line = 1;
  if (node && file && typeof file !== 'string') line = file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1;
  var name = typeof file === 'string' ? file : file.fileName;
  OST.diagnostics.push({ code: code, file: name.replace(/^\/project\//, ''), line: line, reason: reason });
}

// Compare diagnostics deterministically.
function compareDiagnostics(left, right) {
  return left.file.localeCompare(right.file) || left.line - right.line || left.code - right.code || left.reason.localeCompare(right.reason);
}

// Print diagnostics and select the required exit.
function finishDiagnostics() {
  OST.diagnostics.sort(compareDiagnostics);
  var exit = 0;
  var previous = '';
  for (var entry of OST.diagnostics) {
    var text = entry.file + ':' + entry.line + ': ' + OST_CODES[entry.code] + ': ' + entry.reason;
    if (text !== previous) OST_NATIVE.print(text);
    previous = text;
    exit = Math.max(exit, entry.code === 705 ? 2 : 1);
  }
  return exit;
}

// Identify the anatomical owner of a source.
function layerOf(name) {
  var value = normalizePath(name);
  if (value.startsWith('/project/')) value = value.slice('/project/'.length);
  if (value.startsWith('components/ui/')) return 'components/ui';
  var first = value.split('/')[0];
  return ['core', 'primitives', 'components', 'services', 'workflows', 'runtime', 'tests'].includes(first) ? first : null;
}

// Traverse every syntax node without skipping children.
function walkNodes(node, visit) {
  OST.activeFile = node.getSourceFile();
  OST.activeNode = node;
  visit(node);
  // Visit each direct syntax child.
  function child(value) { walkNodes(value, visit); }
  ts.forEachChild(node, child);
}

// Resolve aliases to their defining symbol.
function originalSymbol(node) {
  var symbol = OST.checker.getSymbolAtLocation(node);
  if (symbol && symbol.flags & ts.SymbolFlags.Alias) symbol = OST.checker.getAliasedSymbol(symbol);
  return symbol;
}
