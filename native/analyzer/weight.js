// Extract technical words from a comment.
function commentWords(text) {
  return text.replace(/^\/\*+|\*\/$|^\/\//g, '').trim().split(/\s+/).filter(Boolean);
}

// Locate a function or token's leading comment.
function leadingComment(file, node) {
  var current = node;
  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
    if (ts.isVariableDeclaration(node.parent)) current = node.parent.parent.parent;
  }
  var ranges = ts.getLeadingCommentRanges(file.text, current.getFullStart()) || [];
  if (!ranges.length) return null;
  var range = ranges[ranges.length - 1];
  return file.text.slice(range.pos, range.end);
}

// Enforce line counts and technical comment limits.
function verifyWeight(file) {
  var layer = layerOf(file.fileName);
  var cap = OST.config.lineLimits[layer === 'components/ui' ? 'components' : layer];
  var lines = file.getLineStarts().length - (/[\r\n\u2028\u2029]$/.test(file.text) ? 1 : 0);
  if (cap && lines > cap) diagnose(702, file, file, 'Source has ' + lines + ' lines; cap is ' + cap);
  var scanner = ts.createScanner(ts.ScriptTarget.Latest, false, file.languageVariant, file.text);
  for (var kind = scanner.scan(); kind !== ts.SyntaxKind.EndOfFileToken; kind = scanner.scan()) {
    if (kind !== ts.SyntaxKind.SingleLineCommentTrivia && kind !== ts.SyntaxKind.MultiLineCommentTrivia) continue;
    var text = scanner.getTokenText();
    if (/@ts-(?:nocheck|ignore|expect-error)/i.test(text) || /<reference\b|@jsx\b|@jsxImportSource/i.test(text)) {
      var position = file.getLineAndCharacterOfPosition(scanner.getTokenPos()).line + 1;
      OST.diagnostics.push({ code: 705, file: file.fileName.replace(/^\/project\//, ''), line: position, reason: 'Compiler directives cannot override verified socket semantics' });
    }
    var count = commentWords(text).length;
    if (count > OST.config.comments.functionWords || /\b(?:TODO|FIXME)\b|what\s+if|maybe\s+we\s+should/i.test(text) || /\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}\u20e3]/u.test(text)) {
      var line = file.getLineAndCharacterOfPosition(scanner.getTokenPos()).line + 1;
      OST.diagnostics.push({ code: 702, file: file.fileName.replace(/^\/project\//, ''), line: line, reason: 'Comment exceeds technical documentation rules' });
    }
  }
  // Check every declared function annotation.
  function visit(node) {
    if (ts.isFunctionLike(node) && (node.body || ts.isMethodSignature(node))) {
      var comment = leadingComment(file, node);
      if (!comment || /[\r\n\u2028\u2029]/.test(comment) || commentWords(comment).length > OST.config.comments.functionWords) diagnose(702, file, node, 'Function requires one technical comment of at most ten words');
    }
    if (layer === 'core' && ts.isVariableStatement(node) && ts.isSourceFile(node.parent)) {
      var tokenComment = leadingComment(file, node);
      if (!tokenComment || /[\r\n\u2028\u2029]/.test(tokenComment) || commentWords(tokenComment).length > OST.config.comments.coreTokenWords) diagnose(702, file, node, 'Core token requires a single comment of at most five words');
    }
    if (layer === 'core' && ts.isPropertyAssignment(node) && !enclosingFunction(node)) {
      var propertyComment = leadingComment(file, node);
      if (!propertyComment || /[\r\n\u2028\u2029]/.test(propertyComment) || commentWords(propertyComment).length > OST.config.comments.coreTokenWords) diagnose(702, file, node, 'Core token requires a single technical comment');
    }
    if (layer === 'core' && (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node))) {
      var contractComment = leadingComment(file, node);
      if (!contractComment || /[\r\n\u2028\u2029]/.test(contractComment) || commentWords(contractComment).length > OST.config.comments.functionWords) diagnose(702, file, node, 'Core contract requires a single technical comment');
    }
  }
  walkNodes(file, visit);
}
