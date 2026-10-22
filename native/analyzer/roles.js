// Require stateful exports to expose canonical mockable ports.
function verifyServicePorts(file) {
  if (layerOf(file.fileName) !== 'services') return;
  for (var node of file.statements) {
    if (!ts.isFunctionDeclaration(node) || !node.modifiers?.some(hasExport)) continue;
    var type = OST.checker.getSignatureFromDeclaration(node)?.getReturnType();
    if ((type?.symbol || type?.aliasSymbol)?.getName() === 'Promise') type = type.typeArguments?.[0];
    var methods = false;
    for (var property of type ? OST.checker.getPropertiesOfType(type) : []) {
      var declaration = property.valueDeclaration || property.declarations?.[0];
      if (declaration && OST.checker.getTypeOfSymbolAtLocation(property, declaration).getCallSignatures().length) methods = true;
    }
    if (!type || !canonicalSymbol(type.aliasSymbol || type.symbol) || !methods) diagnose(701, file, node, 'Service exports require canonical mockable method interfaces');
  }
}

// Enforce master control placement and bootstrap-only calculations.
function verifyRoles(file) {
  verifyServicePorts(file);
  var layer = layerOf(file.fileName);
  var controls = { button: 'Button.tsx', input: 'Input.tsx', select: 'Select.tsx', textarea: 'TextArea.tsx', canvas: 'Graph.tsx' };
  // Inspect intrinsic controls and runtime arithmetic.
  function visit(node) {
    if (layer === 'components/ui' && (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node))) {
      var tag = node.tagName.getText(file);
      var possible = [];
      var tagType = OST.checker.getTypeAtLocation(node.tagName);
      if (/^[a-z]/.test(tag)) possible.push(tag);
      else for (var candidate of tagType.types || [tagType]) {
        if (candidate.flags & ts.TypeFlags.StringLiteral) possible.push(candidate.value);
        else if (candidate.flags & (ts.TypeFlags.String | ts.TypeFlags.Any | ts.TypeFlags.Unknown)) diagnose(705, file, node, 'Dynamic intrinsic tag cannot be verified');
      }
      for (var intrinsic of possible) {
        if (intrinsic === 'style') diagnose(701, file, node, 'Styles must reside in core/styles.css');
        if (['script', 'iframe', 'frame', 'frameset', 'fencedframe', 'object', 'embed', 'link'].includes(intrinsic)) diagnose(705, file, node, 'Opaque browser execution element is unsupported: ' + intrinsic);
        if (Object.hasOwn(controls, intrinsic) && !file.fileName.endsWith('/components/ui/' + controls[intrinsic])) diagnose(701, file, node, 'Standard control requires its canonical master module: ' + controls[intrinsic]);
      }
      if (Object.hasOwn(controls, tag) && !file.fileName.endsWith('/components/ui/' + controls[tag])) diagnose(701, file, node, 'Standard control requires its canonical master module: ' + controls[tag]);
    }
    if (layer === 'runtime' && ts.isBinaryExpression(node)) {
      var operation = node.operatorToken.kind;
      if ((operation >= ts.SyntaxKind.FirstBinaryOperator && operation <= ts.SyntaxKind.LastBinaryOperator) && ![ts.SyntaxKind.EqualsToken, ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(operation)) diagnose(701, file, node, 'Runtime calculations belong in domain modules');
    }
    if (layer === 'runtime' && (ts.isPostfixUnaryExpression(node) || ts.isPrefixUnaryExpression(node) && node.operator !== ts.SyntaxKind.ExclamationToken)) diagnose(701, file, node, 'Runtime arithmetic belongs in domain modules');
  }
  walkNodes(file, visit);
}
