// Reject aliased raw substrate capabilities before invocation.
function verifyDeterministicReferences(file) {
  if (file.fileName.endsWith('/core/constants.ts')) return;
  // Trace forbidden reference origins independently of call spelling.
  function visit(node) {
    if (ts.isPropertyAccessExpression(node)) {
      var member = originalSymbol(node.name);
      if (rawPlatformSymbol(member)) diagnose(703, file, node, 'Raw platform clock or entropy reference outside core');
      var defining = member?.valueDeclaration || member?.declarations?.[0];
      if (/^(random|now)$/.test(member?.getName() || '') && /lib\.(?:es5|dom)\.d\.ts/.test(defining?.getSourceFile().fileName || '')) diagnose(703, file, node, 'Raw substrate member reference outside core');
    }
    if (!ts.isIdentifier(node) || propertyIdentifier(node)) return;
    var symbol = originalSymbol(node);
    var declaration = symbol?.valueDeclaration || symbol?.declarations?.[0];
    var origin = declaration?.getSourceFile().fileName || '';
    var name = symbol?.getName() || '';
    if (rawPlatformSymbol(symbol)) diagnose(703, file, node, 'Raw platform clock or entropy reference outside core');
    if ((name === 'Date' && origin.includes('/__ostean__/lib.')) || /^(setTimeout|setInterval|setImmediate|requestAnimationFrame|randomBytes|randomUUID|getRandomValues)$/.test(name)) diagnose(703, file, node, 'Raw deterministic capability reference outside core');
    if (node.text === 'fetch' || node.text === 'console' || node.text === 'process' || node.text === 'performance' || node.text === 'crypto') {
      var local = OST.checker.getSymbolAtLocation(node);
      var imported = local?.declarations?.some(/* Recognize explicit runtime import bindings. */ function importBinding(item) { return ts.isImportSpecifier(item) || ts.isImportClause(item); });
      var substrate = ts.isPropertyAccessExpression(node.parent) && node.parent.expression === node && OST_RAW_CALLS.test(node.parent.getText(file));
      if ((!origin.startsWith('/project/') || origin.includes('/node_modules/')) && !imported && !substrate) diagnose(705, file, node, 'Ambient runtime capability requires explicit verified adapter');
    }
    if (origin.endsWith('/lib.dom.d.ts') && ts.isVariableDeclaration(declaration) && !(node.text === 'document' && layerOf(file.fileName) === 'runtime') && !['crypto', 'performance', 'console'].includes(node.text)) diagnose(705, file, node, 'Ambient browser values are outside declarative presentation and bootstrap subset');
    if (ts.isPropertyAccessExpression(node.parent) && node.parent.expression === node) {
      var text = node.parent.getText(file);
      if (OST_RAW_CALLS.test(text)) diagnose(703, file, node.parent, 'Raw substrate reference cannot be aliased');
    }
  }
  walkNodes(file, visit);
}
