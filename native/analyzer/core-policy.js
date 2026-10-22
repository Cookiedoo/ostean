// Recognize recursively passive literal initialization.
function passiveInitializer(node, seen) {
  if (!node || seen.has(node)) return false;
  seen.add(node);
  if (ts.isLiteralExpression(node) || [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword].includes(node.kind)) return true;
  if (ts.isPrefixUnaryExpression(node)) return passiveInitializer(node.operand, seen);
  if (ts.isAsExpression(node)) return node.type.getText() === 'const' && passiveInitializer(node.expression, seen);
  if (ts.isArrayLiteralExpression(node)) {
    for (var item of node.elements) if (!passiveInitializer(item, new Set(seen))) return false;
    return true;
  }
  if (ts.isObjectLiteralExpression(node)) {
    for (var property of node.properties) {
      if (!ts.isPropertyAssignment(property) || property.name.getText() === '__proto__' || !passiveInitializer(property.initializer, new Set(seen))) return false;
    }
    return true;
  }
  if (ts.isPropertyAccessExpression(node)) return !!(OST.checker.getTypeAtLocation(node).flags & ts.TypeFlags.NumberLike) && node.expression.getText() === 'Number';
  if (ts.isIdentifier(node)) {
    if (['NaN', 'Infinity', 'undefined'].includes(node.text)) return true;
    var declaration = originalSymbol(node)?.valueDeclaration;
    return !!declaration && ts.isVariableDeclaration(declaration) && !!(declaration.parent.flags & ts.NodeFlags.Const)
      && layerOf(declaration.getSourceFile().fileName) === 'core' && passiveInitializer(declaration.initializer, seen);
  }
  return false;
}

// Enforce passive registries and the sealed substrate implementation.
function verifyCorePolicy(file) {
  if (layerOf(file.fileName) !== 'core') return;
  var template = ts.createSourceFile('constants.ts', OST_TEMPLATES['core/constants.ts'], ts.ScriptTarget.Latest, true);
  var mutable = new Map();
  for (var statement of template.statements) if (ts.isVariableStatement(statement) && !(statement.declarationList.flags & ts.NodeFlags.Const)) {
    for (var declaration of statement.declarationList.declarations) mutable.set(declaration.name.getText(template), declaration.getText(template));
  }
  // Validate every core declaration and module-level mutation.
  function visit(node) {
    if (ts.isTypeNode(node) && OST.checker.getTypeAtLocation(node).flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) diagnose(705, file, node, 'Inferred opaque core contract is unverifiable');
    if (ts.isTypeNode(node) && externalType(OST.checker.getTypeAtLocation(node), new Set())) diagnose(701, file, node, 'Core contracts cannot contain external library types');
    if ([ts.SyntaxKind.UnknownKeyword, ts.SyntaxKind.ObjectKeyword].includes(node.kind)) diagnose(705, file, node, 'Opaque core contracts cannot prove containment');
    if ((ts.isInterfaceDeclaration(node) && node.members.length === 0) || (ts.isTypeLiteralNode(node) && node.members.length === 0)) diagnose(705, file, node, 'Empty structural contract cannot prove containment');
    if (ts.isVariableDeclaration(node) && !enclosingFunction(node)) {
      var name = node.name.getText(file);
      var constant = !!(node.parent.flags & ts.NodeFlags.Const);
      var sealed = ['RNG_MULTIPLIER', 'RNG_INCREMENT', 'RNG_DIVISOR', 'STRESS_KINDS', 'BIPOLAR_SCALE', 'INVALID_VALUES', 'EXTREME_VALUES'];
      if (sealed.includes(name)) {
        var expected = null;
        for (var statement of template.statements) if (ts.isVariableStatement(statement)) for (var item of statement.declarationList.declarations) if (item.name.getText(template) === name) expected = item;
        if (!expected || node.getText(file) !== expected.getText(template)) diagnose(705, file, node, 'Verified substrate or stress token was altered');
      }
      if (name === 'PRIVATE_CASES' && OST.checker.getTypeAtLocation(node.name).value !== OST.config.testing.privateCases) diagnose(705, file, node, 'Private case threshold differs from configuration');
      if (!constant) {
        if (!file.fileName.endsWith('/constants.ts') || mutable.get(name) !== node.getText(file)) diagnose(701, file, node, 'Mutable core state is reserved for sealed substrate hooks');
      } else if (!passiveInitializer(node.initializer, new Set())) diagnose(701, file, node, 'Core exports must contain passive immutable data');
    }
    if (mutationTarget(node) && !enclosingFunction(node)) diagnose(701, file, node, 'Core module-level mutation violates registry purity');
  }
  walkNodes(file, visit);
  if (file.fileName.endsWith('/errors.ts')) verifyErrorRegistry(file);
}

