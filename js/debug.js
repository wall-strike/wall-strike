'use strict';
/* Error collection + debug helpers. Loaded first, so it also sees errors thrown while the other scripts load.
   Normal play: every distinct error is logged once and kept in DBG.errors (no spam, nothing shown to the player).
   Open the game with ?debug (e.g. http://localhost:8000/?debug) to also get:
     - a red error banner in the corner (runtime errors, promise rejections, files that failed to load)
     - console helpers: dbg.state() dbg.give(id) dbg.cash(n) dbg.gems(n) dbg.best(n) dbg.god() dbg.reset() */
const DBG = (() => {
  const on = /[?&]debug(=|&|$)/.test(location.search);
  const errors = [], seen = new Set();
  let box = null;
  const show = () => {
    if (!on || !document.body) return;
    if (!box) {
      box = document.createElement('pre');
      box.style.cssText = 'position:fixed;left:8px;bottom:8px;max-width:70vw;max-height:40vh;overflow:auto;margin:0;padding:6px 8px;background:#300d;color:#fff;font:12px/1.35 ui-monospace,Consolas,monospace;z-index:99;white-space:pre-wrap;pointer-events:none;border:1px solid #f55';
      document.body.append(box);
    }
    box.textContent = errors.slice(-5).join('\n');
  };
  const report = (err, where) => {
    const msg = err && err.message ? err.message : String(err);
    const stack = err && err.stack ? err.stack.split('\n').slice(0, 3).join('\n') : '';
    if (seen.has(msg + stack)) return;
    seen.add(msg + stack);
    errors.push(`[${where}] ${msg}${stack ? '\n' + stack : ''}`);
    try { console.error(`[${where}]`, err); } catch (_) {}
    show();
  };
  addEventListener('error', e => {
    const t = e.target;
    if (t && t !== window && (t.src || t.href)) report('failed to load ' + (t.src || t.href), 'asset');
    else report(e.error || `${e.message} (${(e.filename || '').split('/').pop()}:${e.lineno})`, 'error');
  }, true);
  addEventListener('unhandledrejection', e => report(e.reason, 'promise'));
  return {on, errors, report};
})();

if (DBG.on) addEventListener('load', () => {
  let god = 0;
  const upd = () => { save(); top_(); };
  window.dbg = {
    state: () => ({mode, S, G}),
    items: () => Object.keys(ITEM),
    give: id => { if (!ITEM[id]) return 'unknown item: ' + id; S.inv[id] = (S.inv[id] || 0) + 1; upd(); return id; },
    cash: n => { S.$ += n; upd(); return S.$; },
    gems: n => { S.gems += n; upd(); return S.gems; },
    best: n => { S.best = n; upd(); return S.best; },
    god: () => { god = !god; return god ? 'shield refills every 100 ms' : 'off'; },
    reset: () => { try { localStorage.removeItem('pigstrike'); } catch (_) {} location.reload(); },
  };
  setInterval(() => { if (god && mode == 'play' && G && !G.dead) G.sh = 1; }, 100);
  console.info('debug mode - helpers: dbg.state() dbg.items() dbg.give(id) dbg.cash(n) dbg.gems(n) dbg.best(n) dbg.god() dbg.reset()');
});
