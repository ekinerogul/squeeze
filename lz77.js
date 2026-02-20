function findMatch(text, windowStart, currentPos) {
  let bestOffset = 0;
  let bestLength = 0;

  for (let i = windowStart; i < currentPos; i++) {
    let length = 0;

    while (
      currentPos + length < text.length &&
      text[i + length] === text[currentPos + length]
    ) {
      length++;
    }

    if (length > bestLength) {
      bestLength = length;
      bestOffset = currentPos - i;
    }
  }

  return { offset: bestOffset, length: bestLength };
}

function lz77Encode(text, windowSize = 10) {
  const result = [];
  let i = 0;
  while (i < text.length) {
    const windowStart = Math.max(0, i - windowSize);
    const { offset, length } = findMatch(text, windowStart, i);

    if (length > 0) {
      result.push({ offset, length });
      i += length;
    } else {
      result.push({ char: text[i] });
      i++;
    }
  }

  return result;
}

function lz77Decode(encoded) {
  let result = "";

  for (let i = 0; i < encoded.length; i++) {
    const token = encoded[i];

    if (token.char) {
      result = result + token.char;
    } else {
      const start = result.length - token.offset;
      for (let j = 0; j < token.length; j++) {
        result = result + result[start + j];
      }
    }
  }

  return result;
}

module.exports = { lz77Encode, lz77Decode };
