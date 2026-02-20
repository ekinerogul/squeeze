const {
  generateCodes,
  encode,
  decode,
  nodes,
  getFrequency,
  buildTree,
} = require("./huffman");
const { lz77Encode, lz77Decode } = require("./lz77");
const {
  boostFrequency,
  replaceKeywords,
  restoreKeywords,
} = require("./jsdictionary");

function tokensToString(tokens) {
  let result = "";

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.char) {
      result = result + token.char;
    } else {
      result = result + "<" + token.offset + "," + token.length + ">";
    }
  }

  return result;
}

function deflateEncode(text, jsMode = false) {
  const processedText = jsMode ? replaceKeywords(text) : text;

  const tokens = lz77Encode(processedText);
  const tokenString = tokensToString(tokens);

  let freq = getFrequency(tokenString);

  const tree = buildTree(freq);
  const codes = generateCodes(tree);
  const encoded = encode(tokenString, codes);

  return { encoded, tree, jsMode };
}

function stringToTokens(str) {
  const tokens = [];
  let i = 0;

  while (i < str.length) {
    if (str[i] === "<") {
      const end = str.indexOf(">", i);
      const inside = str.slice(i + 1, end);
      const [offset, length] = inside.split(",").map(Number);
      tokens.push({ offset, length });
      i = end + 1;
    } else {
      tokens.push({ char: str[i] });
      i++;
    }
  }

  return tokens;
}

function deflateDecode({ encoded, tree, jsMode }) {
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
