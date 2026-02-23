const SAFE_CONTROLS = [
  1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
  25, 26, 27, 28, 29, 30, 31,
].map((c) => String.fromCharCode(c));

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
  "exports",
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
  "typeof",
  "throw",
  "catch",
];

function replaceKeywords(text) {
  let result = text;
  for (let i = 0; i < JS_KEYWORDS.length; i++) {
    result = result.split(JS_KEYWORDS[i]).join(SAFE_CONTROLS[i]);
  }
  return result;
}

function restoreKeywords(text) {
  let result = text;
  for (let i = 0; i < JS_KEYWORDS.length; i++) {
    result = result.split(SAFE_CONTROLS[i]).join(JS_KEYWORDS[i]);
  }
  return result;
}

module.exports = {
  JS_KEYWORDS,
  replaceKeywords,
  restoreKeywords,
};
