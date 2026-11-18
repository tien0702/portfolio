/* ══════════════════════════════════════════
   [NIX] Portfolio — Main Script
   Pages: index.html (home) · project.html?p=<folder> (case study)
   Data:  web-config.json · Database/skills.md · Database/packages.md
          Database/Projects/index.json → Database/Projects/<folder>/data.json
   ══════════════════════════════════════════ */
(function () {
'use strict';

var PAGE = document.body.dataset.page;
var PROJECTS_DIR = 'Database/Projects/';

var CONFIG = null, SKILLS = [], PACKAGES = [], PROJECTS = [], ALL_PROJECTS = []; // PROJECTS = published only
var lang = 'en';
var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ══════════════════════════════
// UI STRINGS
// ══════════════════════════════
// UI text lives in web-config.json → i18n. This is only a fallback for the loader error,
// shown before (or if) web-config.json fails to load.
var BOOT = {
  en: { err: 'Could not load data files.' },
  vi: { err: 'Không tải được dữ liệu.' }
};
function t(k, vars) {
  var D = (CONFIG && CONFIG.i18n) || {};
  var s = (D[lang] && D[lang][k]) || (D.en && D.en[k]) || BOOT[lang][k] || BOOT.en[k] || k;
  if (vars) Object.keys(vars).forEach(function (v) { s = s.replace('{' + v + '}', vars[v]); });
  return s;
}
function loc(o) { if (o == null) return ''; if (typeof o === 'string' || typeof o === 'number') return String(o); return o[lang] || o.en || ''; }
// Per-item fallback to English when a translation is missing.
function locArr(o) {
  if (!o) return []; if (Array.isArray(o)) return o;
  var arr = function (v) { return Array.isArray(v) ? v : v ? [v] : []; };
  var a = arr(o[lang]), en = arr(o.en), out = [];
  for (var i = 0; i < Math.max(a.length, en.length); i++) if (a[i] || en[i]) out.push(a[i] || en[i]);
  if (!out.length) Object.keys(o).forEach(function (k) { if (!out.length) out = arr(o[k]).filter(Boolean); }); // only one language filled
  return out;
}
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function $(id) { return document.getElementById(id); }
function isURL(p) { return /^(https?:)?\/\//.test(p); }

// ══════════════════════════════
// MARKDOWN PARSERS (skills.md, packages.md)
// ══════════════════════════════
function blocks(md) {
  return md.split(/^## /m).filter(Boolean).map(function (b) {
    var lines = b.trim().split('\n'), title = lines[0].trim(), kv = {};
    if (title.charAt(0) === '#') return null;
    lines.slice(1).forEach(function (l) { var m = l.match(/^- ([\w_]+):\s*(.*)$/); if (m) kv[m[1]] = m[2].trim(); });
    return { title: title, kv: kv };
  }).filter(Boolean);
}
function list(s) { return (s || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean); }
function parseSkills(md) {
  return blocks(md).map(function (b) { return { name: b.title, items: list(b.kv.items) }; });
}
function parsePackages(md) {
  return blocks(md).map(function (b) {
    return { title: b.title, tags: list(b.kv.tags), githubLink: b.kv.github || '', line: { en: b.kv.line_en || '', vi: b.kv.line_vi || '' } };
  });
}

// ══════════════════════════════
// ICONS
// ══════════════════════════════
var IC = {
  email: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>',
  linkedin: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg>',
  github: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>',
  blog: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  itchio: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3.13 1.338C2.08 1.96.02 4.328 0 4.95v1.03c0 1.303 1.22 2.45 2.325 2.45 1.33 0 2.436-1.102 2.436-2.41 0 1.308 1.07 2.41 2.4 2.41 1.328 0 2.362-1.102 2.362-2.41 0 1.308 1.104 2.41 2.432 2.41h.024c1.33 0 2.432-1.102 2.432-2.41 0 1.308 1.034 2.41 2.363 2.41 1.33 0 2.4-1.102 2.4-2.41 0 1.308 1.105 2.41 2.435 2.41C22.78 8.43 24 7.282 24 5.98V4.95c-.02-.622-2.08-2.99-3.13-3.612C19.948 1 12.588 1 12 1c-.588 0-7.948 0-8.87.338z"/></svg>',
  code: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  design: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4z"/></svg>',
  vfx: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  ui: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
  team: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  gauge: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 14l4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>',
  play: '<svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><polygon points="6,3 20,12 6,21"/></svg>',
  gplay: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.6 1.8c-.3.3-.4.7-.4 1.2v18c0 .5.1.9.4 1.2l.1.1L13.8 12v-.2L3.7 1.7l-.1.1zM17.2 15.4l-3.4-3.4v-.2l3.4-3.4.1.1 4 2.3c1.1.6 1.1 1.7 0 2.3l-4 2.3h-.1zM17.3 15.3L13.8 11.9 3.6 22.1c.4.4 1 .4 1.7.1l12-6.9M17.3 8.5L5.3 1.7c-.7-.4-1.3-.3-1.7.1l10.2 10.1 3.5-3.4z"/></svg>',
  dl: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><polyline points="7 10 12 15 17 10"/><path d="M5 21h14"/></svg>',
  apple: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.37 12.6c-.02-2.3 1.88-3.4 1.97-3.46-1.07-1.57-2.74-1.78-3.33-1.8-1.42-.14-2.77.83-3.49.83-.72 0-1.83-.81-3.01-.79-1.55.02-2.98.9-3.78 2.29-1.61 2.8-.41 6.93 1.16 9.2.77 1.11 1.68 2.36 2.88 2.31 1.16-.05 1.6-.75 3-.75 1.4 0 1.79.75 3.01.73 1.25-.02 2.04-1.13 2.8-2.25.88-1.29 1.24-2.54 1.26-2.6-.03-.01-2.42-.93-2.47-3.71zM14.1 5.85c.64-.78 1.07-1.85.95-2.92-.92.04-2.03.61-2.69 1.38-.59.68-1.11 1.78-.97 2.83 1.02.08 2.07-.52 2.71-1.29z"/></svg>',
  muted: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>',
  sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>'
};
function roleIcon(name) {
  var n = String(name).toLowerCase();
  if (/lead|manag|produc|quản lý|trưởng/.test(n)) return IC.team;
  if (/design/.test(n)) return IC.design;
  if (/art|vfx|anim/.test(n)) return IC.vfx;
  if (/ui|ux/.test(n)) return IC.ui;
  if (/perf|sdk|optim/.test(n)) return IC.gauge;
  return IC.code;
}

// ══════════════════════════════
// DERIVED DATA
// ══════════════════════════════
function contacts() {
  var c = CONFIG.profile.contact || {}, out = [];
  var gh = c.github || PACKAGES.map(function (p) { return (p.githubLink.match(/https?:\/\/github\.com\/[^/]+/) || [])[0]; }).filter(Boolean)[0];
  if (gh && !/^https?:/.test(gh)) gh = 'https://' + gh;
  if (c.email) out.push({ k: 'email', label: 'Email', href: 'mailto:' + c.email });
  if (c.linkedin) out.push({ k: 'linkedin', label: 'LinkedIn', href: c.linkedin });
  if (gh) out.push({ k: 'github', label: 'GitHub', href: gh });
  if (c.blog) out.push({ k: 'blog', label: 'Blog', href: c.blog });
  if (c.itchio) out.push({ k: 'itchio', label: 'itch.io', href: c.itchio });
  return out;
}
function socialHTML() {
  return contacts().map(function (s) {
    var ext = s.k !== 'email' ? ' target="_blank" rel="noopener"' : '';
    return '<a href="' + esc(s.href) + '"' + ext + ' aria-label="' + s.label + '" data-label="' + s.label + '">' + IC[s.k] + '</a>';
  }).join('');
}
function stat(re) { return (CONFIG.profile.stats || []).filter(function (s) { return re.test(loc(s.label)) || re.test(s.label.en || ''); })[0]; }
function sample(on) { return on ? ' <span class="sample">' + t('sample') + '</span>' : ''; }

// ── projects (one folder per project) ──
function pAsset(p, path) { return !path ? '' : isURL(path) ? path : PROJECTS_DIR + p.id + '/' + path; }
function ytId(p) { var y = (p.video || {}).youtube; return y && !/^VIDEO_ID/i.test(y) ? y : ''; }
function hasVideo(p) { return !!(ytId(p) || (p.video || {}).file); }
function isPortrait(p) { return (p.video || {}).orientation === 'portrait'; }
function posterOf(p) {
  if (p.poster) return pAsset(p, p.poster);
  var y = ytId(p);
  return y ? 'https://img.youtube.com/vi/' + y + '/hqdefault.jpg' : '';
}
function imgOrPh(p, src) {
  if (src) return '<img src="' + esc(src) + '" alt="" loading="lazy">';
  return '<div class="ph" style="background:linear-gradient(140deg,' + esc(p.accentColor || '#7c4dff') + ',#1a1030)">' + esc(String(p.title).charAt(0)) + '</div>';
}
function iconHTML(p) { return imgOrPh(p, p.icon ? pAsset(p, p.icon) : posterOf(p)); }
function rolesOf(p) { return (p.roles || []).map(function (r) { return loc(r.name); }).filter(Boolean); }
function projectURL(p) { return 'project.html?p=' + encodeURIComponent(p.id); }
function roleChips(p) {
  return '<div class="roles">' + rolesOf(p).map(function (r) { return '<span class="role"><i>' + roleIcon(r) + '</i>' + esc(r) + '</span>'; }).join('') + '</div>';
}
function storeButtons(p, cls) {
  var s = p.store || {}, h = '';
  if (s.googlePlay) h += '<a class="btn ' + cls[0] + '" href="' + esc(s.googlePlay) + '" target="_blank" rel="noopener">' + IC.gplay + t('google_play') + '</a>';
  if (s.appStore) h += '<a class="btn ' + cls[1] + '" href="' + esc(s.appStore) + '" target="_blank" rel="noopener">' + IC.apple + t('app_store') + '</a>';
  if (s.apk) h += isURL(s.apk)
    ? '<a class="btn ' + cls[1] + '" href="' + esc(s.apk) + '" target="_blank" rel="noopener">' + IC.dl + t('download_apk') + '</a>'
    : '<a class="btn ' + cls[1] + '" href="' + esc(pAsset(p, s.apk)) + '" download>' + IC.dl + t('download_apk') + '</a>'; // file inside the project folder
  return h;
}

// ══════════════════════════════
// VIDEO — autoplay in view, only one plays at a time
// ══════════════════════════════
var VM = { cur: null, muted: true, resume: null, hold: true }; // hold: no autoplay while the loader is up

// Video box markup. mode: 'row' (home preview) | 'hero' (project page). Both show player controls so viewers can seek.
function videoBox(p, mode) {
  var y = ytId(p), file = (p.video || {}).file, poster = posterOf(p);
  return '<div class="vbox" data-mode="' + mode + '" data-kind="' + (file ? 'file' : 'yt') + '" data-src="' + esc(file ? pAsset(p, file) : y) + '">' +
    '<div class="v-slot"></div>' +
    '<div class="v-poster">' + imgOrPh(p, poster) + '</div>' +
    '<span class="v-live">' + t('live') + '</span>' +
    '<button class="v-play" type="button" aria-label="' + t('play') + '">' + IC.play + '</button>' +
    '<button class="v-sound" type="button" aria-label="' + (VM.muted ? t('unmute') : t('mute')) + '">' + (VM.muted ? IC.muted : IC.sound) + '</button>' +
  '</div>';
}
function ytSrc(id) {
  return 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&mute=1&playsinline=1&loop=1&playlist=' + id +
    '&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1&controls=1' +
    '&origin=' + encodeURIComponent(location.origin);
}
function ytCmd(box, func) {
  var f = box._media;
  if (f && f.contentWindow) f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: [] }), '*');
}
function vmEnsure(box) {
  if (box._media) return box._media;
  var slot = box.querySelector('.v-slot'), el;
  if (box.dataset.kind === 'yt') {
    el = document.createElement('iframe');
    el.src = ytSrc(box.dataset.src);
    el.title = 'Video';
    el.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    el.setAttribute('allowfullscreen', '');
    el.addEventListener('load', function () {
      // The player needs a moment before it accepts commands; re-apply state a few times.
      [300, 900, 1800].forEach(function (ms) {
        setTimeout(function () {
          if (VM.cur === box) { ytCmd(box, VM.muted ? 'mute' : 'unMute'); ytCmd(box, 'playVideo'); }
          else ytCmd(box, 'pauseVideo');
        }, ms);
      });
      setTimeout(function () { box.classList.add('ready'); }, 700);
    });
  } else {
    el = document.createElement('video');
    el.src = box.dataset.src;
    el.loop = true; el.muted = true; el.playsInline = true; el.preload = 'auto';
    el.setAttribute('playsinline', '');
    el.controls = true;
    el.addEventListener('playing', function () { box.classList.add('ready', 'playing'); });
    el.addEventListener('pause', function () { box.classList.remove('playing'); });
    el.addEventListener('volumechange', function () { if (VM.cur === box && el.muted !== VM.muted) { VM.muted = el.muted; syncSound(); } });
  }
  slot.appendChild(el);
  box._media = el;
  return el;
}
function vmPlay(box) {
  if (!box) return;
  if (VM.cur && VM.cur !== box) vmPause(VM.cur);
  VM.cur = box;
  var m = vmEnsure(box);
  box.classList.add('started');
  if (box.dataset.kind === 'yt') {
    ytCmd(box, VM.muted ? 'mute' : 'unMute'); ytCmd(box, 'playVideo');
    box.classList.add('playing');
  } else {
    m.muted = VM.muted;
    var pr = m.play();
    if (pr && pr.catch) pr.catch(function () {
      // Unmuted autoplay blocked → fall back to muted.
      if (!m.muted) { VM.muted = true; m.muted = true; syncSound(); m.play().catch(function () {}); }
    });
  }
  syncSound();
}
function vmPause(box) {
  if (!box) return;
  if (box._media) { if (box.dataset.kind === 'yt') ytCmd(box, 'pauseVideo'); else box._media.pause(); }
  box.classList.remove('playing');
  if (VM.cur === box) VM.cur = null;
}
function vmToggleSound(box) {
  VM.muted = !VM.muted;
  if (VM.cur !== box) vmPlay(box);
  else if (box._media) { if (box.dataset.kind === 'yt') ytCmd(box, VM.muted ? 'mute' : 'unMute'); else box._media.muted = VM.muted; }
  syncSound();
}
function syncSound() {
  document.querySelectorAll('.v-sound').forEach(function (b) {
    var on = !VM.muted && b.closest('.vbox') === VM.cur;
    b.innerHTML = on ? IC.sound : IC.muted;
    b.setAttribute('aria-label', on ? t('mute') : t('unmute'));
  });
}
// Pick the most visible box (≥ 60%) and play it; pause the current one once it scrolls away.
var vmIO = null, vmRatios = new Map();
function observeVideos() {
  if (vmIO) vmIO.disconnect();
  vmRatios.clear();
  if (VM.cur && !document.body.contains(VM.cur)) VM.cur = null;
  vmIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) { vmRatios.set(e.target, e.intersectionRatio); });
    var lbEl = $('lb');
    if (VM.hold || document.hidden || (lbEl && !lbEl.hidden)) return;
    var best = null, br = 0;
    vmRatios.forEach(function (r, box) { if (r > br) { br = r; best = box; } });
    if (VM.cur && (vmRatios.get(VM.cur) || 0) < 0.2) vmPause(VM.cur);
    if (!REDUCED && best && br >= 0.6 && best !== VM.cur) vmPlay(best);
  }, { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] });
  document.querySelectorAll('.vbox').forEach(function (b) { vmIO.observe(b); });
}

