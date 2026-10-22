// Procedural sound design for the logo intro, synced to the timing in logo-intro.json.
//
//   node sound.mjs [logo-intro.json] [out-dir]      → 5 WAV files (48 kHz / 24-bit stereo)
//
// Re-run after changing the intro's timing and every sound follows it.
import fs from "node:fs";
import path from "node:path";

const cfgPath = process.argv[2] || "logo-intro.json";
const outDir = process.argv[3] || "sounds";
const P = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
const SR = 48000, TAIL = 1.0;                       // reverb tail kept after the intro ends

// ---------------------------------------------------------------------------
// Timeline (seconds from Trim đầu) — mirrors the maths in logo-intro.html
// ---------------------------------------------------------------------------
const EASE = {
  linear: k => k, in: k => k * k * k, out: k => 1 - Math.pow(1 - k, 3),
  inOut: k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2,
  outExpo: k => k >= 1 ? 1 : 1 - Math.pow(2, -10 * k),
};
const T0 = P.trimIn ?? 0, END = (P.trimOut ?? P.duration) - T0;
const rel = t => t - T0;
const span = (a, d, ease) => ({ t0: rel(a), t1: rel(a + d), ease });
const EV = {
  inOn: P.inOn, cross: P.inOn && P.inCross,
  crossStart: rel(P.inStart), crossDur: P.inDur * .8,
  // each fly-in line reaches its vertex at 70 % of its run, then locks onto the edge
  locks: Array.from({ length: P.inInner ? 12 : 6 }, (_, i) => rel(P.inStart + i * P.inStagger + .7 * P.inDur)),
  tracers: Array.from({ length: 5 }, (_, j) => span(P.lineStart + j * P.lineStagger, P.lineDur, P.lineEase)),
  dis: span(P.dStart, P.dDur, P.dEase),
  txt: span(P.tStart, P.tDur, P.tEase),
  out: span(P.fadeStart, P.fadeDur, P.fadeEase),
};
// the moment the lockup reads as complete (~70 % through both dissolves)
EV.hit = Math.max(EV.dis.t0 + (EV.dis.t1 - EV.dis.t0) * .7, EV.txt.t0 + (EV.txt.t1 - EV.txt.t0) * .7);

// ---------------------------------------------------------------------------
// DSP helpers (mono Float32Array in, mono out)
// ---------------------------------------------------------------------------
let seed = 7;
const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const N = d => Math.max(1, Math.round(d * SR));
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const wave = (type, ph) => {
  const x = ph - Math.floor(ph);
  return type === "saw" ? 2 * x - 1 : type === "square" ? (x < .5 ? 1 : -1) : type === "pulse" ? (x < .25 ? 1 : -1)
       : type === "tri" ? 1 - 4 * Math.abs(x - .5) : Math.sin(2 * Math.PI * x);
};
// attack → exponential decay, short release at the end to avoid clicks
const envAD = (t, dur, a, d) => Math.min(1, t / a) * Math.exp(-t / d) * Math.min(1, (dur - t) / .004);

