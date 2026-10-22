// Recognize compile-time types and import bindings.
function typePosition(node) {
  var current = node;
  while (current) {
    if (ts.isTypeNode(current) || ts.isImportDeclaration(current)) return true;
    if (ts.isStatement(current)) return false;
    current = current.parent;
  }
  return false;
}

// Recognize declaration names rather than runtime values.
function declarationIdentifier(node) {
  var parent = node.parent;
  return ts.isIdentifier(node) && ((ts.isVariableDeclaration(parent) || ts.isParameter(parent) || ts.isFunctionDeclaration(parent)) && parent.name === node || propertyIdentifier(node));
}

// Identify values originating in passive runtime registries.
function coreLiteralReference(node) {
  if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) return coreLiteralReference(node.expression);
  var symbol = ts.isIdentifier(node) && ts.isShorthandPropertyAssignment(node.parent) ? OST.checker.getShorthandAssignmentValueSymbol(node.parent) : originalSymbol(node);
  var declaration = symbol?.valueDeclaration || symbol?.declarations?.[0];
  return !!declaration && ts.isVariableDeclaration(declaration) && /\/core\/(?:constants|errors)\.ts$/.test(declaration.getSourceFile().fileName);
}

// Recognize safely copied primitive iteration values.
function scalarType(type) {
  if (!type) return false;
  if (type.isUnion()) {
    for (var item of type.types) if (!scalarType(item)) return false;
    return true;
  }
  return !!(type.flags & (ts.TypeFlags.NumberLike | ts.TypeFlags.StringLike | ts.TypeFlags.BooleanLike | ts.TypeFlags.Null | ts.TypeFlags.Undefined));
}

// Prevent passive registry objects from becoming shared state.
function verifyRegistryReferences(file) {
  if (layerOf(file.fileName) === 'core') return;
  // Require scalar access instead of object forwarding.
  function visit(node) {
    if (!(ts.isIdentifier(node) || ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) || declarationIdentifier(node) || typePosition(node)) return;
    var type = OST.checker.getTypeAtLocation(node);
    if (!(type.flags & ts.TypeFlags.Object) || type.getCallSignatures().length) return;
    if (!coreLiteralReference(node) && !sharedNamespace(node, type)) return;
    var parent = node.parent;
    var target = mutationTarget(parent);
    var binding = target && ts.isIdentifier(target) ? originalSymbol(target)?.valueDeclaration : null;
    if (binding?.getSourceFile().fileName.includes('/__ostean__/lib.')) return;
    var member = (ts.isPropertyAccessExpression(parent) || ts.isElementAccessExpression(parent)) && parent.expression === node;
    var iteration = ts.isForOfStatement(parent) && parent.expression === node && scalarType(OST.checker.getIndexTypeOfType(type, ts.IndexKind.Number));
    if (!member && !iteration) diagnose(705, file, node, 'Shared registry and namespace objects require explicit member reads');
  }
  walkNodes(file, visit);
}
