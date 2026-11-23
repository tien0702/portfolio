// NIX logo intro for the hero — the same renderer as exports/logo-intro/logo-intro.html
// (params from logo-intro.json), drawn on a TRANSPARENT canvas so the site background shows through.
// Differences from the video: no blue/solid background, no dissolve-out (the logo stays), sizes scale with the viewport.
(function () {
const LOGO_D = [
  "M155.72,217.1V170.15a1.8,1.8,0,0,0-.9-1.57l-11.88-6.86a1.83,1.83,0,0,0-1.81,0l-12.1,7a1.8,1.8,0,0,0-.9,1.57v47a1.8,1.8,0,0,0,.9,1.57l11.8,6.81a1.83,1.83,0,0,0,1.81,0l12.18-7A1.8,1.8,0,0,0,155.72,217.1Z",
  "M128.13,66.14v47.62a1.8,1.8,0,0,0,.9,1.57l12.1,7a1.83,1.83,0,0,0,1.81,0l11.88-6.86a1.8,1.8,0,0,0,.9-1.57V66.36a1.8,1.8,0,0,0-.9-1.56l-12.18-7a1.83,1.83,0,0,0-1.81,0L129,64.57A1.81,1.81,0,0,0,128.13,66.14Z",
  "M141.9,151.59l8.39,4.85,5.43,3.13,42.55,24.56,7.28,4.21a1.83,1.83,0,0,0,1.81,0L214,184.5a1.8,1.8,0,0,0,.9-1.57v-82.4A1.81,1.81,0,0,0,214,99l-6.24-3.6a1.83,1.83,0,0,0-1.81,0l-7.68,4.43-42.55,24.56L152.91,126a1.81,1.81,0,0,0,0,3.14l2.81,1.62L166,136.65a1.78,1.78,0,0,0,1.81,0l27.78-16a1.82,1.82,0,0,1,2.72,1.57v39.56a1.81,1.81,0,0,1-2.72,1.57L167,146.81l-8.4-4.85-2.85-1.64-13.82-8-8.16-4.71-5.61-3.25L85.2,99.6l-7.51-4.34a1.83,1.83,0,0,0-1.81,0L69.47,99a1.82,1.82,0,0,0-.91,1.57v82.4a1.81,1.81,0,0,0,.91,1.57l6.8,3.93a1.78,1.78,0,0,0,1.81,0l7.12-4.11,42.93-24.78,2.8-1.62a1.81,1.81,0,0,0,0-3.13l-2.8-1.62-10.25-5.92a1.85,1.85,0,0,0-1.82,0L87.92,163.5a1.81,1.81,0,0,1-2.72-1.56V122a1.81,1.81,0,0,1,2.72-1.57l29.15,16.83,8.16,4.71,2.9,1.68Z",
  "M140.83,28.37,44,84.27a1.81,1.81,0,0,0-.91,1.56v111.8A1.82,1.82,0,0,0,44,199.2l96.82,55.9a1.83,1.83,0,0,0,1.81,0l96.82-55.9a1.81,1.81,0,0,0,.9-1.57V85.83a1.8,1.8,0,0,0-.9-1.56l-96.82-55.9A1.78,1.78,0,0,0,140.83,28.37Zm84.84,162.87-83,47.94a1.83,1.83,0,0,1-1.81,0l-83-47.94a1.8,1.8,0,0,1-.9-1.57V93.79a1.83,1.83,0,0,1,.9-1.57l83-47.93a1.78,1.78,0,0,1,1.81,0l83,47.93a1.84,1.84,0,0,1,.91,1.57v95.88A1.81,1.81,0,0,1,225.67,191.24Z"
];
const LC = 141.73, HEX_W = 197.3, HEX_H = 227.3;
const HEXV = [[141.73,28.1],[240.4,85],[240.4,198.5],[141.73,255.4],[43.1,198.5],[43.1,85]];
const INNER_K = 0.8575;
const EASE = {
  linear: k => k,
  in: k => k * k * k,
  out: k => 1 - Math.pow(1 - k, 3),
  inOut: k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2,
  outExpo: k => k >= 1 ? 1 : 1 - Math.pow(2, -10 * k),
};
// exports/logo-intro/logo-intro.json (fade-out params dropped: the logo stays on screen)
const P = {
  logoScale: .36, inOn: true, inStart: 0, inDur: .55, inStagger: .025, inEase: "outExpo", inFrom: 3.5, inOver: 0, inInner: true, inCross: true, inFade: .1062,
  lineStart: .125, lineDur: .9, lineStagger: .1083, lineEase: "inOut", lineCount: 3, lineTail: 1, lineFade: .25, lineReverse: true, lineWidth: 2.5, lineColor: "#ffffff", lineGlow: 0,
  dStart: .5, dDur: .8417, dEase: "inOut", grain: 6, dust: 0, soft: .24, logoColor: "#ffffff",
  tStart: .6583, tDur: .6, tEase: "inOut", textScale: .11, gap: .06,
};
const TEXT_IMG_SRC = "data:image/png;base64,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";

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => b <= a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;

const LOGO = LOGO_D.map(d => new Path2D(d));
const OUTLINES = (() => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"), out = [];
  svg.style.cssText = "position:absolute;width:0;height:0;visibility:hidden";
  document.body.appendChild(svg);
  LOGO_D.forEach(d => {
    let start = null;
    d.split(/(?=[Mm])/).forEach(sub => {
      if (sub[0] === "m"){
        const m = sub.match(/^m(-?[\d.]+),?(-?[\d.]+)(.*)$/s);
        const x = start[0] + +m[1], y = start[1] + +m[2];
        sub = `M${x},${y}` + (/^[-\d.,]/.test(m[3]) ? "l" : "") + m[3];
      }
      const m = sub.match(/^M(-?[\d.]+),?(-?[\d.]+)/); start = [+m[1], +m[2]];
      const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
      el.setAttribute("d", sub); svg.appendChild(el);
      out.push({ path: new Path2D(sub), len: el.getTotalLength() });
    });
  });
  svg.remove();
  return out;
})();

// time at which every part of the intro has settled
const END = Math.max(
  P.dStart + P.dDur, P.tStart + P.tDur,
  P.lineStart + (OUTLINES.length - 1) * P.lineStagger + P.lineDur + P.lineFade,
  P.inStart + 11 * P.inStagger + P.inDur + P.inFade);

let cv, ctx, layer, lctx, G, NOISE = { key: "" }, U = 1;
const TEXT_IMG = { img: null, box: null };

async function loadTextImage(src){
  const img = new Image(); img.src = src; await img.decode();
  const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
  const x = c.getContext("2d"); x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height).data;
  let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
  for (let y = 0; y < c.height; y++) for (let i = 0; i < c.width; i++){
    if (d[(y * c.width + i) * 4 + 3] > 8){ if (i < x0) x0 = i; if (i > x1) x1 = i; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  TEXT_IMG.img = img;
  TEXT_IMG.box = x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

// canvas = full viewport in device pixels; U = one "video pixel" (1080 frame) in canvas pixels
function layout(logoScale){
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const W = Math.round(cv.clientWidth * dpr), H = Math.round(cv.clientHeight * dpr);
  cv.width = layer.width = W; cv.height = layer.height = H;
  const m = Math.min(W, H); U = m / 1080;
  const s = m * logoScale / HEX_H, logoH = HEX_H * s, logoW = HEX_W * s;
  const fs = m * P.textScale * logoScale / P.logoScale;
  const b = TEXT_IMG.box, cap = fs * .722, textW = cap * b.w / b.h;
  const gap = m * P.gap * logoScale / P.logoScale, totalH = logoH + gap + cap;
  const top = H / 2 - totalH / 2;
  const left = Math.floor(Math.min(W / 2 - logoW / 2, W / 2 - textW / 2) - 6);
  const right = Math.ceil(Math.max(W / 2 + logoW / 2, W / 2 + textW / 2) + 6);
  const bottom = Math.ceil(top + totalH + fs * .08 + 6);
  G = { W, H, s, dpr, lx: W / 2, ly: top + logoH / 2, baseY: top + logoH + gap + cap, splitY: top + logoH + gap / 2,
        box: { x: clamp(left, 0, W), y: clamp(Math.floor(top - 6), 0, H), w: 0, h: 0 },
        img: { x: W / 2 - textW / 2, y: top + logoH + gap, w: textW, h: cap } };
  G.box.w = clamp(right, 0, W) - G.box.x; G.box.h = clamp(bottom, 0, H) - G.box.y;
  buildNoise();
}

function buildNoise(){
  const { w, h } = G.box, g = P.grain * U, key = `${w}x${h}:${g}`;
  if (NOISE.key === key) return;
  const hash = (x, y) => { const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); };
  const sm = k => k * k * (3 - 2 * k), a = new Float32Array(w * h);
  for (let y = 0; y < h; y++){
    const gy = y / g, iy = Math.floor(gy), fy = sm(gy - iy);
    for (let x = 0; x < w; x++){
      const gx = x / g, ix = Math.floor(gx), fx = sm(gx - ix);
      a[y * w + x] = (hash(ix, iy) * (1 - fx) + hash(ix + 1, iy) * fx) * (1 - fy) + (hash(ix, iy + 1) * (1 - fx) + hash(ix + 1, iy + 1) * fx) * fy;
    }
  }
  NOISE = { key, a };
}

function drawContent(c){
  c.save(); c.translate(G.lx, G.ly); c.scale(G.s, G.s); c.translate(-LC, -LC);
  c.fillStyle = P.logoColor; LOGO.forEach(p => c.fill(p)); c.restore();
  const b = TEXT_IMG.box;
  c.drawImage(TEXT_IMG.img, b.x, b.y, b.w, b.h, G.img.x, G.img.y, G.img.w, G.img.h);
}

function drawDissolve(t){
  const pl = EASE[P.dEase](seg(t, P.dStart, P.dStart + P.dDur));
  const pt = EASE[P.tEase](seg(t, P.tStart, P.tStart + P.tDur));
  if (pl <= 0 && pt <= 0) return;
  if (pl >= 1 && pt >= 1){ drawContent(ctx); return; }
  lctx.clearRect(0, 0, G.W, G.H); drawContent(lctx);
  const { x: bx, y: by, w, h } = G.box;
  if (w <= 0 || h <= 0) return;
  const img = lctx.getImageData(bx, by, w, h), d = img.data, n = NOISE.a, sf = P.soft;
  for (let y = 0; y < h; y++){
    const p = by + y < G.splitY ? pl : pt;
    if (p >= 1) continue;
    const row = y * w;
    if (p <= 0){ for (let x = 0; x < w; x++) d[(row + x) * 4 + 3] = 0; continue; }
    const pp = p * (1 + sf);
    for (let x = 0; x < w; x++){
      const i = (row + x) * 4 + 3; if (d[i] === 0) continue;
      d[i] *= clamp((pp - n[row + x]) / sf);
    }
  }
  lctx.putImageData(img, bx, by);
  ctx.drawImage(layer, 0, 0);
}

function drawLines(t){
  ctx.save(); ctx.translate(G.lx, G.ly); ctx.scale(G.s, G.s); ctx.translate(-LC, -LC);
  ctx.strokeStyle = P.lineColor; ctx.lineWidth = P.lineWidth * U / G.s; ctx.lineCap = "round"; ctx.lineJoin = "round";
  const n = P.lineCount;
  OUTLINES.forEach((o, j) => {
    const st = P.lineStart + j * P.lineStagger, end = st + P.lineDur;
    const k = seg(t, st, end); if (k <= 0) return;
    const alpha = 1 - seg(t, end, end + P.lineFade);   // lineTail = 1: the stroke stays, then fades
    if (alpha <= 0) return;
    const uh = EASE[P.lineEase](clamp(k));
    if (uh <= 1e-4) return;
    const cover = o.len / n, dir = P.lineReverse && j % 2 ? -1 : 1;
    ctx.globalAlpha = alpha;
    for (let i = 0; i < n; i++){
      const base = i * cover, b = base + dir * uh * cover;
      const from = Math.min(base, b), len = Math.abs(b - base);
      ctx.setLineDash([len, Math.max(.001, o.len - len)]);
      ctx.lineDashOffset = -from;
      ctx.stroke(o.path);
    }
  });
  ctx.restore();
}

function drawInLines(t){
  const E = EASE[P.inEase];
  const seg2 = (A, B, u0, u1) => { ctx.beginPath(); ctx.moveTo(lerp(A[0], B[0], u0), lerp(A[1], B[1], u0)); ctx.lineTo(lerp(A[0], B[0], u1), lerp(A[1], B[1], u1)); ctx.stroke(); };
  ctx.save();
  ctx.strokeStyle = P.lineColor; ctx.lineCap = "round"; ctx.globalAlpha = 1;
  if (P.inCross){
    const r = Math.hypot(G.W, G.H) * .55, a = 35 * Math.PI / 180;
    ctx.lineWidth = P.lineWidth * U;
    [-1, 1].forEach((sx, i) => {
      const st = P.inStart + i * .08, k = seg(t, st, st + P.inDur * .8);
      if (k <= 0 || k >= 1) return;
      const A = [G.lx - sx * Math.cos(a) * r, G.ly - Math.sin(a) * r], B = [2 * G.lx - A[0], 2 * G.ly - A[1]];
      seg2(A, B, E(clamp(k * 1.6 - .6)), E(k));
    });
  }
  ctx.translate(G.lx, G.ly); ctx.scale(G.s, G.s); ctx.translate(-LC, -LC);
  ctx.lineWidth = P.lineWidth * U / G.s;
  [1, INNER_K].forEach((sc, r) => {
    const pt = v => [LC + (v[0] - LC) * sc, LC + (v[1] - LC) * sc];
    for (let i = 0; i < 6; i++){
      const st = P.inStart + (r * 6 + i) * P.inStagger, end = st + P.inDur;
      const k = seg(t, st, end); if (k <= 0) continue;
      const alpha = 1 - seg(t, end, end + P.inFade); if (alpha <= 0) continue;
      let A = pt(HEXV[i]), B = pt(HEXV[(i + 1) % 6]);
      if (i % 2) [A, B] = [B, A];
      const F = P.inFrom, O = P.inOver;
      const hu = k < .7 ? lerp(-F, 1 + O, E(k / .7)) : lerp(1 + O, 1, EASE.out((k - .7) / .3));
      const tu = Math.min(hu, lerp(-F - 1, 0, E(k)));
      ctx.globalAlpha = alpha;
      seg2(A, B, tu, hu);
    }
  });
  ctx.restore();
}

function renderFrame(t){
  ctx.setLineDash([]); ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, G.W, G.H);          // transparent: the page background shows through
  drawDissolve(t);
  drawInLines(t);
  drawLines(t);
}

// Public API
// NixIntro.mount(canvas, { logoScale }) → Promise; .play(onTime) ; .skip() ; .layout(); .box() (logo+text bounds in CSS px)
let opts = { logoScale: P.logoScale }, raf = 0, t0 = 0, time = 0, cb = null;
window.NixIntro = {
  END,
  mount(canvas, o){
    cv = canvas; ctx = cv.getContext("2d");
    layer = document.createElement("canvas"); lctx = layer.getContext("2d", { willReadFrequently: true });
    Object.assign(opts, o);
    return loadTextImage(TEXT_IMG_SRC).then(() => { layout(opts.logoScale); renderFrame(0); });
  },
  play(onTime){
    cancelAnimationFrame(raf); cb = onTime || null; t0 = performance.now(); time = 0;
    const loop = now => {
      time = (now - t0) / 1000;
      renderFrame(Math.min(time, END)); cb && cb(time);
      if (time < END + .05) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  },
  skip(){ cancelAnimationFrame(raf); time = END; renderFrame(END); cb && cb(END + 10); },
  layout(o){ if (o) Object.assign(opts, o); layout(opts.logoScale); renderFrame(Math.min(time, END)); },
  box(){ const d = G.dpr; return { top: G.box.y / d, bottom: (G.box.y + G.box.h) / d, cy: G.H / 2 / d }; },
};
})();
