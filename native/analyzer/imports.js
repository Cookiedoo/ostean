// Resolve an internal static module specifier.
function internalTarget(file, specifier) {
  var path = normalizePath(parentPath(file.fileName) + '/' + specifier);
  if (!path.startsWith('/project/')) return null;
  path = path.slice('/project/'.length);
  var choices = [path, path.replace(/\.js$/, '.ts'), path.replace(/\.js$/, '.tsx')];
  for (var choice of choices) if (OST.files.includes(choice)) return choice;
  return null;
}

// Check vertical and lateral project relationships.
function legalInternal(source, target) {
  var from = layerOf(source);
  var to = layerOf(target);
  if (!from || !to) return false;
  if (from === 'tests') return to !== 'tests' || target.startsWith('tests/fixtures/');
  if (from === 'core') return source.endsWith('/schemas.ts') && ['core/constants.ts', 'core/errors.ts'].includes(target);
  if (from === 'runtime') return ['core', 'primitives', 'components', 'components/ui', 'services', 'workflows'].includes(to);
  if (from === 'components/ui') return ['core', 'primitives', 'components', 'components/ui'].includes(to);
  var matrix = {
    primitives: ['core'], components: ['core', 'primitives'],
    services: ['core', 'primitives', 'components'],
    workflows: ['core', 'primitives', 'components', 'services']
  };
  return (matrix[from] || []).includes(to);
}

// Verify all explicit and implicit import edges.
function verifyImports(file) {
  var source = file.fileName.replace(/^\/project\//, '');
  var layer = layerOf(source);
  OST.edges.set(source, []);
  for (var statement of file.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    var specifier = statement.moduleSpecifier;
    if (!ts.isStringLiteral(specifier)) {
      diagnose(705, file, statement, 'Import requires literal specifier');
      continue;
    }
    if (specifier.text.startsWith('.')) {
      var target = internalTarget(file, specifier.text);
      if (!target) diagnose(705, file, statement, 'Unresolved or escaping project import');
      else if (!legalInternal(source, target)) diagnose(701, file, statement, 'Forbidden import: ' + source + ' -> ' + target);
      else OST.edges.get(source).push(target);
    } else if (!allowedExternal(layer, specifier.text)) diagnose(701, file, statement, 'Unlisted entry point for ' + layer + ': ' + specifier.text);
  }
  if (file.languageVariant === ts.LanguageVariant.JSX) {
    if (layer !== 'components/ui') diagnose(701, file, file, 'JSX is confined to components/ui');
    if (!allowedExternal(layer, 'react/jsx-runtime')) diagnose(701, file, file, 'Implicit JSX runtime is not allowlisted');
  }
}

// Measure UI composition depth and reject cycles.
function verifyUiGraph() {
  var visiting = new Set();
  var measured = new Map();
  // Compute the longest UI-only dependency path.
  function depth(name) {
    if (visiting.has(name)) {
      diagnose(701, name, null, 'UI dependency cycle');
      return Infinity;
    }
    if (measured.has(name)) return measured.get(name);
    visiting.add(name);
    var maximum = 0;
    for (var target of OST.edges.get(name) || []) {
      if (layerOf(target) === 'components/ui') maximum = Math.max(maximum, 1 + depth(target));
    }
    visiting.delete(name);
    measured.set(name, maximum);
    if (maximum > OST.config.ui.maxCompositionHops) diagnose(701, name, null, 'UI exceeds two composition hops');
    return maximum;
  }
  for (var name of OST.edges.keys()) if (layerOf(name) === 'components/ui') depth(name);
}
