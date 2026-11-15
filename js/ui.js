'use strict';
/* DOM screens: top bar, menu, inventory, shop, cases, maps, settings. */
/* ---------- UI ---------- */
function rvbg(col) {
    ov.className = 'ui cs';
    ov.style.setProperty('--c', col);
}
function top_() {
    const a = ITEM[S.eq.a];
    tp.innerHTML = `<span>$${S.$.toLocaleString()}</span><span class=gm><i class=gi></i>${S.gems.toLocaleString()}</span><span>BEST ${S.best}</span>`;
    tp.append(icon(a, 60));
}
function mainMenu() {
    menu.innerHTML = '<h1 aria-label="WALL STRIKE"><img class=logo alt="WALL STRIKE" src="assets/ui/logo.webp"></h1>';
    [['PLAY', play], ['INVENTORY', inv], ['SHOP', cases], ['MAPS', maps], ['SETTINGS', sets]].forEach(([n, f], i) => {
        const b = E('button', 'b' + (i ? ' s' : ''), n);
        b.onclick = () => {
            au();
            loadCase();
            SFX.click();
            f();
        };
        menu.append(b);
    });
}
function panel(title, fn) {
    const fi = kb ? foc(pn).indexOf(document.activeElement) : -1;
    pn.className = 'ui';
    pn.innerHTML = `<div class=ph><h2>${title}</h2><button class="b s sm" id=bk>BACK</button></div><div class=pb></div>`;
    $('#bk').onclick = () => {
        SFX.click();
        pn.className = 'ui hid';
        top_();
    };
    fn(pn.querySelector('.pb'));
    top_();
    if (kb) {
        inr();
        const f = foc(pn), t = f[Math.min(fi < 0 ? 1 : fi, f.length - 1)];
        if (t)
            t.focus();
    }
}
let tab = 'a';
function inv() {
    panel('INVENTORY', b => {
        const T = { a: 'Agents', k: 'Knives', g: 'Gloves' }, cnt = k => Object.values(ITEM).filter(i => i.t == k && S.inv[i.id]).length + '/' + Object.values(ITEM).filter(i => i.t == k).length;
        b.append(E('div', 'tabs', Object.keys(T).map(k => `<button class="tb ${k == tab ? 'on' : ''}" data-k=${k}>${T[k]} <small>${cnt(k)}</small></button>`).join('')));
        b.querySelectorAll('.tb').forEach(x => x.onclick = () => {
            tab = x.dataset.k;
            SFX.click();
            inv();
        });
        const g = E('div', 'gr'), list = Object.values(ITEM).filter(i => i.t == tab).sort((a, b) => a.r - b.r);
        if (tab == 'g')
            list.unshift({ id: null, t: 'g', n: 'No gloves', r: 0, none: 1 });
        list.forEach(it => {
            const own = it.none || S.inv[it.id], on = S.eq[tab] == it.id, d = E('div', 'cd' + (own ? '' : ' lk') + (on ? ' eq' : ''));
            d.style.setProperty('--c', RAR[it.r][1]);
            d.append(icon(it, 130), E('b', '', it.none || own ? it.n.replace(' | ', '<br>') : '???'), E('small', '', own ? (on ? 'EQUIPPED' : S.inv[it.id] > 1 ? '×' + S.inv[it.id] : '&nbsp;') : 'LOCKED'));
            if (own) {
                const go = () => {
                    S.eq[tab] = it.id;
                    save();
                    SFX.click();
                    inv();
                };
                d.onclick = go;
                kbd(d, go);
            }
            g.append(d);
        });
        b.append(g);
    });
}
function caseInfo(c) {
    const ids = Object.values(ITEM).filter(i => !i.nd && i.t == c.t), w = cprob(c, ids), T = w.reduce((a, b) => a + b), p = [], ch = {};
    ids.forEach((i, k) => {
        p[i.r] = (p[i.r] || 0) + w[k] / T;
        ch[i.id] = w[k] / T;
    });
    const seen = {}, show = [], nm = i => i.t == 'k' ? i.n.split(' | ')[0].replace(/ Knife$/, '') : i.n.split(' | ').pop();
    ids.slice().sort((a, b) => b.r - a.r).forEach(i => {
        const k = i.t == 'k' ? nm(i) : i.id;
        if (!seen[k] && show.length < 3) {
            seen[k] = 1;
            show.push(i);
        }
    });
    return { p, show, nm, ch };
}
const TN = { a: 'Agent', k: 'Knife', g: 'Gloves' }, pc = v => {
    v *= 100;
    return (v >= 1 ? +v.toFixed(1) : v.toFixed(2)) + '%';
};
function cases(pg) {
    panel('SHOP', b => {
        const sec = t => E('div', 'sct', `<h2>${t}</h2>`), big = E('div', 'sbg'), sm = E('div', 'ssm'), L = E('div', 'sb'), R = E('div', 'sr');
        CS.forEach((c, i) => {
            const { p, show, nm, ch } = caseInfo(c), tr = p.length - 1;
            const d = E('div', 'si', `<div class=sw></div><div class=sv><img alt="" src="${crUI(c)}"></div><div class=sd><h3>${c.n}</h3><p>Top: ${RAR[tr][0]} ${pc(p[tr])}</p></div>`);
            d.style.setProperty('--c', c.col);
            d.tabIndex = 0;
            d.setAttribute('role', 'button');
            const sp = E('div', 'sp'), go = () => {
                SFX.click();
                caseDetail(i);
            };
            d.onclick = go;
            d.onkeydown = e => {
                if (e.key == 'Enter' || e.key == ' ') {
                    e.preventDefault();
                    go();
                }
            };
            sp.textContent = '$' + c.p;
            sp.classList.toggle('need', S.$ < c.p);
            d.append(sp);
            big.append(d);
            show.slice(0, 2).forEach(it => {
                const x = E('div', 'si sx', `<div class=sw></div><div class=sv></div><div class=sd><h3>${nm(it)}</h3><p>${it.t == 'k' && it.n.includes(' | ') ? it.n.split(' | ')[1] : TN[it.t]}</p></div><div class=sp>${pc(ch[it.id])}</div>`);
                x.style.setProperty('--c', RAR[it.r][1]);
                x.querySelector('.sv').append(icon(it, 84));
                sm.append(x);
            });
        });
        L.append(sec('FEATURED CASES'), big);
        R.append(sec('TOP DROPS'), sm);
        const sh = E('div', 'shp'), p1 = E('div', 'pg');
        sh.append(L, R);
        p1.append(sh, E('p', 'nt', 'Top drops: chance per case opening. Earn $ by playing — no real money. Duplicates are refunded.'));
        shopPages(b, p1, pg);
    });
}
/* shop = 2 horizontally swipeable pages: 0 cases ($), 1 gem shop (gems, rare agents only) */
let SHW = null;
function shopPg(i) {
    if (SHW && SHW.pgs.isConnected && !pn.classList.contains('hid'))
        SHW.go(i);
}
function shopPages(b, p1, start) {
    const w = E('div', 'shw'), tabs = E('div', 'tabs'), pgs = E('div', 'pgs'), p2 = gemPage(), gl = Object.values(ITEM).filter(i => i.gem), tb = ['CASES', 'GEM SHOP <small>' + gl.filter(i => S.inv[i.id]).length + '/' + gl.length + '</small>'].map((n, i) => E('button', 'tb' + (i ? '' : ' on'), n)), lf = E('button', 'pgn l hd', '‹'), rt = E('button', 'pgn r', '›');
    const go = i => pgs.scrollTo({ left: i ? pgs.scrollWidth : 0, behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' }), sync = () => {
        const m = pgs.scrollWidth - pgs.clientWidth, i = m > 0 && pgs.scrollLeft / m > .5 ? 1 : 0;
        tb.forEach((t, k) => t.classList.toggle('on', k == i));
        lf.classList.toggle('hd', !i);
        rt.classList.toggle('hd', !!i);
    };
    tb.forEach((t, i) => t.onclick = () => {
        SFX.click();
        go(i);
    });
    lf.onclick = () => {
        SFX.click();
        go(0);
    };
    rt.onclick = () => {
        SFX.click();
        go(1);
    };
    pgs.onscroll = sync;
    tabs.append(...tb);
    pgs.append(p1, p2);
    w.append(tabs, pgs, lf, rt);
    b.append(w);
    SHW = { pgs, go };
    if (start) {
        pgs.scrollLeft = pgs.scrollWidth;
        sync();
    }
}
function gemPage() {
    const pg = E('div', 'pg'), g = E('div', 'gg');
    pg.append(E('div', 'sct', '<h2>VERY RARE AGENTS</h2>'));
    Object.values(ITEM).filter(i => i.gem).sort((a, b) => a.gem - b.gem || a.r - b.r).forEach(it => {
        const own = S.inv[it.id], can = S.gems >= it.gem, d = E('div', 'cd gc' + (own ? ' own' : '')), lbl = `<i class=gi></i>${it.gem}`, bt = E('button', 'b sm gb' + (own || !can ? ' s' : ''), own ? 'OWNED' : lbl);
        d.style.setProperty('--c', RAR[it.r][1]);
        d.append(E('small', 'rr', RAR[it.r][0].toUpperCase()), icon(it, 130), E('b', '', it.n), bt, E('small', '', own ? 'IN YOUR INVENTORY' : can ? 'READY TO BUY' : 'NEED ' + (it.gem - S.gems) + ' MORE'));
        let cf = 0, ct;
        bt.onclick = () => {
            if (own || !can)
                return;
            if (!cf) {
                cf = 1;
                bt.textContent = 'CONFIRM?';
                SFX.click();
                ct = setTimeout(() => {
                    cf = 0;
                    bt.innerHTML = lbl;
                }, 3000);
                return;
            }
            clearTimeout(ct);
            buyGem(it.id);
        };
        g.append(d);
    });
    pg.append(g, E('p', 'nt', 'Rare agents for gems. Collect blue diamonds while running: each one gives 1 gem.'));
    return pg;
}
function caseDetail(ci) {
    const c = CS[ci], { p, ch } = caseInfo(c), MAXQ = 10;
    let q = 1;
    const ids = Object.values(ITEM).filter(i => !i.nd && i.t == c.t).sort((a, b) => b.r - a.r || a.n.localeCompare(b.n));
    rvbg(c.col);
    ov.innerHTML = `<div class=cdp style="--c:${c.col}"><div class=ph><h2>${c.n}</h2><button class="b s sm" id=cdb>BACK</button></div><div class=cdbd><div class=cdl><div class=cdc><img alt="" src="${crUI(c)}"></div><p>${c.d}</p><div class=sq></div><button class=b id=cdo></button></div><div class=cdr><div class=sct><h2>CHANCES</h2></div><div class=cdsum></div><div class=cdg></div></div></div></div>`;
    const sm = ov.querySelector('.cdsum'), g = ov.querySelector('.cdg'), sq = ov.querySelector('.sq'), op = $('#cdo'), mi = E('button', '', '−'), pl = E('button', '', '+'), qn = E('span');
    for (let r = 6; r >= 0; r--)
        if (p[r]) {
            const x = E('span', '', `${RAR[r][0]} <b>${pc(p[r])}</b>`);
            x.style.setProperty('--c', RAR[r][1]);
            sm.append(x);
        }
    ids.forEach(it => {
        const d = E('div', 'ri');
        d.style.setProperty('--c', RAR[it.r][1]);
        d.append(icon(it, 96), E('small', '', it.n.split(' | ').join('<br>')), E('em', '', pc(ch[it.id])));
        g.append(d);
    });
    const up = () => {
        const t = c.p * q, ok = S.$ >= t;
        qn.textContent = '×' + q;
        op.textContent = ok ? 'OPEN · $' + t : 'NEED $' + (t - S.$);
        op.disabled = !ok;
        mi.disabled = q <= 1;
        pl.disabled = q >= MAXQ || S.$ < c.p * (q + 1);
    };
    mi.onclick = () => {
        if (q > 1) {
            q--;
            SFX.click();
            up();
        }
    };
    pl.onclick = () => {
        if (q < MAXQ && S.$ >= c.p * (q + 1)) {
            q++;
            SFX.click();
            up();
        }
    };
    op.onclick = () => {
        if (S.$ >= c.p * q) {
            SFX.click();
            openCase(ci, q);
        }
    };
    $('#cdb').onclick = () => {
        SFX.click();
        ov.className = 'ui hid';
    };
    sq.append(mi, qn, pl);
    up();
}
function buyGem(id) {
    const it = ITEM[id];
    if (!it || !it.gem || S.inv[id] || S.gems < it.gem)
        return;
    S.gems -= it.gem;
    S.inv[id] = 1;
    save();
    top_();
    SFX.rare(it.r);
    const col = RAR[it.r][1];
    ov.className = 'ui';
    rvbg(col);
    ov.innerHTML = `<div class=rv style="--c:${col}"><div class=rays></div><div class=glow></div><h3 class=rb style="color:${col == '#050505' ? '#fff' : col}">${RAR[it.r][0].toUpperCase()}</h3><div id=bg></div><h2>${it.n}</h2><p>NEW AGENT UNLOCKED!</p><div class=row><button class=b id=eqp>EQUIP</button><button class="b s" id=cl>COLLECT</button></div></div>`;
    $('#bg').append(icon(it, 240));
    $('#bg').style.filter = `drop-shadow(0 0 ${10 + it.r * 6}px ${col})`;
    $('#eqp').onclick = () => {
        S.eq[it.t] = id;
        save();
        SFX.click();
        ov.className = 'ui hid';
        cases(1);
    };
    $('#cl').onclick = () => {
        ov.className = 'ui hid';
        SFX.click();
        cases(1);
    };
}
function openCase(ci, q = 1) {
    const c = CS[ci];
    q = Math.max(1, Math.min(10, q | 0));
    if (S.$ < c.p * q)
        return;
    au();
    loadCase();
    S.$ -= c.p * q;
    save();
    top_();
    const wins = [];
    for (let k = 0; k < q; k++)
        wins.push(roll(ci));
    S.pend = q > 1 ? wins : wins[0];
    save();
    const N = 46, WI = 38;
    /* one reel per opened case; many reels are laid out in 1-2 columns and zoomed so they all fit on screen */
    const zf = n => Math.min(1, (H - (PT ? 270 : 200)) / (Math.ceil(q / n) * 208 * UZ), (W - 80 - 16 * UZ * (n - 1)) / n / (RW * UZ)), z1 = zf(1), z2 = zf(2), cols = q > 1 && z2 > z1 + .01 ? 2 : 1, z = q > 1 ? Math.max(.3, cols == 2 ? z2 : z1) : 1;
    rvbg(c.col);
    ov.innerHTML = `<div class="ocs${q > 1 ? ' multi' : ''}"><img class=ocr alt="" src="${crUI(c)}"><h3 class=oct>${c.n.toUpperCase()}${q > 1 ? ' ×' + q : ''}</h3><div class=rls></div></div>`;
    const rls = ov.querySelector('.rls');
    rls.style.gridTemplateColumns = `repeat(${cols},max-content)`;
    const trs = wins.map(win => {
        const rl = E('div', 'rl', '<div class=mk></div><div class=tr></div>'), tr = rl.querySelector('.tr');
        if (z < 1)
            rl.style.zoom = z;
        for (let i = 0; i < N; i++) {
            const it = ITEM[i == WI ? win : roll(ci)], d = E('div', 'ri');
            d.style.borderBottomColor = RAR[it.r][1];
            d.style.setProperty('--c', RAR[it.r][1]);
            d.append(icon(it, 96), E('small', '', it.n.split(' | ').join('<br>')));
            tr.append(d);
        }
        rls.append(rl);
        return tr;
    });
    SFX.open();
    trs.forEach(tr => {
        tr.style.transform = 'translateX(0)';
    });
    trs[0].offsetWidth;
    trs.forEach(tr => {
        tr.style.transition = 'transform 3.2s cubic-bezier(.12,.7,.1,1)';
        tr.style.transform = `translateX(${-(WI * 138 + 65 - RW / 2 + (Math.random() * 80 - 40))}px)`;
    });
    let last = -1;
    const iv = setInterval(() => {
        const m = new DOMMatrix(getComputedStyle(trs[0]).transform), i = Math.floor((RW / 2 - m.m41) / 138);
        if (i != last) {
            last = i;
            SFX.tick();
        }
    }, 30);
    setTimeout(() => {
        clearInterval(iv);
        trs.forEach(tr => tr.children[WI].classList.add('win'));
    }, 3300);
    setTimeout(() => reveal(wins, c), 4400);
}
function reveal(x, c) {
    if (Array.isArray(x) && x.length > 1)
        return revealMulti(x, c);
    const id = [].concat(x)[0], it = ITEM[id], col = RAR[it.r][1], dup = S.inv[id];
    S.inv[id] = (dup || 0) + 1;
    const rf = dup ? REF[it.r] : 0;
    S.$ += rf;
    delete S.pend;
    save();
    SFX.rare(it.r);
    rvbg(col);
    ov.innerHTML = `<div class=rv style="--c:${col}"><div class=rays></div><div class=glow></div><h3 class=rb style="color:${col == '#050505' ? '#fff' : col}">${RAR[it.r][0].toUpperCase()}</h3><div id=bg></div><h2>${it.n}</h2><p>${dup ? 'Duplicate → +$' + rf : 'NEW ITEM!'}</p><div class=row><button class=b id=eqp>EQUIP</button><button class="b s" id=cl>COLLECT</button></div></div>`;
    $('#bg').append(icon(it, 240));
    $('#bg').style.filter = `drop-shadow(0 0 ${10 + it.r * 6}px ${col})`;
    $('#eqp').onclick = () => {
        S.eq[it.t] = id;
        save();
        SFX.click();
        ov.className = 'ui hid';
        cases();
    };
    $('#cl').onclick = () => {
        ov.className = 'ui hid';
        SFX.click();
        cases();
    };
}
function revealMulti(ids, c) {
    let tot = 0, nw = 0;
    const cells = ids.map(id => {
        const it = ITEM[id], dup = S.inv[id];
        S.inv[id] = (dup || 0) + 1;
        const rf = dup ? REF[it.r] : 0;
        S.$ += rf;
        tot += rf;
        if (!dup)
            nw++;
        return { it, dup, rf };
    });
    delete S.pend;
    save();
    cells.sort((x, y) => x.it.r - y.it.r);
    const n = cells.length, top = cells[n - 1].it.r;
    rvbg(RAR[top][1]);
    ov.innerHTML = `<div class=rv><h3 style="color:#f5a524">${n} CASES OPENED</h3><div class=rg></div><p id=sm class=hd></p><div class="row hd" id=rw><button class=b id=cl>COLLECT</button></div></div>`;
    const g = ov.querySelector('.rg'), sm = $('#sm'), rw = $('#rw');
    let k = 0, tm = 0, done = 0;
    const cards = cells.map(({ it, dup, rf }) => {
        const d = E('div', 'ri dn');
        d.append(E('img', 'cb'), icon(it, 96), E('small', '', it.n.split(' | ').join('<br>')), E('em', dup ? '' : 'nw', dup ? '+$' + rf : 'NEW'));
        d.firstChild.src = crUI(c);
        g.append(d);
        return d;
    });
    const flash = col => {
        const f = E('div', 'fx');
        f.style.background = col;
        ov.append(f);
        setTimeout(() => f.remove(), 700);
    };
    const flip = (i, q) => {
        const { it } = cells[i], d = cards[i], col = RAR[it.r][1];
        d.firstChild.remove();
        d.classList.remove('dn');
        d.style.setProperty('--c', col);
        d.style.borderBottomColor = col;
        if (i == n - 1 && it.r == top)
            d.classList.add('best');
        if (q)
            return;
        d.classList.add('pop');
        if (it.r >= 4)
            SFX.rare(it.r);
        else
            tone(300 + it.r * 120, .12, 'triangle', .18);
        if (it.r >= 5)
            flash(col);
    };
    const fin = () => {
        if (done)
            return;
        done = 1;
        sm.textContent = `${nw} new · duplicates +$${tot}`;
        sm.classList.remove('hd');
        rw.classList.remove('hd');
    };
    const gap = i => i == n - 2 && top >= 3 ? 750 : Math.max(150, Math.min(380, 2400 / n));
    const step = () => {
        if (k >= n)
            return fin();
        flip(k++);
        tm = setTimeout(step, k >= n ? 500 : gap(k - 1));
    };
    g.onclick = () => {
        if (done)
            return;
        clearTimeout(tm);
        while (k < n)
            flip(k++, 1);
        SFX.rare(top);
        fin();
    };
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) {
        while (k < n)
            flip(k++, 1);
        fin();
    }
    else
        tm = setTimeout(step, 500);
    $('#cl').onclick = () => {
        clearTimeout(tm);
        ov.className = 'ui hid';
        SFX.click();
        cases();
    };
}
function maps() {
    panel('MAPS', b => {
        const w = E('div', 'big');
        MAPS.forEach((m, i) => {
            const un = S.best >= m.u, d = E('div', 'card' + (S.pick == i ? ' sel' : '') + (un ? '' : ' off'), `<div class=mp style="background:${m.bg ? `linear-gradient(#0003,#0003),url(assets/${m.bg}.webp) center/cover` : `linear-gradient(${m.sky[0]},${m.sky[1]} 60%,${m.gr})`}">${m.n}</div><p>${un ? 'Payout x' + m.m + ' · ' + MODS[i] : 'LOCKED · Reach score ' + m.u}</p>`);
            d.style.setProperty('--c', m.c);
            d.style.cursor = un ? 'pointer' : 'default';
            if (un) {
                const go = () => {
                    S.pick = S.map = i;
                    save();
                    SFX.click();
                    maps();
                };
                d.onclick = go;
                kbd(d, go);
            }
            w.append(d);
        });
        b.append(w);
    });
}
let rs = 0;
function sets() {
    panel('SETTINGS', b => {
        const d = E('div', 'set', `<label>Volume <input type=range min=0 max=100 value=${S.vol * 100}></label>`);
        d.querySelector('input').oninput = e => {
            S.vol = e.target.value / 100;
            save();
            SFX.click();
        };
        const mu = E('button', 'b s sm', S.mute ? 'SOUND: OFF' : 'SOUND: ON');
        mu.onclick = () => {
            S.mute = !S.mute;
            save();
            sets();
            SFX.click();
        };
        const rb = E('button', 'b d sm', rs ? 'CLICK AGAIN TO CONFIRM' : 'RESET PROGRESS');
        rb.onclick = () => {
            if (rs) {
                S = DEF();
                save();
                rs = 0;
                toMenu();
                pn.className = 'ui hid';
            }
            else {
                rs = 1;
                sets();
            }
        };
        const fb = E('button', 'b s sm', 'FULLSCREEN (F)');
        fb.onclick = () => {
            SFX.click();
            fsT();
        };
        d.append(mu, fb, rb, E('p', '', '<small style="color:#8b95a8">Tap the opposite half = long jump · tap your own wall side = hop · tap in air = 2x jump. Keys: SPACE/W jump, A/D or arrows pick a side, S/↓ slide, P/TAB/ESC pause (R restart, L lobby, Q end run), M mute, F fullscreen. Menus: arrows/TAB move, ENTER select, ESC back, 1-5 shortcuts. Shield pickup saves you once.</small>'));
        b.append(d);
    });
}
