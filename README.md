# 🗜️ Squeeze

A custom file compression tool built from scratch using Huffman Coding, LZ77, and Deflate algorithms. Includes JS-specific optimization for compressing JavaScript projects.

## 🚀 Getting Started

### Installation

```bash
git clone https://github.com/ekinerogul/squeeze.git
cd squeeze
npm install
```

### Usage

**Compress a file:**

```bash
node cli.js compress <file>
```

**Compress a JS file with JS optimization:**

```bash
node cli.js compress <file> --js
```

**Extract a file:**

```bash
node cli.js extract <file>.squeeze
```

## ⚙️ How It Works

### 1. Huffman Coding

Assigns shorter bit codes to frequently used characters and longer codes to rare ones. Reduces file size by up to 80% for repetitive text.

### 2. LZ77

Looks back at previous content and replaces repeated sequences with references. Instead of writing the same word twice, it says "go back X characters and copy Y characters."

### 3. Deflate

Combines LZ77 and Huffman in a pipeline — LZ77 first finds repetitions, then Huffman compresses the result further.

### 4. JS Optimization

Replaces common JavaScript keywords (`function`, `const`, `return`, etc.) with single-byte symbols before compression, resulting in significantly smaller output for JS files.

## 📊 Compression Results

> Note: Compression is most effective on larger, repetitive files.
> Small files may result in larger output due to algorithm overhead
> (storing the Huffman tree, LZ77 references, etc.)

| File     | Original     | Normal Mode  | JS Mode      |
| -------- | ------------ | ------------ | ------------ |
| app.js   | 31,987 bytes | 31,987 bytes | 28,927 bytes |
| test.txt | 15 bytes     | 1,040 bytes  | -            |

## 👤 Author

Ekin Eroğul - [GitHub](https://github.com/ekinerogul)
