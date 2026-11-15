'use strict';
/* Saved game (localStorage key "pigstrike" - never rename it without a migration). */
function loadSave() {
    const d = DEF();
    let raw = null, r = {}, bad = 0;
    try {
        raw = localStorage.getItem('pigstrike');
        r = JSON.parse(raw || '{}');
    }
    catch (e) {
        bad = 1;
    }
    const isO = x => x && typeof x == 'object' && !Array.isArray(x), num = (v, f) => typeof v == 'number' && isFinite(v) && v >= 0 ? v : f;
    if (!isO(r)) {
        r = {};
        bad = 1;
    }
    const s = Object.assign(DEF(), r);
    s.$ = num(r.$, d.$);
    s.best = num(r.best, d.best);
    if (('$' in r && s.$ !== r.$) || ('best' in r && s.best !== r.best))
        bad = 1;
    s.map = num(r.map, 0);
    s.pick = Math.floor(num(r.pick, 0));
    if (!MAPS[s.pick] || MAPS[s.pick].u > s.best)
        s.pick = 0;
    s.gems = Math.floor(num(r.gems, 0));
    if ('gems' in r && s.gems !== r.gems)
        bad = 1;
    s.vol = typeof r.vol == 'number' && r.vol >= 0 && r.vol <= 1 ? r.vol : d.vol;
    s.mute = !!r.mute;
    if (isO(r.eq)) {
        s.eq = Object.assign(d.eq, r.eq);
    }
    else {
        s.eq = d.eq;
        if ('eq' in r)
            bad = 1;
    }
    if (isO(r.inv)) {
        s.inv = {};
        for (const k in r.inv) {
            if (typeof r.inv[k] == 'number' && isFinite(r.inv[k]) && r.inv[k] > 0)
                s.inv[k] = r.inv[k];
            else
                bad = 1;
        }
    }
    else {
        s.inv = d.inv;
        if ('inv' in r)
            bad = 1;
    }
    if (Array.isArray(s.pend)) {
        s.pend = s.pend.filter(x => typeof x == 'string');
        if (!s.pend.length)
            delete s.pend;
    }
    else if (typeof s.pend != 'string')
        delete s.pend;
    if (bad && raw) {
        try {
            localStorage.setItem('pigstrike_bak', raw);
        }
        catch (e) {
        }
    }
    return s;
}
let S = loadSave();
const save = () => {
    try {
        localStorage.setItem('pigstrike', JSON.stringify(S));
    }
    catch (e) {
    }
};
{
    const D = DEF(), RM = { 'a:ghost': 150, 'a:midas': 300, 'a:void': 500 };
    for (const id in RM)
        if (S.inv[id]) {
            S.gems += RM[id];
            delete S.inv[id];
        }
    for (const id in D.inv)
        S.inv[id] = S.inv[id] || 1;
    ['a', 'k'].forEach(t => {
        if (!ITEM[S.eq[t]] || !S.inv[S.eq[t]])
            S.eq[t] = D.eq[t];
    });
    if (S.eq.g && (!ITEM[S.eq.g] || !S.inv[S.eq.g]))
        S.eq.g = null;
}
if (S.pend) {
    const pl = [].concat(S.pend);
    delete S.pend;
    pl.forEach(pid => {
        if (ITEM[pid]) {
            const dp = S.inv[pid];
            S.inv[pid] = (dp || 0) + 1;
            if (dp)
                S.$ += REF[ITEM[pid].r];
        }
    });
    save();
}
