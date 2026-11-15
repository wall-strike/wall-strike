'use strict';
/* Keyboard, pointer and touch input, fullscreen, resize, service worker registration. */
/* ---------- LOOP / INPUT ---------- */
/* keyboard: play = jump/slide/pause; menus = arrows/WASD move focus, ENTER/SPACE select, ESC goes back, 1-9 pick a menu item/tab, TAB cycles (hidden and covered layers are inert) */
let kb = 0;
const shown = e => !e.classList.contains('hid'), vis = e => e && e.offsetParent && !e.closest('.hd'), foc = r => [...r.querySelectorAll('button:not(:disabled):not(.pgn),[tabindex=\"0\"],input')].filter(x => vis(x)), mv = (r, dx, dy) => {
    const f = foc(r), a = document.activeElement;
    if (!f.includes(a)) {
        f[0] && f[0].focus();
        return;
    }
    const b = a.getBoundingClientRect(), cx = b.x + b.width / 2, cy = b.y + b.height / 2;
    let n = null, bs = 1e9;
    f.forEach(x => {
        if (x === a)
            return;
        const q = x.getBoundingClientRect(), ex = q.x + q.width / 2 - cx, ey = q.y + q.height / 2 - cy, d = ex * dx + ey * dy;
        if (d <= 2)
            return;
        const sc = d + Math.abs(dx ? ey : ex) * 3;
        if (sc < bs) {
            bs = sc;
            n = x;
        }
    });
    if (n)
        n.focus();
}, kbd = (d, go) => {
    d.tabIndex = 0;
    d.setAttribute('role', 'button');
    d.onkeydown = e => {
        if (e.key == 'Enter' || e.key == ' ') {
            e.preventDefault();
            if (!e.repeat)
                go();
        }
    };
}, DIR = { ArrowLeft: [-1, 0], KeyA: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0], ArrowUp: [0, -1], KeyW: [0, -1], ArrowDown: [0, 1], KeyS: [0, 1] }, inr = () => {
    const o = shown(ov), p = shown(pn);
    ov.inert = !o;
    pn.inert = !p || o;
    menu.inert = !shown(menu) || p || o;
};
[ov, pn, menu].forEach(e => new MutationObserver(inr).observe(e, { attributes: true, attributeFilter: ['class'] }));
inr();
addEventListener('pointerdown', () => {
    kb = 0;
}, true);
addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey)
        return;
    kb = 1;
    const c = e.code, tg = e.target, bt = tg.closest && tg.closest('button,[role=button]'), ent = c == 'Enter' || c == 'Space', d = DIR[c];
    if (tg.tagName == 'INPUT' && (c.startsWith('Arrow') || c == 'Home' || c == 'End'))
        return;
    if (mode == 'play' && (d || ent || c == 'Tab'))
        e.preventDefault();
    if (e.repeat && (mode == 'play' || !d))
        return;
    if (c == 'KeyF') {
        fsT();
        return;
    }
    if (c == 'KeyM') {
        S.mute = !S.mute;
        save();
        SFX.click();
        if (shown(pn) && pn.querySelector('.ph h2').textContent == 'SETTINGS')
            sets();
        return;
    }
    if (mode == 'play') {
        if (G.pause) {
            if (ent && bt && ov.contains(bt))
                bt.click();
            else if (c == 'KeyP' || c == 'Tab' || ent || c == 'Escape')
                G.pause = 0;
            else if (c == 'KeyQ') {
                G.pause = 0;
                die(1);
            }
            else if (c == 'KeyR')
                play();
            else if (c == 'KeyL' && pzOn)
                $('#pzl').click();
            else if (d)
                mv(ov, d[0], d[1]);
            return;
        }
        if (c == 'KeyP' || c == 'Tab' || c == 'Escape') {
            if (!G.dead)
                G.pause = 1;
            return;
        }
        if (c == 'Space' || c == 'ArrowUp' || c == 'KeyW')
            jump(0);
        else if (c == 'ArrowLeft' || c == 'KeyA')
            jump(-1);
        else if (c == 'ArrowRight' || c == 'KeyD')
            jump(1);
        else if (c == 'ArrowDown' || c == 'KeyS')
            slide();
        return;
    }
    const ly = shown(ov) ? ov : shown(pn) ? pn : mode == 'menu' ? menu : null, $o = q => ov.querySelector(q);
    if (mode == 'over') {
        if (c == 'Escape') {
            toMenu();
            return;
        }
        if (c == 'KeyR' || ent && !bt) {
            e.preventDefault();
            play();
            return;
        }
    }
    else if (shown(ov)) {
        if (c == 'Escape') {
            const b = $o('#cdb') || $o('#cl');
            if (vis(b))
                b.click();
            else if ($o('.rg'))
                $o('.rg').click();
            return;
        }
        if (c == 'KeyE' && vis($o('#eqp'))) {
            $o('#eqp').click();
            return;
        }
        if (ent && !bt) {
            e.preventDefault();
            const b = [$o('#cdo'), $o('#cl')].find(vis);
            if (b)
                b.click();
            else if ($o('.rg'))
                $o('.rg').click();
            return;
        }
        if (d && d[0]) {
            const q = ov.querySelectorAll('.sq button');
            if (q.length) {
                e.preventDefault();
                q[d[0] < 0 ? 0 : 1].click();
                return;
            }
        }
    }
    else if (shown(pn)) {
        if (c == 'Escape' || c == 'Backspace') {
            e.preventDefault();
            $('#bk').click();
            return;
        }
        const t = /^Digit[1-9]$/.test(c) && pn.querySelectorAll('.tabs .tb')[+c[5] - 1];
        if (t) {
            t.click();
            return;
        }
        if (d && d[0] && SHW && SHW.pgs.isConnected) {
            shopPg(d[0] > 0 ? 1 : 0);
            return;
        }
    }
    else if (mode == 'menu') {
        if (ent && !bt) {
            e.preventDefault();
            play();
            return;
        }
        const t = /^Digit[1-5]$/.test(c) && menu.querySelectorAll('.b')[+c[5] - 1];
        if (t) {
            t.click();
            return;
        }
    }
    if (d && ly) {
        e.preventDefault();
        mv(ly, d[0], d[1]);
    }
});
C.addEventListener('pointerdown', e => {
    au();
    if (mode != 'play')
        return;
    e.preventDefault();
    const r = C.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    if (G.pause) {
        G.pause = 0;
        return;
    }
    if (px * W > W - 130 && py * H < 110 && !G.dead) {
        G.pause = 1;
        return;
    }
    tapJump(e, px < .5 ? -1 : 1);
});
const fsT = () => {
    const D = document;
    try {
        D.fullscreenElement ? D.exitFullscreen() : D.documentElement.requestFullscreen();
    }
    catch (_) {
    }
};
const SW_PX = 18, SW_MS = 80;
let swp = null;
function tapJump(e, t) {
    if (e.pointerType != 'touch') {
        jump(t);
        return;
    }
    if (swp) {
        clearTimeout(swp.h);
        jump(swp.t);
    }
    const o = { id: e.pointerId, x: e.clientX, y: e.clientY, t };
    o.h = setTimeout(() => {
        if (swp === o) {
            swp = null;
            jump(t);
        }
    }, SW_MS);
    swp = o;
}
C.addEventListener('pointermove', e => {
    if (!swp || e.pointerId != swp.id)
        return;
    const dx = e.clientX - swp.x, dy = e.clientY - swp.y;
    if (dy > SW_PX && dy > Math.abs(dx) * 1.2) {
        clearTimeout(swp.h);
        swp = null;
        slide();
    }
});
['pointerup', 'pointercancel'].forEach(v => C.addEventListener(v, e => {
    if (!swp || e.pointerId != swp.id)
        return;
    clearTimeout(swp.h);
    const t = swp.t;
    swp = null;
    jump(t);
}));
// Browsers may drop offscreen canvas contents after a long idle, so rebuild the cached knife/digit canvases on return
const rc = () => {
    for (const k in KC)
        delete KC[k];
    for (const k in DGC)
        delete DGC[k];
};
addEventListener('focus', rc);
addEventListener('pageshow', rc);
const ap = () => {
    if (mode == 'play' && G && !G.dead)
        G.pause = 1;
};
addEventListener('blur', ap);
document.addEventListener('visibilitychange', () => {
    if (document.hidden)
        ap();
    else
        rc();
});
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('touchmove', e => {
    if (!(e.target.closest && e.target.closest('.pb')))
        e.preventDefault();
}, { passive: false });
document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('button');
    if (b && !kb)
        b.blur();
}, true);
['pointerup', 'touchend', 'keydown'].forEach(v => addEventListener(v, () => {
    au();
    loadSmp();
}, { passive: true }));
function fit() {
    if ((innerHeight > innerWidth ? 1 : 0) !== PT) {
        layout();
        if (G && mode == 'play') {
            G.x = G.side > 0 ? RX - R : G.side < 0 ? LX + R : clamp(G.x, LX + R, RX - R);
            G.coins = G.coins.filter(c => c.x > LX && c.x < RX);
            G.pause = 1;
        }
    }
    const s = Math.min(innerWidth / W, innerHeight / H), d = window.devicePixelRatio || 1, k = Math.round(clamp(s * d * QL, 1, 2) * 4) / 4;
    st.style.transform = `translate(${(innerWidth - W * s) / 2}px,${(innerHeight - H * s) / 2}px) scale(${s})`;
    UK = Math.min(3, Math.max(1, Math.ceil(s * d)));
    if (k !== RK || C.width !== Math.round(W * k)) {
        RK = k;
        C.width = Math.round(W * k);
        C.height = Math.round(H * k);
    }
}
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && AC && AC.state != 'running')
        AC.resume();
});
let WL = null;
const wake = async () => {
    try {
        if ('wakeLock' in navigator && !WL) {
            WL = await navigator.wakeLock.request('screen');
            WL.addEventListener('release', () => WL = null);
        }
    }
    catch (_) {
    }
};
addEventListener('pointerdown', wake, { once: true });
document.addEventListener('visibilitychange', () => {
    if (!document.hidden)
        wake();
});
if ('serviceWorker' in navigator && location.protocol.startsWith('http'))
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(e => DBG.report(e, 'sw')));
addEventListener('resize', fit);
addEventListener('orientationchange', () => setTimeout(fit, 250));
if (window.visualViewport)
    visualViewport.addEventListener('resize', fit);
fit();
