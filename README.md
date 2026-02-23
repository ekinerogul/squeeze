# Squeeze

A custom file compression tool built from scratch using Huffman Coding, LZ77, and Deflate algorithms, with JS-specific optimization for JavaScript projects.

## Getting Started

```bash
git clone https://github.com/ekinerogul/squeeze.git
cd squeeze
npm install
```

## Usage

**Compress a file:**
```bash
node cli.js compress <file>
```

**Compress a JS file with JS optimization:**
```bash
node cli.js compress <file> --js
```

**Compress an entire folder:**
```bash
node cli.js compress <folder> --js
```

**Extract:**
```bash
node cli.js extract <file>.squeeze
```

Extracted files are placed under `./extracted/` with the original folder structure preserved.

## How It Works

### 1. Huffman Coding

Assigns shorter bit codes to frequently used characters and longer codes to rare ones. Uses canonical Huffman codes so only the code length per symbol (1 byte) needs to be stored — not the full frequency count (4 bytes). Huffman output is bit-packed into bytes, making storage 8x more compact than a naive implementation.

### 2. LZ77

Looks back up to 4 096 characters in the sliding window and replaces repeated sequences with `<offset,length>` back-references. Only matches of 4 or more characters are encoded as references (shorter matches would expand the data rather than shrink it).

### 3. Deflate pipeline

LZ77 runs first to eliminate repeated sequences, then Huffman compresses the resulting token stream. The code-length table needed to reconstruct the Huffman tree is stored in compact binary form (3 bytes per symbol) alongside the compressed data.

### 4. Raw fallback

If the compressed output would be larger than the original (common for very small files), the file is stored as-is with a single flag byte. No algorithm overhead, no size increase.

### 5. JS Optimization (`--js` flag)

Before compression, 28 common JavaScript keywords (`function`, `const`, `return`, `async`, `await`, `typeof`, `catch`, ...) are replaced with safe single-byte control characters. This reduces the text size fed into LZ77 and creates high-frequency single-byte symbols for Huffman.

The tool automatically tries both modes and picks whichever produces the smaller output — so `--js` never makes things worse.

After extraction the keywords are restored exactly — the round-trip is 100% lossless.

## Compression Results

| File | Original | Compressed | Ratio |
| ---- | -------- | ---------- | ----- |
| app.js | 3 023 bytes | 1 305 bytes | -56.8% |
| color-geometry/src (16 files) | 45 519 bytes | 24 633 bytes | -45.9% |

## Binary Format

Each `.squeeze` archive begins with a 3-byte magic header `SQZ`, a version byte, and a 4-byte file count. Per-file records contain:

| Field | Size |
| ----- | ---- |
| Filename length | 2 bytes |
| Filename | N bytes |
| Original size | 4 bytes |
| Checksum | 4 bytes |
| JS mode flag | 1 byte |
| Raw flag | 1 byte |
| Code-length table (3 bytes × symbols) | variable |
| Packed Huffman data | variable |

If the raw flag is set, the code-length table and Huffman data are omitted and the original content is stored directly.

## Author

Ekin Erogul - [GitHub](https://github.com/ekinerogul)
