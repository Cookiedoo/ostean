// Report stylesheet diagnostics with precise line positions.
function styleDiagnostic(code, source, offset, reason) {
  OST.diagnostics.push({ code: code, file: 'core/styles.css', line: source.slice(0, offset).split(/\r\n|[\r\n\f\u2028\u2029]/).length, reason: reason });
}

// Parse the flat canonical stylesheet grammar completely.
function verifyStyles() {
  var source = readSource('core/styles.css');
  if (source === undefined) { diagnose(705, 'core/styles.css', null, 'Canonical stylesheet is required'); return; }
  if (source.replace(/(?:\r\n|[\r\n\f\u2028\u2029])$/, '').split(/\r\n|[\r\n\f\u2028\u2029]/).length > OST.config.lineLimits.core) styleDiagnostic(702, source, 0, 'Stylesheet exceeds core line limit');
  var comments = [];
  var clean = source.replace(/\/\*[\s\S]*?\*\//g, /* Validate each stylesheet token comment. */ function comment(text, offset) {
    comments.push({ offset: offset, end: offset + text.length, text: text });
    if (/[\r\n\f\u2028\u2029]/.test(text) || commentWords(text).length > 5 || /TODO|FIXME|maybe|what\s+if/i.test(text) || /\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}\u20e3]/u.test(text)) styleDiagnostic(702, source, offset, 'Style comment violates core token documentation rules');
    return text.replace(/[^\n]/g, ' ');
  });
  var cursor = 0;
  var tokens = new Set();
  var references = [];
  while (cursor < clean.length) {
    var remainder = clean.slice(cursor);
    if (!remainder.trim()) break;
    var rule = /^\s*(:root|\*|body|header|footer|[.#][A-Za-z][\w-]*)\s*\{([^{}]*)\}/.exec(remainder);
    if (!rule) { styleDiagnostic(705, source, cursor, 'Unsupported stylesheet syntax'); return; }
    var bodyOffset = cursor + rule[0].indexOf('{') + 1;
    var bodyCursor = 0;
    while (bodyCursor < rule[2].length) {
      var pending = rule[2].slice(bodyCursor);
      if (!pending.trim()) break;
      var declaration = /^\s*(--[\w-]+|[a-z][a-z-]*)\s*:\s*([^;{}]+);/.exec(pending);
      if (!declaration) { styleDiagnostic(705, source, bodyOffset + bodyCursor, 'Unsupported style declaration'); return; }
      var property = declaration[1];
      var value = declaration[2].trim();
      var position = bodyOffset + bodyCursor + declaration[0].indexOf(property);
      if (!/^(?:#[\da-fA-F]{3,8}|-?(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em|%|vh|vw)?|[a-z][a-z-]*|var\(--[\w-]+\))(?:\s+(?:[a-z][a-z-]*|-?\d+(?:\.\d+)?(?:px|rem|em|%)?))*$/.test(value)) styleDiagnostic(705, source, position, 'Style value is outside supported token grammar');
      if (property.startsWith('--')) {
        if (rule[1] !== ':root' || tokens.has(property)) styleDiagnostic(705, source, position, 'Tokens require unique root declarations');
        tokens.add(property);
        var preceding = comments.filter(/* Locate the nearest preceding token comment. */ function before(item) { return item.end <= position; }).pop();
        if (!preceding || source.slice(preceding.end, position).trim()) styleDiagnostic(702, source, position, 'Style token requires a technical comment');
      }
      for (var reference of value.matchAll(/var\((--[\w-]+)\)/g)) references.push({ name: reference[1], position: position });
      bodyCursor += declaration[0].length;
    }
    cursor += rule[0].length;
  }
  for (var reference of references) if (!tokens.has(reference.name)) styleDiagnostic(705, source, reference.position, 'Unresolved visual token: ' + reference.name);
}