function tone({ type = "sine", f, f2 = f, dur, a = .005, d = 1e9, env, vib = 0, vibRate = 6, ph = 0 }){
  const n = N(dur), out = new Float32Array(n);
  for (let i = 0; i < n; i++){
    const t = i / SR, k = t / dur;
    const fr = f * Math.pow(f2 / f, k) * (1 + vib * Math.sin(2 * Math.PI * vibRate * t));
    ph += fr / SR;
    out[i] = wave(type, ph) * (env ? env(t, k) * Math.min(1, (dur - t) / .004) : envAD(t, dur, a, d));
  }
  return out;
}
function biquad(type, f, q){
  const w = 2 * Math.PI * clamp(f, 20, SR * .45) / SR, cs = Math.cos(w), al = Math.sin(w) / (2 * q);
  let b0, b1, b2;
  if (type === "lp"){ b0 = (1 - cs) / 2; b1 = 1 - cs; b2 = b0; }
  else if (type === "hp"){ b0 = (1 + cs) / 2; b1 = -(1 + cs); b2 = b0; }
  else { b0 = al; b1 = 0; b2 = -al; }                        // band-pass (0 dB peak)
  const a0 = 1 + al;
  return [b0 / a0, b1 / a0, b2 / a0, -2 * cs / a0, (1 - al) / a0];
}
// cutoff may be a number or a function of time (s)
function filter(buf, type, f, q = .707){
  const out = new Float32Array(buf.length), fn = typeof f === "function" ? f : () => f;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0, c;
  for (let i = 0; i < buf.length; i++){
    if (i % 32 === 0) c = biquad(type, fn(i / SR), q);
    const x = buf[i], y = c[0] * x + c[1] * x1 + c[2] * x2 - c[3] * y1 - c[4] * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y; out[i] = y;
  }
  return out;
}
function noise({ dur, type = "bp", f = 1000, f2 = f, q = .9, a = .005, d = 1e9, env }){
  const n = N(dur), raw = new Float32Array(n);
  for (let i = 0; i < n; i++) raw[i] = rnd() * 2 - 1;
  const out = filter(raw, type, t => f * Math.pow(f2 / f, clamp(t / dur, 0, 1)), q);
  for (let i = 0; i < n; i++){ const t = i / SR; out[i] *= env ? env(t, t / dur) * Math.min(1, (dur - t) / .004) : envAD(t, dur, a, d); }
  return out;
}
function fm({ f, ratio = 3.5, index = 2.5, dur, d = .5, a = .002 }){
  const n = N(dur), out = new Float32Array(n);
  for (let i = 0; i < n; i++){
    const t = i / SR, I = index * Math.exp(-t / (d * .6));
    out[i] = Math.sin(2 * Math.PI * f * t + I * Math.sin(2 * Math.PI * f * ratio * t)) * envAD(t, dur, a, d);
  }
  return out;
}
function piano({ f, dur = 2.5 }){
  const n = N(dur), out = new Float32Array(n);
  for (let i = 0; i < n; i++){
    const t = i / SR; let s = 0;
    for (let h = 1; h <= 8; h++) s += Math.pow(h, -1.3) * Math.exp(-t * (1.1 + h * .9)) * Math.sin(2 * Math.PI * f * h * (1 + .0004 * h * h) * t);
    out[i] = s * Math.min(1, t / .002) * .6;
  }
  return out;
}
function supersaw({ f, dur, voices = 5, detune = .012, env }){
  let out = new Float32Array(N(dur));
  for (let v = 0; v < voices; v++){
    const dt = 1 + detune * (v / (voices - 1) * 2 - 1);
    out = mixInto(out, tone({ type: "saw", f: f * dt, dur, env, ph: rnd() }), 1 / voices);
  }
  return out;
}
function kick({ f0 = 140, f1 = 40, dur = .8, d = .3 }){
  const n = N(dur), out = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++){
    const t = i / SR; ph += (f1 + (f0 - f1) * Math.exp(-t / .035)) / SR;
    out[i] = Math.sin(2 * Math.PI * ph) * envAD(t, dur, .001, d) + (t < .002 ? (rnd() * 2 - 1) * .5 : 0);
  }
  return out;
}
function mixInto(a, b, g = 1){
  const out = new Float32Array(Math.max(a.length, b.length)); out.set(a);
  for (let i = 0; i < b.length; i++) out[i] += b[i] * g;
  return out;
}
const reverse = buf => Float32Array.from(buf).reverse();
function crush(buf, bits = 5, hold = 4){
  const out = new Float32Array(buf.length), q = Math.pow(2, bits - 1); let v = 0;
  for (let i = 0; i < buf.length; i++){ if (i % hold === 0) v = Math.round(buf[i] * q) / q; out[i] = v; }
  return out;
}

