// Validate the supported JSON schema vocabulary.
function validateSchema(value, schema, root, location) {
  if (schema.$ref) return validateSchema(value, root.$defs[schema.$ref.split('/').pop()], root, location);
  if (schema.anyOf) {
    var accepted = false;
    for (var choice of schema.anyOf) if (validateSchema(value, choice, root, location).length === 0) accepted = true;
    return accepted ? [] : [location + ' violates allowed alternatives'];
  }
  var issues = [];
  if (Object.hasOwn(schema, 'const') && JSON.stringify(value) !== JSON.stringify(schema.const)) issues.push(location + ' violates fixed policy');
  if (schema.type === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return [location + ' requires object'];
    for (var required of schema.required || []) if (!Object.hasOwn(value, required)) issues.push(location + '.' + required + ' is required');
    var properties = schema.properties || {};
    for (var key of Object.keys(value)) {
      if (Object.hasOwn(properties, key)) issues.push(...validateSchema(value[key], properties[key], root, location + '.' + key));
      else if (schema.additionalProperties === false) issues.push(location + '.' + key + ' is unsupported');
      else if (typeof schema.additionalProperties === 'object') issues.push(...validateSchema(value[key], schema.additionalProperties, root, location + '.' + key));
    }
    if (schema.maxProperties !== undefined && Object.keys(value).length > schema.maxProperties) issues.push(location + ' exceeds property limit');
  }
  if (schema.type === 'array') {
    if (!Array.isArray(value)) return [location + ' requires array'];
    if (schema.minItems && value.length < schema.minItems) issues.push(location + ' lacks entries');
    if (schema.uniqueItems && new Set(value).size !== value.length) issues.push(location + ' contains duplicate entries');
    for (var entry of value) issues.push(...validateSchema(entry, schema.items, root, location));
  }
  if (schema.type === 'string') {
    if (typeof value !== 'string') return [location + ' requires string'];
    if (schema.minLength && value.length < schema.minLength) issues.push(location + ' is empty');
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) issues.push(location + ' requires exact version');
  }
  if (schema.type === 'integer' && (!Number.isInteger(value) || value < schema.minimum || value > (schema.maximum ?? Infinity))) issues.push(location + ' requires bounded integer');
  return issues;
}

// Load canonical configuration and exact dependency pins.
function loadConfiguration() {
  OST.config = JSON.parse(readSource('ostean.json') || 'null');
  OST.package = JSON.parse(readSource('package.json') || 'null');
  var schema = JSON.parse(OST_TEMPLATES['ostean.schema.json']);
  for (var issue of validateSchema(OST.config, schema, schema, 'configuration')) diagnose(705, 'ostean.json', null, issue);
  if (!OST.config || !OST.package || OST.diagnostics.length) return false;
  var exact = new RegExp(schema.$defs.exactVersion.pattern);
  var installed = { ...OST.package.dependencies, ...OST.package.devDependencies };
  for (var name of Object.keys(installed)) if (!exact.test(installed[name])) diagnose(705, 'package.json', null, 'Unpinned dependency: ' + name);
  for (var layer of Object.keys(OST.config.externalDependencies)) {
    var entries = OST.config.externalDependencies[layer];
    for (var name of Object.keys(entries)) {
      var entry = entries[name];
      if (name === 'node') {
        if (entry.version !== 'builtin') diagnose(705, 'ostean.json', null, 'Built-ins require builtin marker');
      } else if (entry.version === 'builtin' || installed[name] !== entry.version) diagnose(705, 'ostean.json', null, 'Dependency pin mismatch: ' + name);
      for (var specifier of entry.entrypoints) {
        if (name === 'node' ? !specifier.startsWith('node:') : specifier !== name && !specifier.startsWith(name + '/')) diagnose(705, 'ostean.json', null, 'Entry point does not belong to dependency: ' + specifier);
        if (layer === 'components/ui' && !['react', 'react/jsx-runtime'].includes(specifier)) diagnose(701, 'ostean.json', null, 'UI entry point is outside approved declarative rendering boundary: ' + specifier);
        if (layer === 'runtime' && !['node:process', 'react-dom/client'].includes(specifier)) diagnose(701, 'ostean.json', null, 'Runtime entry point is outside approved bootstrap boundary: ' + specifier);
      }
    }
  }
  if (installed.typescript !== OST.config.languageSocket.version) diagnose(705, 'package.json', null, 'TypeScript socket version mismatch');
  verifyDependencyMetadata();
  var compiler = JSON.parse(readSource('tsconfig.json') || 'null');
  if (JSON.stringify(compiler) !== JSON.stringify(JSON.parse(OST_TEMPLATES['tsconfig.json']))) diagnose(705, 'tsconfig.json', null, 'Compiler configuration is outside supported socket');
  return OST.diagnostics.length === 0;
}

// Verify an exact external import entry point.
function allowedExternal(layer, specifier) {
  var entries = OST.config.externalDependencies[layer] || {};
  for (var name of Object.keys(entries)) if (entries[name].entrypoints.includes(specifier)) return true;
  return false;
}