// ══════════════════════════════
// SHARED RENDER
// ══════════════════════════════
function renderShell() {
  var p = CONFIG.profile;
  document.documentElement.lang = lang;
  document.querySelectorAll('.lang button').forEach(function (b) { b.classList.toggle('on', b.dataset.lang === lang); b.setAttribute('aria-pressed', b.dataset.lang === lang); });
  document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(function (el) { el.innerHTML = t(el.dataset.i18nHtml); });
  if (p.brand) $('navBrand').innerHTML = brandHTML(p.brand);
  $('drawerSoc').innerHTML = '<div class="socials" style="margin:0">' + socialHTML() + '</div>';
  var email = (p.contact || {}).email || '';
  $('mailTxt').textContent = email;
  $('mailBtn').href = 'mailto:' + email;
  $('contactSoc').innerHTML = socialHTML();
  $('footL').textContent = '© ' + new Date().getFullYear() + ' ' + p.name;
}

// "TRAN VAN TIEN - [NIX]" → name + separator + bracketed tag (the name hides on small screens)
function brandHTML(s) {
  var m = String(s).match(/^(.*?)\s*(?:[-–—|]\s*)?\[([^\]]+)\]\s*$/);
  if (!m) return '<span class="brand-name">' + esc(s) + '</span>';
  return (m[1] ? '<span class="brand-name">' + esc(m[1]) + '</span><span class="brand-sep"> - </span>' : '') + '<b>[</b>' + esc(m[2]) + '<b>]</b>';
}

