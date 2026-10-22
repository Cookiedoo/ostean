// Find the closest containing function body.
function enclosingFunction(node) {
  var current = node.parent;
  while (current && !ts.isFunctionLike(current)) current = current.parent;
  return current;
}

// Classify an assignment or increment target.
function mutationTarget(node) {
  if (ts.isBinaryExpression(node) && node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && node.operatorToken.kind <= ts.SyntaxKind.LastAssignment) return node.left;
  if ((ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) && [ts.SyntaxKind.PlusPlusToken, ts.SyntaxKind.MinusMinusToken].includes(node.operator)) return node.operand;
  return null;
}

// Reject captured mutation and illegal core implementations.
function verifyPurity(file) {
  var layer = layerOf(file.fileName);
  // Check each state mutation and canonical hook definition.
  function visit(node) {
    if (layer === 'core' && ts.isArrowFunction(node)) {
      var binding = ts.isVariableDeclaration(node.parent) ? node.parent.name.getText(file) : '';
      if (binding !== 'clockHook' || node.getText(file) !== '(): number => 0') diagnose(705, file, node, 'Unverified core function initializer');
    }
    if (layer === 'core' && ts.isCallExpression(node) && !enclosingFunction(node)) diagnose(701, file, node, 'Core token initialization cannot execute domain logic');
    if (layer === 'core' && ts.isFunctionDeclaration(node)) {
      if (!file.fileName.endsWith('/constants.ts')) diagnose(701, file, node, 'Core contracts cannot implement domain helpers');
      else {
        var template = ts.createSourceFile('constants.ts', OST_TEMPLATES['core/constants.ts'], ts.ScriptTarget.Latest, true);
        var expected = null;
        for (var statement of template.statements) if (ts.isFunctionDeclaration(statement) && statement.name.text === node.name.text) expected = statement;
        if (!expected || node.getText(file) !== expected.getText(template)) diagnose(705, file, node, 'Substrate hook implementation is outside verified socket');
      }
    }
    if (layer === 'core' && !file.fileName.endsWith('/constants.ts') && (ts.isCallExpression(node) || ts.isNewExpression(node))) diagnose(701, file, node, 'Passive core registry contains executable logic');
    var target = mutationTarget(node);
    if (target && ts.isIdentifier(target)) {
      var binding = originalSymbol(target)?.valueDeclaration;
      var defining = binding?.getSourceFile().fileName || '';
      if (defining.includes('/__ostean__/lib.') || defining.includes('/node_modules/')) diagnose(701, file, node, 'Trusted global binding mutation is prohibited');
    }
    if (target && ts.isPropertyAccessExpression(target)) {
      var baseDeclaration = resolveCapability(target.expression, new Set())?.declaration;
      var memberDeclaration = originalSymbol(target.name)?.declarations?.[0];
      if (baseDeclaration?.getSourceFile().fileName.includes('/__ostean__/lib.') || memberDeclaration?.getSourceFile().fileName.includes('/__ostean__/lib.')) diagnose(701, file, node, 'Trusted intrinsic member mutation is prohibited');
      if (/\/core\/(?:constants|errors)\.ts$/.test(memberDeclaration?.getSourceFile().fileName || '')) diagnose(701, file, node, 'Passive registry member mutation is prohibited');
    }
    if (!target || ['core', 'services', 'tests'].includes(layer)) return;
    if (!ts.isIdentifier(target)) {
      diagnose(701, file, node, 'Mutation outside services must target local scalar state');
      return;
    }
    var declaration = originalSymbol(target)?.valueDeclaration;
    var owner = enclosingFunction(node);
    if (!declaration || enclosingFunction(declaration) !== owner || !owner) diagnose(701, file, node, 'Captured or module state belongs in services');
  }
  walkNodes(file, visit);
}
