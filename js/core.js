'use strict';
/* Constants, DOM handles, stage layout. */
let W = 1536, H = 864, LX = 70, RX = 1466, HK = 1, PT = 0, RW = 680, UZ = 1.2;
const R = 42, TS = 1.25, VK = .75 / TS, GK = .75 / TS / TS, CKR = 36, $ = s => document.querySelector(s), E = (t, c, h) => {
    const e = document.createElement(t);
    if (c)
        e.className = c;
    if (h != null)
        e.innerHTML = h;
    return e;
};
const C = $('#cv'), X = C.getContext('2d', { alpha: false }), tp = $('#top'), menu = $('#menu'), pn = $('#pn'), ov = $('#ov'), st = $('#st');
let QL = (window.devicePixelRatio || 1) >= 2 ? .85 : 1, RK = 1, UK = 1, fe = 16, fc = 0;
/* landscape (PC, wide) = 1536x864 stage; portrait (phone) = 600 x ~1067-1400 stage, filled to the screen */
function layout() {
    const iw = innerWidth || 1, ih = innerHeight || 1, pt = ih > iw;
    PT = pt ? 1 : 0;
    if (pt) {
        W = 600;
        H = Math.max(960, Math.min(1400, Math.round(600 * ih / iw)));
        LX = 50;
        UZ = 1;
    }
    else {
        W = 1536;
        H = 864;
        LX = 70;
        UZ = 1.2;
    }
    RX = W - LX;
    HK = (RX - LX - 2 * R) / 484 / TS;
    RW = Math.min(680, W - 48);
    st.style.width = W + 'px';
    st.style.height = H + 'px';
    C.style.width = W + 'px';
    C.style.height = H + 'px';
    const r = document.documentElement;
    r.classList.toggle('pt', pt);
    r.style.setProperty('--u', UZ);
    r.style.setProperty('--rw', RW + 'px');
}
layout();
try {
    const sbd = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'shadowBlur');
    Object.defineProperty(X, 'shadowBlur', { get() {
            return sbd.get.call(X);
        }, set(v) {
            sbd.set.call(X, QL < .8 ? 0 : v);
        }, configurable: true });
}
catch (e) {
}
;
