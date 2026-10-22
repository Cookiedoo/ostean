// Recognize direct canonical failure reporting.
function containsCanonicalFailure(node) {
  if (!ts.isBlock(node)) return false;
  var first = node.statements[0];
  return !!first && (ts.isExpressionStatement(first) || ts.isReturnStatement(first)) && recoveryCall(first.expression, new Set());
}

// Require explicit null recovery for mount acquisition.
function verifyBootstrap(file) {
  if (layerOf(file.fileName) !== 'runtime') return;
  var mounts = new Map();
  // Register mount lookup variables and their null branches.
  function discover(node) {
    if (!ts.isVariableDeclaration(node) || !node.initializer || !ts.isCallExpression(node.initializer)) return;
    var lookup = resolveCapability(node.initializer.expression, new Set());
    if (lookup?.symbol?.getName() !== 'getElementById' || !lookup.declaration.getSourceFile().fileName.endsWith('/lib.dom.d.ts')) return;
    if (!ts.isIdentifier(node.name)) {
      diagnose(705, file, node, 'Mount lookup requires direct binding');
      return;
    }
    var declaration = node.parent.parent;
    var block = declaration.parent;
    var index = block.statements ? block.statements.indexOf(declaration) : -1;
    var next = index < 0 ? null : block.statements[index + 1];
    var condition = next && ts.isIfStatement(next) ? next.expression : null;
    var valid = condition && ts.isBinaryExpression(condition) && condition.left.getText(file) === node.name.text
      && condition.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken && condition.right.kind === ts.SyntaxKind.NullKeyword;
    var returns = false;
    if (valid && ts.isBlock(next.thenStatement)) {
      for (var statement of next.thenStatement.statements) if (ts.isReturnStatement(statement)) returns = true;
      valid = returns && containsCanonicalFailure(next.thenStatement);
    } else valid = false;
    if (!valid) diagnose(705, file, node, 'Mount null recovery cannot be verified');
    mounts.set(originalSymbol(node.name), node);
  }
  walkNodes(file, discover);
  // Prevent mount handles escaping approved bootstrap expressions.
  function references(node) {
    if (!ts.isIdentifier(node) || !mounts.has(originalSymbol(node))) return;
    var parent = node.parent;
    var binding = ts.isVariableDeclaration(parent) && parent.name === node;
    var check = ts.isBinaryExpression(parent) && parent.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken && parent.right.kind === ts.SyntaxKind.NullKeyword;
    var renderer = ts.isCallExpression(parent) ? resolveCapability(parent.expression, new Set()) : null;
    var mount = renderer?.symbol?.getName() === 'createRoot' && renderer.declaration.getSourceFile().fileName.includes('react-dom') && parent.arguments[0] === node;
    if (!binding && !check && !mount) diagnose(701, file, node, 'DOM mount target escaped approved bootstrap');
  }
  walkNodes(file, references);
}
