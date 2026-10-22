// Resolve immutable aliases to their original callable declaration.
function resolveCapability(expression, seen) {
  if (!expression || seen.has(expression)) return null;
  seen.add(expression);
  if (ts.isParenthesizedExpression(expression)) return resolveCapability(expression.expression, seen);
  if (ts.isArrowFunction(expression) || ts.isFunctionExpression(expression)) return { declaration: expression, symbol: null };
  var name = ts.isPropertyAccessExpression(expression) ? expression.name : expression;
  var symbol = originalSymbol(name);
  var declaration = symbol?.valueDeclaration || symbol?.declarations?.[0];
  if (!declaration) return null;
  if (ts.isShorthandPropertyAssignment(declaration)) {
    symbol = OST.checker.getShorthandAssignmentValueSymbol(declaration);
    declaration = symbol?.valueDeclaration || symbol?.declarations?.[0];
    if (!declaration) return null;
  }
  if (ts.isVariableDeclaration(declaration) && declaration.initializer) {
    if (!(declaration.parent.flags & ts.NodeFlags.Const)) return null;
    return resolveCapability(declaration.initializer, seen);
  }
  if (ts.isPropertyAssignment(declaration)) return resolveCapability(declaration.initializer, seen);
  return { declaration: declaration, symbol: symbol };
}

// Determine whether a binding belongs to canonical schemas.
function canonicalSymbol(symbol) {
  for (var declaration of symbol?.declarations || []) {
    if (/\/core\/(?:schemas|constants|errors)\.ts$/.test(declaration.getSourceFile().fileName)) return true;
  }
  return false;
}

// Verify a concretely instantiated cross-layer payload type.
function canonicalType(type, seen) {
  if (!type || seen.has(type)) return true;
  seen.add(type);
  if (type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.TypeParameter)) return false;
  if (type.flags & (ts.TypeFlags.StringLike | ts.TypeFlags.NumberLike | ts.TypeFlags.BooleanLike | ts.TypeFlags.Void | ts.TypeFlags.Undefined | ts.TypeFlags.Null | ts.TypeFlags.Never)) return true;
  if (type.isUnion()) {
    for (var item of type.types) if (!canonicalType(item, seen)) return false;
    return true;
  }
  if (canonicalSymbol(type.aliasSymbol || type.symbol)) {
    for (var argument of type.aliasTypeArguments || type.typeArguments || []) if (!canonicalType(argument, seen)) return false;
    if (seen.size > 256) return false;
    if (type.symbol?.declarations?.some(standardDeclaration)) return ['Array', 'ReadonlyArray', 'Promise'].includes(type.symbol.getName());
    for (var property of OST.checker.getPropertiesOfType(type)) {
      var declaration = property.valueDeclaration || property.declarations?.[0];
      if (declaration && !canonicalType(OST.checker.getTypeOfSymbolAtLocation(property, declaration), seen)) return false;
    }
    for (var signature of type.getCallSignatures()) {
      if (!canonicalType(signature.getReturnType(), seen)) return false;
      for (var parameter of signature.parameters) if (!canonicalType(OST.checker.getTypeOfSymbolAtLocation(parameter, parameter.valueDeclaration), seen)) return false;
    }
    return true;
  }
  return false;
}

// Reject type widening that conceals external capabilities.
function verifyWidening(file, actual, expected, node) {
  if (!actual || !expected) return;
  if (actual.flags & ts.TypeFlags.Any) diagnose(705, file, node, 'Inferred any conceals a verifiable value');
  if (presentationType(actual, new Set()) && !presentationType(expected, new Set())) diagnose(701, file, node, 'Type widening conceals presentation or DOM data');
  if (layerOf(file.fileName) === 'services' && externalType(actual, new Set()) && !externalType(expected, new Set())) diagnose(701, file, node, 'External service data requires explicit canonical mapping');
}
