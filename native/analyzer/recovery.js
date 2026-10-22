// Verify an immediate canonical failure dispatch operation.
function recoveryCall(expression, seen) {
  if (!expression || !ts.isCallExpression(expression)) return false;
  var resolved = resolveCapability(expression.expression, new Set());
  var declaration = resolved?.declaration;
  if (!declaration || seen.has(declaration)) return false;
  seen.add(declaration);
  var origin = declaration.getSourceFile().fileName;
  var name = resolved.symbol?.getName() || '';
  var sink = name === 'record' && origin.endsWith('/core/schemas.ts') && declaration.parent?.name?.getText() === 'FailureLog';
  if ((name === 'failure' && origin.endsWith('/primitives/result.ts')) || sink) {
    var argument = expression.arguments[0];
    if (!argument) return false;
    if (sink && ts.isObjectLiteralExpression(argument)) {
      var code = argument.properties.find(codeProperty);
      argument = code?.initializer;
    }
    return !!argument && canonicalType(OST.checker.getTypeAtLocation(argument), new Set())
      && !!OST.checker.getContextualType(argument);
  }
  if (!ts.isFunctionLike(declaration) || !declaration.body || !ts.isBlock(declaration.body)) return false;
  var first = declaration.body.statements[0];
  return !!first && (ts.isExpressionStatement(first) || ts.isReturnStatement(first)) && recoveryCall(first.expression, seen);
}

// Identify a canonical failure code property.
function codeProperty(property) {
  return ts.isPropertyAssignment(property) && property.name.getText() === 'code';
}

// Require canonical recovery before subsequent catch operations.
function canonicalRecovery(node) {
  var current = node;
  while (current.parent) {
    if (ts.isTryStatement(current.parent) && current === current.parent.tryBlock && current.parent.catchClause) {
      var first = current.parent.catchClause.block.statements[0];
      return !!first && (ts.isExpressionStatement(first) || ts.isReturnStatement(first)) && recoveryCall(first.expression, new Set());
    }
    if (ts.isFunctionLike(current.parent)) return false;
    current = current.parent;
  }
  return false;
}

// Verify approved renderer error handlers before initialization.
function verifyRendererHandlers(file, node) {
  var options = node.arguments[1];
  if (!options || !ts.isObjectLiteralExpression(options)) {
    diagnose(705, file, node, 'Renderer requires explicit canonical error handlers');
    return;
  }
  for (var name of ['onCaughtError', 'onUncaughtError', 'onRecoverableError']) {
    var handler = null;
    for (var property of options.properties) if (property.name?.getText(file) === name && ts.isPropertyAssignment(property)) handler = property.initializer;
    var resolved = handler && resolveCapability(handler, new Set());
    var declaration = resolved?.declaration;
    var first = declaration?.body && ts.isBlock(declaration.body) ? declaration.body.statements[0] : null;
    if (!first || !ts.isExpressionStatement(first) || !recoveryCall(first.expression, new Set())) diagnose(705, file, node, 'Renderer handler lacks immediate canonical dispatch: ' + name);
  }
}
