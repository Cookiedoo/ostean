// Verify every source before issuing a compliance pass.
function checkProject() {
  if (!loadConfiguration()) return finishDiagnostics();
  buildProgram();
  for (var file of OST.sources) verifyImports(file);
  verifyUiGraph();
  if (OST.diagnostics.length) return finishDiagnostics();
  verifyTypeDiagnostics();
  verifyLockedHarness();
  verifyStyles();
  for (var file of OST.sources) {
    verifyWeight(file);
    verifySyntax(file);
    verifyContracts(file);
    verifyPurity(file);
    verifyCorePolicy(file);
    verifyRegistryReferences(file);
    verifyRoles(file);
    verifySignals(file);
    verifyEffects(file);
    verifyContainment(file);
    verifyBootstrap(file);
    verifyDeterministicReferences(file);
  }
  verifyLiterals();
  verifyClones();
  var exit = finishDiagnostics();
  if (!exit) OST_NATIVE.print('Verified compliance: ' + OST.sources.length + ' sources; TypeScript ' + ts.version + '; declared external trust boundary');
  return exit;
}

// Dispatch supported native commands deterministically.
function mainCommand(args) {
  try {
    var command = args[0];
    if (command === 'init') {
      var language = 'ts';
      var name = null;
      for (var option of args.slice(1)) {
        if (!option.startsWith('--')) {
          if (name) { diagnose(705, '<cli>', null, 'Only one project name is permitted'); return finishDiagnostics(); }
          name = option;
          continue;
        }
        if (!option.startsWith('--lang=')) {
          diagnose(705, '<cli>', null, 'Unsupported option: ' + option);
          return finishDiagnostics();
        }
        language = option.slice('--lang='.length);
      }
      if (language !== 'ts') {
        diagnose(705, '<cli>', null, 'Usage: ostean init project-name --lang=ts; only ts is supported');
        return finishDiagnostics();
      }
      name = name || 'ostean-app';
      OST_NATIVE.init(name, OST_TEMPLATES);
      OST_NATIVE.print('Initialized Ostean (v_final): ' + name);
      return 0;
    }
    if ((command !== 'check' && command !== 'test') || args.length !== 1) {
      diagnose(705, '<cli>', null, 'Usage: ostean init project-name --lang=ts | check | test');
      return finishDiagnostics();
    }
    var checked = checkProject();
    if (checked || command === 'check') return checked;
    return executeTests();
  } catch (error) {
    diagnose(705, '<engine>', null, String(error));
    return finishDiagnostics();
  }
}

var OST_EXIT = mainCommand(OST_ARGS);
