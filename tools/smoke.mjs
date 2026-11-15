#!/usr/bin/env node
// Browser smoke test (needs Playwright + Chromium; not part of the game):
//   node tools/smoke.mjs                 run against this repo, compare with tools/golden.json
//   node tools/smoke.mjs --update        accept the current behaviour as the new golden.json
//   options: --root <dir> site folder (default: repo root)  --golden <file>  --shots <dir> save screenshots
// Checks: no console/page errors, no failed requests, offline start + complete offline cache, save loading/migration,
// and a seeded 150 s simulated run whose numbers must match golden.json exactly (so a refactor cannot silently change gameplay).
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const ROOT = path.resolve(arg('--root', path.join(HERE, '..')));
const GOLDEN = path.resolve(arg('--golden', path.join(HERE, 'golden.json')));
const SHOTS = arg('--shots', '');
const UPDATE = process.argv.includes('--update');

let chromium;
try { ({chromium} = await import('playwright')); }
catch { try { ({chromium} = (await import('node:module')).createRequire(import.meta.url)('/opt/npm-tools/node_modules/playwright')); }
  catch { console.error('Playwright is not installed. Install: npm i --no-save playwright && npx playwright install chromium'); process.exit(2); } }

const MIME = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.mp3': 'audio/mpeg', '.ttf': 'font/ttf', '.webmanifest': 'application/manifest+json', '.json': 'application/json'};
const server = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end('not found'); return; }
  r.writeHead(200, {'content-type': MIME[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r);
}).listen(0);
const BASE = `http://localhost:${server.address().port}`;
const walk = d => fs.readdirSync(d, {withFileTypes: true}).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const diskAssets = walk(path.join(ROOT, 'assets')).map(f => path.relative(ROOT, f).split(path.sep).join('/')).sort();
if (SHOTS) fs.mkdirSync(SHOTS, {recursive: true});

const SEED = `(()=>{let a=0x9e3779b9;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}})()`;
const errors = [], failed = [], golden = {}, assertions = [];
const assert = (c, m) => { if (!c) assertions.push(m); };
const md5 = s => crypto.createHash('md5').update(s).digest('hex').slice(0, 10);
const br = await chromium.launch();
async function fresh(vp = {width: 1280, height: 720}) {
  const ctx = await br.newContext({viewport: vp, deviceScaleFactor: 1});
  await ctx.addInitScript(SEED);
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  p.on('requestfailed', r => failed.push(r.url() + ' ' + (r.failure() || {}).errorText));
  p.on('response', r => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url()); });
  return {ctx, p};
}
const shot = (p, n) => SHOTS ? p.screenshot({path: path.join(SHOTS, n + '.png')}) : null;