function renderAll() {
  var playing = VM.cur;
  if (playing) vmPause(playing);
  renderShell();
  if (PAGE === 'home') {
    renderHero(); renderWork();
    if (sectionOn('skills')) renderSkills();
    if (sectionOn('experience')) renderExperience();
  } else renderProject();
  applySections();
  observeReveal();
  observeVideos();
}

// ══════════════════════════════
// HOME
// ══════════════════════════════
function renderHero() {
  var p = CONFIG.profile, dl = stat(/download/i) || { value: '' };
  var name = p.name.replace(/\s*-?\s*\[.*?\]\s*/, '').trim();
  $('heroStatus').textContent = (p.status === 'available' ? t('available') : loc(p.statusLabel)) + ' · ' + (p.location || '');
  var h1 = t('h1', { n: esc(dl.value) });
  $('heroH1').innerHTML = /<[a-z]/i.test(h1) ? h1 : headline(h1);
  $('heroBio').textContent = loc(p.bio);
  $('cvBtn').hidden = !p.cv; if (p.cv) $('cvBtn').href = p.cv;
  $('ctaContact').hidden = !!p.cv;
  $('heroSoc').innerHTML = socialHTML();
  renderNowCard(p, name);
  $('strip').innerHTML = (p.stats || []).map(function (s) {
    var m = String(s.value).match(/^(\d+)(.*)$/);
    var val = m ? '<span data-to="' + m[1] + '">' + m[1] + '</span><em>' + esc(m[2]) + '</em>' : esc(s.value);
    return '<div><b>' + val + '</b><span>' + esc(loc(s.label)) + '</span></div>';
  }).join('');
}

