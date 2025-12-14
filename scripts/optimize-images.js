#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const images = [];

function walk(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (/\.(jpe?g|png)$/i.test(full)) {
      images.push(full);
    }
  }
}

walk(root);

async function convert() {
  for (const imgPath of images) {
    const dirname = path.dirname(imgPath);
    const base = path.basename(imgPath, path.extname(imgPath));
    const webpPath = path.join(dirname, base + '.webp');
    const avifPath = path.join(dirname, base + '.avif');

    try {
      await sharp(imgPath).resize({ width: 1600, withoutEnlargement: true }).toFile(webpPath);
      await sharp(imgPath).resize({ width: 1600, withoutEnlargement: true }).toFile(avifPath);
      console.log('Optimized', imgPath);
    } catch (err) {
      console.error('Failed to optimize', imgPath, err);
    }
  }
}

convert();
