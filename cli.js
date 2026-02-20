const fs = require("fs");
const { squeezeCreate, squeezeExtract } = require("./squeeze");
const { encode: binaryEncode, decode: binaryDecode } = require("./binary");

const command = process.argv[2];
const fileName = process.argv[3];
const jsMode = process.argv[4] === "--js";

if (command === "compress") {
  const content = fs.readFileSync(fileName, "utf8");
  const archive = squeezeCreate([{ name: fileName, content }], { jsMode });
  const outputName = jsMode ? fileName + ".js.squeeze" : fileName + ".squeeze";
  const binary = binaryEncode(archive);
  fs.writeFileSync(outputName, binary);
  console.log(fileName + "squeezed! →" + outputName);
} else if (command === "extract") {
  const buffer = fs.readFileSync(fileName);
  const archive = binaryDecode(buffer);
  const files = squeezeExtract(archive);
  files.forEach((file) => {
    fs.writeFileSync("extracted_" + file.fileName, file.content);
    console.log(file.fileName + " pened! → extracted_" + file.fileName);
  });
} else {
  console.log("Usage: node cli.js compress <file>");
  console.log(" node cli.js extract <file>.squeeze");
}
