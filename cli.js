const fs = require("fs");
const path = require("path");
const { squeezeCreate, squeezeExtract } = require("./squeeze");
const { encode: binaryEncode, decode: binaryDecode } = require("./binary");

const command = process.argv[2];
const target = process.argv[3];
const jsMode = process.argv[4] === "--js";

function collectJsFiles(dirPath) {
  const results = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectJsFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      results.push(full);
    }
  }
  return results;
}

if (command === "compress") {
  const stat = fs.statSync(target);

  if (stat.isDirectory()) {
    const jsPaths = collectJsFiles(target);
    if (jsPaths.length === 0) {
      console.log("No .js files found in " + target);
      process.exit(1);
    }

    const files = jsPaths.map((filePath) => ({
      name: path.relative(target, filePath),
      content: fs.readFileSync(filePath, "utf8"),
    }));

    const totalOriginal = files.reduce((sum, f) => sum + f.content.length, 0);
    const archive = squeezeCreate(files, { jsMode });
    const binary = binaryEncode(archive);
    const outputName = path.basename(target) + ".squeeze";
    fs.writeFileSync(outputName, binary);

    const ratio = ((1 - binary.length / totalOriginal) * 100).toFixed(1);
    const sign = ratio >= 0 ? "-" : "+";
    console.log(target + "/ squeezed -> " + outputName);
    console.log("  Files:      " + files.length + " .js files");
    console.log("  Original:   " + totalOriginal + " bytes");
    console.log("  Compressed: " + binary.length + " bytes  (" + sign + Math.abs(ratio) + "%)");
  } else {
    const content = fs.readFileSync(target, "utf8");
    const archive = squeezeCreate([{ name: target, content }], { jsMode });
    const outputName = target + ".squeeze";
    const binary = binaryEncode(archive);
    fs.writeFileSync(outputName, binary);

    const ratio = ((1 - binary.length / content.length) * 100).toFixed(1);
    const sign = ratio >= 0 ? "-" : "+";
    console.log(target + " squeezed -> " + outputName);
    console.log("  Original:   " + content.length + " bytes");
    console.log("  Compressed: " + binary.length + " bytes  (" + sign + Math.abs(ratio) + "%)");
  }
} else if (command === "extract") {
  const buffer = fs.readFileSync(target);
  const archive = binaryDecode(buffer);
  const files = squeezeExtract(archive);
  files.forEach((file) => {
    const outPath = path.join("extracted", file.fileName);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, file.content);
    console.log(file.fileName + " -> " + outPath);
  });
  console.log(files.length + " file(s) extracted to ./extracted/");
} else {
  console.log("Usage:");
  console.log("  node cli.js compress <file|folder> [--js]");
  console.log("  node cli.js extract  <file>.squeeze");
}
