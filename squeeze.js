const { deflateEncode, deflateDecode } = require("./deflate");

function squeezeCreate(files, options = {}) {
  const archive = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (file.content.length === 0) {
      archive.push({
        fileName: file.name,
        raw: true,
        rawContent: "",
        jsMode: false,
        originalSize: 0,
        checksum: 0,
      });
      continue;
    }

    let encoded, codeLengths, jsMode;

    if (options.jsMode) {
      const withJs = deflateEncode(file.content, true);
      const withoutJs = deflateEncode(file.content, false);
      const sizeWithJs =
        2 + Object.keys(withJs.codeLengths).length * 3 + Math.ceil(withJs.encoded.length / 8) + 1;
      const sizeWithoutJs =
        2 + Object.keys(withoutJs.codeLengths).length * 3 + Math.ceil(withoutJs.encoded.length / 8) + 1;
      if (sizeWithJs <= sizeWithoutJs) {
        encoded = withJs.encoded;
        codeLengths = withJs.codeLengths;
        jsMode = true;
      } else {
        encoded = withoutJs.encoded;
        codeLengths = withoutJs.codeLengths;
        jsMode = false;
      }
    } else {
      const result = deflateEncode(file.content, false);
      encoded = result.encoded;
      codeLengths = result.codeLengths;
      jsMode = false;
    }

    const compressedPayloadSize =
      2 + Object.keys(codeLengths).length * 3 + Math.ceil(encoded.length / 8) + 1;
    const isRaw = compressedPayloadSize >= file.content.length;

    if (isRaw) {
      archive.push({
        fileName: file.name,
        raw: true,
        rawContent: file.content,
        jsMode: false,
        originalSize: file.content.length,
        checksum: checksum(file.content),
      });
    } else {
      archive.push({
        fileName: file.name,
        raw: false,
        compressedData: encoded,
        codeLengths: codeLengths,
        jsMode: jsMode,
        originalSize: file.content.length,
        checksum: checksum(file.content),
      });
    }
  }

  return {
    header: createHeader(files.length),
    files: archive,
  };
}

function squeezeExtract(archive) {
  if (archive.header.magic !== "SQZ") {
    throw new Error("This is not a squeeze file!");
  }

  const files = [];

  for (let i = 0; i < archive.files.length; i++) {
    const entry = archive.files[i];

    const content = entry.raw
      ? entry.rawContent
      : deflateDecode({
          encoded: entry.compressedData,
          codeLengths: entry.codeLengths,
          jsMode: entry.jsMode,
        });

    if (checksum(content) !== entry.checksum) {
      throw new Error(entry.fileName + " corrupted!");
    }

    files.push({
      fileName: entry.fileName,
      content: content,
    });
  }

  return files;
}

function checksum(text) {
  let sum = 0;
  for (let i = 0; i < text.length; i++) {
    sum = (sum + text.charCodeAt(i)) >>> 0;
  }
  return sum;
}

function createHeader(fileCount) {
  return {
    magic: "SQZ",
    version: "2.0",
    createdAt: new Date().toISOString(),
    fileCount: fileCount,
  };
}

module.exports = { squeezeCreate, squeezeExtract };
