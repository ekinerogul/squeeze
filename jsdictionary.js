const JS_KEYWORDS = [
  "function",
  "return",
  "const",
  "let",
  "var",
  "if",
  "else",
  "for",
  "while",
  "async",
  "await",
  "import",
  "export",
  "default",
  "class",
  "new",
  "this",
  "true",
  "false",
  "null",
  "undefined",
  "console",
  "require",
  "module",
  "exports",
];

function boostFrequency(frequency) {
  const BOOST = 100;

  for (let i = 0; i < JS_KEYWORDS.length; i++) {
    const keyword = JS_KEYWORDS[i];

    if (frequency[keyword] === undefined) {
      frequency[keyword] = BOOST;
    } else {
      frequency[keyword] = frequency[keyword] + BOOST;
    }
  }

  return frequency;
}

function replaceKeywords(text) {
  let result = text;
  for (let i = 0; i < JS_KEYWORDS.length; i++) {
    const keyword = JS_KEYWORDS[i];
    const replacement = String.fromCharCode(i + 1);
    result = result.split(keyword).join(replacement);
  }
  return result;
}

function restoreKeywords(text) {
  let result = text;
  for (let i = 0; i < JS_KEYWORDS.length; i++) {
    const replacement = String.fromCharCode(i + 1);
    const keyword = JS_KEYWORDS[i];
    result = result.split(replacement).join(keyword);
  }
  return result;
}

module.exports = {
  JS_KEYWORDS,
  boostFrequency,
  replaceKeywords,
  restoreKeywords,
};