// ---------------------------------------------------------------------------
// Mix bus: dry + send (→ optional ping-pong delay → reverb)
// ---------------------------------------------------------------------------
class Mix {
  constructor(sec){ this.n = N(sec); ["dL", "dR", "sL", "sR"].forEach(k => this[k] = new Float32Array(this.n)); }
  add(t, buf, { gain = 1, pan = 0, send = .25 } = {}){
    const s0 = Math.round(t * SR), pf = typeof pan === "function" ? pan : () => pan;
    for (let i = 0; i < buf.length; i++){
      const j = s0 + i; if (j < 0) continue; if (j >= this.n) break;
      const a = (clamp(pf(i / SR), -1, 1) + 1) * Math.PI / 4, v = buf[i] * gain;
      const l = v * Math.cos(a), r = v * Math.sin(a);
      this.dL[j] += l; this.dR[j] += r; this.sL[j] += l * send; this.sR[j] += r * send;
    }
  }
}
// granular sprinkle whose density follows the speed of an eased dissolve
function grains(mix, seg, o){
  const { t0, t1 } = seg; if (t1 <= t0) return;
  const E = EASE[seg.ease] || EASE.linear, der = k => (E(Math.min(1, k + .01)) - E(Math.max(0, k - .01))) / .02;
  let maxD = 0; for (let k = 0; k <= 1; k += .01) maxD = Math.max(maxD, der(k));
  for (let placed = 0, guard = 0; placed < o.count && guard < o.count * 60; guard++){
    const k = rnd(); if (rnd() * maxD > der(k)) continue;
    const f = o.fmin * Math.pow(o.fmax / o.fmin, rnd());
    const g = o.make ? o.make(f) : tone({ f, dur: o.dur, a: .0008, d: o.dur * .35 });
    mix.add(t0 + k * (t1 - t0), g, { gain: o.gain * (.5 + .5 * rnd()), pan: rnd() * 1.6 - .8, send: o.send });
    placed++;
  }
}
function pingpong(L, R, time, fb, mixAmt){
  const d = N(time), oL = Float32Array.from(L), oR = Float32Array.from(R), bL = new Float32Array(L.length), bR = new Float32Array(L.length);
  for (let i = 0; i < L.length; i++){
    const pl = i >= d ? bR[i - d] : 0, pr = i >= d ? bL[i - d] : 0;
    bL[i] = L[i] + pl * fb; bR[i] = pr * fb;
    oL[i] += pl * mixAmt; oR[i] += pr * mixAmt;
  }
  return [oL, oR];
}
function freeverb(L, R, room = .84, damp = .25){
  const sc = SR / 44100, combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617], alls = [556, 441, 341, 225];
  const run = spread => {
    const out = new Float32Array(L.length);
    const cs = combs.map(c => ({ b: new Float32Array(Math.round((c + spread) * sc)), i: 0, st: 0 }));
    const as = alls.map(c => ({ b: new Float32Array(Math.round((c + spread) * sc)), i: 0 }));
    for (let n = 0; n < L.length; n++){
      const x = (L[n] + R[n]) * .015; let y = 0;
      for (const c of cs){ const o = c.b[c.i]; c.st = o * (1 - damp) + c.st * damp; c.b[c.i] = x + c.st * room; c.i = (c.i + 1) % c.b.length; y += o; }
      for (const a of as){ const o = a.b[a.i]; a.b[a.i] = y + o * .5; a.i = (a.i + 1) % a.b.length; y = o - y; }
      out[n] = y;
    }
    return out;
  };
  return [run(0), run(23)];
}
function master(mix, { wet = .25, delay }){
  let [sL, sR] = [mix.sL, mix.sR];
  if (delay) [sL, sR] = pingpong(sL, sR, delay.time, delay.fb, delay.mix);
  const [rL, rR] = freeverb(sL, sR);
  const L = new Float32Array(mix.n), R = new Float32Array(mix.n);
  for (let i = 0; i < mix.n; i++){ L[i] = mix.dL[i] + (sL[i] - mix.sL[i]) + rL[i] * wet * 3; R[i] = mix.dR[i] + (sR[i] - mix.sR[i]) + rR[i] * wet * 3; }
  // gentle soft-clip then normalise to -1 dBFS, fade the very end
  let pk = 1e-9; for (let i = 0; i < mix.n; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
  const pre = 1.3 / pk; let pk2 = 1e-9;
  for (let i = 0; i < mix.n; i++){ L[i] = Math.tanh(L[i] * pre); R[i] = Math.tanh(R[i] * pre); pk2 = Math.max(pk2, Math.abs(L[i]), Math.abs(R[i])); }
  const g = .89 / pk2, fade = N(.08);
  for (let i = 0; i < mix.n; i++){ const f = Math.min(1, (mix.n - i) / fade); L[i] *= g * f; R[i] *= g * f; }
  return [L, R];
}
function writeWav(file, L, R){
  const n = L.length, buf = Buffer.alloc(44 + n * 6);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 6, 4); buf.write("WAVE", 8); buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 6, 28); buf.writeUInt16LE(6, 32); buf.writeUInt16LE(24, 34); buf.write("data", 36); buf.writeUInt32LE(n * 6, 40);
  for (let i = 0, o = 44; i < n; i++, o += 6){
    buf.writeIntLE(Math.round(clamp(L[i], -1, 1) * 8388607), o, 3);
    buf.writeIntLE(Math.round(clamp(R[i], -1, 1) * 8388607), o + 3, 3);
  }
  fs.writeFileSync(file, buf);
}