// Plain-text headline "Name [TAG] - Subtitle" → name lockup (tag pill + small subtitle).
function headline(s) {
  var m = String(s).match(/^(.*?)\s*(\[[^\]]+\])?\s*(?:[-–—|]\s*(.+))?$/) || [s, s];
  var name = (m[1] || s).trim(), tag = m[2], sub = m[3];
  return '<span class="h1-name">' + esc(name) + '</span>' +
    (tag || sub ? '<span class="h1-meta">' + (tag ? '<span class="h1-tag">' + esc(tag) + '</span>' : '') +
      (tag && sub ? '<i class="h1-sep" aria-hidden="true"></i>' : '') + (sub ? '<span class="h1-sub">' + esc(sub) + '</span>' : '') + '</span>' : '');
}

// Hero card: avatar + what I'm open to (profile.now).
function renderNowCard(p, name) {
  $('pcImg').src = p.avatar; $('pcImg').alt = name;
  $('pcRows').innerHTML = (p.now || []).map(function (r) { return '<div><span>' + esc(loc(r.label)) + '</span><b>' + esc(loc(r.value)) + '</b></div>'; }).join('');
}

// Sections that can be switched off in web-config.json → "sections": { "skills": false, ... }
function sectionOn(id) { return ((CONFIG && CONFIG.sections) || {})[id] !== false; }
function applySections() {
  ['skills', 'experience'].forEach(function (id) {
    var on = sectionOn(id), sec = $(id);
    if (sec && !on) sec.hidden = true;
    document.querySelectorAll('a[href="#' + id + '"], a[href="index.html#' + id + '"]').forEach(function (a) { if (!on) a.parentNode.hidden = true; });
  });
}

function renderWork() {
  var list = PROJECTS;
  $('prjList').innerHTML = list.map(function (p, i) {
    var url = projectURL(p), portrait = hasVideo(p) && isPortrait(p);
    var tagline = loc(p.tagline) || loc(p.overview);
    var facts = [];
    if (p.platform) facts.push([t('platform'), p.platform]);
    if (p.year) facts.push([t('year'), p.year]);
    var contrib = [];
    (p.roles || []).forEach(function (r) { var a = locArr(r.did); if (a[0]) contrib.push(a[0]); });
    var media = hasVideo(p)
      ? (portrait ? '<div class="backdrop">' + imgOrPh(p, posterOf(p)) + '</div><div class="phone">' + videoBox(p, 'row') + '</div>' : videoBox(p, 'row'))
      : '<div class="vbox-static">' + imgOrPh(p, posterOf(p)) + '</div>';
    return '<article class="prj rv' + (i % 2 ? ' rev' : '') + (portrait ? ' portrait' : '') + '">' +
      '<div class="prj-media' + (portrait ? ' portrait' : '') + '">' + media +
        '<a class="prj-hit" href="' + url + '" aria-label="' + esc(p.title) + '"></a>' +
        (p.downloads ? '<span class="dlb">' + esc(p.downloads) + '<small>' + t('downloads').toUpperCase() + '</small></span>' : '') + '</div>' +
      '<div class="prj-body">' +
        '<h3><a href="' + url + '">' + esc(p.title) + '</a></h3>' +
        '<p class="tagline">' + (tagline ? esc(tagline) + sample(p.placeholder) : '<span class="muted">' + t('no_desc') + '</span>') + '</p>' +
        roleChips(p) +
        (facts.length ? '<dl class="facts">' + facts.map(function (f) { return '<div><dt>' + f[0] + '</dt><dd>' + esc(f[1]) + '</dd></div>'; }).join('') + '</dl>' : '') +
        (contrib.length ? '<div class="prj-k">' + t('key_contrib') + '</div><ul class="did">' + contrib.map(function (c) { return '<li><span>' + esc(c) + '</span></li>'; }).join('') + '</ul>' : '') +
        '<div class="cta"><a class="btn btn-pri btn-sm" href="' + url + '">' + t('read_more') + ' →</a>' + storeButtons(p, ['btn-ghost btn-sm', 'btn-ghost btn-sm']) + '</div>' +
      '</div></article>';
  }).join('');
}

function renderSkills() {
  $('bento').innerHTML = SKILLS.map(function (g) {
    return '<div class="spot bx w2 rv"><h4>' + esc(g.name) + '</h4><div class="chips">' + g.items.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div></div>';
  }).join('');
  // link only to an actual repo, not the bare profile
  var repo = function (u) { return /github\.com\/[^/]+\/[^/]+/.test(u) ? u : ''; };
  $('pkgsT').hidden = !PACKAGES.length;
  $('pkgs').innerHTML = PACKAGES.map(function (k) {
    var u = repo(k.githubLink);
    return '<div class="pk rv"><b>' + esc(k.title) + '</b><span>' + esc(loc(k.line)) + '</span>' +
      (u ? '<a href="' + esc(u) + '" target="_blank" rel="noopener" aria-label="GitHub: ' + esc(k.title) + '">' + IC.github + '</a>' : '') + '</div>';
  }).join('');
}

function renderExperience() {
  var xs = CONFIG.experience || [];
  $('experience').hidden = !xs.length;
  document.querySelectorAll('a[href="#experience"]').forEach(function (a) { a.parentNode.hidden = !xs.length; });
  $('timeline').innerHTML = xs.map(function (x) {
    return '<div class="spot tl-item rv' + (x.current ? ' cur' : '') + '">' +
      '<div class="tl-head"><h4>' + esc(loc(x.role)) + (x.org && x.org !== '—' ? ' · <span>' + esc(x.org) + '</span>' : '') + '<span class="now">● ' + t('now') + '</span></h4>' +
      '<span class="per">' + esc(loc(x.period)) + sample(x.placeholder) + '</span></div>' +
      '<p>' + esc(loc(x.desc)) + '</p>' +
      (x.tags && x.tags.length ? '<div class="meta">' + x.tags.map(function (tg) { return '<span class="tag">' + esc(tg) + '</span>'; }).join('') + '</div>' : '') +
    '</div>';
  }).join('');
}

