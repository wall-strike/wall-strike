'use strict';
/* Main loop, pause menu, boot. */
let last = performance.now();
// FPS counter (number only, bottom right): average over ~0.5 s
let fpsN = 0, fpsT = 0;
const fpsE = document.createElement('div');
fpsE.id = 'fps';
document.body.append(fpsE);
function loop(now) {
    requestAnimationFrame(loop);
    fpsN++;
    if (!fpsT)
        fpsT = now;
    else if (now - fpsT >= 500) {
        fpsE.textContent = Math.round(fpsN * 1000 / (now - fpsT));
        fpsN = 0;
        fpsT = now;
    }
    try {
        loopBody(now);
    }
    catch (e) {
        DBG.report(e, 'loop');
    }
}
function loopBody(now) {
    const raw = now - last, dt = Math.min(.05, raw / 1000);
    last = now;
    X.setTransform(RK, 0, 0, RK, 0, 0);
    fe = fe * .95 + Math.min(raw, 100) * .05;
    if (++fc > 30) {
        fc = 0;
        if (fe > 24 && QL > .55) {
            QL -= .15;
            fit();
        }
    }
    const m = MAPS[S.map], t = now / 1000;
    if (bgm !== S.map) {
        bgm = S.map;
        bgsync();
    }
    if (mode == 'menu') {
        off += 70 * dt;
        scene(m, off, t);
        X.save();
        X.translate(PT ? W / 2 : 380, PT ? H * .36 : 480);
        X.scale(PT ? 3.2 : 3.8, PT ? 3.2 : 3.8);
        animal(X, ITEM[S.eq.a].k, { t, ph: t * 5, ka: -.35 + Math.sin(t * 2) * .1 });
        X.restore();
        fx(m);
    }
    else if (G) {
        if (!G.pause)
            upd(dt);
        drw(m, t);
    }
    pz();
}
// pause menu: DOM overlay shown while G.pause is set (G.pause is flipped from many places, so it is synced here)
let pzOn = 0;
function pz() {
    const w = mode == 'play' && G && G.pause && !G.dead ? 1 : 0;
    if (w && !pzOn) {
        pzOn = 1;
        ov.className = 'ui pz';
        ov.style.removeProperty('--c');
        ov.innerHTML = '<div class=rv><h1>PAUSED</h1><div class=col><button class=b id=pzr>RESUME</button><button class="b s" id=pzt>RESTART</button><button class="b s" id=pzs></button><button class="b s" id=pzl>LOBBY</button></div><p class=mu><small>ESC resume · R restart · M sound · L lobby · Q end run</small></p></div>';
        $('#pzr').onclick = () => {
            SFX.click();
            G.pause = 0;
        };
        $('#pzt').onclick = play;
        $('#pzs').onclick = () => {
            S.mute = !S.mute;
            save();
            SFX.click();
        };
        // lobby keeps the run's earnings: same payout as a finished run, just without the game over screen
        $('#pzl').onclick = () => {
            SFX.click();
            G.dead = true;
            end();
            toMenu();
        };
        if (kb)
            $('#pzr').focus();
    }
    else if (!w && pzOn) {
        pzOn = 0;
        if (mode == 'play')
            ov.className = 'ui hid';
    }
    if (pzOn) {
        const s = $('#pzs'), t = 'SOUND: ' + (S.mute ? 'OFF' : 'ON');
        if (s && s.textContent != t)
            s.textContent = t;
    }
}
let bgm = -1;
function bgsync() {
    const m = MAPS[S.map], v = `linear-gradient(#000b,#000d),radial-gradient(ellipse at 50% 35%,${m.sky[1]},transparent 75%),linear-gradient(${m.sky[0]},${m.sky[1]} 55%,${m.sky[2]})`;
    document.documentElement.style.background = v;
    document.body.style.background = v;
}
const dec = i => {
    try {
        return i.decode ? i.decode().catch(() => {
        }) : Promise.resolve();
    }
    catch (e) {
        return Promise.resolve();
    }
};
let booted = 0;
const boot = () => {
    if (booted)
        return;
    booted = 1;
    last = performance.now();
    fc = -30;
    mainMenu();
    top_();
    requestAnimationFrame(loop);
};
S.map = S.pick;
Promise.race([Promise.all([[SPK, CN, CRI, CKI, ...MAPS.map(m => m.im).filter(Boolean), ...Object.values(AS), ...Object.values(GI), ...Object.values(KI), ...Object.values(DGI).flat()].map(dec), (() => {
            try {
                return document.fonts ? document.fonts.load('800 24px MojeRuka').catch(() => {
                }) : 0;
            }
            catch (e) {
                return 0;
            }
        })()].flat()), new Promise(r => setTimeout(r, 2500))]).then(boot, boot);
