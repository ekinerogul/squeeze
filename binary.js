function packBits(bitString) {
  const padLen = (8 - (bitString.length % 8)) % 8;
  const padded = bitString + "0".repeat(padLen);
  const byteCount = padded.length / 8;
  const buf = Buffer.alloc(byteCount + 1);
  buf[0] = padLen;
  for (let i = 0; i < byteCount; i++) {
    buf[i + 1] = parseInt(padded.slice(i * 8, i * 8 + 8), 2);
  }
  return buf;
}

function unpackBits(buffer) {
  const padLen = buffer[0];
  let bitString = "";
  for (let i = 1; i < buffer.length; i++) {
    bitString += buffer[i].toString(2).padStart(8, "0");
  }
  return padLen > 0 ? bitString.slice(0, -padLen) : bitString;
}

function encodeCodeLengths(codeLengths) {
  const entries = Object.keys(codeLengths);
  const buf = Buffer.alloc(2 + entries.length * 3);
  buf.writeUInt16BE(entries.length, 0);
  let pos = 2;
  for (let i = 0; i < entries.length; i++) {
    buf.writeUInt16BE(entries[i].charCodeAt(0), pos);
    buf[pos + 2] = codeLengths[entries[i]];
    pos += 3;
  }
  return buf;
}

function decodeCodeLengths(buf, offset) {
  const count = buf.readUInt16BE(offset);
  offset += 2;
  const codeLengths = {};
  for (let i = 0; i < count; i++) {
    const charCode = buf.readUInt16BE(offset);
    const length = buf[offset + 2];
    codeLengths[String.fromCharCode(charCode)] = length;
    offset += 3;
  }
  return { codeLengths, bytesRead: 2 + count * 3 };
}

function encode(archive) {
  const parts = [];

  parts.push(Buffer.from("SQZ"));
  parts.push(Buffer.from([2])); // version 2

  const fileCount = Buffer.alloc(4);
  fileCount.writeUInt32BE(archive.files.length, 0);
  parts.push(fileCount);

  for (let i = 0; i < archive.files.length; i++) {
    const file = archive.files[i];

    const fileNameBuf = Buffer.from(file.fileName, "utf8");
    const fileNameLen = Buffer.alloc(2);
    fileNameLen.writeUInt16BE(fileNameBuf.length, 0);
    parts.push(fileNameLen);
    parts.push(fileNameBuf);

    const meta = Buffer.alloc(8);
    meta.writeUInt32BE(file.originalSize, 0);
    meta.writeUInt32BE(file.checksum, 4);
    parts.push(meta);

    parts.push(Buffer.from([file.jsMode ? 1 : 0]));
    parts.push(Buffer.from([file.raw ? 1 : 0]));

    if (file.raw) {
      parts.push(Buffer.from(file.rawContent, "utf8"));
    } else {
      const codeLengthsBuf = encodeCodeLengths(file.codeLengths);
      parts.push(codeLengthsBuf);

      const packedBuf = packBits(file.compressedData);
      const packedLen = Buffer.alloc(4);
      packedLen.writeUInt32BE(packedBuf.length, 0);
      parts.push(packedLen);
      parts.push(packedBuf);
    }
  }

  return Buffer.concat(parts);
}

function decode(buffer) {
  let offset = 0;

  const magic = buffer.slice(offset, offset + 3).toString();
  offset += 3;
  if (magic !== "SQZ") throw new Error("Not a squeeze file!");

  const version = buffer[offset];
  offset += 1;

  const fileCount = buffer.readUInt32BE(offset);
  offset += 4;

  const files = [];

  for (let i = 0; i < fileCount; i++) {
    const fileNameLen = buffer.readUInt16BE(offset);
    offset += 2;
    const fileName = buffer.slice(offset, offset + fileNameLen).toString("utf8");
    offset += fileNameLen;

    const originalSize = buffer.readUInt32BE(offset);
    offset += 4;
    const checksum = buffer.readUInt32BE(offset);
    offset += 4;

    const jsMode = buffer[offset] === 1;
    offset += 1;

    const isRaw = buffer[offset] === 1;
    offset += 1;

    if (isRaw) {
      const rawContent = buffer.slice(offset, offset + originalSize).toString("utf8");
      offset += originalSize;
      files.push({ fileName, raw: true, rawContent, jsMode, originalSize, checksum });
    } else {
      const { codeLengths, bytesRead } = decodeCodeLengths(buffer, offset);
      offset += bytesRead;

      const packedLen = buffer.readUInt32BE(offset);
      offset += 4;
      const compressedData = unpackBits(buffer.slice(offset, offset + packedLen));
      offset += packedLen;

      files.push({ fileName, raw: false, compressedData, codeLengths, jsMode, originalSize, checksum });
    }
  }

  return {
    header: { magic, version },
    files,
  };
}

module.exports = { encode, decode };
