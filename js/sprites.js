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
    const el = (x, y, a, b, col, rot = 0) => {
        c.fillStyle = col;
        c.beginPath();
        c.ellipse(x, y, a, b, rot, 0, 7);
        c.fill();
    };
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
    for (let i = 0; i < 2; i++) {
        const l = o.air ? -3 : Math.max(0, Math.sin(ph + i * Math.PI)) * 9;
        el((i ? 1 : -1) * 13, r - 1 - l, 10, 7, A.d);
        c.strokeStyle = '#0005';
        c.lineWidth = 1.5;
        c.beginPath();
        c.ellipse((i ? 1 : -1) * 13, r - 1 - l, 10, 7, 0, 0, 7);
        c.stroke();
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
    else {
        c.fillStyle = '#667';
        c.font = 'bold 50px "MojeRuka","Segoe UI",Arial';
        c.textAlign = 'center';
        c.fillText('✕', 0, 16);
    }
    return cv;
}
