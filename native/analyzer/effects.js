var OST_PURE_CALLS = new Set(['Math.abs', 'Math.min', 'Math.max', 'Math.floor', 'Math.ceil', 'Math.round', 'Math.trunc', 'Math.imul', 'Math.sqrt', 'Math.pow', 'Number.isFinite', 'Number.isNaN', 'Number.isInteger', 'Number.isSafeInteger', 'Number', 'String', 'Boolean']);
var OST_RAW_CALLS = /^(?:Date(?:\.now)?|performance\.now|process\.hrtime(?:\.bigint)?|Math\.random|setTimeout|setInterval|setImmediate|requestAnimationFrame|crypto\.(?:randomUUID|getRandomValues|randomBytes)|randomBytes|randomUUID|getRandomValues)$/;

// Verify a call's resolved capability and containment.
function verifyCall(file, node) {
  var layer = layerOf(file.fileName);
  var expression = node.expression;
  var text = expression.getText(file);
  if (layer === 'core' && file.fileName.endsWith('/constants.ts') && enclosingFunction(node)) return;
  var resolved = resolveCapability(expression, new Set());
  var symbol = resolved?.symbol;
  var declaration = resolved?.declaration;
  var origin = declaration?.getSourceFile().fileName || '';
  var symbolName = symbol?.getName() || '';
  var raw = rawPlatformSymbol(symbol) || OST_RAW_CALLS.test(text) || /^(Date|randomBytes|randomUUID|getRandomValues|setTimeout|setInterval|setImmediate|requestAnimationFrame)$/.test(symbolName)
    || (symbolName === 'now' && /lib\.(?:es5|dom)\.d\.ts/.test(origin))
    || (symbolName === 'random' && /lib\.es5\.d\.ts/.test(origin));
  if (raw && !file.fileName.endsWith('/core/constants.ts')) {
    diagnose(703, file, node, 'Deterministic substrate call outside core/constants.ts');
    return;
  }
  var ownerName = declaration?.parent?.name?.getText() || '';
  var pureName = ownerName.replace(/Constructor$/, '') + '.' + symbolName;
  if ((OST_PURE_CALLS.has(text) || OST_PURE_CALLS.has(pureName) || OST_PURE_CALLS.has(symbolName)) && origin.includes('/__ostean__/lib.')) {
    if (layer === 'runtime') diagnose(701, file, node, 'Runtime calculations belong in domain modules');
    for (var argument of node.arguments || []) {
      var type = OST.checker.getTypeAtLocation(argument);
      if (!scalarType(type)) diagnose(705, file, argument, 'Implicit object coercion effects are unverifiable');
    }
    return;
  }
  if (raw && layer === 'core') return;
  if (origin.startsWith('/project/') && !origin.includes('/node_modules/')) {
    var owner = layerOf(origin);
    if (origin.endsWith('/core/constants.ts') && ['primitives', 'components', 'components/ui'].includes(layer)) diagnose(701, file, node, 'Stateful substrate hooks cannot execute inside pure modules');
    if (origin !== file.fileName && !legalInternal(file.fileName, origin.replace(/^\/project\//, ''))) diagnose(701, file, node, 'Resolved callable crosses a forbidden anatomical edge');
    if (owner === 'core' && origin.endsWith('/schemas.ts')) {
      if (!['workflows', 'runtime', 'tests'].includes(layer) && !(layer === 'components/ui' && ts.isPropertySignature(declaration))) diagnose(701, file, node, 'Stateful contract call outside orchestration layers');
      return;
    }
    if (owner === 'components/ui' && !['components/ui', 'runtime', 'tests'].includes(layer)) diagnose(701, file, node, 'UI invocation escaped presentation corridor');
    if (ts.isParameter(declaration) && !['components/ui', 'workflows', 'runtime', 'tests'].includes(layer)) diagnose(705, file, node, 'Callback effects cannot be verified in pure layer');
    if (!ts.isFunctionLike(declaration) && !ts.isParameter(declaration)) diagnose(705, file, node, 'Callable initializer could not be resolved');
    if (ts.isFunctionLike(declaration) && !declaration.body) diagnose(705, file, node, 'Callable implementation cannot be verified');
    return;
  }
  if (origin.endsWith('/lib.dom.d.ts')) {
    if (symbolName === 'getElementById' && layer === 'runtime') {
      if (!ts.isPropertyAccessExpression(expression) || expression.expression.getText(file) !== 'document') diagnose(705, file, node, 'Mount lookup requires an explicit bound document method');
      if (!ts.isVariableDeclaration(node.parent) || node.parent.initializer !== node) diagnose(705, file, node, 'Mount lookup requires explicit local binding');
      return;
    }
    if (layer === 'components/ui' && ['focus', 'blur', 'setSelectionRange'].includes(symbolName)) {
      if (!canonicalRecovery(node)) diagnose(705, file, node, 'Interactive DOM operation lacks canonical recovery');
      return;
    }
    diagnose(701, file, node, 'DOM operation is outside the approved presentation corridor');
    return;
  }
  if (origin.includes('node_modules/')) {
    if (layer === 'components/ui' && /node_modules\/@types\/react\//.test(origin)) {
      if (!['useRef', 'useId'].includes(symbolName)) diagnose(705, file, node, 'React capability is outside declarative rendering subset; use explicit JSX');
      return;
    }
    if (layer === 'runtime' && /react-dom/.test(origin) && ['createRoot', 'render', 'unmount'].includes(symbolName)) {
      if (!canonicalRecovery(node)) diagnose(705, file, node, 'Renderer call lacks canonical recovery');
      if (symbolName === 'createRoot') verifyRendererHandlers(file, node);
      return;
    }
    if (layer === 'services') {
      if (!canonicalRecovery(node)) diagnose(705, file, node, 'External service call lacks canonical recovery');
      var returned = OST.checker.getTypeAtLocation(node);
      if ((returned.aliasSymbol || returned.symbol)?.getName() === 'Promise' && !ts.isAwaitExpression(node.parent)) diagnose(705, file, node, 'External promises must be awaited inside canonical recovery');
      return;
    }
  }
  diagnose(705, file, node, 'Call capability cannot be statically verified: ' + text);
}

// Inspect all executable calls and constructor invocations.
function verifyEffects(file) {
  // Resolve each invocation before assigning effects.
  function visit(node) {
    verifyIntrinsicReference(file, node);
    if ((ts.isIdentifier(node) || ts.isPropertyAccessExpression(node)) && !declarationIdentifier(node) && !typePosition(node) && opaquePlatformSymbol(resolveCapability(node, new Set())?.symbol)) diagnose(705, file, node, 'Native loader or evaluator capability is outside the verified socket');
    if (ts.isCallExpression(node) || ts.isNewExpression(node)) verifyCall(file, node);
    if (layerOf(file.fileName) === 'services') {
      if (ts.isPropertyAccessExpression(node)) {
        var property = originalSymbol(node.name)?.declarations?.[0];
        if (property?.getSourceFile().fileName.includes('/node_modules/') && !canonicalRecovery(node)) diagnose(705, file, node, 'External property access requires canonical recovery');
      }
      if (ts.isAwaitExpression(node) && !canonicalRecovery(node)) diagnose(705, file, node, 'Service awaits require canonical recovery');
      var returned = ts.isReturnStatement(node) ? node.expression : ts.isArrowFunction(node) && !ts.isBlock(node.body) ? node.body : null;
      var type = returned && OST.checker.getTypeAtLocation(returned);
      if ((type?.symbol || type?.aliasSymbol)?.getName() === 'Promise') diagnose(705, file, returned, 'Service promises must be awaited inside canonical recovery');
    }
    if (ts.isBinaryExpression(node)) {
      var operation = node.operatorToken.kind;
      if ([ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken].includes(operation)) diagnose(705, file, node, 'Coercive equality is outside supported subset');
      var safe = [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.EqualsToken, ts.SyntaxKind.CommaToken];
      if (!safe.includes(operation)) for (var operand of [node.left, node.right]) {
        var type = OST.checker.getTypeAtLocation(operand);
        if (!scalarType(type)) diagnose(705, file, operand, 'Operator coercion effects cannot be statically verified');
      }
    }
  }
  walkNodes(file, visit);
}

// Prevent intrinsic functions from escaping verified call sites.
function verifyIntrinsicReference(file, node) {
  if (!(ts.isIdentifier(node) || ts.isPropertyAccessExpression(node)) || declarationIdentifier(node) || typePosition(node)) return;
  var resolved = resolveCapability(node, new Set());
  var declaration = resolved?.declaration;
  if (!declaration?.getSourceFile().fileName.includes('/__ostean__/lib.')) return;
  var type = OST.checker.getTypeAtLocation(node);
  if (!type.getCallSignatures().length) return;
  var name = resolved.symbol?.getName() || '';
  if (OST_RAW_CALLS.test(node.getText(file)) || /^(Date|setTimeout|setInterval|setImmediate|requestAnimationFrame|randomUUID|getRandomValues)$/.test(name)) return;
  var parent = node.parent;
  var direct = (ts.isCallExpression(parent) || ts.isNewExpression(parent)) && parent.expression === node;
  var alias = ts.isVariableDeclaration(parent) && parent.initializer === node && !!(parent.parent.flags & ts.NodeFlags.Const);
  var member = ts.isPropertyAccessExpression(parent) && parent.expression === node;
  if (!direct && !alias && !member) diagnose(705, file, node, 'Intrinsic callbacks require explicit verified wrappers');
}
