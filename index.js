const {
  generateCodes,
  encode,
  decode: huffmanDecode,
  nodes,
} = require("./huffman");
const { lz77Encode, lz77Decode } = require("./lz77");
const { deflateEncode, deflateDecode, tokensToString } = require("./deflate");
const { squeezeCreate, squeezeExtract } = require("./squeeze");
const { encode: binaryEncode, decode: binaryDecode } = require("./binary");

const tree = nodes[0];
const codes = generateCodes(tree);
const tokens = lz77Encode("abcabcabc");
const result = deflateEncode("abcabcabc");
const archive = squeezeCreate([{ name: "test.txt", content: "abcabcabc" }]);
const extracted = squeezeExtract(archive);
const binary = binaryEncode(archive);
const decoded = binaryDecode(binary);

console.log("Decoded:", decoded);

console.log(codes);
console.log(encode("aabbbcc", codes));
console.log(huffmanDecode(tree, "10100001111"));
console.log(lz77Encode("abcabcabc"));
console.log(lz77Decode(lz77Encode("abcabcabc")));
console.log(tokensToString(tokens));
console.log(deflateEncode("abcabcabc"));
console.log(deflateDecode(result));
console.log(archive);
console.log(extracted);
console.log("Binary size:", binary.length, "byte");
console.log("JSON size:", JSON.stringify(archive).length, "byte");
