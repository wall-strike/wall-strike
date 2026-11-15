'use strict';
/* Sound: synthesized tones plus recorded samples. */
/* ---------- SOUND ---------- */
let AC;
const au = () => {
    if (!AC)
        try {
            AC = new (window.AudioContext || window.webkitAudioContext)();
        }
        catch (e) {
        }
    if (AC && AC.state == 'suspended')
        AC.resume();
    return AC;
};
function tone(f, d, ty = 'sine', v = .2, f2) {
    const a = au();
    if (!a || S.mute || S.vol <= 0)
        return;
    const o = a.createOscillator(), g = a.createGain(), t = a.currentTime;
    o.type = ty;
    o.frequency.setValueAtTime(f, t);
    if (f2)
        o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(v * S.vol, t);
    g.gain.exponentialRampToValueAtTime(.001, t + d);
    o.connect(g);
    g.connect(a.destination);
    o.start(t);
    o.stop(t + d);
}
let CASEBUF = null, CASEREQ = 0;
const CASE_URL = 'assets/audio/case-open.mp3';
function loadCase() {
    if (CASEBUF || CASEREQ)
        return;
    const a = au();
    if (!a)
        return;
    CASEREQ = 1;
    try {
        fetch(CASE_URL).then(r => r.ok ? r.arrayBuffer() : Promise.reject()).then(u => {
            const p = a.decodeAudioData(u, b => {
                CASEBUF = b;
            }, () => {
                CASEREQ = 0;
            });
            if (p && p.catch)
                p.catch(() => {
                    CASEREQ = 0;
                });
        }).catch(() => {
            CASEREQ = 0;
        });
    }
    catch (e) {
        CASEREQ = 0;
    }
}
function playCase() {
    const a = au();
    if (!a || S.mute || S.vol <= 0)
        return;
    if (!CASEBUF) {
        tone(200, .6, 'sawtooth', .12, 900);
        return;
    }
    const s = a.createBufferSource(), g = a.createGain();
    s.buffer = CASEBUF;
    g.gain.value = S.vol;
    s.connect(g);
    g.connect(a.destination);
    s.start();
}
/* recorded sounds (denoised); the synth tone is the fallback until the file is decoded */
const SMP = { jump: { u: 'assets/audio/jump.mp3', v: .6 }, land: { u: 'assets/audio/land.mp3', v: .7 } };
function loadSmp() {
    const a = au();
    if (!a)
        return;
    for (const k in SMP) {
        const o = SMP[k];
        if (o.b || o.q)
            continue;
        o.q = 1;
        try {
            fetch(o.u).then(r => r.ok ? r.arrayBuffer() : Promise.reject()).then(u => {
                const p = a.decodeAudioData(u, b => {
                    o.b = b;
                }, () => {
                    o.q = 0;
                });
                if (p && p.catch)
                    p.catch(() => {
                        o.q = 0;
                    });
            }).catch(() => {
                o.q = 0;
            });
        }
        catch (e) {
            o.q = 0;
        }
    }
}
function smp(k, fb) {
    const a = au();
    if (!a || S.mute || S.vol <= 0)
        return;
    const o = SMP[k];
    if (!o.b) {
        loadSmp();
        fb();
        return;
    }
    const s = a.createBufferSource(), g = a.createGain();
    s.buffer = o.b;
    g.gain.value = S.vol * o.v;
    s.connect(g);
    g.connect(a.destination);
    s.start();
}
const SFX = { jump: () => smp('jump', () => tone(300, .18, 'square', .1, 700)), land: () => smp('land', () => tone(140, .12, 'sine', .3, 60)), coin: () => {
        tone(880, .08, 'triangle', .2);
        setTimeout(() => tone(1320, .12, 'triangle', .2), 60);
    }, pass: () => tone(520, .1, 'sine', .15, 780), tick: () => tone(900, .03, 'square', .08), click: () => tone(660, .05, 'square', .1), over: () => tone(300, .7, 'sawtooth', .2, 50), open: () => playCase(), rare: r => {
        for (let i = 0; i < r + 3; i++)
            setTimeout(() => tone(400 * Math.pow(1.26, i), .25, 'triangle', .25), i * 90);
    } };
