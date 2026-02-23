const {
  generateCodes,
  getCodeLengths,
  buildCanonicalCodes,
  buildTreeFromCodes,
  encode,
  decode,
  getFrequency,
  buildTree,
} = require("./huffman");
const { lz77Encode, lz77Decode } = require("./lz77");
const { replaceKeywords, restoreKeywords } = require("./jsdictionary");

function tokensToString(tokens) {
  let result = "";

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.char !== undefined) {
      if (token.char === "<") {
        result = result + "<<";
      } else {
        result = result + token.char;
      }
    } else {
      result = result + "<" + token.offset + "," + token.length + ">";
    }
  }

  return result;
}

function stringToTokens(str) {
  const tokens = [];
  let i = 0;

  while (i < str.length) {
    if (str[i] === "<") {
      if (str[i + 1] === "<") {
        tokens.push({ char: "<" });
        i += 2;
      } else {
        const end = str.indexOf(">", i);
        const inside = str.slice(i + 1, end);
        const [offset, length] = inside.split(",").map(Number);
        tokens.push({ offset, length });
        i = end + 1;
      }
    } else {
      tokens.push({ char: str[i] });
      i++;
    }
  }

  return tokens;
}

function deflateEncode(text, jsMode = false) {
  const processedText = jsMode ? replaceKeywords(text) : text;

  const tokens = lz77Encode(processedText);
  const tokenString = tokensToString(tokens);

  const freq = getFrequency(tokenString);
  const tree = buildTree(freq);
  const rawCodes = generateCodes(tree);
  const codeLengths = getCodeLengths(rawCodes);
  const codes = buildCanonicalCodes(codeLengths);
  const encoded = encode(tokenString, codes);

  return { encoded, codeLengths, jsMode };
}

function deflateDecode({ encoded, codeLengths, jsMode }) {
  const codes = buildCanonicalCodes(codeLengths);
  const tree = buildTreeFromCodes(codes);
  const tokenString = decode(tree, encoded);
  const tokens = stringToTokens(tokenString);
  const decoded = lz77Decode(tokens);
  return jsMode ? restoreKeywords(decoded) : decoded;
}

module.exports = {
  tokensToString,
  stringToTokens,
  deflateEncode,
  deflateDecode,
};
