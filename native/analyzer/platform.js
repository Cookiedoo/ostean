// Recognize standard clock and entropy capability origins.
function rawPlatformSymbol(symbol) {
  var declaration = symbol?.valueDeclaration || symbol?.declarations?.[0];
  var origin = declaration?.getSourceFile().fileName || '';
  var name = symbol?.getName() || '';
  if (/\/@types\/node\/crypto\.d\.ts$/.test(origin) && /^(?:random|pseudoRandom|generateKey|generatePrime)/.test(name)) return true;
  if (/\/@types\/node\/perf_hooks\.d\.ts$/.test(origin) && ['now', 'timeOrigin'].includes(name)) return true;
  if (/\/@types\/node\/process\.d\.ts$/.test(origin) && (name === 'hrtime' || name === 'bigint' && declaration.parent?.name?.getText() === 'HRTime')) return true;
  if (origin.endsWith('/lib.dom.d.ts') && ['randomUUID', 'getRandomValues', 'now', 'timeOrigin'].includes(name)) return true;
  return false;
}

// Identify unsupported native loader and evaluator capabilities.
function opaquePlatformSymbol(symbol) {
  var declaration = symbol?.valueDeclaration || symbol?.declarations?.[0];
  var origin = declaration?.getSourceFile().fileName || '';
  var name = symbol?.getName() || '';
  if (/\/@types\/node\/(?:module|vm|worker_threads)\.d\.ts$/.test(origin)) return true;
  return /\/@types\/node\/process\.d\.ts$/.test(origin) && ['getBuiltinModule', 'binding', '_linkedBinding', 'dlopen'].includes(name);
}

// Recognize shared standard and module namespace objects.
function sharedNamespace(node, type) {
  var symbol = originalSymbol(node);
  var declaration = symbol?.valueDeclaration || symbol?.declarations?.[0];
  var origin = declaration?.getSourceFile().fileName || '';
  if (type.symbol && type.symbol.flags & (ts.SymbolFlags.ValueModule | ts.SymbolFlags.NamespaceModule) && !(type.symbol.flags & ts.SymbolFlags.Class)) return true;
  return !!declaration && ts.isVariableDeclaration(declaration) && origin.includes('/__ostean__/lib.');
}