// 1) load, tables, UI walk (DOM of every screen is hashed)
{
  const {ctx, p} = await fresh();
  await p.goto(BASE + '/'); await p.waitForSelector('#menu .b', {timeout: 8000}); await p.waitForTimeout(1000);
  await shot(p, '01-menu');
  golden.static = await p.evaluate(() => ({
    items: Object.keys(ITEM).length, skins: SKINS.length, maps: MAPS.length, pools: POOL.map(x => x.length),
    economy: CS.map(c => { const ids = Object.values(ITEM).filter(i => !i.nd && i.t == c.t), w = cprob(c, ids); return {n: c.n, price: c.p, items: ids.length, avgRefund: +ids.reduce((a, i, k) => a + w[k] * REF[i.r], 0).toFixed(4)}; }),
  }));
  const dom = () => p.evaluate(() => ['#top', '#menu', '#pn', '#ov'].map(s => document.querySelector(s).innerHTML.replace(/\s+/g, ' ')).join('|'));
  golden.ui = {menu: md5(await dom())};
  const names = await p.$$eval('#menu .b', b => b.map(x => x.textContent.trim()));
  for (let i = 1; i < names.length; i++) {
    await p.evaluate(() => toMenu()); await p.waitForTimeout(150);
    await p.locator('#menu .b').nth(i).click(); await p.waitForTimeout(450);
    golden.ui[names[i]] = md5(await dom()); await shot(p, `02-${names[i]}`);
    // the shop switches its tab only after the scroll animation ends, so wait for it instead of a fixed delay
    const nt = await p.locator('#pn .tabs .tb').count();
    for (let t = 0; t < nt; t++) { await p.locator('#pn .tabs .tb').nth(t).click(); await p.waitForFunction(i => document.querySelectorAll('#pn .tabs .tb')[i]?.classList.contains('on'), t, {timeout: 4000}); await p.waitForTimeout(300); golden.ui[`${names[i]}/tab${t}`] = md5(await dom()); }
    if (/shop/i.test(names[i])) { const c = await p.$('#pn .si'); if (c) { await c.click(); await p.waitForTimeout(450); golden.ui.caseDetail = md5(await dom()); await shot(p, '03-case'); } }
    await p.keyboard.press('Escape'); await p.waitForTimeout(150); await p.keyboard.press('Escape');
  }
  await ctx.close();
}
// 2) seeded simulated run: shield on, inputs scripted, restart on death -> exact numbers
{
  const {ctx, p} = await fresh();
  await p.goto(BASE + '/'); await p.waitForSelector('#menu .b'); await p.waitForTimeout(600);
  golden.sim = await p.evaluate(() => {
    const seed = s => { let a = s; Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
    seed(12345); const rolls = []; for (let i = 0; i < 300; i++) rolls.push(roll(i % 3));
    seed(777); play(); G.pause = 1; const cp = []; let deaths = 0, maxScore = 0;
    for (let f = 1; f <= 9000; f++) {
      if (G.dead) { deaths++; newRun(); G.pause = 1; }
      G.sh = 1; if (f % 17 == 0) jump(f % 34 == 0 ? -1 : 1); if (f % 53 == 0) slide();
      upd(1 / 60); G.pause = 1; maxScore = Math.max(maxScore, G.score);
      if (f % 1500 == 0) cp.push({f, deaths, t: +G.t.toFixed(3), x: +G.x.toFixed(2), y: +G.y.toFixed(2), maxY: +G.maxY.toFixed(2), score: G.score, cash: G.cash, gems: G.gems, combo: G.combo, obs: G.obs.length, coins: G.coins.length, ny: +G.ny.toFixed(2), dead: G.dead, side: G.side});
    }
    const kinds = {}; G.obs.forEach(o => kinds[o.k] = (kinds[o.k] || 0) + 1);
    G.dead = true; const before = {$: S.$, gems: S.gems, best: S.best}; end();
    return {rolls: rolls.join(','), deaths, maxScore, cp, kinds, before, after: {$: S.$, gems: S.gems, best: S.best}};
  });
  await ctx.close();
}
// 3) saves: old save loads, removed skins are converted to gems, pending case recovered, corrupt save backed up
{
  const {ctx, p} = await fresh();
  await p.goto(BASE + '/');
  const load = async raw => { await p.evaluate(r => localStorage.setItem('pigstrike', r), raw); await p.reload(); await p.waitForSelector('#menu .b'); await p.waitForTimeout(400); };
  await load('{"$":1234,"gems":10,"inv":{"a:camo":1,"a:ropz":2,"a:ghost":1,"a:midas":1,"a:void":1},"eq":{"a":"a:ghost"},"best":777,"pend":["a:frozen"]}');
  golden.save = await p.evaluate(() => ({$: S.$, gems: S.gems, best: S.best, eqA: S.eq.a, inv: Object.keys(S.inv).sort(), pend: S.pend || null}));
  await load('{broken');
  golden.corrupt = await p.evaluate(() => ({bak: localStorage.getItem('pigstrike_bak'), $: S.$}));
  await ctx.close();
}
// 4) offline: whole asset folder cached, game starts without network
{
  const {ctx, p} = await fresh();
  await p.goto(BASE + '/'); await p.waitForSelector('#menu .b');
  await p.evaluate(() => navigator.serviceWorker.ready.then(() => 0)); await p.waitForTimeout(2500);
  const cached = await p.evaluate(async () => { const o = []; for (const k of await caches.keys()) { const c = await caches.open(k); for (const r of await c.keys()) o.push(new URL(r.url).pathname); } return [...new Set(o)].sort(); });
  const missing = diskAssets.filter(f => !cached.includes('/' + f));
  assert(!missing.length, 'files missing from the offline cache: ' + missing.join(', '));
  await ctx.setOffline(true); await p.reload();
  let started = true; try { await p.waitForSelector('#menu .b', {timeout: 6000}); } catch { started = false; }
  assert(started, 'game does not start offline');
  await ctx.close();
}
// 5) phone layout
{
  const {ctx, p} = await fresh({width: 390, height: 844});
  await p.goto(BASE + '/'); await p.waitForSelector('#menu .b'); await p.waitForTimeout(700); await shot(p, '05-portrait');
  golden.portrait = await p.evaluate(() => ({PT, W, H})); await ctx.close();
}
await br.close(); server.close();

assert(!errors.length, 'console/page errors: ' + [...new Set(errors)].join(' | '));
assert(!failed.length, 'failed requests: ' + [...new Set(failed)].join(' | '));
for (const e of golden.static.economy) assert(e.avgRefund / e.price < 0.25, `${e.n}: refund too high`);
if (UPDATE) { fs.writeFileSync(GOLDEN, JSON.stringify(golden, null, 1) + '\n'); console.log('golden updated:', GOLDEN); }
else if (fs.existsSync(GOLDEN)) {
  const g = JSON.parse(fs.readFileSync(GOLDEN, 'utf8'));
  const diff = (a, b, p = '') => Object.keys({...a, ...b}).flatMap(k => (typeof a?.[k] == 'object' && typeof b?.[k] == 'object' && a[k] && b[k]) ? diff(a[k], b[k], p + k + '.') : JSON.stringify(a?.[k]) === JSON.stringify(b?.[k]) ? [] : [`${p}${k}: golden ${JSON.stringify(a?.[k])?.slice(0, 80)} vs now ${JSON.stringify(b?.[k])?.slice(0, 80)}`]);
  const d = diff(g, golden); assert(!d.length, 'behaviour differs from golden.json (if intended, run with --update):\n  ' + d.join('\n  '));
} else console.log('no golden.json yet - run with --update to create it');
if (assertions.length) { console.log('FAIL\n' + assertions.map(a => ' - ' + a).join('\n')); process.exit(1); }
console.log('Smoke test passed.', UPDATE ? '' : fs.existsSync(GOLDEN) ? '(matches golden.json)' : '');
