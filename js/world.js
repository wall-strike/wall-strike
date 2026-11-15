'use strict';
/* Drawing of the world: map backgrounds, walls, scenery. */
/* ---------- DRAWING: WORLD ---------- */
let BY = 0;
const rnd = n => {
    const x = Math.sin(n * 127.1) * 43758.5453;
    return x - Math.floor(x);
};
function lay(sp, gap, off, f) {
    const o = off * sp, k = Math.floor(o / gap);
    for (let i = -1; i < W / gap + 2; i++)
        f(i * gap - (o - k * gap), k + i);
}
function deco(m, x, i, t) {
    const r = rnd(i), h = 150 + r * 120, b = BY;
    X.fillStyle = m.c;
    switch (m.dec) {
        case 0:
            X.fillRect(x, b - h, 230, h);
            X.fillStyle = m.gd;
            X.beginPath();
            X.arc(x + 115, b - 62, 34, Math.PI, 0);
            X.lineTo(x + 149, b);
            X.lineTo(x + 81, b);
            X.fill();
            X.fillStyle = m.c;
            X.beginPath();
            X.arc(x + 115, b - h, 48, Math.PI, 0);
            X.fill();
            X.fillStyle = m.gd;
            X.fillRect(x + 20, b - h + 30, 24, 40);
            X.fillRect(x + 186, b - h + 30, 24, 40);
            break;
        case 1:
            X.fillRect(x, b - h, 200, h);
            X.strokeStyle = '#0003';
            for (let y = b - h; y < b; y += 14) {
                X.beginPath();
                X.moveTo(x, y);
                X.lineTo(x + 200, y);
                X.stroke();
            }
            X.fillStyle = '#4a1f1a';
            X.beginPath();
            X.moveTo(x - 12, b - h);
            X.lineTo(x + 100, b - h - 60);
            X.lineTo(x + 212, b - h);
            X.fill();
            X.fillStyle = '#ffd27a';
            X.shadowColor = '#ffb04a';
            X.shadowBlur = 18;
            for (let k = 0; k < 2; k++)
                for (let j = 0; j < 2; j++)
                    if (rnd(i * 7 + k * 3 + j) > .3)
                        X.fillRect(x + 28 + k * 90, b - h + 24 + j * 70, 34, 46);
            X.shadowBlur = 0;
            break;
        case 2:
            X.fillRect(x, b - 100 - r * 60, 260, 100 + r * 60);
            X.fillStyle = m.gd;
            X.beginPath();
            X.arc(x + 130, b - 50, 38, Math.PI, 0);
            X.lineTo(x + 168, b);
            X.lineTo(x + 92, b);
            X.fill();
            if (r > .5) {
                X.fillStyle = m.c;
                X.fillRect(x + 210, b - h - 40, 30, h + 40);
                X.beginPath();
                X.arc(x + 225, b - h - 40, 22, Math.PI, 0);
                X.fill();
            }
            break;
        case 3:
            for (let s = 0; s < 5; s++) {
                X.fillStyle = s % 2 ? m.c : m.gd;
                X.fillRect(x + s * 26, b - (s + 1) * 42 - r * 20, 260 - s * 52, 42 + r * 20);
            }
            X.fillStyle = '#5dffc8';
            X.shadowColor = '#5dffc8';
            X.shadowBlur = 16;
            X.fillRect(x + 124, b - 230 - r * 20, 12, 10);
            X.shadowBlur = 0;
            X.strokeStyle = '#2f7a3a';
            X.lineWidth = 4;
            for (let k = 0; k < 4; k++) {
                X.beginPath();
                X.moveTo(x + 30 + k * 60, b - 60);
                X.lineTo(x + 34 + k * 60, b - 60 - 30 - k * 6);
                X.stroke();
            }
            break;
        case 4:
            X.beginPath();
            X.moveTo(x, b);
            X.quadraticCurveTo(x + 50, b - h * .5, x + 30, b - h);
            X.lineTo(x + 150, b - h);
            X.quadraticCurveTo(x + 130, b - h * .5, x + 180, b);
            X.fill();
            X.fillStyle = '#0003';
            X.fillRect(x + 90, b - h, 60, h);
            X.fillStyle = '#ffffff55';
            X.beginPath();
            X.arc(x + 90, b - h - 20, 36, 0, 7);
            X.arc(x + 120, b - h - 40, 28, 0, 7);
            X.fill();
            X.fillStyle = Math.sin(t * 4 + i) > 0 ? '#ff3a3a' : '#601010';
            X.fillRect(x + 84, b - h - 4, 12, 8);
            break;
        case 5:
            X.beginPath();
            X.moveTo(x + 30, b);
            X.lineTo(x + 50, b - h - 40);
            X.lineTo(x + 70, b);
            X.fill();
            X.fillStyle = '#ffd870';
            X.beginPath();
            X.moveTo(x + 43, b - h - 14);
            X.lineTo(x + 50, b - h - 40);
            X.lineTo(x + 57, b - h - 14);
            X.fill();
            X.fillStyle = m.c;
            for (let k = 0; k < 3; k++) {
                X.fillRect(x + 110 + k * 44, b - 110, 22, 110);
                X.fillStyle = m.gd;
                X.fillRect(x + 106 + k * 44, b - 116, 30, 10);
                X.fillStyle = m.c;
            }
            X.fillStyle = '#3ad0d055';
            X.fillRect(x + 100, b - 12, 160, 12);
            break;
        case 6:
            X.fillRect(x, b - h * .6, 220, h * .6);
            X.fillStyle = m.gd;
            X.fillRect(x - 10, b - h * .6 - 14, 240, 14);
            X.fillStyle = '#8a6a3a';
            X.fillRect(x + 230, b - 70, 60, 70);
            X.fillRect(x + 250, b - 130, 50, 60);
            X.fillStyle = '#0003';
            X.fillRect(x + 230, b - 38, 60, 4);
            break;
        case 7:
            X.fillRect(x, b - 30, 300, 30);
            X.fillStyle = m.gd;
            for (let k = 0; k < 4; k++)
                X.fillRect(x + 10 + k * 80, b - h * .7, 22, h * .7 - 30);
            X.fillStyle = m.c;
            X.fillRect(x - 10, b - h * .7 - 18, 320, 18);
            X.fillStyle = '#2a5a4a77';
            X.fillRect(x, b - 12, 300, 12);
            break;
        case 8:
            X.fillRect(x, b - 90, 260, 70);
            X.fillStyle = m.gd;
            X.fillRect(x, b - 26, 260, 8);
            X.fillStyle = '#0004';
            for (let k = 0; k < 6; k++)
                X.fillRect(x + 14 + k * 42, b - 80, 3, 50);
            X.fillStyle = '#222';
            X.beginPath();
            X.arc(x + 50, b - 14, 12, 0, 7);
            X.arc(x + 210, b - 14, 12, 0, 7);
            X.fill();
            X.fillStyle = '#8a3a2a';
            X.fillRect(x + 260, b - 60, 30, 40);
            break;
        case 9:
            X.fillRect(x, b - h - 80, 120, h + 80);
            X.fillStyle = m.gd;
            for (let y = b - h - 70; y < b; y += 26)
                X.fillRect(x + 8, y, 104, 14);
            X.fillStyle = '#ff9a3d';
            X.fillRect(x + 120, b - h - 80, 5, 70);
            X.fillStyle = '#e0e6ee55';
            X.fillRect(x + 140, b - 130, 18, 130);
    }
}
/* map wallpaper sheet = [left wall | corridor | right wall]; bw = [left wall px, corridor px] */
function bgs(m, cam) {
    const im = m.im, wl = m.bw[0], mw = m.bw[1], w = RX - LX, n = Math.max(1, Math.round(w / mw / 1.7)), k = w / n / mw, th = im.naturalHeight * k, cw = mw * k;
    for (let c = 0; c < n; c++) {
        const base = (cam * .6 + c * th * .37) % th, x0 = Math.round(LX + c * cw), x1 = Math.round(LX + (c + 1) * cw);
        X.save();
        X.beginPath();
        X.rect(x0, 0, x1 - x0, H);
        X.clip();
        if (c % 2) {
            X.translate(x1, 0);
            X.scale(-1, 1);
        }
        else
            X.translate(x0, 0);
        for (let y = base - th; y < H; y += th)
            X.drawImage(im, wl, 0, mw, im.naturalHeight, 0, Math.round(y), x1 - x0, Math.ceil(th) + 1);
        X.restore();
    }
    X.fillStyle = '#b4aa83';
    X.globalAlpha = .55;
    X.fillRect(LX, 0, w, H);
    X.globalAlpha = 1;
}
function wall(m, cam, x0, s) {
    const im = m.im, wl = m.bw[0], mw = m.bw[1], sx = s < 0 ? 0 : wl + mw, sw = s < 0 ? wl : im.naturalWidth - wl - mw, th = im.naturalHeight * LX / sw;
    for (let y = (cam % th) - th; y < H; y += th)
        X.drawImage(im, sx, 0, sw, im.naturalHeight, x0, Math.round(y), LX, Math.ceil(th) + 1);
}
function shaft(m, cam, t) {
    if (m.im && m.im.naturalWidth) {
        bgs(m, cam);
        return;
    }
    const tl = (f, gap, fn) => {
        const b = cam * f, k = Math.floor(b / gap);
        for (let i = k - 1; i <= k + Math.ceil(H / gap) + 2; i++)
            fn(H - (i * gap - b), i);
    };
    X.fillStyle = m.c;
    X.globalAlpha = .5;
    X.fillRect(LX, 0, RX - LX, H);
    X.globalAlpha = 1;
    X.strokeStyle = '#0002';
    X.lineWidth = 2;
    tl(.6, 44, (y, i) => {
        X.beginPath();
        X.moveTo(LX, y);
        X.lineTo(RX, y);
        for (let x = LX + (i % 2) * 60; x < RX; x += 120) {
            X.moveTo(x, y);
            X.lineTo(x, y - 44);
        }
        X.stroke();
    });
    tl(.6, 320, (yb, i) => {
        const r = rnd(i), cx = W / 2 + (r - .5) * (RX - LX) * .7;
        switch (m.dec) {
            case 0:
                X.fillStyle = m.gd;
                X.beginPath();
                X.moveTo(cx - 50, yb - 60);
                X.lineTo(cx - 50, yb - 150);
                X.arc(cx, yb - 150, 50, Math.PI, 0);
                X.lineTo(cx + 50, yb - 60);
                X.fill();
                X.fillStyle = m.sky[1];
                X.beginPath();
                X.moveTo(cx - 38, yb - 60);
                X.lineTo(cx - 38, yb - 150);
                X.arc(cx, yb - 150, 38, Math.PI, 0);
                X.lineTo(cx + 38, yb - 60);
                X.fill();
                break;
            case 1:
                X.fillStyle = '#3a1812';
                X.fillRect(cx - 36, yb - 190, 72, 120);
                X.fillStyle = '#ffd27a';
                X.shadowColor = '#ffb04a';
                X.shadowBlur = 26;
                X.fillRect(cx - 28, yb - 182, 56, 104);
                X.shadowBlur = 0;
                X.fillStyle = '#3a1812';
                X.fillRect(cx - 2, yb - 182, 4, 104);
                X.fillRect(cx - 28, yb - 132, 56, 4);
                X.strokeStyle = '#222';
                X.lineWidth = 2;
                X.beginPath();
                X.moveTo(cx + 100, yb - 320);
                X.lineTo(cx + 100, yb - 200);
                X.stroke();
                X.fillStyle = '#ffb04a';
                X.shadowColor = '#ffb04a';
                X.shadowBlur = 24;
                X.fillRect(cx + 90, yb - 200, 20, 28);
                X.shadowBlur = 0;
                break;
            case 2:
                X.fillStyle = '#6b4a2a';
                X.fillRect(LX, yb - 130, RX - LX, 16);
                X.fillStyle = '#0005';
                X.fillRect(LX, yb - 114, RX - LX, 8);
                X.fillStyle = '#8a6a3a';
                X.fillRect(cx - 34, yb - 182, 68, 52);
                X.fillStyle = '#0004';
                X.fillRect(cx - 34, yb - 156, 68, 3);
                X.strokeStyle = '#3a2a14';
                X.lineWidth = 3;
                X.strokeRect(cx - 34, yb - 182, 68, 52);
                break;
            case 3:
                X.strokeStyle = '#5dffc8';
                X.shadowColor = '#5dffc8';
                X.shadowBlur = 18;
                X.globalAlpha = .5 + .4 * Math.sin(t * 2 + i);
                X.lineWidth = 4;
                X.beginPath();
                X.arc(cx, yb - 150, 44, 0, 7);
                X.moveTo(cx - 30, yb - 150);
                X.lineTo(cx + 30, yb - 150);
                X.moveTo(cx, yb - 180);
                X.lineTo(cx, yb - 120);
                X.stroke();
                X.globalAlpha = 1;
                X.shadowBlur = 0;
                X.strokeStyle = '#2f7a3a';
                X.lineWidth = 5;
                for (let k = 0; k < 4; k++) {
                    const vx = LX + 30 + k * (RX - LX - 60) / 4 + r * 40;
                    X.beginPath();
                    X.moveTo(vx, yb - 320);
                    X.quadraticCurveTo(vx + 20, yb - 250, vx - 10, yb - 190 - k * 20);
                    X.stroke();
                }
                break;
            case 4:
                X.fillStyle = '#4a5260';
                X.fillRect(cx - 12, yb - 320, 24, 320);
                X.fillStyle = '#ffffff22';
                X.fillRect(cx - 8, yb - 320, 6, 320);
                X.fillStyle = '#2a2f38';
                for (let y = yb - 300; y < yb; y += 80)
                    X.fillRect(cx - 16, y, 32, 10);
                X.fillStyle = '#f2c230';
                X.fillRect(LX, yb - 150, RX - LX, 22);
                X.fillStyle = '#111';
                for (let x = LX; x < RX; x += 44) {
                    X.beginPath();
                    X.moveTo(x, yb - 150);
                    X.lineTo(x + 22, yb - 150);
                    X.lineTo(x + 4, yb - 128);
                    X.lineTo(x - 18, yb - 128);
                    X.fill();
                }
                X.fillStyle = Math.sin(t * 4 + i) > 0 ? '#ff3a3a' : '#601010';
                X.beginPath();
                X.arc(cx + 60, yb - 230, 7, 0, 7);
                X.fill();
                break;
            case 5:
                X.fillStyle = m.gd;
                X.fillRect(cx - 60, yb - 250, 120, 190);
                X.fillStyle = '#ffd870';
                for (let a = 0; a < 4; a++)
                    for (let b = 0; b < 3; b++)
                        if (rnd(i * 13 + a * 3 + b) > .35)
                            X.fillRect(cx - 44 + b * 34, yb - 236 + a * 44, 18, 26);
                X.fillStyle = '#ffb030';
                X.shadowColor = '#ff9a20';
                X.shadowBlur = 30;
                X.beginPath();
                X.arc(cx + 100, yb - 190, 10 + 2 * Math.sin(t * 9 + i), 0, 7);
                X.fill();
                X.shadowBlur = 0;
                break;
            case 6:
                X.fillStyle = '#8a6a3a';
                X.fillRect(cx - 50, yb - 130, 100, 70);
                X.strokeStyle = '#4a3a1a';
                X.lineWidth = 3;
                X.strokeRect(cx - 50, yb - 130, 100, 70);
                X.beginPath();
                X.moveTo(cx - 50, yb - 130);
                X.lineTo(cx + 50, yb - 60);
                X.moveTo(cx + 50, yb - 130);
                X.lineTo(cx - 50, yb - 60);
                X.stroke();
                X.fillStyle = '#ffe9a0';
                X.shadowColor = '#ffe9a0';
                X.shadowBlur = 24;
                X.fillRect(cx - 4, yb - 300, 8, 12);
                X.shadowBlur = 0;
                break;
            case 7:
                X.fillStyle = '#4a5a55';
                X.fillRect(LX, yb - 170, RX - LX, 18);
                X.fillStyle = '#0004';
                X.fillRect(LX, yb - 152, RX - LX, 5);
                X.fillStyle = '#2f7a5a';
                X.fillRect(cx - 40, yb - 250, 80, 60);
                X.fillStyle = '#bfe0d0';
                X.fillRect(cx - 32, yb - 244, 64, 8);
                break;
            case 8:
                X.fillStyle = '#5a4a3a';
                X.fillRect(LX, yb - 120, RX - LX, 10);
                X.fillStyle = '#8a3a2a';
                X.fillRect(cx - 60, yb - 230, 120, 100);
                X.fillStyle = '#0004';
                for (let k = 0; k < 4; k++)
                    X.fillRect(cx - 48 + k * 28, yb - 224, 4, 88);
                X.fillStyle = '#f2c230';
                X.fillRect(cx - 60, yb - 150, 120, 6);
                break;
            case 9:
                X.fillStyle = '#8a94a2';
                X.fillRect(cx - 8, yb - 320, 16, 320);
                X.fillStyle = '#f2a030';
                X.fillRect(LX, yb - 170, RX - LX, 12);
                X.fillStyle = '#0003';
                for (let x = LX; x < RX; x += 40)
                    X.fillRect(x, yb - 170, 18, 12);
                X.fillStyle = Math.sin(t * 4 + i) > 0 ? '#ff3a3a' : '#601010';
                X.beginPath();
                X.arc(cx + 50, yb - 260, 6, 0, 7);
                X.fill();
        }
    });
    let g = X.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#fff5');
    g.addColorStop(1, '#fff0');
    X.fillStyle = g;
    X.beginPath();
    X.moveTo(LX + (RX - LX) * .1, 0);
    X.lineTo(LX + (RX - LX) * .4, 0);
    X.lineTo(RX - (RX - LX) * .05, H);
    X.lineTo(RX - (RX - LX) * .36, H);
    X.fill();
    X.fillStyle = ['#fff', '#ffb060', '#ffe9b0', '#b8ffd0', '#cfe6ff', '#9ffcf0', '#ffe0a0', '#cfe8d8', '#d8c0a0', '#e8f4ff'][m.dec];
    for (let i = 0; i < 40; i++) {
        X.globalAlpha = .25 + .3 * rnd(i + 3);
        X.fillRect(LX + rnd(i) * (RX - LX), ((rnd(i + 50) * H + cam * (.2 + rnd(i + 9) * .3) + t * 8) % H + H) % H, 2.5, 2.5);
    }
    X.globalAlpha = 1;
}
function scene(m, cam, t) {
    let g = X.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, m.sky[0]);
    g.addColorStop(.55, m.sky[1]);
    g.addColorStop(1, m.sky[2]);
    X.fillStyle = g;
    X.fillRect(0, 0, W, H);
    g = X.createRadialGradient(W / 2, 200, 10, W / 2, 200, 700);
    g.addColorStop(0, '#fff8');
    g.addColorStop(1, '#fff0');
    X.fillStyle = g;
    X.fillRect(0, 0, W, H);
    const lyr = (f, gap, fn) => {
        const k = Math.floor(cam * f / gap);
        for (let i = k - 1; i <= k + Math.ceil(H / gap) + 2; i++)
            fn(H - (i * gap - cam * f), i);
    };
    X.fillStyle = m.gd;
    X.globalAlpha = .25;
    lyr(.15, 340, (yb, i) => {
        X.fillRect(100 + rnd(i + 9) * (W - 300), yb - 600, 36 + rnd(i) * 50, 600);
    });
    X.globalAlpha = 1;
    shaft(m, cam, t);
    [[0, -1], [RX, 1]].forEach(([x0, s]) => {
        g = X.createLinearGradient(x0, 0, x0 + LX, 0);
        g.addColorStop(s < 0 ? 0 : 1, m.gd);
        g.addColorStop(s < 0 ? 1 : 0, m.gr);
        X.fillStyle = g;
        X.fillRect(x0, 0, LX, H);
        if (m.im && m.im.naturalWidth)
            wall(m, cam, x0, s);
        else {
            X.strokeStyle = '#0004';
            X.lineWidth = 2;
            for (let y = cam % 56; y < H + 56; y += 56) {
                X.beginPath();
                X.moveTo(x0, y);
                X.lineTo(x0 + LX, y);
                X.stroke();
            }
        }
        X.fillStyle = '#fff3';
        X.fillRect(s < 0 ? LX - 4 : RX, 0, 4, H);
        g = X.createLinearGradient(s < 0 ? LX : RX, 0, s < 0 ? LX + 36 : RX - 36, 0);
        g.addColorStop(0, '#0007');
        g.addColorStop(1, '#0000');
        X.fillStyle = g;
        X.fillRect(s < 0 ? LX : RX - 36, 0, 36, H);
    });
}
function fx(m) {
    const g = X.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .45, W / 2, H / 2, Math.max(W, H) * .62);
    g.addColorStop(0, '#0000');
    g.addColorStop(1, '#000a');
    X.fillStyle = g;
    X.fillRect(0, 0, W, H);
    X.globalCompositeOperation = 'overlay';
    X.fillStyle = ['#ffb04a55', '#ff5a1a66', '#ffe0a044', '#3aff8a44', '#4a7aff55', '#2affe044', '#a0b0c044', '#5aa0ff44', '#c8a06a44', '#8ad0ff44'][m.dec];
    X.fillRect(0, 0, W, H);
    X.globalCompositeOperation = 'source-over';
}
