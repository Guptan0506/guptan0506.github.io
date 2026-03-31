const fs = require('fs');
const path = require('path');

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['.git', '.github', '.vscode'].includes(entry.name)) continue;
      walk(p, acc);
    } else if (p.endsWith('.html')) {
      acc.push(p);
    }
  }
  return acc;
}

const htmlFiles = walk('.');
const broken = [];
const attrRegex = /(?:href|src)=["']([^"'#]+)(?:#[^"']*)?["']/gi;

for (const file of htmlFiles) {
  const text = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = attrRegex.exec(text))) {
    const ref = match[1];
    if (ref.includes('${')) continue;
    if (/^(https?:|mailto:|tel:|data:|javascript:)/i.test(ref)) continue;
    const cleanRef = ref.split('?')[0];
    const resolved = path.normalize(path.join(path.dirname(file), cleanRef));
    if (fs.existsSync(resolved) === false) {
      broken.push({ file, ref, resolved });
    }
  }
}

if (broken.length > 0) {
  console.log('BROKEN local refs found:');
  for (const item of broken) {
    console.log(`${item.file} -> ${item.ref} => ${item.resolved}`);
  }
  process.exitCode = 1;
} else {
  console.log('OK: all local href/src targets exist');
}
