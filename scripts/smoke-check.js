const fs = require('fs');
const path = require('path');

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function exists(p) {
  return fs.existsSync(p);
}

const root = process.cwd();
const indexPath = path.join(root, 'index.html');
const sitemapPath = path.join(root, 'sitemap.xml');
const robotsPath = path.join(root, 'robots.txt');
const resumePath = path.join(root, 'resume.html');

const failures = [];
const notes = [];

if (!exists(indexPath)) failures.push('Missing index.html');
if (!exists(sitemapPath)) failures.push('Missing sitemap.xml');
if (!exists(robotsPath)) failures.push('Missing robots.txt');
if (!exists(resumePath)) failures.push('Missing resume.html');

if (failures.length) {
  console.log('SMOKE CHECK FAILED');
  for (const f of failures) console.log('- ' + f);
  process.exit(1);
}

const indexText = read(indexPath);
const hrefRegex = /href=["']([^"']+)["']/gi;
const localHrefs = [];
let m;
while ((m = hrefRegex.exec(indexText))) {
  const href = m[1];
  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) continue;
  localHrefs.push(href);
}

const uniqueLocal = [...new Set(localHrefs)];
for (const href of uniqueLocal) {
  const clean = href.split('#')[0].split('?')[0];
  const resolved = path.normalize(path.join(root, clean));
  if (!exists(resolved)) {
    failures.push(`Broken local href from index: ${href} -> ${clean}`);
  }
}

const appPages = uniqueLocal
  .filter((h) => h.startsWith('projects/apps/') && h.endsWith('.html'))
  .map((h) => h.split('#')[0].split('?')[0]);

for (const appRel of appPages) {
  const appPath = path.join(root, appRel);
  const appText = read(appPath);
  if (!/index\.html/.test(appText)) {
    failures.push(`No back-to-index link hint in ${appRel}`);
  }
}

const resumeText = read(resumePath);
if (!/window\.print\(\)/.test(resumeText)) {
  failures.push('resume.html is missing print trigger logic');
}
if (!/params\.get\(["']download["']\)/.test(resumeText)) {
  failures.push('resume.html is missing query handling for download parameter');
}

const sitemapText = read(sitemapPath);
for (const appRel of appPages) {
  const url = `https://guptan0506.github.io/${appRel}`;
  if (!sitemapText.includes(url)) {
    failures.push(`sitemap.xml missing URL for ${appRel}`);
  }
}

const requiredStandalone = [
  'https://guptan0506.github.io/',
  'https://guptan0506.github.io/resume.html',
  'https://guptan0506.github.io/projects/password-analyzer-case-study.html',
  'https://guptan0506.github.io/projects/fixmate-case-study.html',
];
for (const url of requiredStandalone) {
  if (!sitemapText.includes(url)) {
    failures.push(`sitemap.xml missing expected URL: ${url}`);
  }
}

const robotsText = read(robotsPath);
if (!/Sitemap:\s*https:\/\/guptan0506\.github\.io\/sitemap\.xml/i.test(robotsText)) {
  failures.push('robots.txt does not point to canonical sitemap URL');
}

if (failures.length) {
  console.log('SMOKE CHECK FAILED');
  for (const f of failures) console.log('- ' + f);
  process.exit(1);
}

notes.push(`Checked ${uniqueLocal.length} unique local href values in index.html`);
notes.push(`Validated ${appPages.length} app page routes + back-link hints`);
notes.push('Validated resume download/print behavior markers');
notes.push('Validated sitemap and robots consistency');

console.log('SMOKE CHECK PASSED');
for (const n of notes) console.log('- ' + n);
