// Identify TypeScript primitive contract annotations.
function primitiveAnnotation(node) {
  return [ts.SyntaxKind.NumberKeyword, ts.SyntaxKind.StringKeyword, ts.SyntaxKind.BooleanKeyword,
    ts.SyntaxKind.VoidKeyword, ts.SyntaxKind.UndefinedKeyword, ts.SyntaxKind.NeverKeyword].includes(node.kind);
}

// Verify a boundary annotation's canonical origin.
function canonicalAnnotation(node, layer, typeParameters) {
  if (!node) return false;
  if (primitiveAnnotation(node)) return true;
  if (ts.isTypeReferenceNode(node)) {
    var name = node.typeName.getText();
    if (typeParameters.has(name)) return true;
    if (layer === 'components/ui' && ['ReactElement', 'ReactNode', 'JSX.Element'].includes(name)) return true;
    if (name === 'Promise' && node.typeArguments?.length === 1) return canonicalAnnotation(node.typeArguments[0], layer, typeParameters);
    var symbol = originalSymbol(node.typeName);
    var declarations = symbol?.declarations || [];
    var canonical = false;
    for (var declaration of declarations) {
      var file = declaration.getSourceFile().fileName;
      if (file.endsWith('/core/schemas.ts') || file.endsWith('/core/errors.ts') || file.endsWith('/core/constants.ts')) canonical = true;
    }
    if (!canonical) return false;
    for (var argument of node.typeArguments || []) if (!canonicalAnnotation(argument, layer, typeParameters)) return false;
    return true;
  }
  if (ts.isUnionTypeNode(node)) {
    for (var item of node.types) if (!canonicalAnnotation(item, layer, typeParameters)) return false;
    return true;
  }
  return false;
}

// Detect presentation and DOM types recursively.
function presentationType(type, seen) {
  if (!type || seen.has(type)) return false;
  seen.add(type);
  if (type.flags & (ts.TypeFlags.NumberLike | ts.TypeFlags.StringLike | ts.TypeFlags.BooleanLike | ts.TypeFlags.Null | ts.TypeFlags.Undefined | ts.TypeFlags.Void | ts.TypeFlags.Unknown | ts.TypeFlags.Any | ts.TypeFlags.TypeParameter)) return false;
  var symbol = type.aliasSymbol || type.symbol;
  var name = symbol?.getName() || '';
  if (symbol) {
    for (var declaration of symbol?.declarations || []) {
      var source = declaration.getSourceFile().fileName;
      if (/node_modules\/.*react|lib\.dom\.d\.ts/.test(source)) return true;
    }
  }
  for (var item of type.types || []) if (presentationType(item, seen)) return true;
  for (var argument of type.aliasTypeArguments || type.typeArguments || []) if (presentationType(argument, seen)) return true;
  if (seen.size > 256) {
    diagnose(705, OST.activeFile, OST.activeNode, 'Type containment exceeds supported complexity');
    return false;
  }
  if (symbol?.declarations?.some(standardDeclaration)) return false;
  for (var property of OST.checker.getPropertiesOfType(type)) {
    var declaration = property.valueDeclaration || property.declarations?.[0];
    if (declaration && presentationType(OST.checker.getTypeOfSymbolAtLocation(property, declaration), seen)) return true;
  }
  for (var signature of type.getCallSignatures()) {
    if (presentationType(signature.getReturnType(), seen)) return true;
    for (var parameter of signature.parameters) if (presentationType(OST.checker.getTypeOfSymbolAtLocation(parameter, parameter.valueDeclaration), seen)) return true;
  }
  return false;
}

// Enforce explicit canonical exported function contracts.
function verifyContracts(file) {
  var layer = layerOf(file.fileName);
  // Inspect exported signatures and inferred presentation values.
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.modifiers?.some(hasExport)) {
      var parameters = new Set();
      for (var type of node.typeParameters || []) parameters.add(type.name.text);
      if (layer !== 'core') {
        if (!canonicalAnnotation(node.type, layer, parameters)) diagnose(705, file, node, 'Export return requires explicit canonical contract');
        for (var parameter of node.parameters) if (!canonicalAnnotation(parameter.type, layer, parameters)) diagnose(705, file, parameter, 'Export parameter requires explicit canonical contract');
      }
    }
    if (layer !== 'core' && ts.isVariableStatement(node) && node.modifiers?.some(hasExport)) diagnose(705, file, node, 'Exported variables are outside supported boundary subset');
    if (!['components/ui', 'runtime', 'tests'].includes(layer) && (ts.isTypeNode(node) || ts.isVariableDeclaration(node) || ts.isParameter(node))) {
      if (presentationType(OST.checker.getTypeAtLocation(node), new Set())) diagnose(701, file, node, 'Presentation or DOM type escaped its corridor');
    }
    if (layer === 'runtime' && ts.isFunctionDeclaration(node) && node.modifiers?.some(hasExport)) diagnose(701, file, node, 'Runtime may not export bootstrap handles');
  }
  walkNodes(file, visit);
}

// Recognize an explicit export modifier.
function hasExport(modifier) { return modifier.kind === ts.SyntaxKind.ExportKeyword; }

// Recognize trusted standard-library container declarations.
function standardDeclaration(declaration) {
  return declaration.getSourceFile().fileName.startsWith('/__ostean__/lib.');
}
