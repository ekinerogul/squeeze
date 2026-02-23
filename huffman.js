function getFrequency(text) {
  const frequency = {};

  for (let i = 0; i < text.length; i++) {
    const letter = text[i];
    if (frequency[letter] === undefined) {
      frequency[letter] = 1;
    } else {
      frequency[letter] = frequency[letter] + 1;
    }
  }

  return frequency;
}

function buildTree(frequency) {
  const nodes = [];

  Object.entries(frequency).forEach(([char, freq]) => {
    nodes.push({ char, freq });
  });

  nodes.sort((a, b) => a.freq - b.freq);

  while (nodes.length > 1) {
    const left = nodes.shift();
    const right = nodes.shift();

    const parent = {
      freq: left.freq + right.freq,
      left,
      right,
    };

    nodes.push(parent);
    nodes.sort((a, b) => a.freq - b.freq);
  }

  return nodes[0];
}

function generateCodes(node, code = "", codes = {}) {
  if (node.char !== undefined) {
    codes[node.char] = code || "0";
    return codes;
  }

  generateCodes(node.left, code + "0", codes);
  generateCodes(node.right, code + "1", codes);

  return codes;
}

function getCodeLengths(codes) {
  const lengths = {};
  for (const char of Object.keys(codes)) {
    lengths[char] = codes[char].length;
  }
  return lengths;
}

function buildCanonicalCodes(codeLengths) {
  const symbols = Object.entries(codeLengths).sort(
    (a, b) => a[1] - b[1] || a[0].charCodeAt(0) - b[0].charCodeAt(0),
  );

  if (symbols.length === 1) {
    return { [symbols[0][0]]: "0" };
  }

  let code = 0;
  let prevLen = 0;
  const codes = {};

  for (let i = 0; i < symbols.length; i++) {
    const char = symbols[i][0];
    const len = symbols[i][1];
    code <<= len - prevLen;
    codes[char] = code.toString(2).padStart(len, "0");
    code++;
    prevLen = len;
  }

  return codes;
}

function buildTreeFromCodes(codes) {
  const entries = Object.entries(codes);

  if (entries.length === 1) {
    return { char: entries[0][0] };
  }

  const root = {};

  for (let i = 0; i < entries.length; i++) {
    const char = entries[i][0];
    const bitStr = entries[i][1];
    let node = root;

    for (let j = 0; j < bitStr.length - 1; j++) {
      const dir = bitStr[j] === "0" ? "left" : "right";
      if (!node[dir]) node[dir] = {};
      node = node[dir];
    }

    const lastDir = bitStr[bitStr.length - 1] === "0" ? "left" : "right";
    node[lastDir] = { char };
  }

  return root;
}

function encode(text, codes) {
  let result = "";

  for (let i = 0; i < text.length; i++) {
    result = result + codes[text[i]];
  }

  return result;
}

function decode(tree, encoded) {
  let result = "";
  let node = tree;

  for (let i = 0; i < encoded.length; i++) {
    if (encoded[i] === "0") {
      node = node.left || node;
    } else {
      node = node.right || node;
    }

    if (node.char !== undefined) {
      result = result + node.char;
      node = tree;
    }
  }

  return result;
}

module.exports = {
  getFrequency,
  buildTree,
  generateCodes,
  getCodeLengths,
  buildCanonicalCodes,
  buildTreeFromCodes,
  encode,
  decode,
};