// ══════════════════════════════
// PROJECT PAGE
// ══════════════════════════════
var GALLERY = [];
function currentProject() {
  var q = new URLSearchParams(location.search), id = q.get('p');
  for (var i = 0; i < PROJECTS.length; i++) if (PROJECTS[i].id === id) return { p: PROJECTS[i], i: i };
  // hidden projects are only reachable as a draft preview (Studio's "open page" link adds &draft)
  if (q.has('draft')) for (var j = 0; j < ALL_PROJECTS.length; j++) if (ALL_PROJECTS[j].id === id) return { p: ALL_PROJECTS[j], i: -1, draft: true };
  return null;
}
function renderProject() {
  var cur = currentProject();
  if (!cur) {
    $('pjRoot').innerHTML = '';
    $('pjBody').innerHTML = '<div class="empty" style="margin-top:160px">' + t('not_found') + ' <a href="index.html#work" style="color:var(--cyan)">' + t('back_home') + ' →</a></div>';
    return;
  }
  var p = cur.p, ph = !!p.placeholder, vid = hasVideo(p), portrait = vid && isPortrait(p);
  document.title = p.title + ' — ' + CONFIG.profile.name;
  var tagline = loc(p.tagline) || loc(p.overview);

  // HERO — blurred poster backdrop; portrait video sits beside the title in a phone frame
  var info =
    '<div class="pj-info">' +
      '<a class="back" href="index.html#work">← ' + t('all_projects') + '</a>' +
      (cur.draft ? ' <span class="sample draft">' + t('draft_note') + '</span>' : '') +
      '<div class="pj-title rv in"><div class="pj-icon">' + iconHTML(p) + '</div><div>' +
        '<div class="sh-k" style="margin-bottom:8px">' + esc(p.studio) + '</div><h1>' + esc(p.title) + '</h1></div></div>' +
      '<p class="tagline">' + (tagline ? esc(tagline) + sample(ph) : '<span class="muted">' + t('no_desc') + '</span>') + '</p>' +
      roleChips(p) +
      '<div class="cta">' + storeButtons(p, ['btn-pri', 'btn-ghost']) +
        (vid ? '<button class="btn btn-ghost" type="button" id="watchBtn">🔊 ' + t('watch') + '</button>' : '') + '</div>' +
    '</div>';
  $('pjRoot').innerHTML =
    '<header class="pj-hero">' +
      '<div class="pj-banner">' + imgOrPh(p, posterOf(p)) + '</div>' +
      '<div class="wrap pj-head' + (portrait ? ' has-phone' : '') + '">' + info +
        (portrait ? '<div class="pj-phone"><div class="phone">' + videoBox(p, 'hero') + '</div></div>' : '') +
      '</div>' +
    '</header>';

  // BODY
  var h = '';
  if (vid && !portrait) h += '<div class="pj-player rv in">' + videoBox(p, 'hero') + '</div>';
  var stats = [];
  if (p.downloads) stats.push(['<b class="g">' + esc(p.downloads) + '</b>', t('downloads')]);
  if (p.team) stats.push(['<b>' + esc(t('people', { n: p.team })) + '</b>', loc(p.teamDetail) ? '<em class="raw">' + esc(loc(p.teamDetail)) + '</em>' : t('team')]);
  if (p.duration) stats.push(['<b>' + esc(loc(p.duration)) + '</b>', t('duration')]);
  if (p.engine) stats.push(['<b>' + esc(p.engine) + '</b>', t('engine')]);
  if (p.year) stats.push(['<b>' + esc(p.year) + '</b>', t('year')]);
  if (stats.length) h += '<div class="pj-stats rv">' + stats.map(function (s) { return '<div>' + s[0] + '<span>' + s[1] + '</span></div>'; }).join('') + '</div>';

  var n = 1, num = function () { return String(n++).padStart(2, '0'); };
  if (loc(p.overview)) h += '<section class="pj-sec rv"><h2><small>' + num() + '</small>' + t('overview') + '</h2><p class="overview">' + esc(loc(p.overview)) + sample(ph) + '</p></section>';

  // responsibilities (per role)
  var roles = (p.roles || []).filter(function (r) { return locArr(r.did).length; });
  h += '<section class="pj-sec" id="roles"><h2 class="rv"><small>' + num() + '</small>' + t('resp') + (roles.length ? ' <span class="cnt">' + t('roles_n', { n: roles.length }) + '</span>' : '') + '</h2>';
  if (roles.length) {
    h += roles.map(function (r, i) {
      return '<article class="spot role-card rv" id="role-' + i + '">' +
        '<div class="rc-head"><div class="rc-icon">' + roleIcon(loc(r.name)) + '</div><div><h3>' + esc(loc(r.name)) + sample(ph) + '</h3>' + (r.summary ? '<p>' + esc(loc(r.summary)) + '</p>' : '') + '</div><span class="rc-n">' + String(i + 1).padStart(2, '0') + '</span></div>' +
        '<ul class="did rc-list">' + locArr(r.did).map(function (x) { return '<li><span>' + esc(x) + '</span></li>'; }).join('') + '</ul>' +
      '</article>';
    }).join('');
  } else {
    h += roleChips(p).replace('class="roles"', 'class="roles rv"') + '<div class="empty rv">' + t('details_soon') + '</div>';
  }
  h += '</section>';

  var learned = (p.learned || []).filter(function (l) { return loc(l.title) || locArr(l.text).length; });
  if (learned.length) {
    h += '<section class="pj-sec" id="learned"><h2 class="rv"><small>' + num() + '</small>' + t('what_learned') + '</h2><div class="learn">' + learned.map(function (l, i) {
      return '<div class="spot lc rv"><span class="lc-n">' + String(i + 1).padStart(2, '0') + '</span><h4>' + esc(loc(l.title)) + sample(ph) + '</h4><ul class="did">' + locArr(l.text).map(function (x) { return '<li><span>' + esc(x) + '</span></li>'; }).join('') + '</ul></div>';
    }).join('') + '</div></section>';
  }

  GALLERY = (p.screenshots || []).map(function (g, i) {
    var src = typeof g === 'string' ? g : g.src;
    return { img: pAsset(p, src), cap: (typeof g === 'object' && loc(g.caption)) || '', alt: t('screenshot') + ' ' + (i + 1) };
  });
  if (GALLERY.length) {
    h += '<section class="pj-sec"><h2 class="rv"><small>' + num() + '</small>' + t('gallery') + '</h2><div class="gallery rv">' + GALLERY.map(function (g, i) {
      return '<button type="button" data-lb="' + i + '"><img src="' + esc(g.img) + '" alt="' + esc(g.cap || g.alt) + '" loading="lazy">' + (g.cap ? '<span>' + esc(g.cap) + '</span>' : '') + '</button>';
    }).join('') + '</div></section>';
  }
  var chal = (p.challenges || []).filter(function (c) { return loc(c.title) || loc(c.problem) || loc(c.solution); });
  if (chal.length) {
    h += '<section class="pj-sec"><h2 class="rv"><small>' + num() + '</small>' + t('challenges') + '</h2><div class="chal">' + chal.map(function (c) {
      return '<div class="spot ch rv"><h4>' + esc(loc(c.title)) + sample(ph) + '</h4><dl><dt class="p">' + t('problem') + '</dt><dd>' + esc(loc(c.problem)) + '</dd><dt class="s">' + t('solution') + '</dt><dd>' + esc(loc(c.solution)) + '</dd></dl></div>';
    }).join('') + '</div></section>';
  }
  var res = (p.results || []).filter(function (r) { return r.value || loc(r.label); });
  if (res.length) {
    h += '<section class="pj-sec"><h2 class="rv"><small>' + num() + '</small>' + t('results') + '</h2><div class="results">' + res.map(function (r) {
      return '<div class="rv"><b>' + esc(r.value) + '</b><span>' + esc(loc(r.label)) + '</span></div>';
    }).join('') + '</div></section>';
  }

  var L = PROJECTS, prev = L[(cur.i - 1 + L.length) % L.length], next = L[(cur.i + 1) % L.length];
  if (cur.i >= 0 && L.length > 1) h += '<div class="pager" role="navigation">' +
    '<a class="spot rv" href="' + projectURL(prev) + '"><div class="pg-ic">' + iconHTML(prev) + '</div><div><small>← ' + t('prev_p') + '</small><b>' + esc(prev.title) + '</b></div></a>' +
    '<a class="spot nx rv" href="' + projectURL(next) + '"><div class="pg-ic">' + iconHTML(next) + '</div><div><small>' + t('next_p') + ' →</small><b>' + esc(next.title) + '</b></div></a></div>';
  $('pjBody').innerHTML = h;

  var wb = $('watchBtn');
  if (wb) wb.onclick = function () {
    var box = document.querySelector('.vbox');
    box.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' });
    VM.muted = false; vmPlay(box);
  };
}