// Preserve numerical registry categories and canonical verifier codes.
function verifyErrorRegistry(file) {
  var expected = ts.createSourceFile('errors.ts', OST_TEMPLATES['core/errors.ts'], ts.ScriptTarget.Latest, true);
  var actualRegistry = null;
  var required = new Map();
  // Extract passive canonical code declarations.
  function registry(source) {
    for (var statement of source.statements) if (ts.isVariableStatement(statement)) for (var item of statement.declarationList.declarations) if (item.name.getText(source) === 'Codes' && ts.isAsExpression(item.initializer) && ts.isObjectLiteralExpression(item.initializer.expression)) return item.initializer.expression;
    return null;
  }
  actualRegistry = registry(file);
  for (var property of registry(expected).properties) required.set(property.name.getText(expected), property.initializer.getText(expected));
  if (!actualRegistry) { diagnose(705, file, null, 'Canonical numerical registry is required'); return; }
  var used = new Set();
  for (var property of actualRegistry.properties) {
    if (!ts.isPropertyAssignment(property)) { diagnose(705, file, property, 'Registry entries require explicit numerical properties'); continue; }
    var value = property.initializer;
    var name = property.name.getText(file);
    if (!ts.isNumericLiteral(value) || Number(value.text) < 100 || Number(value.text) > 799 || used.has(Number(value.text))) diagnose(701, file, property, 'Signal codes require unique numerical registry entries from 1xx through 7xx');
    used.add(Number(value.text));
    if (required.has(name) && required.get(name) !== value.getText(file)) diagnose(701, file, value, 'Canonical signal number cannot change');
    required.delete(name);
  }
  if (required.size) diagnose(705, file, null, 'Canonical signal registry entries are missing');
  var actualTypes = new Map();
  for (var statement of file.statements) if (ts.isTypeAliasDeclaration(statement)) actualTypes.set(statement.name.text, statement.getText(file));
  for (var statement of expected.statements) if (ts.isTypeAliasDeclaration(statement) && actualTypes.get(statement.name.text) !== statement.getText(expected)) diagnose(705, file, null, 'Canonical signal type definition was altered: ' + statement.name.text);
}

// Preserve the locked private adversarial harness.
function verifyLockedHarness() {
  for (var document of ['AGENTS.md', '.cursorrules']) {
    if (readSource(document)?.replace(/\r\n/g, '\n') !== OST_TEMPLATES[document]) diagnose(705, document, null, 'Canonical architectural constitution is required');
  }
  for (var layer of ['core', 'primitives', 'components', 'services', 'workflows', 'runtime']) {
    if (readSource(layer + '/README.md') === undefined) diagnose(705, layer + '/README.md', null, 'Anatomical boundary rulebook is required');
  }
  var name = 'tests/private/stress.ts';
  var actual = readSource(name)?.replace(/\r\n/g, '\n');
  if (actual !== OST_TEMPLATES[name]) diagnose(705, name, null, 'Locked private harness differs from the verified socket');
  for (var mapper of ['primitives/result.ts', 'services/failure-log.ts']) {
    if (readSource(mapper)?.replace(/\r\n/g, '\n') !== OST_TEMPLATES[mapper]) diagnose(705, mapper, null, 'Canonical result or error mapper differs from verified implementation');
  }
}
