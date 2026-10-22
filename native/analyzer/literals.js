// Identify value literals outside exempt syntax.
function literalKey(node) {
  var parent = node.parent;
  if (!parent) return null;
  if (ts.isImportDeclaration(parent) || ts.isExternalModuleReference(parent)) return null;
  if (ts.isNumericLiteral(node)) {
    if (ts.isPrefixUnaryExpression(parent) && parent.operator === ts.SyntaxKind.MinusToken) return null;
    var value = Number(node.text);
    return value === 0 || value === 1 ? null : 'number:' + value;
  }
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(node.operand)) {
    var negative = -Number(node.operand.text);
    return negative === -1 || negative === 0 ? null : 'number:' + negative;
  }
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text === '' ? null : 'string:' + node.text;
  if (ts.isRegularExpressionLiteral(node)) return 'regex:' + node.text;
  if (node.kind === ts.SyntaxKind.JsxText) {
    var text = node.getText().trim();
    return text ? 'string:' + text : null;
  }
  return null;
}

// Reject repeated noncanonical literal values.
function verifyLiterals() {
  var seen = new Map();
  for (var file of OST.sources) {
    if (layerOf(file.fileName) === 'core') continue;
    // Count each non-exempt semantic literal.
    function visit(node) {
      var key = literalKey(node);
      if (!key) return;
      if (seen.has(key)) diagnose(704, file, node, 'Repeated literal requires canonical extraction; first at ' + seen.get(key));
      else seen.set(key, file.fileName.replace(/^\/project\//, '') + ':' + (file.getLineAndCharacterOfPosition(node.getStart()).line + 1));
    }
    walkNodes(file, visit);
  }
}
