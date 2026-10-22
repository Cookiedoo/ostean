// Recognize code references with canonical registry provenance.
function registeredCode(node, seen) {
  if (!node || seen.has(node)) return false;
  seen.add(node);
  if (ts.isParenthesizedExpression(node)) return registeredCode(node.expression, seen);
  if (ts.isConditionalExpression(node)) return registeredCode(node.whenTrue, new Set(seen)) && registeredCode(node.whenFalse, new Set(seen));
  var symbol = ts.isShorthandPropertyAssignment(node) ? OST.checker.getShorthandAssignmentValueSymbol(node) : originalSymbol(ts.isPropertyAccessExpression(node) ? node.name : node);
  var declaration = symbol?.valueDeclaration || symbol?.declarations?.[0];
  if (!declaration) return false;
  if (declaration.getSourceFile().fileName.endsWith('/core/errors.ts')) return true;
  if (ts.isVariableDeclaration(declaration) && declaration.initializer) return registeredCode(declaration.initializer, seen);
  var typeNode = declaration.type;
  if (typeNode && ts.isTypeReferenceNode(typeNode)) {
    var typeSymbol = originalSymbol(typeNode.typeName);
    return typeSymbol?.getName() === 'FailureCode' && typeSymbol.declarations?.some(/* Resolve canonical numerical registry ownership. */ function registry(item) { return item.getSourceFile().fileName.endsWith('/core/errors.ts'); });
  }
  return false;
}

// Require canonical failure codes at dispatch and envelope sites.
function verifySignals(file) {
  if (layerOf(file.fileName) === 'core') return;
  // Inspect failure factories and explicit code properties.
  function visit(node) {
    if ((ts.isPropertyAssignment(node) || ts.isShorthandPropertyAssignment(node)) && node.name.getText(file) === 'code') {
      var value = ts.isPropertyAssignment(node) ? node.initializer : node;
      if (!registeredCode(value, new Set())) diagnose(701, file, node, 'Failure code must originate in core/errors.ts');
    }
    if (ts.isCallExpression(node)) {
      var resolved = resolveCapability(node.expression, new Set());
      if (resolved?.symbol?.getName() === 'failure' && resolved.declaration.getSourceFile().fileName.endsWith('/primitives/result.ts') && !registeredCode(node.arguments[0], new Set())) diagnose(701, file, node, 'Failure dispatch requires a registered numerical code');
    }
  }
  walkNodes(file, visit);
}
