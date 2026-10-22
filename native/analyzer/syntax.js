// Reject constructs outside the explicitly supported grammar.
function verifySyntax(file) {
  var names = ('SourceFile EndOfFileToken Identifier QualifiedName ComputedPropertyName '
    + 'ImportDeclaration ImportClause NamedImports ImportSpecifier '
    + 'VariableStatement VariableDeclarationList VariableDeclaration FunctionDeclaration ArrowFunction '
    + 'Parameter TypeParameter Block ReturnStatement IfStatement ForStatement ForOfStatement '
    + 'ExpressionStatement BinaryExpression PrefixUnaryExpression PostfixUnaryExpression '
    + 'PropertyAccessExpression ElementAccessExpression CallExpression NewExpression AwaitExpression '
    + 'ParenthesizedExpression ConditionalExpression TypeOfExpression ObjectLiteralExpression ArrayLiteralExpression '
    + 'PropertyAssignment ShorthandPropertyAssignment SpreadAssignment SpreadElement '
    + 'InterfaceDeclaration PropertySignature MethodSignature TypeAliasDeclaration TypeReference '
    + 'UnionType IntersectionType TypeLiteral ArrayType TupleType NamedTupleMember '
    + 'LiteralType IndexedAccessType TypeQuery TypeOperator FunctionType ParenthesizedType '
    + 'AsExpression HeritageClause ExpressionWithTypeArguments TryStatement CatchClause '
    + 'JsxElement JsxOpeningElement JsxClosingElement JsxSelfClosingElement JsxAttributes '
    + 'JsxAttribute JsxExpression JsxText NumericLiteral StringLiteral RegularExpressionLiteral '
    + 'NoSubstitutionTemplateLiteral').split(/\s+/);
  var supported = new Set();
  for (var kindName of names) supported.add(ts.SyntaxKind[kindName]);
  // Verify each syntax form and explicit escape hatch.
  function visit(node) {
    for (var modifier of node.modifiers || []) if (modifier.kind === ts.SyntaxKind.DeclareKeyword) diagnose(705, file, node, 'Project ambient declarations have no verified implementation');
    if (ts.isFunctionDeclaration(node) && !node.body) diagnose(705, file, node, 'Project callable declarations require explicit implementations');
    if (ts.isSpreadAssignment(node)) diagnose(705, file, node, 'Object spread hides property access effects; use explicit field mappings');
    if (ts.isForOfStatement(node)) {
      var iterable = OST.checker.getTypeAtLocation(node.expression);
      if (!(iterable.flags & ts.TypeFlags.StringLike) && !OST.checker.isArrayType(iterable) && !OST.checker.isTupleType(iterable)) diagnose(705, file, node.expression, 'Only explicit arrays, tuples, and strings have verified iteration effects');
    }
    var name = ts.SyntaxKind[node.kind];
    var token = node.kind >= ts.SyntaxKind.FirstToken && node.kind <= ts.SyntaxKind.LastToken;
    if (node.kind >= ts.SyntaxKind.FirstLiteralToken && node.kind <= ts.SyntaxKind.LastLiteralToken && !supported.has(node.kind)) diagnose(705, file, node, 'Unsupported literal syntax: ' + name);
    if (!token && !supported.has(node.kind)) diagnose(705, file, node, 'Unsupported syntax: ' + name);
    if (node.kind === ts.SyntaxKind.AnyKeyword) diagnose(705, file, node, 'Explicit any erases verifiable contracts');
    if (ts.isAsExpression(node) && node.type.getText(file) !== 'const') diagnose(705, file, node, 'Type assertions are outside supported subset');
    if (ts.isComputedPropertyName(node)) diagnose(705, file, node, 'Computed property declarations are unsupported');
    if (ts.isElementAccessExpression(node)) {
      var type = OST.checker.getTypeAtLocation(node.argumentExpression);
      if (!(type.flags & (ts.TypeFlags.NumberLike | ts.TypeFlags.NumberLiteral))) diagnose(705, file, node, 'Only numeric collection indexing is supported');
    }
    if (ts.isIdentifier(node) && ['eval', 'Function', 'Reflect', 'Proxy', 'require', 'globalThis', 'window', 'self'].includes(node.text)) diagnose(705, file, node, 'Opaque global capability: ' + node.text);
    if (ts.isPropertyAccessExpression(node) && ['constructor', '__proto__', 'prototype'].includes(node.name.text)) diagnose(705, file, node, 'Prototype reflection is unsupported');
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) diagnose(705, file, node, 'Runtime import is unsupported');
    if (ts.isTypeReferenceNode(node) && node.typeName.getText(file) === 'Record') diagnose(705, file, node, 'Untyped dictionary contracts are unsupported');
    if (ts.isJsxAttribute(node) && /^(style|width|height|color|bgcolor|align|fill|stroke|margin|padding)$/i.test(node.name.getText(file))) diagnose(701, file, node, 'Visual values must reference core/styles.css classes');
    if (ts.isJsxAttribute(node) && /^(dangerouslySetInnerHTML|srcDoc)$/i.test(node.name.getText(file))) diagnose(705, file, node, 'Opaque browser source injection is unsupported');
    if (ts.isIdentifier(node) && node.text === '__osteanCase') diagnose(705, file, node, 'Private harness instrumentation name is reserved');
  }
  walkNodes(file, visit);
}
