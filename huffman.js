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

const nodes = [];

Object.entries(getFrequency("aabbbcc")).forEach(([char, freq]) => {
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

function generateCodes(node, code = "", codes = {}) {
  if (node.char) {
    codes[node.char] = code;
    return codes;
  }

  generateCodes(node.left, code + "0", codes);

  generateCodes(node.right, code + "1", codes);

  return codes;
}

function encode(text, codes) {
  let result = "";

  for (let i = 0; i < text.length; i++) {
    const letter = text[i];
    result = result + codes[letter];
  }

  return result;
}

function decode(tree, encoded) {
  let result = "";
  let node = tree;

  for (let i = 0; i < encoded.length; i++) {
    if (encoded[i] === "0") {
      node = node.left;
    } else {
      node = node.right;
    }

    if (node.char) {
      result = result + node.char;
      node = tree;
    }
  }
  return result;
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

module.exports = {
  getFrequency,
  buildTree,
  generateCodes,
  encode,
  decode,
  nodes,
};