// shared pieces
const whoosh = (dur, f, f2, q = 1.1) => noise({ dur, type: "bp", f, f2, q, env: (t, k) => Math.pow(Math.sin(Math.PI * Math.min(1, k)), 2) });
const sweepPan = dur => t => -.75 + 1.5 * t / dur;

// ---------------------------------------------------------------------------
// The five sound designs
// ---------------------------------------------------------------------------
const PRESETS = [
  { file: "1-digital-clean", name: "Digital Clean — whoosh, tick khớp cạnh, chuông FM", build(m){
    const wd = EV.crossDur + .15;
    if (EV.cross) m.add(EV.crossStart, whoosh(wd, 600, 5000), { gain: .5, pan: sweepPan(wd), send: .2 });
    if (EV.inOn) EV.locks.forEach((t, i) => {
      const f = 2600 * Math.pow(2, i / 24), pan = i % 2 ? .45 : -.45;
      m.add(t, mixInto(tone({ f, dur: .06, a: .001, d: .012 }), tone({ f: f * 2.01, dur: .04, a: .001, d: .006 }), .4), { gain: .3, pan, send: .25 });
      m.add(t, noise({ dur: .006, type: "hp", f: 5000, a: .0005, d: .002 }), { gain: .25, pan, send: .1 });
    });
    EV.tracers.forEach((tr, j) => m.add(tr.t0, tone({ f: 900 * Math.pow(1.12, j), f2: 1800 * Math.pow(1.12, j), dur: tr.t1 - tr.t0, env: (t, k) => Math.sin(Math.PI * k), vib: .004 }), { gain: .045, pan: (j - 2) * .3, send: .5 }));
    grains(m, EV.dis, { count: 70, fmin: 3000, fmax: 9000, dur: .01, gain: .1, send: .35 });
    grains(m, EV.txt, { count: 35, fmin: 4000, fmax: 10000, dur: .008, gain: .08, send: .35 });
    [81, 85, 88].forEach((n, i) => m.add(EV.hit + i * .012, fm({ f: midi(n), dur: 1.6, d: .5 }), { gain: .18, pan: (i - 1) * .35, send: .45 }));
    m.add(EV.hit, kick({ f0: 110, f1: 45, dur: .5, d: .16 }), { gain: .5, send: .05 });
    grains(m, EV.out, { count: 45, fmin: 2500, fmax: 8000, dur: .012, gain: .08, send: .4 });
    m.add(EV.out.t0, noise({ dur: EV.out.t1 - EV.out.t0 + .3, type: "lp", f: 7000, f2: 500, q: .8, env: (t, k) => Math.sin(Math.PI * k) }), { gain: .18, send: .4 });
    return { wet: .28 };
  } },

  { file: "2-cinematic-impact", name: "Cinematic Impact — riser, reverse cymbal, boom + braam", build(m){
    const r0 = Math.max(0, EV.crossStart), rd = Math.max(.2, EV.hit - r0);
    m.add(r0, noise({ dur: rd, type: "bp", f: 300, f2: 6000, q: .9, env: (t, k) => Math.pow(k, 2.2) }), { gain: .35, send: .3 });
    const drone = mixInto(tone({ type: "saw", f: midi(38), dur: rd, env: (t, k) => Math.pow(k, 1.5) }), tone({ type: "saw", f: midi(38) * 1.006, dur: rd, env: (t, k) => Math.pow(k, 1.5), ph: .3 }));
    m.add(r0, filter(drone, "lp", t => 200 * Math.pow(10, t / rd)), { gain: .3, send: .2 });
    m.add(EV.hit - .7, reverse(noise({ dur: .7, type: "hp", f: 4000, a: .001, d: .25 })), { gain: .32, send: .3 });
    const wd = EV.crossDur + .2;
    if (EV.cross) m.add(EV.crossStart, whoosh(wd, 250, 1800, .8), { gain: .45, pan: sweepPan(wd), send: .3 });
    if (EV.inOn) EV.locks.forEach((t, i) => m.add(t, mixInto(tone({ f: 900, dur: .08, a: .001, d: .02 }), noise({ dur: .02, type: "bp", f: 2500, q: 2, a: .0005, d: .006 }), .8), { gain: .14, pan: i % 2 ? .5 : -.5, send: .3 }));
    m.add(EV.hit, kick({ f0: 140, f1: 32, dur: 1.4, d: .5 }), { gain: 1, send: .15 });
    m.add(EV.hit, noise({ dur: .3, type: "lp", f: 3500, f2: 300, a: .001, d: .07 }), { gain: .55, send: .45 });
    [38, 45, 50, 53].forEach((n, i) => {
      const s = supersaw({ f: midi(n), dur: 2, env: (t, k) => Math.min(1, t / .01) * Math.exp(-t / .7) });
      m.add(EV.hit, filter(s, "lp", t => 300 + 1500 * Math.exp(-t / .35)), { gain: .16, pan: (i - 1.5) * .25, send: .35 });
    });
    m.add(EV.out.t0, noise({ dur: .9, type: "bp", f: 5000, f2: 1500, q: 2, env: (t, k) => Math.sin(Math.PI * Math.min(1, k * 1.5)) }), { gain: .12, send: .6 });
    return { wet: .4 };
  } },

  { file: "3-synth-arp", name: "Synth Arp — pluck theo từng line, pad, stab hợp âm", build(m){
    const scale = [72, 75, 77, 79, 82, 84, 87, 89, 91, 94, 96, 99];       // C minor pentatonic, rising with each lock
    const pluck = n => filter(fm({ f: midi(n), ratio: 1, index: 3, dur: .45, d: .12 }), "lp", 6000);
    if (EV.cross) m.add(EV.crossStart, whoosh(EV.crossDur + .1, 1500, 7000, 1.5), { gain: .2, pan: sweepPan(EV.crossDur + .1), send: .3 });
    if (EV.inOn) EV.locks.forEach((t, i) => m.add(t, pluck(scale[i % scale.length]), { gain: .22, pan: i % 2 ? .4 : -.4, send: .45 }));
    const p0 = EV.tracers[0].t0, pd = Math.max(.3, EV.hit - p0 + .15);
    [48, 55, 58, 62, 63].forEach((n, i) => {
      const pad = supersaw({ f: midi(n), dur: pd, voices: 3, detune: .008, env: (t, k) => Math.pow(Math.min(1, k * 1.2), 2) });
      m.add(p0, filter(pad, "lp", t => 400 + 2000 * (t / pd)), { gain: .07, pan: (i - 2) * .3, send: .4 });
    });
    const chordTones = [84, 87, 91, 94, 96, 99];
    grains(m, EV.dis, { count: 14, fmin: 1, fmax: 1.0001, gain: .12, send: .5, make: () => pluck(chordTones[Math.floor(rnd() * chordTones.length)]) });
    [60, 63, 67, 70, 74].forEach((n, i) => {
      const s = supersaw({ f: midi(n), dur: 1.4, env: (t, k) => Math.min(1, t / .005) * Math.exp(-t / .45) });
      m.add(EV.hit, filter(s, "lp", t => 500 + 5000 * Math.exp(-t / .2)), { gain: .13, pan: (i - 2) * .3, send: .35 });
    });
    m.add(EV.hit, kick({ f0: 150, f1: 45, dur: .5, d: .15 }), { gain: .6, send: .05 });
    m.add(EV.hit, noise({ dur: .15, type: "bp", f: 1500, q: .8, a: .001, d: .035 }), { gain: .3, send: .4 });
    const od = EV.out.t1 - EV.out.t0;
    [96, 91, 87, 84].forEach((n, i) => m.add(EV.out.t0 + i * od / 4, pluck(n), { gain: .14, pan: i % 2 ? .5 : -.5, send: .6 }));
    return { wet: .3, delay: { time: .1875, fb: .38, mix: .5 } };
  } },

  { file: "4-minimal-elegant", name: "Minimal Elegant — chạm kính nhẹ, pad sine, hợp âm piano", build(m){
    const wd = EV.crossDur + .25;
    if (EV.cross) m.add(EV.crossStart, whoosh(wd, 400, 2500, .7), { gain: .16, pan: sweepPan(wd), send: .3 });
    if (EV.inOn) EV.locks.forEach((t, i) => { if (i % 2 === 0) m.add(t, tone({ f: 1760 * Math.pow(2, i / 36), dur: .5, a: .001, d: .09 }), { gain: .1, pan: (i / EV.locks.length - .5) * 1.2, send: .5 }); });
    const p0 = EV.tracers[0].t0, pd = Math.max(.4, EV.hit - p0 + .8);
    [48, 55, 59, 64].forEach((n, i) => m.add(p0, tone({ f: midi(n), dur: pd, env: (t, k) => Math.sin(Math.PI * Math.min(1, k)) * .9, vib: .002, vibRate: 4 }), { gain: .06, pan: (i - 1.5) * .3, send: .5 }));
    grains(m, EV.dis, { count: 40, fmin: 6000, fmax: 12000, dur: .006, gain: .04, send: .5 });
    [60, 64, 67, 71].forEach((n, i) => m.add(EV.hit + i * .025, piano({ f: midi(n) }), { gain: .22, pan: (i - 1.5) * .25, send: .45 }));
    m.add(EV.hit, piano({ f: midi(48) }), { gain: .2, send: .35 });
    m.add(EV.out.t0, noise({ dur: EV.out.t1 - EV.out.t0 + .2, type: "lp", f: 3000, f2: 400, q: .6, env: (t, k) => Math.sin(Math.PI * k) }), { gain: .1, send: .5 });
    return { wet: .35 };
  } },

  { file: "5-game-powerup", name: "Game Power-up — zap 8-bit, blip, arpeggio, coin", build(m){
    const sq = (o) => crush(tone({ type: "pulse", ...o }), 6, 3);
    if (EV.cross) m.add(EV.crossStart, sq({ f: 1800, f2: 150, dur: .18, a: .001, d: .2 }), { gain: .2, send: .1 });
    const major = [72, 74, 76, 77, 79, 81, 83, 84, 86, 88, 89, 91];
    if (EV.inOn) EV.locks.forEach((t, i) => m.add(t, sq({ f: midi(major[i % major.length]), dur: .05, a: .001, d: .05 }), { gain: .13, pan: i % 2 ? .3 : -.3, send: .1 }));
    const a0 = EV.tracers[0].t0, arp = [0, 4, 7];
    for (let t = a0, i = 0; t < EV.hit - .03; t += .045, i++){
      const n = Math.min(96, 60 + arp[i % 3] + 12 * Math.floor(i / 3));
      m.add(t, sq({ f: midi(n), dur: .045, a: .001, d: .06 }), { gain: .07, send: .1 });
    }
    grains(m, EV.dis, { count: 40, fmin: 1, fmax: 1.0001, gain: .1, send: .1, make: () => crush(noise({ dur: .015, type: "hp", f: 3000, a: .0005, d: .006 }), 4, 6) });
    m.add(EV.hit, kick({ f0: 180, f1: 50, dur: .35, d: .1 }), { gain: .7, send: .02 });
    [60, 64, 67, 72].forEach(n => m.add(EV.hit, sq({ f: midi(n), dur: .35, a: .002, d: .2, vib: .01, vibRate: 12 }), { gain: .07, send: .15 }));
    m.add(EV.hit + .02, crush(tone({ type: "square", f: midi(83), dur: .07, a: .001, d: .1 }), 6, 3), { gain: .12, send: .2 });
    m.add(EV.hit + .09, crush(tone({ type: "square", f: midi(88), dur: .4, a: .001, d: .15 }), 6, 3), { gain: .12, send: .25 });
    const od = EV.out.t1 - EV.out.t0;
    m.add(EV.out.t0, sq({ f: 1200, f2: 90, dur: od, a: .002, d: od * .7 }), { gain: .12, send: .15 });
    return { wet: .15 };
  } },
];

fs.mkdirSync(outDir, { recursive: true });
console.log(`timeline: intro ${END.toFixed(2)}s, hit @ ${EV.hit.toFixed(2)}s, outro ${EV.out.t0.toFixed(2)}–${EV.out.t1.toFixed(2)}s`);
for (const p of PRESETS){
  seed = 7;
  const mix = new Mix(END + TAIL);
  const fx = p.build(mix);
  const [L, R] = master(mix, fx);
  const file = path.join(outDir, `nix-intro-sfx-${p.file}.wav`);
  writeWav(file, L, R);
  console.log("✓", file, "—", p.name);
}