// ── lightbox (screenshots) ──
var LB = { i: 0, opener: null };
function lbShow() {
  var g = GALLERY[LB.i];
  $('lbStage').innerHTML = '<img src="' + esc(g.img) + '" alt="' + esc(g.cap || g.alt) + '">';
  $('lbCap').textContent = (g.cap ? g.cap + ' · ' : '') + (LB.i + 1) + ' / ' + GALLERY.length;
  $('lbPrev').hidden = $('lbNext').hidden = GALLERY.length < 2;
}
function lbOpen(i, opener) {
  if (!GALLERY.length) return;
  LB.i = i; LB.opener = opener; lbShow();
  var lb = $('lb'); lb.hidden = false; document.body.classList.add('lock');
  requestAnimationFrame(function () { lb.classList.add('open'); });
  $('lbClose').focus();
}
function lbClose() {
  var lb = $('lb'); if (lb.hidden) return;
  lb.classList.remove('open'); document.body.classList.remove('lock');
  setTimeout(function () { lb.hidden = true; $('lbStage').innerHTML = ''; }, REDUCED ? 0 : 300);
  if (LB.opener) LB.opener.focus({ preventScroll: true });
}
function lbStep(d) { LB.i = (LB.i + d + GALLERY.length) % GALLERY.length; lbShow(); }

// ══════════════════════════════
// REVEAL + COUNT UP
// ══════════════════════════════
var revealIO = null, booted = false;
function countUp(el) {
  if (el.dataset.done) return; el.dataset.done = '1';
  var to = +el.dataset.to; if (REDUCED || !to) { el.textContent = to; return; }
  var t0 = null;
  (function s(ts) { if (!t0) t0 = ts; var p = Math.min((ts - t0) / 1300, 1); el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * to); if (p < 1) requestAnimationFrame(s); })(performance.now());
}
function observeReveal() {
  if (revealIO) revealIO.disconnect();
  revealIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('[data-to]').forEach(countUp);
      revealIO.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.rv').forEach(function (el, i) {
    if (booted) el.classList.add('in'); // re-render (language switch): show instantly
    if (el.classList.contains('in')) { el.querySelectorAll('[data-to]').forEach(function (n) { n.dataset.done = '1'; }); return; }
    el.style.transitionDelay = ((i % 4) * 0.06) + 's';
    revealIO.observe(el);
  });
}

