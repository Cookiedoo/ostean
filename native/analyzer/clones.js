// Preserve property identifiers during alpha normalization.
function propertyIdentifier(node) {
  var parent = node.parent;
  return (ts.isPropertyAccessExpression(parent) && parent.name === node)
    || ((ts.isPropertyAssignment(parent) || ts.isPropertySignature(parent) || ts.isMethodSignature(parent)) && parent.name === node)
    || ts.isJsxAttribute(parent) || ts.isJsxOpeningElement(parent)
    || ts.isJsxClosingElement(parent) || ts.isJsxSelfClosingElement(parent);
}

// Normalize locals while preserving free symbol identities.
function normalizedTree(root) {
  var local = new Map();
  var size = 0;
  // Encode one syntax subtree deterministically.
  function encode(node) {
    size += 1;
    var result = [node.kind];
    if (ts.isIdentifier(node)) {
      var symbol = originalSymbol(node);
      var declaration = symbol?.valueDeclaration || symbol?.declarations?.[0];
      var isLocal = declaration && declaration.getSourceFile() === root.getSourceFile()
        && enclosingFunction(declaration)
        && (ts.isVariableDeclaration(declaration) || ts.isParameter(declaration));
      if (isLocal && !propertyIdentifier(node)) {
        if (!local.has(symbol)) local.set(symbol, '$' + (local.size + 1));
        result.push(local.get(symbol));
      } else if (symbol && !propertyIdentifier(node)) {
        result.push((declaration?.getSourceFile().fileName || '') + ':' + symbol.getName());
      } else result.push(node.text);
    } else if (ts.isStringLiteral(node) || ts.isNumericLiteral(node) || ts.isRegularExpressionLiteral(node) || node.kind === ts.SyntaxKind.JsxText) result.push(node.text);
    if (ts.isShorthandPropertyAssignment(node)) result.push('key:' + node.name.text);
    // Encode each ordered syntax child.
    function child(value) { result.push(encode(value)); }
    ts.forEachChild(node, child);
    return result;
  }
  var encoded = JSON.stringify(encode(root));
  return { key: encoded, size: size };
}

// Reject repeated qualifying normalized AST subtrees.
function verifyClones() {
  var seen = new Map();
  for (var file of OST.sources) {
    if (layerOf(file.fileName) === 'core') continue;
    // Compare eligible blocks and expression trees.
    function visit(node) {
      if (!ts.isBlock(node) && !ts.isExpressionNode(node)) return;
      if (ts.isIdentifier(node) || ts.isLiteralExpression(node)) return;
      var normalized = normalizedTree(node);
      if (normalized.size < OST.config.verification.cloneNodes
        && !(ts.isBlock(node) && node.statements.length >= OST.config.verification.cloneStatements)) return;
      var first = seen.get(normalized.key);
      if (first && !(first.file === file && (node.pos >= first.node.pos && node.end <= first.node.end))) diagnose(704, file, node, 'Normalized AST clone; first at ' + first.location);
      else if (!first) seen.set(normalized.key, { file: file, node: node, location: file.fileName.replace(/^\/project\//, '') + ':' + (file.getLineAndCharacterOfPosition(node.getStart()).line + 1) });
    }
    walkNodes(file, visit);
  }
}
