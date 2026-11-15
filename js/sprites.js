'use strict';
/* Drawing of items: agents, knives, gloves, icons. */
/* ---------- DRAWING: ITEMS ---------- */
const AS = {}, GI = {}, KI = {}, KC = {}, SPR = { a: AS, g: GI, k: KI };
SKINS.forEach(o => {
    const i = new Image();
    if (o.t == 'a') {
        AN[o.id] = o.col;
        i.onload = () => {
            try {
                top_();
            }
            catch (e) {
            }
        };
    }
    if (o.z)
        i.z = o.z;
    i.src = 'assets/' + o.img + '.webp';
    SPR[o.t][o.id] = i;
});
const CRATE = 'assets/ui/crate.webp';
const CRI = new Image();
CRI.src = CRATE;
const crUI = c => 'assets/ui/crate-' + (c && c.t || 'a') + '.webp';
['a', 'k', 'g'].forEach(t => {
    new Image().src = crUI({ t });
});
function kimg(s, f) {
    const IM = KI[s];
    if (!IM || !IM.naturalWidth)
        return null;
    const ck = s + f;
    if (KC[ck])
        return KC[ck];
    const w = IM.naturalWidth, h = IM.naturalHeight, cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const x = cv.getContext('2d');
    x.drawImage(IM, 0, 0);
    const d = x.getImageData(0, 0, w, h), p = d.data, F = FIN[f], hx = q => [1, 3, 5].map(i => parseInt(q.substr(i, 2), 16)), A = hx(F.c[0]), B = hx(F.c[1]);
    for (let i = 0; !(f == 0 && s != 'karambit') && i < p.length; i += 4) {
        const r = p[i], g = p[i + 1], l = p[i + 2];
        if (p[i + 3] && Math.abs(r - g) < 25 && Math.abs(g - l) < 30 && r > 130 && r < 205) {
            const t = ((i / 4) % w) / w;
            for (let k = 0; k < 3; k++)
                p[i + k] = A[k] + (B[k] - A[k]) * t;
        }
    }
    x.putImageData(d, 0, 0);
    return KC[ck] = cv;
}
function knife(c, s, f, L = 70) {
    if (KI[s]) {
        const cv = kimg(s, f);
        if (cv) {
            const sc = L * (L > 74 ? 1.35 : .95) / cv.width, w = cv.width * sc, h = cv.height * sc;
            c.save();
            c.scale(-1, 1);
            c.rotate(s == 'karambit' ? Math.PI / 2 : -Math.PI / 2);
            if (s == 'butterfly')
                c.rotate(-.6);
            if (s == 'butterfly') {
                c.scale(1, -1);
                c.drawImage(cv, -w * .3, -h * .45, w, h);
            }
            else
                c.drawImage(cv, -w * .3, -h * .55, w, h);
            c.restore();
            return;
        }
    }
    const F = FIN[f], g = c.createLinearGradient(-10, 0, 10, 0);
    g.addColorStop(0, F.c[0]);
    g.addColorStop(1, F.c[1]);
    c.save();
    c.lineJoin = 'round';
    if (s == 'butterfly') {
        [-.55, .55].forEach(a => {
            c.save();
            c.rotate(a);
            c.fillStyle = '#2a2f38';
            c.beginPath();
            c.roundRect(-5, 2, 10, 34, 4);
            c.fill();
            c.fillStyle = F.c[0];
            c.fillRect(-5, 12, 10, 3);
            c.restore();
        });
    }
    else {
        c.fillStyle = '#2a2f38';
        c.beginPath();
        c.roundRect(-6, 0, 12, 30, 4);
        c.fill();
        c.fillStyle = F.c[0];
        c.fillRect(-6, 10, 12, 3);
        if (s == 'skeleton') {
            c.strokeStyle = F.c[0];
            c.lineWidth = 2;
            for (let y = 14; y < 30; y += 5) {
                c.beginPath();
                c.moveTo(-6, y);
                c.lineTo(6, y + 3);
                c.stroke();
            }
        }
        c.fillStyle = '#59616f';
        c.fillRect(-11, -2, 22, 5);
    }
    if (s == 'karambit') {
        c.strokeStyle = '#8c97a6';
        c.lineWidth = 3;
        c.beginPath();
        c.arc(0, 34, 6, 0, 7);
        c.stroke();
    }
    c.fillStyle = g;
    c.strokeStyle = '#0007';
    c.lineWidth = 1.5;
    c.beginPath();
    if (s == 'karambit') {
        c.moveTo(-6, 0);
        c.quadraticCurveTo(-40, -L * .5, 10, -L);
        c.quadraticCurveTo(-16, -L * .5, 6, 0);
    }
    else if (s == 'talon') {
        c.moveTo(-8, 0);
        c.quadraticCurveTo(-10, -L * .6, 16, -L);
        c.quadraticCurveTo(10, -L * .4, 8, 0);
    }
    else {
        const w = s == 'm9' ? 10 : s == 'skeleton' || s == 'butterfly' ? 5.5 : 7.5;
        c.moveTo(-w, 0);
        c.lineTo(-w, -L * .72);
        c.lineTo(s == 'flip' || s == 'bayonet' ? -1 : 0, -L);
        c.lineTo(w * .9, -L * .66);
        c.lineTo(w, 0);
        if (s == 'bayonet') {
            c.moveTo(0, -8);
        }
    }
    c.closePath();
    c.fill();
    c.stroke();
    if (s == 'skeleton') {
        c.fillStyle = '#000a';
        c.beginPath();
        c.arc(0, -14, 2.5, 0, 7);
        c.fill();
    }
    if (s != 'karambit' && s != 'talon') {
        c.strokeStyle = '#fff8';
        c.lineWidth = 1.2;
        c.beginPath();
        c.moveTo(0, -4);
        c.lineTo(0, -L * .78);
        c.stroke();
    }
    c.restore();
}
function glove(c, gl, r, A) {
    const gi = gl && gl.img && GI[gl.img];
    if (gi && gi.naturalWidth) {
        const w = r * 2.4, h = w * gi.naturalHeight / gi.naturalWidth;
        c.drawImage(gi, -w / 2, -h / 2, w, h);
        return;
    }
    const g = c.createRadialGradient(-r * .3, -r * .3, 1, 0, 0, r);
    g.addColorStop(0, gl ? gl.c[0] : A.a);
    g.addColorStop(1, gl ? gl.c[1] : A.b);
    c.fillStyle = g;
    c.beginPath();
    c.arc(0, 0, r, 0, 7);
    c.fill();
    if (gl) {
        c.fillStyle = gl.c[1];
        c.fillRect(-r * .8, r * .55, r * 1.6, r * .5);
        c.strokeStyle = '#0005';
        c.lineWidth = 1;
        for (let i = -1; i < 2; i++) {
            c.beginPath();
            c.moveTo(i * r * .4, -r * .9);
            c.lineTo(i * r * .4, -r * .3);
            c.stroke();
        }
    }
}
function animal(c, k, o = {}) {
    const A = AN[k], r = 34, t = o.t || 0, ph = o.ph || 0;
    c.save();
    if (k == 'ghost') {
        c.globalAlpha = .92;
        c.shadowColor = '#8fe0ff';
        c.shadowBlur = 22;
    }
    const el = (x, y, a, b, col, rot = 0) => {
        c.fillStyle = col;
        c.beginPath();
        c.ellipse(x, y, a, b, rot, 0, 7);
        c.fill();
    };
    if (k == 'pig' || k == 'fox') {
        const big = k == 'fox' ? 1.5 : 1;
        [-1, 1].forEach(s => {
            c.fillStyle = k == 'fox' ? A.b : A.b;
            c.beginPath();
            c.moveTo(s * 8, -r + 6);
            c.lineTo(s * 30, -r - 12 * big);
            c.lineTo(s * 31, -r + 16);
            c.fill();
            if (k == 'fox') {
                c.fillStyle = A.d;
                c.beginPath();
                c.moveTo(s * 20, -r - 4);
                c.lineTo(s * 30, -r - 12 * big);
                c.lineTo(s * 26, -r + 4);
                c.fill();
            }
        });
    }
    if (k == 'panda' || k == 'bear')
        [-1, 1].forEach(s => el(s * 24, -26, 10, 10, k == 'panda' ? '#222' : A.b));
    if (k == 'fox')
        el(-r - 4, 8, 16, 10, A.b, -.4);
    const g = c.createRadialGradient(-10, -12, 4, 0, 0, r);
    g.addColorStop(0, A.a);
    g.addColorStop(1, A.b);
    c.fillStyle = g;
    c.beginPath();
    c.arc(0, 0, r, 0, 7);
    const sp = AS[k], dk = sp && sp.naturalWidth;
    if (!dk)
        c.fill();
    c.shadowBlur = 0;
    if (dk) {
        const h = 84 * sp.naturalHeight / sp.naturalWidth, hc = Math.min(h, 84), z = hc / h * (sp.z || 1), hh = h * z;
        c.drawImage(sp, -42 * z, -40 + hc - hh, 84 * z, Math.round(hh));
    }
    if (k == 'pig') {
        el(22, 6, 12, 9, '#ff9bb0');
        el(19, 6, 2.2, 3.5, '#a03a58');
        el(26, 6, 2.2, 3.5, '#a03a58');
        el(2, 10, 6, 4, '#ff8aa5');
    }
    if (k == 'chick') {
        c.fillStyle = '#f2b630';
        [-6, 0, 6].forEach((x, i) => {
            c.beginPath();
            c.moveTo(x - 3, -r + 3);
            c.lineTo(x + (i - 1) * 3, -r - 14);
            c.lineTo(x + 3, -r + 3);
            c.fill();
        });
        c.fillStyle = '#ff8a1a';
        c.beginPath();
        c.moveTo(28, 0);
        c.lineTo(44, 6);
        c.lineTo(28, 12);
        c.fill();
        el(-24, 6, 7, 12, A.b, .3);
    }
    if (k == 'panda') {
        el(5, -9, 8, 10, '#222', .3);
        el(24, -9, 8, 10, '#222', -.3);
        el(34, 6, 4, 3, '#222');
    }
    if (k == 'fox') {
        c.fillStyle = '#fff';
        c.beginPath();
        c.moveTo(10, 14);
        c.lineTo(36, 6);
        c.lineTo(28, 26);
        c.fill();
        el(35, 6, 4, 3.5, '#111');
    }
    if (k == 'bear') {
        el(24, 8, 12, 9, '#d9b48a');
        el(30, 5, 4, 3, '#111');
    }
    if (k == 'frog') {
        [-8, 16].forEach((x, i) => {
            el(x, -28 - i * 2, 11, 11, A.a);
            el(x, -28 - i * 2, 9, 9, '#fff');
            el(x + 2, -28 - i * 2, 4, 4, '#111');
        });
        c.strokeStyle = '#1d4a1d';
        c.lineWidth = 2.5;
        c.beginPath();
        c.arc(14, 8, 16, .2, 1.3);
        c.stroke();
    }
    if (k != 'frog' && !AS[k]) {
        const bl = (t % 3.4) < .12;
        [6, 22].forEach(x => {
            if (bl) {
                c.strokeStyle = '#111';
                c.lineWidth = 2;
                c.beginPath();
                c.moveTo(x - 5, -10);
                c.lineTo(x + 5, -10);
                c.stroke();
            }
            else {
                el(x, -10, 5.5, 6.5, '#fff');
                el(x + 1.8, -9.5, 3, 3.6, '#111');
                el(x + 2.6, -11, 1, 1, '#fff');
            }
        });
    }
    if (k != 'ghost')
        for (let i = 0; i < 2; i++) {
            const l = o.air ? -3 : Math.max(0, Math.sin(ph + i * Math.PI)) * 9;
            el((i ? 1 : -1) * 13, r - 1 - l, 10, 7, A.d);
            c.strokeStyle = '#0005';
            c.lineWidth = 1.5;
            c.beginPath();
            c.ellipse((i ? 1 : -1) * 13, r - 1 - l, 10, 7, 0, 0, 7);
            c.stroke();
        }
    if (!o.nk && k != 'ghost' && !AS[k]) {
        c.save();
        c.rotate(.18);
        c.fillStyle = '#1a1d26';
        c.beginPath();
        c.ellipse(0, -r + 3, 20, 5, 0, 0, 7);
        c.fill();
        c.fillRect(-12, -r - 17, 24, 20);
        c.fillStyle = '#c0392b';
        c.fillRect(-12, -r - 2, 24, 4);
        c.restore();
    }
    if (!o.nk) {
        c.save();
        c.translate(-26, 18);
        c.rotate(Math.sin(t * 3 + 1) * .12);
        glove(c, S.eq.g ? ITEM[S.eq.g] : null, 9, A);
        c.restore();
    }
    if (!o.nk) {
        c.save();
        c.translate(26, 16);
        c.rotate(o.ka == null ? -.4 : o.ka);
        c.save();
        c.translate(0, -6);
        knife(c, ITEM[S.eq.k].s, ITEM[S.eq.k].f, 72);
        c.restore();
        glove(c, S.eq.g ? ITEM[S.eq.g] : null, 9, A);
        c.restore();
    }
    c.restore();
}
function icon(it, z) {
    const cv = E('canvas');
    cv.width = cv.height = z * UK;
    cv.style.width = cv.style.height = z + 'px';
    const c = cv.getContext('2d');
    c.scale(UK, UK);
    c.translate(z / 2, z / 2);
    c.scale(z / 110, z / 110);
    if (it.t == 'a')
        animal(c, it.k, { nk: 1, t: 1 });
    else if (it.t == 'k') {
        const kc = kimg(it.s, it.f);
        if (kc) {
            const w = 104, h = w * kc.height / kc.width;
            c.rotate(-.12);
            c.drawImage(kc, -w / 2, -h / 2, w, h);
        }
        else {
            c.rotate(.7);
            c.scale(.85, .85);
            c.translate(0, 21);
            knife(c, it.s, it.f, 76);
        }
    }
    else if (it.img) {
        const gi = GI[it.img];
        if (gi && gi.naturalWidth) {
            const w = 96, h = w * gi.naturalHeight / gi.naturalWidth;
            c.drawImage(gi, -w / 2, -h / 2, w, h);
        }
    }
    else if (it.c) {
        c.scale(1.7, 1.7);
        glove(c, it, 26, AN.pig);
    }
    else {
        c.fillStyle = '#667';
        c.font = 'bold 50px "MojeRuka","Segoe UI",Arial';
        c.textAlign = 'center';
        c.fillText('✕', 0, 16);
    }
    return cv;
}