// ══════════════════════════════
// TOAST
// ══════════════════════════════
var toastT = null;
function toast(msg) { var el = $('toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('show'); }, 2400); }

function trapTab(e, root) {
  var f = [].slice.call(root.querySelectorAll('a[href],button:not([hidden]),[tabindex="0"]')).filter(function (x) { return x.offsetParent !== null; });
  if (!f.length) return;
  var first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

// ══════════════════════════════
// INTERACTIONS
// ══════════════════════════════
function bindStatic() {
  document.addEventListener('click', function (e) {
    var vp = e.target.closest('.v-play');
    if (vp) { vmPlay(vp.closest('.vbox')); return; }
    var vs = e.target.closest('.v-sound');
    if (vs) { vmToggleSound(vs.closest('.vbox')); return; }
    var lb = e.target.closest('[data-lb]');
    if (lb) { lbOpen(+lb.dataset.lb, lb); return; }
    if (e.target === $('lb')) lbClose();
  });
  document.addEventListener('keydown', function (e) {
    var lbx = $('lb');
    if (lbx && !lbx.hidden) {
      if (e.key === 'Escape') lbClose();
      else if (e.key === 'ArrowLeft') lbStep(-1);
      else if (e.key === 'ArrowRight') lbStep(1);
      else if (e.key === 'Tab') trapTab(e, lbx);
      return;
    }
    if (e.key === 'Escape' && $('drawer').classList.contains('open')) toggleDrawer(false);
  });
  if ($('lb')) {
    $('lbPrev').onclick = function () { lbStep(-1); };
    $('lbNext').onclick = function () { lbStep(1); };
    $('lbClose').onclick = lbClose;
    var sx = null;
    $('lb').addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    $('lb').addEventListener('touchend', function (e) { if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 60) lbStep(dx < 0 ? 1 : -1); sx = null; });
  }

  // Pause when the tab is hidden; resume when back.
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { VM.resume = VM.cur; vmPause(VM.cur); }
    else if (VM.resume && document.body.contains(VM.resume)) { vmPlay(VM.resume); VM.resume = null; }
  });

  document.querySelectorAll('.lang button').forEach(function (b) {
    b.onclick = function () {
      if (lang === b.dataset.lang) return;
      lang = b.dataset.lang; try { localStorage.setItem('nix-lang', lang); } catch (e) {}
      renderAll();
    };
  });

  $('copyBtn').onclick = function () {
    var email = (CONFIG.profile.contact || {}).email || '', btn = this;
    var done = function () { toast(t('copied')); btn.textContent = '✓'; setTimeout(function () { btn.textContent = t('copy'); }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(email).then(done, function () { location.href = 'mailto:' + email; });
    else location.href = 'mailto:' + email;
  };

  $('burger').onclick = function () { toggleDrawer(!$('drawer').classList.contains('open')); };
  $('drawer').addEventListener('click', function (e) { if (e.target.closest('a')) toggleDrawer(false); });
  $('totop').onclick = function () { window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }); };

  if (window.matchMedia('(hover: hover)').matches && !REDUCED) {
    var glow = $('glow');
    document.addEventListener('pointermove', function (e) {
      glow.style.setProperty('--mx', e.clientX + 'px'); glow.style.setProperty('--my', e.clientY + 'px');
      var c = e.target.closest && e.target.closest('.spot');
      if (c) { var r = c.getBoundingClientRect(); c.style.setProperty('--x', (e.clientX - r.left) + 'px'); c.style.setProperty('--y', (e.clientY - r.top) + 'px'); }
    }, { passive: true });
    var pc = $('pcard');
    if (pc) {
      pc.addEventListener('pointermove', function (e) {
        var r = pc.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        pc.style.setProperty('--ry', ((x - 0.5) * 14) + 'deg'); pc.style.setProperty('--rx', (-(y - 0.5) * 14) + 'deg');
        pc.style.setProperty('--gx', (x * 100) + '%'); pc.style.setProperty('--gy', (y * 100) + '%');
      });
      pc.addEventListener('pointerleave', function () { pc.style.setProperty('--ry', '0deg'); pc.style.setProperty('--rx', '0deg'); });
    }
  }

  var ticking = false;
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  function onScroll() {
    ticking = false;
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight, p = h > 0 ? y / h : 0;
    var nav = $('nav');
    nav.classList.toggle('scrolled', y > 20);
    $('scrollProg').style.width = (p * 100) + '%';
    $('totop').classList.toggle('show', y > 600);
    $('totopRing').style.strokeDashoffset = 125.7 * (1 - p);
    if (PAGE === 'home') {
      var cur = null;
      ['work', 'skills', 'experience', 'contact'].forEach(function (id) { var s = $(id); if (s && !s.hidden && s.getBoundingClientRect().top < innerHeight * 0.4) cur = id; });
      document.querySelectorAll('.links a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + cur); });
      var tl = $('timeline');
      if (tl && tl.offsetParent) {
        var r = tl.getBoundingClientRect(), mid = innerHeight * 0.6, tp = Math.min(Math.max((mid - r.top) / r.height, 0), 1);
        tl.style.setProperty('--tl', (tp * 100) + '%');
        tl.querySelectorAll('.tl-item').forEach(function (it) { it.classList.toggle('lit', it.getBoundingClientRect().top + 30 < mid); });
      }
    }
  }
  onScroll();
}

function toggleDrawer(open) {
  $('drawer').classList.toggle('open', open);
  $('drawer').setAttribute('aria-hidden', !open);
  $('burger').setAttribute('aria-expanded', open);
  document.body.classList.toggle('lock', open);
}

// ══════════════════════════════
// LOADER — "Warp": stars streak toward the viewer, speeding up with progress;
// on finish it jumps to max speed, flashes, and reveals the page.
// ══════════════════════════════
// transition timings (ms) — also drive the matching CSS durations via --ld-* variables
var LD_TIME = {
  cover: 150,   // loader fades in over the current page before navigating away
  boost: 80,    // stars jump to max speed before the reveal starts
  reveal: 250,  // loader fades out
  pageIn: 400   // page content scales/fades in
};
function warpLoader(ld) {
  Object.keys(LD_TIME).forEach(function (k) { document.documentElement.style.setProperty('--ld-' + k, LD_TIME[k] + 'ms'); });
  var cv = $('ldWarp'), ctx = cv.getContext('2d'), pct = $('ldPct');
  var W = 0, H = 0, stars = [], speed = 0, target = 2, raf = 0, running = false;
  var fromNav = ld.classList.contains('nav'); // arrived from another page of this site → no intro
  try { sessionStorage.removeItem('nix-warp'); } catch (e) {}
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function loop() {
    speed += (target - speed) * 0.05;
    ctx.fillStyle = 'rgba(7,9,15,0.35)'; ctx.fillRect(0, 0, W, H); // trails fade into --bg (#07090f), same as the page
    var cx = W / 2, cy = H / 2, f = Math.max(W, H) * 0.25;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i], pz = s.z;
      s.z -= 0.0025 * speed;
      if (s.z <= 0.02) { s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; s.z = 1; pz = 1; }
      var b = 1 - s.z;
      ctx.strokeStyle = b > 0.7 ? '#bff8ff' : 'rgba(0,229,255,' + b + ')'; ctx.lineWidth = b * 2.4;
      ctx.beginPath(); ctx.moveTo(cx + s.x / pz * f, cy + s.y / pz * f); ctx.lineTo(cx + s.x / s.z * f, cy + s.y / s.z * f); ctx.stroke();
    }
    raf = requestAnimationFrame(loop);
  }
  function start(sp, tg) {
    speed = sp; target = tg;
    if (REDUCED || running) return;
    running = true; resize(); addEventListener('resize', resize); loop();
  }
  function stop() { running = false; cancelAnimationFrame(raf); removeEventListener('resize', resize); }
  for (var i = 0; i < 420; i++) stars.push({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() });
  // intro: stars accelerate from rest (CSS fades the canvas + logo in); via in-site nav they're already at speed
  start(fromNav ? 10 : 0, fromNav ? 10 : 2);

  return {
    progress: function (v) { target = 2 + v * 14; pct.textContent = Math.round(v * 100) + '%'; },
    // reveal the page: boost → fade out with a soft glow while the page scales in
    exit: function (onDone) {
      if (REDUCED) { ld.className = 'done'; stop(); if (onDone) onDone(); return; }
      target = 40; ld.classList.add('boost');
      setTimeout(function () { ld.classList.add('out'); document.body.classList.add('page-in'); }, LD_TIME.boost);
      setTimeout(function () { ld.className = 'done'; stop(); if (onDone) onDone(); }, LD_TIME.boost + LD_TIME.reveal);
      setTimeout(function () { document.body.classList.remove('page-in'); }, LD_TIME.boost + LD_TIME.pageIn + 100);
    },
    // cover the current page before navigating to another page of the site
    cover: function (go) {
      if (REDUCED) { go(); return; }
      try { sessionStorage.setItem('nix-warp', '1'); sessionStorage.setItem('nix-scroll:' + location.pathname + location.search, String(Math.round(scrollY))); } catch (e) {}
      ld.className = 'cover-pre'; void ld.offsetWidth; ld.className = 'cover';
      start(4, 14);
      setTimeout(go, LD_TIME.cover + 20);
    },
    // page restored from the back/forward cache while covered: keep the stars moving and reveal normally
    resume: function () {
      if (REDUCED) { ld.className = 'done'; return; }
      ld.className = 'nav'; start(12, 12);
      var self = this; setTimeout(function () { self.exit(); }, 450);
    },
    stop: stop
  };
}

