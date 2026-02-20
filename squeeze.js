const { deflateEncode, deflateDecode } = require("./deflate");

function squeezeCreate(files, options = {}) {
  const archive = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const { encoded, tree, jsMode } = deflateEncode(
      file.content,
      options.jsMode,
    );

    archive.push({
      fileName: file.name,
      compressedData: encoded,
      tree: tree,
      jsMode: jsMode,
      originalSize: file.content.length,
      compressedSize: encoded.length,
      checksum: checksum(file.content),
    });
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
    const content = deflateDecode({
      encoded: entry.compressedData,
      tree: entry.tree,
      jsMode: entry.jsMode,
    });

    if (checksum(content) !== entry.checksum) {
      throw new Error(entry.fileName + "corrupted!");
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
    sum = sum + text.charCodeAt(i);
  }
  return sum;
}

function createHeader(fileCount) {
  return {
    magic: "SQZ",
    version: "1.0",
    createdAt: new Date().toISOString(),
    fileCount: fileCount,
  };
}

module.exports = { squeezeCreate, squeezeExtract };
