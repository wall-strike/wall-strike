'use strict';
/* Run logic and in-run rendering: spawn, update, collisions, score, game over. */
/* ---------- GAME (vertical wall-jump) ---------- */
let mode = 'menu', G, off = 0;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), sy = y => H - (y - G.cam), sawX = o => W / 2 + Math.sin(G.t * 2.2 / TS + o.ph) * (RX - LX) * .36;
const CKI = new Image();
CKI.src = 'assets/ui/chick.webp';
const SPK = new Image();
SPK.src = 'assets/ui/spike.webp';
const SHD = new Image();
SHD.src = 'assets/ui/shield.webp';
function shd(x, y, h) {
    const w = h * SHD.naturalWidth / SHD.naturalHeight;
    X.drawImage(SHD, x - w / 2, y - h / 2, w, h);
}
const SPP = [0.0, 0.225, 0.275, 0.3, 0.35, 0.375, 0.4, 0.475, 0.5, 0.55, 0.625, 0.675, 0.7, 0.75, 0.8, 0.85, 0.875, 0.925, 0.95, 0.975, 1.0, 1.0, 0.975, 0.95, 0.9, 0.825, 0.775, 0.75, 0.65, 0.625, 0.55, 0.5, 0.45, 0.4, 0.35, 0.375, 0.475, 0.55, 0.6, 0.65, 0.7, 0.825, 0.875, 0.925, 0.975, 1.0, 1.0, 1.0, 0.975, 0.95, 0.9, 0.825, 0.75, 0.725, 0.6, 0.55, 0.525, 0.425, 0.4, 0.325, 0.325, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.675, 0.7, 0.725, 0.8, 0.85, 0.875, 0.875, 0.875, 0.85, 0.825, 0.775, 0.7, 0.65, 0.6, 0.55, 0.5, 0.4, 0.375, 0.3, 0.25, 0.2, 0.15];
function spG(o) {
    const n = Math.max(1, Math.round(o.h / 90));
    return [n, o.h / n];
}
function spikeHit(o) {
    const rr = R - 12, u = o.s < 0 ? G.x - LX : RX - G.x;
    if (u - rr > o.d)
        return false;
    const [n, gh] = spG(o), L = SPP.length, top = o.y + o.h;
    for (let k = 0; k < n; k++) {
        const yt = top - k * gh;
        if (G.y > yt + rr || G.y < yt - gh - rr)
            continue;
        for (let j = 0; j < L; j++) {
            const dp = SPP[j] * o.d;
            if (dp <= 0)
                continue;
            const dy = G.y - (yt - (j + .5) / L * gh);
            if (dy * dy >= rr * rr)
                continue;
            if (u - Math.sqrt(rr * rr - dy * dy) < dp)
                return true;
        }
    }
    return false;
}
function newRun() {
    loadSmp();
    S.map = S.pick;
    G = { t: 0, cam: 0, x: LX + R, y: 230, vx: 0, vy: 0, side: -1, jumps: 0, maxY: 230, sq: 0, bonus: 0, score: 0, cash: 0, gems: 0, combo: 0, ct: 0, obs: [], coins: [], pts: [], txt: [], ny: 980, dead: false, pause: 0, sh: 0, inv: 0, tr: [], dt: 0, shake: 0, sl: 0, face: 1, dn: 0 };
}
function mult() {
    return 1 + Math.min(2.5, Math.floor(G.combo / 6) * .5);
}
function burst(x, y, n, col, sp = 300) {
    for (let i = 0; i < n; i++) {
        const a = Math.random() * 7, v = Math.random() * sp;
        G.pts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, l: .5 + Math.random() * .5, c: col, s: 2 + Math.random() * 4 });
    }
}
const DGS = { "1": ["assets/digits/1.webp", "assets/digits/1-o.webp"], "2": ["assets/digits/2.webp", "assets/digits/2-o.webp"], "3": ["assets/digits/3.webp", "assets/digits/3-o.webp"], "4": ["assets/digits/4.webp", "assets/digits/4-o.webp"], "5": ["assets/digits/5.webp", "assets/digits/5-o.webp"], "6": ["assets/digits/6.webp", "assets/digits/6-o.webp"], "7": ["assets/digits/7.webp", "assets/digits/7-o.webp"], "8": ["assets/digits/8.webp", "assets/digits/8-o.webp"], "9": ["assets/digits/9.webp", "assets/digits/9-o.webp"], "0": ["assets/digits/0.webp", "assets/digits/0-o.webp"] };
const DGI = {};
for (const k in DGS) {
    DGI[k] = DGS[k].map(b => {
        const i = new Image();
        i.src = b;
        return i;
    });
}
const DGC = {};
function dgl(ch, col) {
    const k = ch + col;
    if (DGC[k])
        return DGC[k];
    const f = DGI[ch][0], o = DGI[ch][1];
    if (!f.naturalWidth || !o.naturalWidth)
        return null;
    const cv = document.createElement('canvas');
    cv.width = f.naturalWidth;
    cv.height = f.naturalHeight;
    const x = cv.getContext('2d');
    x.drawImage(o, 0, 0);
    const t = document.createElement('canvas');
    t.width = cv.width;
    t.height = cv.height;
    const y = t.getContext('2d');
    y.drawImage(f, 0, 0);
    y.globalCompositeOperation = 'source-in';
    y.fillStyle = col;
    y.fillRect(0, 0, t.width, t.height);
    x.drawImage(t, 0, 0);
    return DGC[k] = cv;
}
function dtw(s, h) {
    let w = 0;
    for (const ch of String(s)) {
        if (DGI[ch]) {
            const i = DGI[ch][0];
            w += i.naturalWidth ? i.naturalWidth * h / 120 * .8 : h * .6;
        }
        else
            w += X.measureText(ch).width;
    }
    return w;
}
function dtx(s, x, y, h, al, col, fnt) {
    s = String(s);
    X.save();
    X.font = fnt || ('900 ' + h + 'px "MojeRuka","Segoe UI",Arial');
    X.textAlign = 'left';
    const w = dtw(s, h * 1.12);
    let cx = al == 'center' ? x - w / 2 : al == 'right' ? x - w : x;
    const dh = h * 1.12;
    for (const ch of s) {
        if (DGI[ch]) {
            const c = dgl(ch, col);
            if (c) {
                const dw = c.width * dh / 120, sc = dh / 120;
                X.drawImage(c, cx - dw * .1, y - dh * .8, dw, dh);
                cx += dw * .8;
            }
            else {
                X.fillStyle = col;
                X.fillText(ch, cx, y);
                cx += h * .6;
            }
        }
        else {
            X.fillStyle = '#000';
            X.fillText(ch, cx + 2, y + 2);
            X.fillStyle = col;
            X.fillText(ch, cx, y);
            cx += X.measureText(ch).width;
        }
    }
    X.restore();
}
function ftx(x, y, s, c = '#ffd700') {
    G.txt.push({ x, y, s, c, l: 1 });
}
function coinsArc(y) {
    const f = Math.random() < .5, q = Math.random(), n = clamp(Math.floor((RX - LX - 180) / 110) + 1, 4, 7), m = n >> 1;
    for (let i = 0; i < n; i++) {
        const k = f ? n - 1 - i : i;
        G.coins.push({ x: LX + 90 + (RX - LX - 180) * k / (n - 1), y: y + 45 + Math.sin(Math.PI * i / (n - 1)) * 95, g: i == m && q < .12, sh: i == m && q > .9 });
    }
}
function dif() {
    return Math.min(1.6, G.maxY / 9000 + S.map * .06);
}
function fixCoins() {
    for (const c of G.coins)
        for (const o of G.obs) {
            if (o.k != 'block')
                continue;
            const x1 = o.s < 0 ? LX : RX - o.d, x2 = x1 + o.d, y2 = o.y + o.h;
            if (c.x > x1 - 40 && c.x < x2 + 40 && c.y > o.y - 40 && c.y < y2 + 40)
                c.y = Math.max(c.y, y2 + 40);
        }
}
function spawn(m) {
    const d = dif(), y = G.ny, s = Math.random() < .5 ? -1 : 1, r = Math.random();
    let h = 150;
    if (r < .28) {
        h = 100 + Math.random() * 75;
        G.obs.push({ k: 'spike', s, y, h, d: 56 });
    }
    else if (r < .48) {
        h = 56;
        G.obs.push({ k: 'block', s, y, h, d: Math.round((RX - LX) * .22) });
    }
    else if (r < .68) {
        h = 305;
        G.obs.push({ k: 'spike', s, y, h: 95, d: 56 }, { k: 'spike', s: -s, y: y + 210, h: 95, d: 56 });
    }
    else if (r < .84 && d > .08) {
        h = 260;
        G.obs.push({ k: 'block', s, y, h: 56, d: Math.round((RX - LX) * .19) }, { k: 'spike', s: -s, y: y + 170, h: 90, d: 56 });
    }
    else if (d > .15) {
        h = 45;
        G.obs.push({ k: 'saw', y, ph: Math.random() * 6, h });
        if (d > .5 && Math.random() < .6) {
            h = 120;
            G.obs.push({ k: 'saw', y: y + 80, ph: Math.random() * 6, h: 45 });
        }
    }
    else {
        h = 90;
        G.obs.push({ k: 'spike', s, y, h, d: 56 });
    }
    coinsArc(y - 30);
    fixCoins();
    G.ny = y + h + 240 + Math.random() * 110 - d * 100;
}
function jump(t) {
    if (mode != 'play' || G.dead)
        return;
    if (G.side) {
        const s = G.side;
        t = t || -s;
        G.vy = (t == s ? 820 : 1020) * VK;
        G.vx = t == s ? s * 140 * HK : t * 900 * HK;
        G.side = 0;
        G.jumps = 1;
    }
    else if (G.jumps < 2) {
        G.vy = 920 * VK;
        G.vx = (t || Math.sign(G.vx) || 1) * 720 * HK;
        G.jumps = 2;
        burst(G.x, sy(G.y) + R, 10, '#fff8', 140);
    }
    else
        return;
    SFX.jump();
    G.dn = 0;
    G.sq = -.3;
    burst(G.x, sy(G.y) + R * .6, 6, '#fff6', 100);
}
function slide() {
    if (mode != 'play' || G.dead || G.dn > 0)
        return;
    G.dn = .2;
    G.sq = .35;
    SFX.land();
    burst(G.x - G.side * R, sy(G.y) + R, 8, '#fff8', 160);
}
function die(f) {
    if (G.dead)
        return;
    if (G.sh && !f) {
        G.sh = 0;
        G.inv = 1.3;
        G.shake = 12;
        burst(G.x, sy(G.y), 30, '#6ff', 420);
        ftx(G.x, sy(G.y) - 70, 'SHIELD BROKEN', '#6ff');
        SFX.over();
        return;
    }
    G.dead = true;
    G.dt = 0;
    G.shake = 18;
    const y = clamp(sy(G.y), 0, H - 10);
    burst(G.x, y, 40, '#ff5a3d', 500);
    burst(G.x, y, 20, '#ffd700', 400);
    SFX.over();
    try {
        navigator.vibrate && navigator.vibrate(80);
    }
    catch (e) {
    }
}
function hit(x1, y1, x2, y2, pad = 6) {
    const cx = clamp(G.x, x1, x2), cy = clamp(G.y, y1, y2);
    return (G.x - cx) ** 2 + (G.y - cy) ** 2 < (R - pad) ** 2;
}
function pass() {
    G.combo++;
    G.ct = 3.5;
    const mu = mult(), v = Math.round(10 * mu);
    G.bonus += v;
    ftx(G.x, sy(G.y) - 70, '+' + v + (mu > 1 ? ' x' + mu : ''), '#8fe0ff');
    SFX.pass();
}
function pick(c) {
    if (c.sh) {
        G.sh = 1;
        ftx(c.x, sy(c.y) - 20, 'SHIELD!', '#6ff');
        burst(c.x, sy(c.y), 14, '#6ff', 220);
        SFX.rare(2);
        return;
    }
    const m = MAPS[S.map], v = Math.max(1, Math.round((c.g ? 8 : 1) * mult() * m.m));
    G.cash += v;
    if (c.g)
        G.gems++;
    G.bonus += c.g ? 50 : 3;
    G.combo++;
    G.ct = 3.5;
    G.sl = .4;
    ftx(c.x, sy(c.y) - 20, '+$' + v + (c.g ? '  +1 GEM' : ''), c.g ? '#6af' : '#ffd700');
    burst(c.x, sy(c.y), 10, c.g ? '#6af' : '#ffd700', 200);
    SFX.coin();
}
function upd(dt) {
    const m = MAPS[S.map];
    G.t += dt;
    G.pts.forEach(p => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 700 * dt;
        p.l -= dt;
    });
    G.pts = G.pts.filter(p => p.l > 0);
    G.txt.forEach(t => {
        t.y -= 50 * dt;
        t.l -= dt;
    });
    G.txt = G.txt.filter(t => t.l > 0);
    G.shake *= .9;
    if (G.dead) {
        G.dt += dt;
        if (G.dt > .9 && mode == 'play')
            end();
        return;
    }
    G.sq *= .85;
    G.inv = Math.max(0, G.inv - dt);
    if (!G.side)
        G.tr.push({ x: G.x, y: G.y, l: .3 });
    G.tr.forEach(p => p.l -= dt);
    G.tr = G.tr.filter(p => p.l > 0);
    G.sl = Math.max(0, G.sl - dt);
    if ((G.ct -= dt) <= 0)
        G.combo = 0;
    G.cam += (80 + Math.min(160, G.maxY / 38)) * m.sp * VK * dt;
    while (G.ny < G.cam + H + 380)
        spawn(m);
    if (G.dn > 0) {
        G.dn -= dt;
        if (G.side)
            G.y -= 600 * VK * dt;
        else {
            G.vy = Math.min(G.vy, -650 * VK);
            if (G.dn <= 0)
                G.vy = Math.max(G.vy, -250 * VK);
        }
    }
    if (G.side) {
        G.y -= 70 * VK * dt;
        if (Math.random() < dt * 20)
            G.pts.push({ x: G.x + G.side * R, y: sy(G.y) + R * .4, vx: -G.side * (15 + Math.random() * 40), vy: 15 + Math.random() * 40, l: .3 + Math.random() * .3, c: '#fff8', s: 2 + Math.random() * 3 });
    }
    else {
        G.vy -= 1800 * GK * (m.g || 1) * dt;
        G.y += G.vy * dt;
        G.x += G.vx * dt;
        const w = G.x <= LX + R ? -1 : G.x >= RX - R ? 1 : 0;
        if (w) {
            G.x = w < 0 ? LX + R : RX - R;
            G.vx = 0;
            if (G.vy <= 0) {
                G.side = w;
                G.vy = 0;
                G.jumps = 0;
                G.sq = .5;
                SFX.land();
                burst(G.x - w * R, sy(G.y), 8, '#fff6', 160);
            }
        }
    }
    if (G.y > G.cam + H * .5)
        G.cam = G.y - H * .5;
    G.maxY = Math.max(G.maxY, G.y);
    G.score = Math.max(0, Math.floor((G.maxY - 230) / 6)) + G.bonus;
    for (let i = MAPS.length - 1; i > S.map; i--)
        if (G.score >= MAPS[i].u) {
            S.map = i;
            save();
            ftx(W / 2, 340, 'NEW MAP: ' + MAPS[i].n, '#8fe0ff');
            G.mb = { n: MAPS[i].n, t0: G.t };
            G.txt[G.txt.length - 1].l = 2.5;
            burst(W / 2, 300, 30, '#8fe0ff', 400);
            SFX.rare(3);
            break;
        }
    if (G.y < G.cam - R) {
        if (G.sh) {
            G.sh = 0;
            G.inv = 1.3;
            G.y = G.cam + 225;
            G.vy = 540;
            G.side = 0;
            G.jumps = 1;
            burst(G.x, sy(G.y), 30, '#6ff', 420);
            ftx(G.x, sy(G.y) - 70, 'SAVED!', '#6ff');
        }
        else
            die();
    }
    for (const o of G.obs) {
        if (o.y > G.cam + H + 100 || o.y + o.h < G.cam - 150)
            continue;
        if (!o.p && G.y > o.y + o.h + 45) {
            o.p = 1;
            pass();
        }
        if (o.k == 'saw') {
            if (G.inv <= 0 && (G.x - sawX(o)) ** 2 + (G.y - o.y) ** 2 < (R + CKR) ** 2)
                die();
        }
        else if (G.inv <= 0 && (o.k == 'spike' ? spikeHit(o) : (o.s < 0 ? hit(LX, o.y, LX + o.d - 6, o.y + o.h) : hit(RX - o.d + 6, o.y, RX, o.y + o.h))))
            die();
    }
    for (const c of G.coins) {
        if (c.d)
            continue;
        if ((G.x - c.x) ** 2 + (G.y - c.y) ** 2 < (R + 32) ** 2) {
            c.d = 1;
            pick(c);
        }
    }
    G.obs = G.obs.filter(o => o.y + o.h > G.cam - 300);
    G.coins = G.coins.filter(c => !c.d && c.y > G.cam - 100);
}
const CN = new Image();
CN.src = 'assets/ui/coin.webp';
const GEM = new Image();
GEM.src = 'assets/ui/gem.webp';
function coin(x, y, r, k) {
    X.save();
    X.translate(x, y);
    X.scale(Math.max(.25, k), 1);
    if (CN.complete && CN.naturalWidth) {
        const z = r * 2.3;
        X.drawImage(CN, -z / 2, -z / 2, z, z);
    }
    else {
        X.fillStyle = '#facc15';
        X.beginPath();
        X.arc(0, 0, r, 0, 7);
        X.fill();
    }
    X.restore();
}
function drw(m, t) {
    X.save();
    if (G.shake > .5)
        X.translate((Math.random() - .5) * G.shake, (Math.random() - .5) * G.shake);
    scene(m, G.cam, t);
    let g;
    for (const o of G.obs) {
        if (o.y > G.cam + H + 100 || o.y + o.h < G.cam - 150)
            continue;
        if (o.k == 'saw') {
            const x = sawX(o), y = sy(o.y), dr = Math.cos(G.t * 2.2 / TS + o.ph) >= 0 ? -1 : 1;
            X.save();
            X.translate(x, y + Math.sin(G.t * 14 + o.ph) * 5);
            X.rotate(Math.sin(G.t * 9 + o.ph) * .09);
            X.scale(dr, 1);
            if (CKI.naturalWidth) {
                const w = 128, h = w * CKI.naturalHeight / CKI.naturalWidth;
                X.drawImage(CKI, -w / 2, -h / 2 - 4, w, h);
            }
            else {
                X.fillStyle = '#f2c230';
                X.beginPath();
                X.arc(0, 0, CKR, 0, 7);
                X.fill();
            }
            X.restore();
            continue;
        }
        const top = sy(o.y + o.h);
        if (o.k == 'spike') {
            const [n, gh] = spG(o);
            for (let k = 0; k < n; k++) {
                const ty = top + k * gh;
                if (o.s < 0)
                    X.drawImage(SPK, LX, ty, o.d, gh);
                else {
                    X.save();
                    X.translate(RX, ty);
                    X.scale(-1, 1);
                    X.drawImage(SPK, 0, 0, o.d, gh);
                    X.restore();
                }
            }
        }
        else {
            const x = o.s < 0 ? LX : RX - o.d;
            if (CRI.naturalWidth) {
                const n = Math.max(1, Math.round(o.d / (o.h * 1.17))), tw = o.d / n;
                for (let i = 0; i < n; i++)
                    X.drawImage(CRI, x + i * tw, top, tw, o.h);
            }
            else {
                X.fillStyle = '#775a3d';
                X.fillRect(x, top, o.d, o.h);
            }
        }
    }
    for (const c of G.coins) {
        const y = sy(c.y);
        if (y < -60 || y > H + 60)
            continue;
        if (c.sh) {
            X.save();
            X.shadowColor = '#6ff';
            X.shadowBlur = 18;
            if (SHD.naturalWidth)
                shd(c.x, y, 72 + Math.sin(G.t * 6) * 4);
            else {
                X.strokeStyle = '#6ff';
                X.lineWidth = 4;
                X.beginPath();
                X.arc(c.x, y, 18 + Math.sin(G.t * 6) * 2, 0, 7);
                X.fillStyle = '#6ff4';
                X.fill();
                X.stroke();
            }
            X.restore();
            continue;
        }
        const w = Math.abs(Math.cos(G.t * 4 + c.y * .01)) * 13 + 3;
        if (c.g) {
            X.shadowColor = '#6af';
            X.shadowBlur = 14;
        }
        X.fillStyle = c.g ? '#6af' : '#ffd24a';
        if (c.g) {
            if (GEM.naturalWidth) {
                X.save();
                X.translate(c.x, y);
                X.scale(.72 + .28 * (w - 3) / 13, 1);
                X.drawImage(GEM, -36, -34, 72, 68);
                X.restore();
            }
            else {
                X.beginPath();
                X.moveTo(c.x, y - 27);
                X.lineTo(c.x + w * 1.5, y);
                X.lineTo(c.x, y + 27);
                X.lineTo(c.x - w * 1.5, y);
                X.fill();
            }
        }
        else
            coin(c.x, y, 28, w / 16);
        X.shadowBlur = 0;
    }
    G.tr.forEach(p => {
        X.globalAlpha = p.l * .9;
        X.fillStyle = '#fff';
        X.beginPath();
        X.arc(p.x, sy(p.y), R * p.l * 2.2, 0, 7);
        X.fill();
    });
    X.globalAlpha = 1;
    if (!G.dead) {
        const air = !G.side;
        if (G.side)
            G.face = -G.side;
        else if (Math.abs(G.vx) > 20)
            G.face = Math.sign(G.vx);
        const st = air ? 1 + Math.min(.22, Math.abs(G.vy) / 4500) : 1 - G.sq * .3, sx = air ? 2 - st : 1 + G.sq * .35, ka = G.sl > 0 ? -.4 + (1 - G.sl / .4) * Math.PI * 2 : air ? -1.1 + clamp(G.vy / 2200, -.4, .4) : -.2 + Math.sin(G.t * 3) * .1;
        X.save();
        X.translate(G.x, sy(G.y));
        X.scale(G.face * Math.max(.7, sx) * R / 34, Math.max(.7, st) * R / 34);
        animal(X, ITEM[S.eq.a].k, { t: G.t, ph: G.t * (air ? 16 : 2), air, ka });
        X.restore();
        if (G.sh && SHD.naturalWidth) {
            X.save();
            X.shadowColor = '#6ff';
            X.shadowBlur = 20;
            X.globalAlpha = .6;
            shd(G.x, sy(G.y), R * 2 + 24);
            X.restore();
        }
        else if (G.sh || G.inv > 0) {
            X.save();
            X.strokeStyle = '#6ff';
            X.shadowColor = '#6ff';
            X.shadowBlur = 20;
            X.lineWidth = 4;
            X.globalAlpha = G.sh ? .9 : .4 + .4 * Math.sin(G.t * 40);
            X.beginPath();
            X.arc(G.x, sy(G.y), R + 10, 0, 7);
            X.stroke();
            X.restore();
        }
    }
    G.pts.forEach(p => {
        X.globalAlpha = clamp(p.l * 2, 0, 1);
        X.fillStyle = p.c;
        X.fillRect(p.x, p.y, p.s, p.s);
    });
    X.globalAlpha = 1;
    X.font = '800 38px "MojeRuka","Segoe UI",Arial';
    X.textAlign = 'center';
    G.txt.forEach(t => {
        X.globalAlpha = clamp(t.l * 2, 0, 1);
        dtx(t.s, t.x, t.y, 38, 'center', t.c, '800 38px "MojeRuka","Segoe UI",Arial');
    });
    X.globalAlpha = 1;
    X.restore();
    fx(m);
    X.shadowColor = '#000';
    X.shadowBlur = 8;
    X.textAlign = 'center';
    coin(W / 2, 32, 19, 1);
    dtx(G.score, W / 2, 118, 72, 'center', '#ffffff');
    X.textAlign = 'left';
    X.font = '700 26px "MojeRuka","Segoe UI",Arial';
    dtx('$ ' + G.cash, 28, 56, 38, 'left', '#ffd700', '700 38px "MojeRuka","Segoe UI",Arial');
    X.fillStyle = '#8fe0ff';
    X.font = '700 26px "MojeRuka","Segoe UI",Arial';
    X.textAlign = PT ? 'center' : 'left';
    X.fillText(m.n + ' · x' + m.m + ' · LVL ' + (1 + Math.floor(dif() * 6)), PT ? W / 2 : 28, PT ? 206 : 92);
    if (G.combo > 1) {
        X.textAlign = 'right';
        X.fillStyle = '#ff9a3d';
        X.font = '900 32px "MojeRuka","Segoe UI",Arial';
        {
            const cr = PT ? W / 2 + 125 : W - 120, cy = PT ? 262 : 56, bx = cr - 220, by = cy + 16;
            dtx('COMBO ' + G.combo + ' x' + mult(), cr, cy, 40, 'right', '#ff9a3d');
            X.fillStyle = '#fff3';
            X.fillRect(bx, by, 220, 9);
            X.fillStyle = '#ff9a3d';
            X.fillRect(bx, by, 220 * clamp(G.ct / 3.5, 0, 1), 9);
        }
    }
    X.textAlign = 'center';
    X.font = '700 20px "MojeRuka","Segoe UI",Arial';
    dtx('BEST ' + S.best, W / 2, 166, 26, 'center', '#ffffffcc', '700 26px "MojeRuka","Segoe UI",Arial');
    {
        const mb = G.mb || { n: m.n, t0: 0 }, a = clamp(2.6 - (G.t - mb.t0), 0, 1);
        if (a > 0) {
            X.save();
            X.globalAlpha = a;
            X.textAlign = 'center';
            X.shadowColor = '#000';
            X.shadowBlur = 16;
            X.fillStyle = m.c;
            X.font = '900 78px "MojeRuka","Segoe UI",Arial';
            X.fillText(mb.n.toUpperCase(), W / 2, 250);
            X.fillStyle = '#fff';
            X.font = '700 24px "MojeRuka","Segoe UI",Arial';
            X.fillText(MODS[S.map].toUpperCase(), W / 2, 292);
            X.restore();
        }
    }
    if (!G.dead) {
        X.fillStyle = '#fffc';
        X.fillRect(W - 82, 20, 13, 42);
        X.fillRect(W - 58, 20, 13, 42);
    }
    if (G.t < 7) {
        X.textAlign = 'center';
        X.font = '700 ' + (PT ? 25 : 34) + 'px "MojeRuka","Segoe UI",Arial';
        X.fillStyle = '#fff';
        X.fillText('TAP OPPOSITE SIDE = LONG JUMP', W / 2, H - 96);
        X.fillText('TAP SAME SIDE = HOP · TAP IN AIR = 2x JUMP', W / 2, H - 50);
    }
    X.shadowBlur = 0;
}
function end() {
    mode = 'over';
    const m = MAPS[S.map], bonus = Math.floor(G.score * .015 * m.m), gain = G.cash + bonus, old = S.best;
    S.$ += gain;
    S.gems += G.gems || 0;
    S.best = Math.max(S.best, G.score);
    const nu = MAPS.filter(x => x.u > old && x.u <= S.best);
    save();
    ov.className = 'ui';
    ov.innerHTML = `<div class=rv><h1>GAME OVER</h1><div class=big2>${G.score}</div>${G.score > old && old > 0 ? '<p class=gold>NEW BEST</p>' : ''}<p>Best ${S.best} · Coins $${G.cash} · Score bonus $${bonus}</p><p class=gold>Total +$${gain}</p>${G.gems ? `<p style="color:var(--info)">GEMS +${G.gems}</p>` : ''}${nu.map(x => `<p class=gold>MAP UNLOCKED: ${x.n}</p>`).join('')}<div class=row><button class=b id=rt>RETRY</button><button class="b s" id=mn>MENU</button></div></div>`;
    $('#rt').onclick = play;
    $('#mn').onclick = toMenu;
}
function play() {
    au();
    SFX.click();
    mode = 'play';
    [menu, pn, ov, tp].forEach(e => e.className = 'ui hid');
    newRun();
}
function toMenu() {
    S.map = S.pick;
    mode = 'menu';
    ov.className = 'ui hid';
    pn.className = 'ui hid';
    menu.className = 'ui';
    tp.className = 'ui';
    top_();
}