// In-site links (home ↔ project pages) play the warp cover before leaving the page.
function bindPageTransitions(warp) {
  window.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    var url = new URL(a.getAttribute('href'), location.href);
    if (url.origin !== location.origin || !/(^|\/)(index\.html|project\.html)?$/.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.search === location.search) return; // same page (e.g. #section)
    e.preventDefault();
    warp.cover(function () { location.href = url.href; });
  });
  // Coming back with the Back button restores the page from cache — make sure the cover is gone.
  window.addEventListener('pageshow', function (e) { if (e.persisted && !ld().classList.contains('done')) warp.resume(); });
  function ld() { return $('loader'); }
}

// ══════════════════════════════
// BOOT
// ══════════════════════════════
function boot() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  var ld = $('loader'), warp = warpLoader(ld), got = 0, total = 4, t0 = Date.now();
  try { var saved = localStorage.getItem('nix-lang'); if (saved === 'en' || saved === 'vi') lang = saved; else throw 0; }
  catch (e) { lang = (navigator.language || 'en').toLowerCase().indexOf('vi') === 0 ? 'vi' : 'en'; }
  function tick(v) { got++; warp.progress(Math.min(got / total, 1)); return v; }
  function get(path, type) {
    return fetch(path).then(function (r) { if (!r.ok) throw new Error(path + ': ' + r.status); return type === 'json' ? r.json() : r.text(); }).then(tick);
  }
  function loadProjects() {
    return get(PROJECTS_DIR + 'index.json', 'json').then(function (ids) {
      total += ids.length;
      return Promise.all(ids.map(function (id) {
        return get(PROJECTS_DIR + id + '/data.json', 'json').then(function (d) { d.id = id; return d; })
          .catch(function (err) { console.warn('Skipping project', id, err); return null; });
      }));
    }).then(function (list) { return list.filter(Boolean); });
  }
  Promise.all([
    get('web-config.json', 'json'),
    get('Database/skills.md'),
    get('Database/packages.md').catch(function () { return ''; }),
    loadProjects()
  ]).then(function (res) {
    CONFIG = res[0]; SKILLS = parseSkills(res[1]); PACKAGES = parsePackages(res[2]);
    ALL_PROJECTS = res[3]; PROJECTS = ALL_PROJECTS.filter(function (p) { return p.publish !== false; }); // "publish": false hides a project
    renderAll();
    bindStatic();
    booted = true;
    warp.progress(1);
    bindPageTransitions(warp);
    // content is rendered dynamically, so jump to #section ourselves
    var nav = performance.getEntriesByType('navigation')[0], saved = null;
    try { saved = sessionStorage.getItem('nix-scroll:' + location.pathname + location.search); } catch (e) {}
    if (nav && nav.type === 'back_forward' && saved != null) window.scrollTo({ top: +saved, behavior: 'instant' });
    else if (location.hash) { var target = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (target) target.scrollIntoView({ behavior: 'instant' }); }
    // let layout/paint settle (two frames) before starting the reveal, then allow video autoplay
    // fresh visit: reveal as soon as data is ready; arriving from another page: a short beat
    var wait = Math.max(0, (ld.classList.contains('nav') ? 200 : 0) - (Date.now() - t0));
    setTimeout(function () {
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        warp.exit(function () { VM.hold = false; observeVideos(); });
      }); });
    }, wait);
  }).catch(function (err) {
    console.error(err);
    warp.stop(); ld.className = 'err';
    ld.innerHTML = '<div class="ld-logo"><b>[</b>NIX<b>]</b></div><div class="ld-err">⚠ ' + t('err') + '<br><br>Serve the site over HTTP (e.g. <b>python3 -m http.server</b>) — browsers block fetch() on file://.<br><br><span style="color:#6b7690">' + esc(err.message) + '</span></div>';
  });
}
boot();
})();
