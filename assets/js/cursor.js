/* ══════════════════════════════════════════
   [NIX] Portfolio — Star cursor ("Stardust", gold)
   A spinning star replaces the mouse pointer; moving it sheds star particles
   that drift outward and shrink. Hover on clickable things → bigger, faster spin.
   Click → burst. Mouse only: touch devices keep their normal behaviour.
   ══════════════════════════════════════════ */
(function () {
  'use strict';
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var COLORS = ['#ffd54f', '#ffe9a3', '#ffb84d', '#fff6d6'];
  var HEAD = '#ffd54f';
  var DENSITY = 1;
  var MAX_PARTS = 260;
  var CLICKABLE = 'a,button,[role="button"],.clickable,[data-open],[data-lb],label,select,summary';
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var cv = document.createElement('canvas');
  cv.id = 'starfx'; cv.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cv);
  var ctx = cv.getContext('2d'), W = 0, H = 0;
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize(); addEventListener('resize', resize);

  var mouse = { x: 0, y: 0, seen: false };
  var head = { x: 0, y: 0, rot: 0, scale: 1, hover: 0 };
  var parts = [], hovering = false, running = false;

  function color() { return COLORS[(Math.random() * COLORS.length) | 0]; }
  function star(x, y, r, rot, points, inner) {
    ctx.beginPath();
    for (var i = 0; i < points * 2; i++) {
      var a = rot + i * Math.PI / points, rr = i % 2 ? r * inner : r;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
  }
  function spawn(x, y, vx, vy, drag, max, size, five) {
    if (parts.length >= MAX_PARTS) parts.shift();
    parts.push({ x: x, y: y, vx: vx, vy: vy, drag: drag, life: 0, max: max, size: size, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.2, color: color(), five: five });
  }

  function move(x, y) {
    var d = Math.hypot(x - mouse.x, y - mouse.y);
    mouse.x = x; mouse.y = y;
    if (!mouse.seen) { mouse.seen = true; head.x = x; head.y = y; wake(); return; }
    if (REDUCED) return;
    var n = Math.min(5, d / 12 * DENSITY);
    for (var i = 0; i < n; i++) {
      var a = Math.random() * 6.28, s = 0.6 + Math.random() * 1.8;
      spawn(x, y, Math.cos(a) * s, Math.sin(a) * s, 0.94, 40 + Math.random() * 30, 2.5 + Math.random() * 3, false);
    }
  }
  function burst(x, y) {
    head.scale = 0.6;
    if (REDUCED) return;
    var n = Math.round(20 * DENSITY);
    for (var i = 0; i < n; i++) {
      var a = (i / n) * 6.28 + Math.random() * 0.3, s = 2 + Math.random() * 3.5;
      spawn(x, y, Math.cos(a) * s, Math.sin(a) * s, 0.93, 45 + Math.random() * 30, 2.5 + Math.random() * 4, Math.random() < 0.3);
    }
  }
  function hide() { mouse.seen = false; parts.length = 0; ctx.clearRect(0, 0, W, H); }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    head.x = mouse.x; head.y = mouse.y;
    head.hover += ((hovering ? 1 : 0) - head.hover) * 0.18;
    head.scale += (1 - head.scale) * 0.15;
    head.rot += 0.02 + head.hover * 0.06;

    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i]; p.life++;
      if (p.life >= p.max) { parts.splice(i--, 1); continue; }
      p.vx *= p.drag; p.vy *= p.drag; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      var lf = 1 - p.life / p.max;
      ctx.globalAlpha = Math.max(0, lf * (0.65 + 0.35 * Math.sin(p.life * 0.5 + p.rot * 3)));
      ctx.fillStyle = p.color;
      star(p.x, p.y, p.size * lf * 1.5, p.rot, p.five ? 5 : 4, p.five ? 0.45 : 0.36); ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
    var r = (9 + head.hover * 6) * head.scale;
    ctx.globalAlpha = 0.25 + head.hover * 0.15;
    var g = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, r * 2.6);
    g.addColorStop(0, HEAD); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(head.x, head.y, r * 2.6, 0, 6.28); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = HEAD; star(head.x, head.y, r, head.rot, 4, 0.32); ctx.fill();
    ctx.fillStyle = '#fff'; star(head.x, head.y, r * 0.45, head.rot, 4, 0.4); ctx.fill();

    if (mouse.seen) requestAnimationFrame(frame); else { running = false; ctx.clearRect(0, 0, W, H); }
  }
  function wake() { if (!running) { running = true; requestAnimationFrame(frame); } }

  addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') move(e.clientX, e.clientY); }, { passive: true });
  addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse') burst(e.clientX, e.clientY); });
  document.addEventListener('pointerover', function (e) {
    var t = e.target;
    if (t.tagName === 'IFRAME') { hide(); return; } // embedded players show their own cursor
    hovering = !!(t.closest && t.closest(CLICKABLE));
  });
  document.documentElement.addEventListener('mouseleave', hide);
  window.addEventListener('blur', hide);

  document.documentElement.classList.add('star-cursor');
})();
