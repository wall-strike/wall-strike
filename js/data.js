'use strict';
/* Static game data: skins, maps, rarities, cases, drop odds. No state, no DOM (except map images). Must run on its own (tools/check.mjs does that). */
/* ---------- ITEM TABLE: one row per skin. New skin = one row here + one PNG in assets/. ----------
 fill: default item that still drops from its case (common filler, so fixed chances can be small);
 fix: fixed drop chance in its case (0.0025 = 0.25%), the rest share what is left;
 t: a agent | k knife (expands into FIN finishes) | g gloves; r: rarity index into RAR (knife: base model rarity);
 def: in the starting inventory and never dropped from cases; eq: also equipped on a fresh save;
 gem: price in gems - also sold on the Gem Shop page (agents only); the skin still drops from its case;
 img: image path under assets/ (without extension, .webp); col: agent colours {a,b,d} or glove colours [main,dark] */
const SKINS = [
    { t: 'a', id: 'donk', n: 'Donk', r: 6, gem: 500, fix: .0025, img: 'agents/donk', col: { a: '#efd8d0', b: '#c9a89a', d: '#54463a' } },
    { t: 'a', id: 'curly', n: 'ZywOo', r: 6, gem: 500, fix: .0025, img: 'agents/curly', col: { a: '#e8a888', b: '#c88868', d: '#5a2f1a' } },
    { t: 'a', id: 'monesy', n: 'Monesy', r: 6, gem: 500, fix: .0025, img: 'agents/monesy', col: { a: '#e0bda7', b: '#c49a80', d: '#5a3a22' } },
    { t: 'a', id: 'ropz', n: 'ropz', r: 5, z: .8, fix: .01, img: 'agents/ropz', col: { a: '#e2c3c3', b: '#c49a9a', d: '#7a3a12' } },
    { t: 'a', id: 'frozen', n: 'frozen', r: 5, z: .8, fix: .01, img: 'agents/frozen', col: { a: '#e2c3c3', b: '#c49a9a', d: '#7a3a12' } },
    { t: 'a', id: 'camo', n: 'Camo', r: 0, def: 1, fill: 1, eq: 1, img: 'agents/camo', col: { a: '#a37a4c', b: '#7a5a36', d: '#5a4026' } },
    { t: 'k', id: 'karambit', n: 'Karambit', r: 1, img: 'knives/karambit' },
    { t: 'k', id: 'bowie', n: 'Bowie Knife', r: 1, def: 1, eq: 1, img: 'knives/bowie' },
    { t: 'k', id: 'butterfly', n: 'Butterfly Knife', r: 2, img: 'knives/butterfly' },
    { t: 'g', id: 'vice', n: 'Sport Gloves | Vice', r: 3, img: 'gloves/vice', col: ['#ec4899', '#383533'] },
    { t: 'g', id: 'violet', n: 'Sport Gloves | Violet', r: 2, img: 'gloves/violet', col: ['#7c3aed', '#383533'] },
    { t: 'g', id: 'pinkrush', n: 'Sport Gloves | Pink Rush', r: 4, img: 'gloves/pinkrush', col: ['#ec4899', '#7c3aed'] },
    { t: 'g', id: 'basic', n: 'Sport Gloves | Default', r: 0, def: 1, eq: 1, img: 'gloves/basic', col: ['#9da3af', '#6b7280'] }
];
const SID = o => o.t == 'k' ? `k:${o.id}:0` : o.t + ':' + o.id;
const DEF = () => {
    const inv = {}, eq = {};
    SKINS.forEach(o => {
        if (o.def)
            inv[SID(o)] = 1;
        if (o.eq)
            eq[o.t] = SID(o);
    });
    return { $: 0, gems: 0, best: 0, inv, eq, map: 0, pick: 0, vol: .6, mute: false };
};
/* ---------- DATA ---------- */
const RAR = [['Consumer Grade', '#b0c3d9'], ['Industrial Grade', '#5e98d9'], ['Mil-Spec', '#4b69ff'], ['Restricted', '#8847ff'], ['Classified', '#d32ce6'], ['Legendary', '#eb4b4b'], ['Secret', '#050505']];
const MAPS = [
    { n: 'Mirage', u: 0, m: 1, sp: 1, dec: 0, sky: ['#f6c27a', '#e9a15b', '#b9794a'], gr: '#c89a62', gd: '#8d6a3f', c: '#d9b27a' },
    { n: 'Inferno', u: 500, m: 1.3, sp: 1, dec: 1, sky: ['#f58a4a', '#c9562f', '#5a2a2a'], gr: '#7a4a3a', gd: '#4a2a22', c: '#b5533a' },
    { n: 'Dust II', u: 1200, m: 1.6, sp: 1.05, dec: 2, sky: ['#8fc7e8', '#e8d9a8', '#d4b36f'], gr: '#d0b070', gd: '#a2824a', c: '#c9a45c', bg: 'maps/dust2', bw: [106, 295] },
    { n: 'Ancient', u: 2500, m: 2, sp: 1.1, dec: 3, sky: ['#2f5a4a', '#4f8a5d', '#1f3a2f'], gr: '#4a6a45', gd: '#2d4430', c: '#6d8f6a' },
    { n: 'Nuke', u: 4500, m: 2.5, sp: 1.2, dec: 4, sky: ['#3a4a60', '#6f8097', '#26303f'], gr: '#59616d', gd: '#353b45', c: '#8794a5' },
    { n: 'Anubis', u: 7000, m: 3, sp: 1.1, g: .82, dec: 5, sky: ['#0f4f5c', '#2a9a9a', '#e0b860'], gr: '#c8a868', gd: '#7a5f35', c: '#d3b36a' },
    { n: 'Cache', u: 9000, m: 3.5, sp: 1.15, dec: 6, sky: ['#8a9aa8', '#c9b99a', '#5a5f66'], gr: '#6f6a60', gd: '#3f3c36', c: '#8a8578' },
    { n: 'Overpass', u: 12000, m: 4, sp: 1.15, dec: 7, sky: ['#6a8fb0', '#aebfc8', '#4a5a60'], gr: '#6a7a70', gd: '#3a463f', c: '#7f8f88' },
    { n: 'Train', u: 16000, m: 4.5, sp: 1.2, dec: 8, sky: ['#6a6f78', '#9a9a98', '#3a3d42'], gr: '#6a5a4a', gd: '#3a2f26', c: '#7a6a58' },
    { n: 'Vertigo', u: 21000, m: 5, sp: 1.25, g: .9, dec: 9, sky: ['#5aa0d8', '#bfe0f5', '#3a5a78'], gr: '#9aa0a8', gd: '#5a6068', c: '#aab4c0' }
];
MAPS.forEach(m => {
    if (m.bg) {
        m.im = new Image();
        m.im.src = 'assets/' + m.bg + '.webp';
    }
});
const MODS = ['Standard', 'Warm alleys', 'Faster desert', 'Mossy ruins', 'Speed +20%', 'Low gravity', 'Warehouse crates', 'Bridge run', 'Rail yard', 'Skyscraper'];
const AN = {};
const FIN = [['Default', '#d7dde6', '#7d8794', -1], ['Safari Mesh', '#8a7a50', '#4a4026', 0], ['Forest DDPAT', '#5e7a45', '#2a3a22', 0], ['Blue Steel', '#6f8fb5', '#2c4260', 1], ['Crimson Web', '#d34040', '#5a1414', 2], ['Fade', '#ff9a3d', '#d83ad0', 3], ['Doppler', '#3d7dff', '#b13dff', 3], ['Slaughter', '#ff5a3d', '#7a0f0f', 3], ['Gamma Lore', '#7dff6a', '#1a8a3a', 5]].map(a => ({ n: a[0], c: [a[1], a[2]], t: a[3] }));
const ITEM = {}, POOL = [[], [], [], [], [], [], []];
const add = o => {
    ITEM[o.id] = o;
    if (!o.nd)
        POOL[o.r].push(o.id);
};
SKINS.forEach(o => {
    if (o.t == 'a')
        add({ id: 'a:' + o.id, t: 'a', k: o.id, n: o.n, r: o.r, gem: o.gem || 0, fix: o.fix || 0, nd: !!o.def && !o.fill });
    else if (o.t == 'k') {
        add({ id: SID(o), t: 'k', s: o.id, f: 0, n: o.n + ' | Default', r: o.def ? 0 : o.r, nd: !!o.def });
        for (let f = 1; f < 9; f++)
            add({ id: `k:${o.id}:${f}`, t: 'k', s: o.id, f, n: o.n + ' | ' + FIN[f].n, r: Math.min(6, o.r + FIN[f].t) });
    }
    else
        add({ id: SID(o), t: 'g', n: o.n, r: o.r, c: o.col, img: o.id, nd: !!o.def });
});
const CS = [{ n: 'Agent Case', p: 400, b: 1.5, col: '#d32ce6', t: 'a', d: 'For your player<br>Unlock new agents' }, { n: 'Knife Case', p: 300, b: 1.6, col: '#eb4b4b', t: 'k', d: 'Unlock a new knife<br>and its skins' }, { n: 'Gloves Case', p: 400, b: 1.5, col: '#ffd700', t: 'g', d: 'Unlock new gloves' }];
const WT = [45, 28, 16, 7, 3, .8, .2], REF = [5, 10, 20, 40, 70, 120, 200];
const cprob = (c, ids) => {
    const fx = ids.reduce((a, i) => a + (i.fix || 0), 0), w = ids.map(i => i.fix ? 0 : WT[i.r] * Math.pow(c.b, i.r)), T = w.reduce((a, b) => a + b);
    return ids.map((i, k) => T ? i.fix || w[k] / T * (1 - fx) : (i.fix || 0) / (fx || 1));
};
function roll(ci, any) {
    const c = CS[ci], ids = Object.values(ITEM).filter(i => !i.nd && (any || i.t == c.t)), w = cprob(c, ids), T = w.reduce((a, b) => a + b);
    let q = Math.random() * T, k = 0;
    while (k < ids.length - 1 && q > w[k]) {
        q -= w[k];
        k++;
    }
    return ids[k].id;
}
