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

var CONFIG = null, SKILLS = [], PACKAGES = [], PROJECTS = [];
var lang = 'en';
var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ══════════════════════════════
// UI STRINGS
// ══════════════════════════════
var UI = {
  en: {
    skip: 'Skip to content', nav_work: 'Projects', nav_experience: 'Experience', nav_skills: 'Skills', nav_contact: 'Contact',
    hire: 'Hire me', view_work: 'View my projects', download_cv: 'Download CV', contact_me: 'Contact me',
    h1: 'I build games<br>played by <span class="grad">{n}</span> people.',
    installs: 'installs', shipped: '{n} games shipped', available: 'Available',
    skills_k: 'SKILL TREE', skills_t: 'What I bring to a team', skills_p: 'Ranked like a game character — click a skill to inspect it.',
    also: 'Also worked with', also_p: 'Low-level background that shapes how I think about memory and rendering.',
    lead_t: 'Leadership & Training', lead_p: 'Leading a dev team, mentoring juniors, and building shared frameworks so every new project starts ahead.',
    proficiency: 'Proficiency', skill: 'Skill',
    exp_k: 'EXPERIENCE', exp_t: 'Quest log', exp_p: "Roles I've played — and what I brought to each team.", now: 'NOW',
    work_k: 'PROJECTS', work_t: "Games in players' hands", work_p: 'Every game I shipped and the roles I played — open one to see my responsibilities and what I learned.',
    read_more: 'Read more', google_play: 'Google Play', app_store: 'App Store',
    platform: 'Platform', engine: 'Engine', downloads: 'Downloads', studio: 'Studio', team: 'Team', duration: 'Duration', year: 'Year',
    people: '{n} people', key_contrib: 'Key contributions', view_case: 'View case study',
    no_desc: 'Detailed write-up coming soon.',
    all_projects: 'All projects', watch: 'Watch with sound', overview: 'Overview', resp: 'Responsibilities', roles_n: '{n} roles',
    what_learned: 'What I learned', gallery: 'Screenshots', screenshot: 'Screenshot',
    challenges: 'Challenges & solutions', problem: 'Problem', solution: 'Solution', results: 'Results',
    prev_p: 'Previous project', next_p: 'Next project', not_found: 'Project not found.', back_home: 'Back to all projects',
    details_soon: 'A detailed breakdown of my responsibilities in this project is coming soon.',
    play: 'Play video', unmute: 'Unmute', mute: 'Mute', live: 'PLAYING',
    contact_t: "Let's build something<br>players will love.", contact_p: 'Open to new roles, collaborations and Unity training.',
    copy: 'Copy', copied: 'Email copied to clipboard', send: 'Send', term: '// OPEN TO OPPORTUNITIES',
    built: 'Built with ☕ in {city}', sample: 'sample data', err: 'Could not load data files.', booting: 'LOADING…'
  },
  vi: {
    skip: 'Bỏ qua tới nội dung', nav_work: 'Dự án', nav_experience: 'Kinh nghiệm', nav_skills: 'Kỹ năng', nav_contact: 'Liên hệ',
    hire: 'Thuê tôi', view_work: 'Xem dự án', download_cv: 'Tải CV', contact_me: 'Liên hệ',
    h1: 'Tôi làm game<br>cho <span class="grad">{n}</span> người chơi.',
    installs: 'lượt tải', shipped: '{n} game đã ra mắt', available: 'Sẵn sàng nhận việc',
    skills_k: 'CÂY KỸ NĂNG', skills_t: 'Những gì tôi mang đến cho team', skills_p: 'Xếp hạng như nhân vật game — bấm vào kỹ năng để xem chi tiết.',
    also: 'Từng làm việc với', also_p: 'Nền tảng low-level giúp tôi hiểu sâu về bộ nhớ và rendering.',
    lead_t: 'Dẫn dắt & Đào tạo', lead_p: 'Dẫn dắt team, kèm cặp junior và xây framework dùng chung để mỗi dự án mới khởi đầu nhanh hơn.',
    proficiency: 'Mức độ', skill: 'Kỹ năng',
    exp_k: 'KINH NGHIỆM', exp_t: 'Nhật ký hành trình', exp_p: 'Những vai trò tôi đã đảm nhận — và những gì tôi mang lại cho team.', now: 'HIỆN TẠI',
    work_k: 'DỰ ÁN', work_t: 'Game trong tay người chơi', work_p: 'Những game tôi đã làm và vai trò của tôi — mở từng dự án để xem trách nhiệm và những điều tôi học được.',
    read_more: 'Xem chi tiết', google_play: 'Google Play', app_store: 'App Store',
    platform: 'Nền tảng', engine: 'Engine', downloads: 'Lượt tải', studio: 'Studio', team: 'Team', duration: 'Thời gian', year: 'Năm',
    people: '{n} người', key_contrib: 'Đóng góp chính', view_case: 'Xem case study',
    no_desc: 'Mô tả chi tiết sẽ sớm được cập nhật.',
    all_projects: 'Tất cả dự án', watch: 'Xem có âm thanh', overview: 'Tổng quan', resp: 'Trách nhiệm', roles_n: '{n} vai trò',
    what_learned: 'Những điều tôi học được', gallery: 'Ảnh chụp màn hình', screenshot: 'Ảnh',
    challenges: 'Thử thách & giải pháp', problem: 'Vấn đề', solution: 'Giải pháp', results: 'Kết quả',
    prev_p: 'Dự án trước', next_p: 'Dự án sau', not_found: 'Không tìm thấy dự án.', back_home: 'Về danh sách dự án',
    details_soon: 'Phần chi tiết trách nhiệm của tôi trong dự án này sẽ sớm được cập nhật.',
    play: 'Phát video', unmute: 'Bật tiếng', mute: 'Tắt tiếng', live: 'ĐANG PHÁT',
    contact_t: 'Cùng làm một game<br>người chơi yêu thích.', contact_p: 'Sẵn sàng cho vị trí mới, hợp tác và đào tạo Unity.',
    copy: 'Sao chép', copied: 'Đã sao chép email', send: 'Gửi', term: '// SẴN SÀNG CHO CƠ HỘI MỚI',
    built: 'Làm với ☕ tại {city}', sample: 'dữ liệu mẫu', err: 'Không tải được dữ liệu.', booting: 'ĐANG TẢI…'
  }
};
function t(k, vars) {
  var s = (UI[lang] && UI[lang][k]) || UI.en[k] || k;
  if (vars) Object.keys(vars).forEach(function (v) { s = s.replace('{' + v + '}', vars[v]); });
  return s;
}
function loc(o) { if (o == null) return ''; if (typeof o === 'string' || typeof o === 'number') return String(o); return o[lang] || o.en || ''; }
// Per-item fallback to English when a translation is missing.
function locArr(o) {
  if (!o) return []; if (Array.isArray(o)) return o;
  var a = o[lang] || [], en = o.en || [], out = [];
  for (var i = 0; i < Math.max(a.length, en.length); i++) if (a[i] || en[i]) out.push(a[i] || en[i]);
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
function parseSkills(md) {
  return blocks(md).map(function (b) {
    return { name: b.title, level: parseInt(b.kv.level, 10) || 50, icon: b.kv.icon || 'code', description: { en: b.kv.en || '', vi: b.kv.vi || '' } };
  });
}
function parsePackages(md) {
  return blocks(md).map(function (b) {
    return { title: b.title, tags: (b.kv.tags || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean), githubLink: b.kv.github || '' };
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
  unity: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 2.5L22 7.5v9l-8.5 5-8.5-5v-9zm0 2.3L7 8.4v7.2l6.5 3.8 6.5-3.8V8.4z"/></svg>',
  code: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  design: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4z"/></svg>',
  vfx: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  ui: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
  mobile: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
  team: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  gauge: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 14l4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>',
  play: '<svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><polygon points="6,3 20,12 6,21"/></svg>',
  muted: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>',
  sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>'
};
function roleIcon(name) {
  var n = String(name).toLowerCase();
  if (/lead|manag|produc/.test(n)) return IC.team;
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
function skillsSorted() { return SKILLS.slice().sort(function (a, b) { return b.level - a.level; }); }
function rankOf(l) { return l >= 85 ? 'S' : l >= 75 ? 'A' : l >= 60 ? 'B' : 'C'; }
function pips(level) { var n = Math.round(level / 10), h = ''; for (var i = 0; i < 10; i++) h += '<i class="' + (i < n ? 'f' : '') + '" style="animation-delay:' + (i * 40) + 'ms"></i>'; return '<div class="pips" aria-label="' + level + '/100">' + h + '</div>'; }
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
  if (s.googlePlay) h += '<a class="btn ' + cls[0] + '" href="' + esc(s.googlePlay) + '" target="_blank" rel="noopener">▶ ' + t('google_play') + '</a>';
  if (s.appStore) h += '<a class="btn ' + cls[1] + '" href="' + esc(s.appStore) + '" target="_blank" rel="noopener"> ' + t('app_store') + '</a>';
  return h;
}

// ══════════════════════════════
// VIDEO — autoplay in view, only one plays at a time
// ══════════════════════════════
var VM = { cur: null, muted: true, resume: null };

// Video box markup. mode: 'row' (home preview) | 'hero' (project page, with controls)
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
function ytSrc(id, mode) {
  return 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&mute=1&playsinline=1&loop=1&playlist=' + id +
    '&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1&controls=' + (mode === 'hero' ? 1 : 0) +
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
    el.src = ytSrc(box.dataset.src, box.dataset.mode);
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
    if (box.dataset.mode === 'hero') el.controls = true;
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
    if (document.hidden || (lbEl && !lbEl.hidden)) return;
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
  $('navAva').src = p.avatar;
  $('drawerSoc').innerHTML = '<div class="socials" style="margin:0">' + socialHTML() + '</div>';
  var email = (p.contact || {}).email || '';
  $('mailTxt').textContent = email;
  $('mailBtn').href = 'mailto:' + email;
  $('termStatus').textContent = t('term');
  $('contactSoc').innerHTML = socialHTML();
  $('footL').textContent = '© ' + new Date().getFullYear() + ' ' + p.name;
  $('footR').textContent = t('built', { city: (p.location || '').split(',')[0].trim() });
}

function renderAll() {
  var playing = VM.cur;
  if (playing) vmPause(playing);
  renderShell();
  if (PAGE === 'home') { renderHero(); renderMarquee(); renderWork(); renderSkills(); renderExperience(); }
  else renderProject();
  observeReveal();
  observeVideos();
}

// ══════════════════════════════
// HOME
// ══════════════════════════════
function renderHero() {
  var p = CONFIG.profile, dl = stat(/download/i) || { value: '' };
  var name = p.name.replace(/\s*-?\s*\[.*?\]\s*/, '').trim();
  var roles = loc(p.title).split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  var years = stat(/year|năm/i), shipped = stat(/project|shipped|dự án/i);
  $('heroStatus').textContent = (p.status === 'available' ? t('available') : loc(p.statusLabel)) + ' · ' + (p.location || '');
  $('heroH1').innerHTML = t('h1', { n: esc(dl.value) });
  $('heroBio').textContent = loc(p.bio);
  startTyping(roles);
  $('cvBtn').hidden = !p.cv; if (p.cv) $('cvBtn').href = p.cv;
  $('ctaContact').hidden = !!p.cv;
  $('heroSoc').innerHTML = socialHTML();
  $('pcImg').src = p.avatar; $('pcImg').alt = name;
  $('pcName').textContent = name;
  $('pcClass').textContent = roles.slice(0, 2).join(' · ');
  $('pcLv').textContent = years ? '★ LV.' + years.value : '';
  $('pcStats').innerHTML = skillsSorted().slice(0, 4).map(function (s) {
    return '<div class="st"><span title="' + esc(s.name) + '">' + esc(s.name.split(/\s*[|]\s*/)[0]) + '</span>' + pips(s.level) + '<span>' + rankOf(s.level) + '</span></div>';
  }).join('');
  $('float1').innerHTML = '⬇ <b>' + esc(dl.value) + '</b> ' + t('installs');
  $('float2').textContent = '🎮 ' + t('shipped', { n: shipped ? shipped.value : PROJECTS.length });
  $('strip').innerHTML = (p.stats || []).map(function (s) {
    var m = String(s.value).match(/^(\d+)(.*)$/);
    var val = m ? '<span data-to="' + m[1] + '">' + m[1] + '</span><em>' + esc(m[2]) + '</em>' : esc(s.value);
    return '<div><b>' + val + '</b><span>' + esc(loc(s.label)) + '</span></div>';
  }).join('');
}

function renderMarquee() {
  var seen = {}, items = [];
  SKILLS.map(function (s) { return s.name; }).concat([].concat.apply([], PACKAGES.map(function (p) { return p.tags; }))).forEach(function (x) {
    x.split(/\s*\|\s*/).forEach(function (y) { var k = y.toLowerCase(); if (!seen[k]) { seen[k] = 1; items.push(y); } });
  });
  var h = items.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('');
  $('mq').innerHTML = h + h;
}

function renderWork() {
  var list = PROJECTS;
  $('prjList').innerHTML = list.map(function (p, i) {
    var url = projectURL(p), portrait = hasVideo(p) && isPortrait(p);
    var tagline = loc(p.tagline) || loc(p.overview);
    var facts = [];
    if (p.platform) facts.push([t('platform'), p.platform]);
    if (p.engine) facts.push([t('engine'), p.engine]);
    if (p.downloads) facts.push([t('downloads'), p.downloads]);
    if (p.studio) facts.push([t('studio'), p.studio]);
    var contrib = [];
    (p.roles || []).forEach(function (r) { var a = locArr(r.did); if (a[0]) contrib.push(a[0]); });
    var media = hasVideo(p)
      ? (portrait ? '<div class="backdrop">' + imgOrPh(p, posterOf(p)) + '</div><div class="phone">' + videoBox(p, 'row') + '</div>' : videoBox(p, 'row'))
      : '<div class="vbox-static">' + imgOrPh(p, posterOf(p)) + '</div>';
    return '<article class="prj rv' + (i % 2 ? ' rev' : '') + (portrait ? ' portrait' : '') + '">' +
      '<div class="prj-media' + (portrait ? ' portrait' : '') + '">' + media +
        '<a class="prj-hit" href="' + url + '" aria-label="' + esc(p.title) + '"></a>' +
        (p.downloads ? '<span class="dlb">' + esc(p.downloads) + '<small>' + t('downloads').toUpperCase() + '</small></span>' : '') +
        '<span class="view">' + t('view_case') + ' →</span></div>' +
      '<div class="prj-body">' +
        '<div class="prj-no">' + String(i + 1).padStart(2, '0') + ' / ' + String(list.length).padStart(2, '0') + '</div>' +
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
  var all = skillsSorted();
  var core = SKILLS.filter(function (s) { return s.icon === 'unity'; })[0] || all[0];
  if (!core) { $('bento').innerHTML = ''; return; }
  var strong = all.filter(function (s) { return s !== core && s.level >= 50; });
  var weak = all.filter(function (s) { return s !== core && s.level < 50; });
  var idx = function (s) { return all.indexOf(s); };
  var tags = {}; PACKAGES.forEach(function (p) { p.tags.forEach(function (tg) { tags[tg] = 1; }); });
  var r = function (l) { var k = rankOf(l); return '<span class="rank r-' + k.toLowerCase() + '">' + k + '-RANK</span>'; };
  var h = '<div class="spot bx bx-core w2 h2 clickable rv" data-open="skill" data-i="' + idx(core) + '" tabindex="0">' +
      '<div class="ic">' + (IC[core.icon] || IC.code) + '</div>' +
      '<h4>' + esc(core.name) + r(core.level) + '</h4><p>' + esc(loc(core.description)) + '</p>' +
      '<div class="chips">' + Object.keys(tags).map(function (tg) { return '<span>' + esc(tg) + '</span>'; }).join('') + '</div>' +
      pips(core.level) + '</div>';
  h += strong.map(function (s) {
    return '<div class="spot bx clickable rv" data-open="skill" data-i="' + idx(s) + '" tabindex="0">' +
      '<h4>' + esc(s.name) + r(s.level) + '</h4><p>' + esc(loc(s.description)) + '</p>' + pips(s.level) + '</div>';
  }).join('');
  if (/lead|train/i.test(loc(CONFIG.profile.title))) h += '<div class="spot bx w2 rv"><div class="ic">' + IC.team + '</div><h4>' + t('lead_t') + '</h4><p>' + t('lead_p') + '</p></div>';
  if (weak.length) h += '<div class="spot bx w2 rv"><h4>' + t('also') + '</h4><p>' + t('also_p') + '</p><div class="chips">' +
      weak.map(function (s) { return '<button type="button" data-open="skill" data-i="' + idx(s) + '">' + esc(s.name) + '</button>'; }).join('') + '</div></div>';
  $('bento').innerHTML = h;
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
  var id = new URLSearchParams(location.search).get('p');
  for (var i = 0; i < PROJECTS.length; i++) if (PROJECTS[i].id === id) return { p: PROJECTS[i], i: i };
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
  var meta = [];
  if (p.team) meta.push(t('people', { n: p.team }));
  if (p.duration) meta.push(loc(p.duration));
  if (p.status) meta.push(loc(p.status));
  if (p.platform) meta.push(p.platform);

  // HERO — blurred poster backdrop; portrait video sits beside the title in a phone frame
  var info =
    '<div class="pj-info">' +
      '<a class="back" href="index.html#work">← ' + t('all_projects') + '</a>' +
      '<div class="pj-title rv in"><div class="pj-icon">' + iconHTML(p) + '</div><div>' +
        '<div class="sh-k" style="margin-bottom:8px">' + esc(p.studio) + '</div><h1>' + esc(p.title) + '</h1></div></div>' +
      '<p class="tagline">' + (tagline ? esc(tagline) + sample(ph) : '<span class="muted">' + t('no_desc') + '</span>') + '</p>' +
      (meta.length ? '<div class="pj-meta">' + meta.map(function (m) { return '<span><b>' + esc(m) + '</b></span>'; }).join('') + '</div>' : '') +
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
  if (p.team) stats.push(['<b>' + esc(t('people', { n: p.team })) + '</b>', t('team')]);
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
    if (roles.length > 1) h += '<div class="role-nav" id="roleNav" role="navigation">' + roles.map(function (r, i) { return '<a href="#role-' + i + '"' + (i ? '' : ' class="on"') + '>' + esc(loc(r.name)) + '</a>'; }).join('') + '</div>';
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

  var learned = p.learned || [];
  if (learned.length) {
    h += '<section class="pj-sec" id="learned"><h2 class="rv"><small>' + num() + '</small>' + t('what_learned') + '</h2><div class="learn">' + learned.map(function (l, i) {
      return '<div class="spot lc rv"><span class="lc-n">' + String(i + 1).padStart(2, '0') + '</span><h4>' + esc(loc(l.title)) + sample(ph) + '</h4><p>' + esc(loc(l.text)) + '</p></div>';
    }).join('') + '</div></section>';
  }

  GALLERY = (p.screenshots || []).map(function (g, i) {
    var src = typeof g === 'string' ? g : g.src;
    return { img: pAsset(p, src), cap: (typeof g === 'object' && loc(g.caption)) || t('screenshot') + ' ' + (i + 1) };
  });
  if (GALLERY.length) {
    h += '<section class="pj-sec"><h2 class="rv"><small>' + num() + '</small>' + t('gallery') + '</h2><div class="gallery rv">' + GALLERY.map(function (g, i) {
      return '<button type="button" data-lb="' + i + '"><img src="' + esc(g.img) + '" alt="' + esc(g.cap) + '" loading="lazy"><span>' + esc(g.cap) + '</span></button>';
    }).join('') + '</div></section>';
  }
  if (p.challenges && p.challenges.length) {
    h += '<section class="pj-sec"><h2 class="rv"><small>' + num() + '</small>' + t('challenges') + '</h2><div class="chal">' + p.challenges.map(function (c) {
      return '<div class="spot ch rv"><h4>' + esc(loc(c.title)) + sample(ph) + '</h4><dl><dt class="p">' + t('problem') + '</dt><dd>' + esc(loc(c.problem)) + '</dd><dt class="s">' + t('solution') + '</dt><dd>' + esc(loc(c.solution)) + '</dd></dl></div>';
    }).join('') + '</div></section>';
  }
  if (p.results && p.results.length) {
    h += '<section class="pj-sec"><h2 class="rv"><small>' + num() + '</small>' + t('results') + '</h2><div class="results">' + p.results.map(function (r) {
      return '<div class="rv"><b>' + esc(r.value) + '</b><span>' + esc(loc(r.label)) + '</span></div>';
    }).join('') + '</div></section>';
  }

  var L = PROJECTS, prev = L[(cur.i - 1 + L.length) % L.length], next = L[(cur.i + 1) % L.length];
  if (L.length > 1) h += '<div class="pager" role="navigation">' +
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
  $('lbStage').innerHTML = '<img src="' + esc(g.img) + '" alt="' + esc(g.cap) + '">';
  $('lbCap').textContent = g.cap + ' · ' + (LB.i + 1) + ' / ' + GALLERY.length;
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
// TYPING EFFECT
// ══════════════════════════════
var typeTimer = null;
function startTyping(roles) {
  clearTimeout(typeTimer);
  var el = $('typed'); if (!roles.length) return;
  if (REDUCED) { el.textContent = roles[0]; return; }
  var ri = 0, ci = 0, del = false;
  (function tick() {
    var w = roles[ri]; el.textContent = w.slice(0, ci);
    if (!del && ci < w.length) ci++;
    else if (!del) { del = true; typeTimer = setTimeout(tick, 1700); return; }
    else if (ci > 0) ci--;
    else { del = false; ri = (ri + 1) % roles.length; }
    typeTimer = setTimeout(tick, del ? 35 : 75);
  })();
}

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
// SKILL MODAL (home)
// ══════════════════════════════
var M = { i: 0, opener: null };
function fillModal() {
  var list = skillsSorted(), it = list[M.i], k = rankOf(it.level);
  var mediaEl = $('mMedia'); mediaEl.className = 'm-media banner';
  mediaEl.innerHTML = '<div class="ph" style="background:linear-gradient(140deg,#00e5ff33,#7c4dff44,#07090f);color:var(--cyan)">' + (IC[it.icon] || IC.code).replace(/width="20" height="20"/, 'width="56" height="56"') + '</div>';
  $('mKicker').textContent = t('skill');
  $('mTitle').textContent = it.name;
  $('mTags').innerHTML = '<span class="rank r-' + k.toLowerCase() + '">' + k + '-RANK</span>';
  $('mStats').innerHTML = '';
  $('mDesc').innerHTML = '<p>' + esc(loc(it.description)) + '</p><h5>' + t('proficiency') + '</h5>' + pips(it.level).replace('class="pips"', 'class="pips go"');
  $('mActions').innerHTML = '';
  var n = list.length;
  $('mPrevT').textContent = list[(M.i - 1 + n) % n].name;
  $('mNextT').textContent = list[(M.i + 1) % n].name;
  $('mCount').textContent = (M.i + 1) + ' / ' + n;
  $('mPanel').scrollTop = 0;
}
function openModal(i, opener) {
  var modal = $('modal'), wasOpen = !modal.hidden;
  M.i = i; if (!wasOpen) M.opener = opener || document.activeElement;
  fillModal();
  if (!wasOpen) {
    modal.hidden = false; document.body.classList.add('lock');
    requestAnimationFrame(function () { modal.classList.add('open'); });
    setTimeout(function () { modal.querySelector('.m-close').focus(); }, 50);
  }
}
function closeModal() {
  var modal = $('modal'); if (!modal || modal.hidden) return;
  modal.classList.remove('open'); document.body.classList.remove('lock');
  setTimeout(function () { modal.hidden = true; }, REDUCED ? 0 : 350);
  if (M.opener && M.opener.focus) M.opener.focus({ preventScroll: true });
}
function stepModal(d) { var n = SKILLS.length; M.i = (M.i + d + n) % n; fillModal(); }

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
    var o = e.target.closest('[data-open]');
    if (o) { e.preventDefault(); openModal(+o.dataset.i, o); return; }
    if (e.target.closest('[data-close]')) closeModal();
    if (e.target === $('lb')) lbClose();
  });
  document.addEventListener('keydown', function (e) {
    var modal = $('modal');
    if (modal && !modal.hidden) {
      if (e.key === 'Escape') closeModal();
      else if (e.key === 'ArrowLeft') stepModal(-1);
      else if (e.key === 'ArrowRight') stepModal(1);
      else if (e.key === 'Tab') trapTab(e, $('mPanel'));
      return;
    }
    var lbx = $('lb');
    if (lbx && !lbx.hidden) {
      if (e.key === 'Escape') lbClose();
      else if (e.key === 'ArrowLeft') lbStep(-1);
      else if (e.key === 'ArrowRight') lbStep(1);
      else if (e.key === 'Tab') trapTab(e, lbx);
      return;
    }
    if (e.key === 'Escape' && $('drawer').classList.contains('open')) toggleDrawer(false);
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement && document.activeElement.matches('[data-open][tabindex]')) {
      e.preventDefault(); document.activeElement.click();
    }
  });
  if ($('modal')) {
    $('mPrev').onclick = function () { stepModal(-1); };
    $('mNext').onclick = function () { stepModal(1); };
  }
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
      renderAll(); if ($('modal') && !$('modal').hidden) fillModal();
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

  var ticking = false, lastY = window.scrollY;
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  function onScroll() {
    ticking = false;
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight, p = h > 0 ? y / h : 0;
    var nav = $('nav');
    nav.classList.toggle('scrolled', y > 20);
    nav.classList.toggle('hidden', y > 400 && y > lastY + 4 && !$('drawer').classList.contains('open'));
    if (y < lastY - 4) nav.classList.remove('hidden');
    lastY = y;
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
    } else {
      var rn = $('roleNav');
      if (rn) {
        var on = 0;
        document.querySelectorAll('.role-card').forEach(function (c, i) { if (c.getBoundingClientRect().top < innerHeight * 0.4) on = i; });
        rn.querySelectorAll('a').forEach(function (a, i) { a.classList.toggle('on', i === on); });
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
// BOOT
// ══════════════════════════════
function boot() {
  var ld = $('loader'), fill = $('ldFill'), got = 0, total = 5, t0 = Date.now();
  try { var saved = localStorage.getItem('nix-lang'); if (saved === 'en' || saved === 'vi') lang = saved; else throw 0; }
  catch (e) { lang = (navigator.language || 'en').toLowerCase().indexOf('vi') === 0 ? 'vi' : 'en'; }
  $('ldTxt').textContent = t('booting');
  function tick(v) { got++; fill.style.width = Math.min(got / total * 100, 100) + '%'; return v; }
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
    CONFIG = res[0]; SKILLS = parseSkills(res[1]); PACKAGES = parsePackages(res[2]); PROJECTS = res[3];
    renderAll();
    bindStatic();
    booted = true;
    setTimeout(function () { ld.classList.add('done'); }, Math.max(0, (PAGE === 'home' ? 650 : 250) - (Date.now() - t0)));
  }).catch(function (err) {
    console.error(err);
    ld.innerHTML = '<div class="ld-logo"><b>[</b><span>NIX</span><b>]</b></div><div class="ld-err">⚠ ' + t('err') + '<br><br>Serve the site over HTTP (e.g. <b>python3 -m http.server</b>) — browsers block fetch() on file://.<br><br><span style="color:#6b7690">' + esc(err.message) + '</span></div>';
  });
}
boot();
})();
