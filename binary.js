function encode(archive) {
  const parts = [];

  parts.push(Buffer.from("SQZ"));
  parts.push(Buffer.from([1]));

  const fileCount = Buffer.alloc(4);
  fileCount.writeUInt32BE(archive.files.length, 0);
  parts.push(fileCount);

  for (let i = 0; i < archive.files.length; i++) {
    const file = archive.files[i];

    const fileNameBuf = Buffer.from(file.fileName);
    const fileNameLen = Buffer.alloc(2);
    fileNameLen.writeUInt16BE(fileNameBuf.length, 0);
    parts.push(fileNameLen);
    parts.push(fileNameBuf);

    const sizes = Buffer.alloc(12);
    sizes.writeUInt32BE(file.originalSize, 0);
    sizes.writeUInt32BE(file.compressedSize, 4);
    sizes.writeUInt32BE(file.checksum, 8);
    parts.push(sizes);

    parts.push(Buffer.from([file.jsMode ? 1 : 0]));

    const dataBuf = Buffer.from(file.compressedData);
    const dataLen = Buffer.alloc(4);
    dataLen.writeUInt32BE(dataBuf.length, 0);
    parts.push(dataLen);
    parts.push(dataBuf);
  }

  return Buffer.concat(parts);
}

function decode(buffer) {
  let offset = 0;

  const magic = buffer.slice(offset, offset + 3).toString();
  offset += 3;
  if (magic !== "SQZ") throw new Error("This is not a squeeze file!");

  const version = buffer[offset];
  offset += 1;

  const fileCount = buffer.readUInt32BE(offset);
  offset += 4;

  const files = [];

  for (let i = 0; i < fileCount; i++) {
    const fileNameLen = buffer.readUInt16BE(offset);
    offset += 2;
    const fileName = buffer.slice(offset, offset + fileNameLen).toString();
    offset += fileNameLen;

    const originalSize = buffer.readUInt32BE(offset);
    offset += 4;
    const compressedSize = buffer.readUInt32BE(offset);
    offset += 4;
    const checksum = buffer.readUInt32BE(offset);
    offset += 4;

    const jsMode = buffer[offset] === 1;
    offset += 1;

    const dataLen = buffer.readUInt32BE(offset);
    offset += 4;
    const compressedData = buffer.slice(offset, offset + dataLen).toString();
    offset += dataLen;

    files.push({
      fileName,
      compressedData,
      jsMode,
      originalSize,
      compressedSize,
      checksum,
    });
  }

  return {
    header: { magic, version },
    files,
  };
}

module.exports = { encode, decode };
