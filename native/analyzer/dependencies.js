// Validate declarations against pinned embedded or installed metadata.
function verifyDependencyMetadata() {
  var pins = { ...OST.package.dependencies, ...OST.package.devDependencies };
  for (var field of ['exports', 'imports', 'main', 'module', 'browser', 'types', 'typings', 'bin']) if (Object.hasOwn(OST.package, field)) diagnose(705, 'package.json', null, 'Project dependency resolution overrides are unsupported: ' + field);
  if (Object.hasOwn(pins, OST.package.name)) diagnose(705, 'package.json', null, 'Project identity cannot shadow a trusted dependency');
  for (var layer of Object.keys(OST.config.externalDependencies)) {
    for (var name of Object.keys(OST.config.externalDependencies[layer])) {
      if (name === 'node') continue;
      var pin = OST.config.externalDependencies[layer][name].version;
      var embedded = OST_LIBRARIES['/project/node_modules/' + name + '/package.json'];
      var installed = OST_NATIVE.read('node_modules/' + name + '/package.json');
      if (!embedded && !installed) diagnose(705, 'ostean.json', null, 'Pinned dependency metadata unavailable: ' + name);
      for (var metadata of [embedded, installed]) {
        if (metadata && JSON.parse(metadata).version !== pin) diagnose(705, 'ostean.json', null, 'Resolved dependency version differs from pin: ' + name);
      }
    }
  }
  for (var name of ['@types/node', '@types/react', '@types/react-dom']) {
    var text = OST_LIBRARIES['/project/node_modules/' + name + '/package.json'];
    if (pins[name] !== JSON.parse(text).version) diagnose(705, 'package.json', null, 'Presentation declarations differ from verified socket: ' + name);
  }
  var scripts = JSON.parse(OST_TEMPLATES['package.json']).scripts;
  if (JSON.stringify(OST.package.scripts) !== JSON.stringify(scripts) || OST.package.type !== 'module') diagnose(705, 'package.json', null, 'Executable package configuration is outside supported socket');
  if (OST.package.engines?.node !== OST.config.runtimeVersion) diagnose(705, 'package.json', null, 'Declared runtime version mismatch');
  for (var field of ['optionalDependencies', 'peerDependencies']) {
    for (var name of Object.keys(OST.package[field] || {})) {
      var exact = new RegExp(JSON.parse(OST_TEMPLATES['ostean.schema.json']).$defs.exactVersion.pattern);
      if (!exact.test(OST.package[field][name])) diagnose(705, 'package.json', null, 'Unpinned ' + field + ': ' + name);
    }
  }
}
