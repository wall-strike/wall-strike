#!/usr/bin/env node
// Project sanity check. No dependencies:   node tools/check.mjs          (check only)
//                                          node tools/check.mjs --write  (also regenerate the offline cache list in sw.js)
// Catches the mistakes that are easy to make and slow to debug later: missing or unused files, a broken script
// list, a stale offline cache, broken drop tables and a case economy that could be farmed.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');
const MAX_REFUND_SHARE = 0.25; // expected duplicate refund must stay below this share of the case price
// Files that are loaded by a computed name, so a plain text search cannot see them:
const DYNAMIC_ASSETS = [/^assets\/ui\/crate-[akg]\.webp$/];

const problems = [], notes = [];
const bad = m => problems.push(m);
const ok = m => notes.push(m);
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const has = f => fs.existsSync(path.join(ROOT, f));
const walk = d => fs.readdirSync(path.join(ROOT, d), {withFileTypes: true})
  .flatMap(e => e.isDirectory() ? walk(d + '/' + e.name) : [d + '/' + e.name]).sort();

// ---- 1. index.html: every local file it links exists; scripts are listed in load order
const html = read('index.html');
const links = [...html.matchAll(/\b(?:src|href)="([^"#?]+)"/g)].map(m => m[1]).filter(u => !/^(https?:|data:)/.test(u));
for (const f of links) if (!has(f)) bad(`index.html links to ${f}, which does not exist`);
const scripts = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map(m => m[1]);
const css = links.filter(f => f.endsWith('.css'));
if (!scripts.length) bad('index.html has no <script src>');
ok(`index.html: ${scripts.length} scripts, ${css.length} stylesheet(s)`);

// ---- 2. every script compiles and is strict; every js/ file is actually loaded
for (const f of scripts) {
  if (!has(f)) continue;
  const code = read(f);
  try { new vm.Script(code, {filename: f}); } catch (e) { bad(`${f}: syntax error: ${e.message}`); }
  if (!/^\s*(\/\*[\s\S]*?\*\/\s*)?'use strict'/.test(code)) bad(`${f}: must start with 'use strict' (after the header comment)`);
}
for (const f of walk('js')) if (!scripts.includes(f)) bad(`${f} is not loaded by index.html (unused, or forgot the <script> tag)`);

// ---- 3. data sandbox: run js/data.js without a browser to inspect the tables
let D = null;
try {
  const ctx = vm.createContext({Image: class {}, console});
  D = vm.runInContext(read('js/data.js') + '\n;({SKINS, ITEM, CS, REF, WT, RAR, MAPS, cprob})', ctx, {filename: 'js/data.js'});
} catch (e) { bad(`js/data.js cannot run on its own (it must not depend on other scripts): ${e.message}`); }

// ---- 4. assets: referenced -> exists, exists -> referenced
const disk = walk('assets');
const refs = new Set();
for (const f of [...scripts, ...css, 'index.html', 'manifest.webmanifest'])
  if (has(f)) for (const m of read(f).matchAll(/assets\/[\w./-]+\.\w+/g)) refs.add(m[0]);
if (D) {
  for (const s of D.SKINS) refs.add(`assets/${s.img}.webp`);
  for (const m of D.MAPS) if (m.bg) refs.add(`assets/${m.bg}.webp`);
}
for (const r of refs) if (!has(r)) bad(`referenced file is missing: ${r}`);
for (const f of disk) if (!refs.has(f) && !DYNAMIC_ASSETS.some(re => re.test(f))) bad(`unused file (delete it, or reference it): ${f}`);
ok(`assets: ${disk.length} files, ${refs.size} references`);

// ---- 5. item tables and case economy
if (D) {
  const {SKINS, ITEM, CS, REF, RAR, MAPS, cprob} = D;
  const seen = new Set();
  for (const s of SKINS) {
    const key = s.t + ':' + s.id;
    if (seen.has(key)) bad(`duplicate skin ${key}`);
    seen.add(key);
    if (!'akg'.includes(s.t)) bad(`skin ${key}: unknown type`);
    if (!(s.r >= 0 && s.r < RAR.length)) bad(`skin ${key}: rarity ${s.r} out of range`);
    if (!s.img) bad(`skin ${key}: no img`);
  }
  for (const t of 'akg') {
    const n = SKINS.filter(s => s.t === t && s.def && s.eq).length;
    if (n !== 1) bad(`type ${t}: needs exactly one default+equipped item, found ${n}`);
  }
  if (!(MAPS.length && MAPS[0].u === 0 && MAPS.every((m, i) => !i || m.u > MAPS[i - 1].u))) bad('MAPS: first map must unlock at 0 and unlock scores must increase');
  const cheapest = Math.min(...CS.map(c => c.p));
  if (Math.max(...REF) >= cheapest) bad(`REF: the biggest duplicate refund (${Math.max(...REF)}) must stay below the cheapest case price (${cheapest})`);
  for (const c of CS) {
    const ids = Object.values(ITEM).filter(i => !i.nd && i.t === c.t);
    if (ids.length < 2) { bad(`${c.n}: needs at least 2 droppable items (the first opening would already be a duplicate)`); continue; }
    const w = cprob(c, ids), sum = w.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1) > 1e-6) bad(`${c.n}: drop chances add up to ${sum}, not 1`);
    if (w.some(p => !(p >= 0))) bad(`${c.n}: negative or invalid drop chance`);
    const avg = w.reduce((a, p, k) => a + p * REF[ids[k].r], 0);
    if (avg / c.p > MAX_REFUND_SHARE) bad(`${c.n}: average duplicate refund $${avg.toFixed(1)} is ${(avg / c.p * 100).toFixed(0)}% of the price $${c.p} (limit ${MAX_REFUND_SHARE * 100}%) - money could be farmed`);
    ok(`${c.n}: ${ids.length} items, price $${c.p}, average refund $${avg.toFixed(1)} (${(avg / c.p * 100).toFixed(1)}%)`);
  }
}

// ---- 6. offline cache: sw.js must list every shipped file, and its version must change whenever a file changes
const FILES = ['./', 'index.html', 'manifest.webmanifest', ...css, ...scripts, ...disk];
const hash = crypto.createHash('sha256');
for (const f of FILES.slice(1)) if (has(f)) hash.update(f + '\0').update(fs.readFileSync(path.join(ROOT, f)));
const V = 'wall-strike-' + hash.digest('hex').slice(0, 8);
const BEGIN = '// <generated>', END = '// </generated>';
const block = `${BEGIN} by tools/check.mjs --write - do not edit by hand\nconst V = '${V}';\nconst FILES = [\n${FILES.map(f => `  '${f}',`).join('\n')}\n];\n${END}`;
const sw = read('sw.js'), a = sw.indexOf(BEGIN), b = sw.indexOf(END);
if (a < 0 || b < 0) bad('sw.js: generated block markers are missing');
else if (sw.slice(a, b + END.length) !== block) {
  if (WRITE) { fs.writeFileSync(path.join(ROOT, 'sw.js'), sw.slice(0, a) + block + sw.slice(b + END.length)); ok(`sw.js regenerated (${V}, ${FILES.length} files)`); }
  else bad('sw.js is out of date (file list or version). Run: node tools/check.mjs --write');
} else ok(`sw.js up to date (${V}, ${FILES.length} files)`);

for (const n of notes) console.log('  ok  ' + n);
for (const p of problems) console.log('FAIL  ' + p);
console.log(problems.length ? `\n${problems.length} problem(s)` : '\nAll checks passed.');
process.exit(problems.length ? 1 : 0);
