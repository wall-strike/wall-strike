// Service worker: offline cache (stale-while-revalidate).
// The file list and cache version are generated: after changing, adding or removing any file run  node tools/check.mjs --write
// <generated> by tools/check.mjs --write - do not edit by hand
const V = 'wall-strike-5d721cd8';
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/debug.js',
  'js/core.js',
  'js/data.js',
  'js/save.js',
  'js/audio.js',
  'js/sprites.js',
  'js/world.js',
  'js/game.js',
  'js/ui.js',
  'js/input.js',
  'js/main.js',
  'assets/agents/camo.webp',
  'assets/agents/curly.webp',
  'assets/agents/donk.webp',
  'assets/agents/frozen.webp',
  'assets/agents/monesy.webp',
  'assets/agents/ropz.webp',
  'assets/audio/case-open.mp3',
  'assets/audio/jump.mp3',
  'assets/audio/land.mp3',
  'assets/digits/0-o.webp',
  'assets/digits/0.webp',
  'assets/digits/1-o.webp',
  'assets/digits/1.webp',
  'assets/digits/2-o.webp',
  'assets/digits/2.webp',
  'assets/digits/3-o.webp',
  'assets/digits/3.webp',
  'assets/digits/4-o.webp',
  'assets/digits/4.webp',
  'assets/digits/5-o.webp',
  'assets/digits/5.webp',
  'assets/digits/6-o.webp',
  'assets/digits/6.webp',
  'assets/digits/7-o.webp',
  'assets/digits/7.webp',
  'assets/digits/8-o.webp',
  'assets/digits/8.webp',
  'assets/digits/9-o.webp',
  'assets/digits/9.webp',
  'assets/fonts/MojeRuka.ttf',
  'assets/gloves/basic.webp',
  'assets/gloves/pinkrush.webp',
  'assets/gloves/vice.webp',
  'assets/gloves/violet.webp',
  'assets/icons/apple-touch-icon.png',
  'assets/icons/favicon.png',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/maskable-512.png',
  'assets/knives/bowie.webp',
  'assets/knives/butterfly.webp',
  'assets/knives/karambit.webp',
  'assets/maps/dust2.webp',
  'assets/ui/chick.webp',
  'assets/ui/coin.webp',
  'assets/ui/crate-a.webp',
  'assets/ui/crate-g.webp',
  'assets/ui/crate-k.webp',
  'assets/ui/crate.webp',
  'assets/ui/gem.webp',
  'assets/ui/logo.webp',
  'assets/ui/shield.webp',
  'assets/ui/spike.webp',
];
// </generated>
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(V)
      .then(c => Promise.all(FILES.map(f => c.add(f).catch(() => console.warn('sw: could not cache', f)))))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});
// instant offline start; updates are picked up on the next load
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(V).then(async c => {
    const hit = await c.match(e.request, {ignoreSearch: true});
    const net = fetch(e.request).then(r => {
      if (r && r.ok && new URL(e.request.url).origin === location.origin) c.put(e.request, r.clone());
      return r;
    }).catch(() => hit);
    return hit || net;
  }));
});
