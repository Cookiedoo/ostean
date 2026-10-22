// Detect third-party types within composite return values.
function externalType(type, visited) {
  if (!type || visited.has(type)) return false;
  visited.add(type);
  if (type.flags & ts.TypeFlags.Any) return true;
  if (type.flags & (ts.TypeFlags.StringLike | ts.TypeFlags.NumberLike | ts.TypeFlags.BooleanLike | ts.TypeFlags.Void | ts.TypeFlags.Undefined | ts.TypeFlags.Null | ts.TypeFlags.Unknown | ts.TypeFlags.TypeParameter)) return false;
  var symbol = type.aliasSymbol || type.symbol;
  for (var declaration of symbol?.declarations || []) if (declaration.getSourceFile().fileName.includes('/node_modules/')) return true;
  for (var child of type.types || []) if (externalType(child, visited)) return true;
  for (var argument of type.aliasTypeArguments || type.typeArguments || []) if (externalType(argument, visited)) return true;
  if (visited.size > 256) {
    diagnose(705, OST.activeFile, OST.activeNode, 'External type graph exceeds supported complexity');
    return false;
  }
  if (symbol?.declarations?.some(standardDeclaration)) return false;
  for (var property of OST.checker.getPropertiesOfType(type)) {
    var declaration = property.valueDeclaration || property.declarations?.[0];
    if (declaration && externalType(OST.checker.getTypeOfSymbolAtLocation(property, declaration), visited)) return true;
  }
  return false;
}

// Verify call arguments against anatomical type containment.
function verifyContainment(file) {
  var layer = layerOf(file.fileName);
  // Inspect every potentially crossing value.
  function visit(node) {
    if (layer !== 'core' && ts.isPropertyAssignment(node) && node.name.getText(file) === 'code' && ts.isNumericLiteral(node.initializer)) diagnose(701, file, node, 'Failure code must reference core/errors.ts');
    if (ts.isCallExpression(node)) {
      var resolved = resolveCapability(node.expression, new Set());
      var callee = resolved?.symbol;
      var declaration = resolved?.declaration;
      var owner = declaration ? layerOf(declaration.getSourceFile().fileName) : null;
      var renderer = layer === 'runtime' && callee?.getName() === 'render' && declaration?.getSourceFile().fileName.includes('react-dom');
      var signature = OST.checker.getResolvedSignature(node);
      for (var index = 0; index < node.arguments.length; index += 1) {
        var argument = node.arguments[index];
        var parameter = signature?.parameters[index];
        if (!parameter) continue;
        var expected = OST.checker.getTypeOfSymbolAtLocation(parameter, node);
        verifyWidening(file, OST.checker.getTypeAtLocation(argument), expected, argument);
        if (owner && owner !== layer && !canonicalType(expected, new Set())) diagnose(705, file, argument, 'Instantiated boundary parameter lacks canonical contract');
      }
      if (owner && owner !== layer) {
        for (var argument of node.arguments) {
          var type = OST.checker.getTypeAtLocation(argument);
          if (type.flags & ts.TypeFlags.Any) diagnose(705, file, argument, 'Erased any payload crosses anatomical boundary');
          if (externalType(type, new Set()) && !(owner === 'components/ui' && layer === 'components/ui')) diagnose(701, file, argument, 'External type crosses anatomical boundary');
        }
      }
      if (layer === 'runtime' && !renderer) {
        for (var argument of node.arguments) if (presentationType(OST.checker.getTypeAtLocation(argument), new Set())) {
          var mount = callee?.getName() === 'createRoot' && declaration?.getSourceFile().fileName.includes('react-dom');
          if (!mount) diagnose(701, file, argument, 'Presentation value may feed approved renderer only');
        }
      }
    }
    if (ts.isReturnStatement(node) && node.expression && layer === 'services') {
      if (externalType(OST.checker.getTypeAtLocation(node.expression), new Set())) diagnose(701, file, node, 'Service return leaks external types');
    }
    if (ts.isReturnStatement(node) && node.expression) {
      var enclosing = enclosingFunction(node);
      var functionSignature = enclosing && OST.checker.getSignatureFromDeclaration(enclosing);
      if (functionSignature) verifyWidening(file, OST.checker.getTypeAtLocation(node.expression), functionSignature.getReturnType(), node.expression);
    }
    if (ts.isVariableDeclaration(node) && node.initializer && node.type) verifyWidening(file, OST.checker.getTypeAtLocation(node.initializer), OST.checker.getTypeAtLocation(node.name), node.initializer);
    if (ts.isBinaryExpression(node) && mutationTarget(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) verifyWidening(file, OST.checker.getTypeAtLocation(node.right), OST.checker.getTypeAtLocation(node.left), node.right);
    if (ts.isIdentifier(node) && node.text === 'document' && layer !== 'runtime') diagnose(701, file, node, 'Global document access belongs in runtime bootstrap');
  }
  walkNodes(file, visit);
}
