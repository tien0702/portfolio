/* ══════════════════════════════════════════
   [NIX] Portfolio — Plan 1 (full build)
   Data: web-config.json + Database/*.md (+ preview-data.json)
   ══════════════════════════════════════════ */
(function () {
'use strict';

// Path to the site root (data + assets). Becomes '' once deployed at the root.
var BASE = '../../';

var CONFIG = null, SKILLS = [], PACKAGES = [], PROJECTS = [], EXTRA = {};
var lang = 'en';
var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ══════════════════════════════
// UI STRINGS
// ══════════════════════════════
var UI = {
  en: {
    skip: 'Skip to content', nav_work: 'Work', nav_experience: 'Experience', nav_skills: 'Skills', nav_toolkit: 'Toolkit', nav_contact: 'Contact',
    hire: 'Hire me', view_work: 'View my work', download_cv: 'Download CV', contact_me: 'Contact me',
    h1: 'I build games<br>played by <span class="grad">{n}</span> people.',
    installs: 'installs', shipped: '{n} games shipped', pkg_count: 'In-house packages', available: 'Available',
    work_k: 'SELECTED WORK', work_t: "Games in players' hands", work_p: 'Hit titles shipped with Champion Game Studio — from prototype to live ops. Click any game for details.',
    featured: '★ FEATURED', downloads: 'Downloads', on_gp: 'downloads on Google Play', store: 'Google Play', details: 'Details',
    no_desc: 'Detailed write-up coming soon.', what_i_did: 'What I did', role: 'Role', studio: 'Studio', game: 'Game',
    exp_k: 'EXPERIENCE', exp_t: 'Quest log', exp_p: "Roles I've played — and what I brought to each team.", now: 'NOW',
    skills_k: 'SKILL TREE', skills_t: 'What I bring to a team', skills_p: 'Ranked like a game character — click a skill to inspect it.',
    also: 'Also worked with', also_p: 'Low-level background that shapes how I think about memory and rendering.',
    lead_t: 'Leadership & Training', lead_p: 'Leading a dev team, mentoring juniors, and building shared frameworks so every new project starts ahead.',
    rank: 'Rank', proficiency: 'Proficiency', skill: 'Skill',
    tk_k: 'TOOLKIT', tk_t: 'The engine behind the games', tk_p: '{n} reusable Unity packages built around {core} — hover to explore, click for details.',
    package: 'Package', version: 'Version', stars: 'Stars', depends: 'Depends on', required_by: 'Required by', all_modules: 'all modules', github: 'View on GitHub',
    contact_t: "Let's build something<br>players will love.", contact_p: 'Open to new roles, collaborations and Unity training.',
    copy: 'Copy', copied: 'Email copied to clipboard', send: 'Send', term: '// OPEN TO OPPORTUNITIES',
    built: 'Built with ☕ in {city}', sample: 'sample data', err: 'Could not load data files.', booting: 'BOOTING PORTFOLIO…'
  },
  vi: {
    skip: 'Bỏ qua tới nội dung', nav_work: 'Dự án', nav_experience: 'Kinh nghiệm', nav_skills: 'Kỹ năng', nav_toolkit: 'Toolkit', nav_contact: 'Liên hệ',
    hire: 'Thuê tôi', view_work: 'Xem dự án', download_cv: 'Tải CV', contact_me: 'Liên hệ',
    h1: 'Tôi làm game<br>cho <span class="grad">{n}</span> người chơi.',
    installs: 'lượt tải', shipped: '{n} game đã ra mắt', pkg_count: 'Package nội bộ', available: 'Sẵn sàng nhận việc',
    work_k: 'DỰ ÁN TIÊU BIỂU', work_t: 'Game trong tay người chơi', work_p: 'Các game hit phát hành cùng Champion Game Studio — từ prototype đến live ops. Bấm vào game để xem chi tiết.',
    featured: '★ NỔI BẬT', downloads: 'Lượt tải', on_gp: 'lượt tải trên Google Play', store: 'Google Play', details: 'Chi tiết',
    no_desc: 'Mô tả chi tiết sẽ sớm được cập nhật.', what_i_did: 'Tôi đã làm', role: 'Vai trò', studio: 'Studio', game: 'Game',
    exp_k: 'KINH NGHIỆM', exp_t: 'Nhật ký hành trình', exp_p: 'Những vai trò tôi đã đảm nhận — và những gì tôi mang lại cho team.', now: 'HIỆN TẠI',
    skills_k: 'CÂY KỸ NĂNG', skills_t: 'Những gì tôi mang đến cho team', skills_p: 'Xếp hạng như nhân vật game — bấm vào kỹ năng để xem chi tiết.',
    also: 'Từng làm việc với', also_p: 'Nền tảng low-level giúp tôi hiểu sâu về bộ nhớ và rendering.',
    lead_t: 'Dẫn dắt & Đào tạo', lead_p: 'Dẫn dắt team, kèm cặp junior và xây framework dùng chung để mỗi dự án mới khởi đầu nhanh hơn.',
    rank: 'Hạng', proficiency: 'Mức độ', skill: 'Kỹ năng',
    tk_k: 'TOOLKIT', tk_t: 'Bộ máy phía sau các game', tk_p: '{n} package Unity tái sử dụng xây quanh {core} — rê chuột để khám phá, bấm để xem chi tiết.',
    package: 'Package', version: 'Phiên bản', stars: 'Sao', depends: 'Phụ thuộc', required_by: 'Bắt buộc cho', all_modules: 'mọi module', github: 'Xem trên GitHub',
    contact_t: 'Cùng làm một game<br>người chơi yêu thích.', contact_p: 'Sẵn sàng cho vị trí mới, hợp tác và đào tạo Unity.',
    copy: 'Sao chép', copied: 'Đã sao chép email', send: 'Gửi', term: '// SẴN SÀNG CHO CƠ HỘI MỚI',
    built: 'Làm với ☕ tại {city}', sample: 'dữ liệu mẫu', err: 'Không tải được dữ liệu.', booting: 'ĐANG KHỞI ĐỘNG…'
  }
};
function t(k, vars) {
  var s = (UI[lang] && UI[lang][k]) || UI.en[k] || k;
  if (vars) Object.keys(vars).forEach(function (v) { s = s.replace('{' + v + '}', vars[v]); });
  return s;
}
function loc(o) { if (o == null) return ''; if (typeof o === 'string') return o; return o[lang] || o.en || ''; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function slug(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function $(id) { return document.getElementById(id); }
function asset(p) { return /^(https?:)?\/\//.test(p) ? p : BASE + p; }
function validYT(id) { return !!id && !/^VIDEO_ID/i.test(id); }
function dlNum(s) { var m = String(s || '').match(/([\d.]+)\s*([KMB])?/i); if (!m) return 0; var n = parseFloat(m[1]); var u = (m[2] || '').toUpperCase(); return u === 'B' ? n * 1000 : u === 'K' ? n / 1000 : u === 'M' ? n : n / 1e6; }

// ══════════════════════════════
// MARKDOWN PARSERS (same format as the live site)
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
    return { title: b.title, tags: (b.kv.tags || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean),
      githubLink: b.kv.github || '', stars: parseInt(b.kv.stars, 10) || 0, version: b.kv.version || '', youtubeId: b.kv.youtubeId || '',
      image: b.kv.image || '', description: { en: b.kv.en || '', vi: b.kv.vi || '' } };
  });
}
function parseProjects(md) {
  return blocks(md).map(function (b) {
    return { title: b.title, role: { en: b.kv.role_en || '', vi: b.kv.role_vi || b.kv.role_en || '' }, youtubeId: b.kv.youtubeId || '',
      downloadLink: b.kv.downloadLink || '', featured: b.kv.featured === 'true', downloads: b.kv.downloads || '', studio: b.kv.studio || '',
      accentColor: b.kv.accentColor || '#00e5ff', description: { en: b.kv.en || '', vi: b.kv.vi || '' } };
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
  play: '<svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><polygon points="6,3 20,12 6,21"/></svg>'
};

// ══════════════════════════════
// DERIVED DATA
// ══════════════════════════════
function contacts() {
  var c = CONFIG.profile.contact || {}, out = [];
  var gh = c.github;
  if (!gh) { var hit = PACKAGES.map(function (p) { return (p.githubLink.match(/https?:\/\/github\.com\/[^/]+/) || [])[0]; }).filter(Boolean)[0]; gh = hit; }
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
function downloadsStat() { return stat(/download/i) || { value: '' }; }
function projectsSorted() {
  return PROJECTS.slice().sort(function (a, b) { return (b.featured - a.featured) || (dlNum(b.downloads) - dlNum(a.downloads)); });
}
function skillsSorted() { return SKILLS.slice().sort(function (a, b) { return b.level - a.level; }); }
function rankOf(l) { return l >= 85 ? 'S' : l >= 75 ? 'A' : l >= 60 ? 'B' : 'C'; }
function pips(level) { var n = Math.round(level / 10), h = ''; for (var i = 0; i < 10; i++) h += '<i class="' + (i < n ? 'f' : '') + '" style="animation-delay:' + (i * 40) + 'ms"></i>'; return '<div class="pips" aria-label="' + level + '/100">' + h + '</div>'; }
function corePkg() { return PACKAGES.filter(function (p) { return /core/i.test(p.title); })[0] || PACKAGES[0]; }
function sample() { return ' <span class="sample">' + t('sample') + '</span>'; }
function mediaFor(item, big) {
  if (validYT(item.youtubeId)) {
    var q = big ? 'maxresdefault' : 'hqdefault';
    return '<img src="https://img.youtube.com/vi/' + item.youtubeId + '/' + q + '.jpg" onerror="this.onerror=null;this.src=\'https://img.youtube.com/vi/' + item.youtubeId + '/hqdefault.jpg\'" alt="" loading="lazy">';
  }
  return '<div class="ph" style="background:linear-gradient(140deg,' + esc(item.accentColor || '#7c4dff') + ',#1a1030)">' + esc(item.title.charAt(0)) + '</div>';
}

// ══════════════════════════════
// RENDER
// ══════════════════════════════
function renderAll() {
  document.documentElement.lang = lang;
  document.querySelectorAll('.lang button').forEach(function (b) { b.classList.toggle('on', b.dataset.lang === lang); b.setAttribute('aria-pressed', b.dataset.lang === lang); });
  document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(function (el) { el.innerHTML = t(el.dataset.i18nHtml); });
  renderHero(); renderMarquee(); renderWork(); renderExperience(); renderSkills(); renderToolkit(); renderContact();
  bindDynamic();
  observeReveal();
}

function renderHero() {
  var p = CONFIG.profile, dl = downloadsStat();
  var name = p.name.replace(/\s*-?\s*\[.*?\]\s*/, '').trim();
  var roles = loc(p.title).split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  var years = stat(/year|năm/i), shipped = stat(/project|shipped|dự án/i);
  $('navAva').src = asset(p.avatar);
  $('heroStatus').textContent = (p.status === 'available' ? t('available') : loc(p.statusLabel)) + ' · ' + (p.location || '');
  $('heroH1').innerHTML = t('h1', { n: esc(dl.value) });
  $('heroBio').textContent = loc(p.bio);
  startTyping(roles);
  var cv = EXTRA.cv || p.cv;
  $('cvBtn').hidden = !cv; if (cv) $('cvBtn').href = asset(cv);
  $('ctaContact').hidden = !!cv;
  $('heroSoc').innerHTML = socialHTML();
  $('drawerSoc').innerHTML = '<div class="socials" style="margin:0">' + socialHTML() + '</div>';

  $('pcImg').src = asset(p.avatar); $('pcImg').alt = name;
  $('pcName').textContent = name;
  $('pcClass').textContent = roles.slice(0, 2).join(' · ');
  $('pcLv').textContent = years ? '★ LV.' + years.value : '';
  $('pcStats').innerHTML = skillsSorted().slice(0, 4).map(function (s) {
    return '<div class="st"><span title="' + esc(s.name) + '">' + esc(s.name.split(/\s*[|]\s*/)[0]) + '</span>' + pips(s.level) + '<span>' + rankOf(s.level) + '</span></div>';
  }).join('');
  $('float1').innerHTML = '⬇ <b>' + esc(dl.value) + '</b> ' + t('installs');
  $('float2').textContent = '🎮 ' + t('shipped', { n: shipped ? shipped.value : PROJECTS.length });

  var cells = (p.stats || []).map(function (s) { return { v: s.value, l: loc(s.label) }; });
  cells.push({ v: String(PACKAGES.length), l: t('pkg_count') });
  $('strip').innerHTML = cells.map(function (c) {
    var m = String(c.v).match(/^(\d+)(.*)$/);
    var val = m ? '<span data-to="' + m[1] + '">' + m[1] + '</span><em>' + esc(m[2]) + '</em>' : esc(c.v);
    return '<div><b>' + val + '</b><span>' + esc(c.l) + '</span></div>';
  }).join('');
  $('footL').textContent = '© ' + new Date().getFullYear() + ' ' + p.name;
  $('footR').textContent = t('built', { city: (p.location || '').split(',')[0].trim() });
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
  var list = projectsSorted();
  if (!list.length) { $('featured').innerHTML = ''; $('games').innerHTML = ''; return; }
  var f = list[0], s = slug(f.title), hl = (EXTRA.highlights || {})[s];
  var dlm = String(f.downloads).match(/^(\d+)(.*)$/);
  var bullets = hl ? '<ul class="did">' + (hl[lang] || hl.en || []).map(function (x) { return '<li><span>' + esc(x) + (hl.placeholder ? sample() : '') + '</span></li>'; }).join('') + '</ul>'
    : '<p>' + (loc(f.description) ? esc(loc(f.description)) : '<span class="muted">' + t('no_desc') + '</span>') + '</p>';
  $('featured').innerHTML =
    '<article class="spot feat clickable rv" data-open="project" data-i="0" tabindex="0" aria-label="' + esc(f.title) + '">' +
      '<div class="feat-media"><span class="badge">' + t('featured') + '</span>' + mediaFor(f, true) +
        (validYT(f.youtubeId) ? '<button class="play" type="button" data-open="project" data-i="0" data-autoplay="1" aria-label="Play video">' + IC.play + '</button>' : '') + '</div>' +
      '<div class="feat-body">' +
        '<div class="meta"><span class="tag">' + esc(f.studio) + '</span><span class="tag pk">' + esc(loc(f.role)) + '</span></div>' +
        '<h3>' + esc(f.title) + '</h3>' +
        (f.downloads ? '<div class="big-num"><b>' + (dlm ? '<span data-to="' + dlm[1] + '">' + dlm[1] + '</span>' + esc(dlm[2]) : esc(f.downloads)) + '</b><span>' + t('on_gp') + '</span></div>' : '') +
        bullets +
        '<div class="cta">' +
          (f.downloadLink ? '<a class="btn btn-pri btn-sm" href="' + esc(f.downloadLink) + '" target="_blank" rel="noopener">▶ ' + t('store') + '</a>' : '') +
          '<button class="btn btn-ghost btn-sm" type="button" data-open="project" data-i="0">' + t('details') + ' →</button>' +
        '</div>' +
      '</div>' +
    '</article>';
  $('games').innerHTML = list.slice(1).map(function (g, k) {
    var i = k + 1;
    return '<article class="spot game clickable rv" data-open="project" data-i="' + i + '" tabindex="0" aria-label="' + esc(g.title) + '">' +
      '<div class="gicon">' + mediaFor(g) + '</div>' +
      '<div><div class="meta"><span class="tag pk">' + esc(loc(g.role)) + '</span></div>' +
        '<h4>' + esc(g.title) + '</h4>' +
        '<p>' + (loc(g.description) ? esc(loc(g.description)) : '<span class="muted">' + t('no_desc') + '</span>') + '</p>' +
        '<div class="row"><span class="dl">⬇ ' + esc(g.downloads || '—') + '</span><span class="more-l">' + t('details') + ' <span aria-hidden="true">→</span></span></div></div>' +
    '</article>';
  }).join('');
}

function renderExperience() {
  var xs = EXTRA.experience || [];
  $('experience').hidden = !xs.length;
  document.querySelectorAll('a[href="#experience"]').forEach(function (a) { a.parentNode.hidden = !xs.length; });
  $('timeline').innerHTML = xs.map(function (x) {
    return '<div class="spot tl-item rv' + (x.current ? ' cur' : '') + '">' +
      '<div class="tl-head"><h4>' + esc(loc(x.role)) + (x.org && x.org !== '—' ? ' · <span>' + esc(x.org) + '</span>' : '') + '<span class="now">● ' + t('now') + '</span></h4>' +
      '<span class="per">' + esc(loc(x.period)) + (x.placeholder ? sample() : '') + '</span></div>' +
      '<p>' + esc(loc(x.desc)) + '</p>' +
      (x.tags && x.tags.length ? '<div class="meta">' + x.tags.map(function (tg) { return '<span class="tag">' + esc(tg) + '</span>'; }).join('') + '</div>' : '') +
    '</div>';
  }).join('');
}

function renderSkills() {
  var all = skillsSorted();
  var core = SKILLS.filter(function (s) { return s.icon === 'unity'; })[0] || all[0];
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
  var roles = loc(CONFIG.profile.title);
  if (/lead|train/i.test(roles)) h += '<div class="spot bx w2 rv"><div class="ic">' + IC.team + '</div><h4>' + t('lead_t') + '</h4><p>' + t('lead_p') + '</p></div>';
  if (weak.length) h += '<div class="spot bx w2 rv"><h4>' + t('also') + '</h4><p>' + t('also_p') + '</p><div class="chips">' +
      weak.map(function (s) { return '<button type="button" data-open="skill" data-i="' + idx(s) + '">' + esc(s.name) + '</button>'; }).join('') + '</div></div>';
  $('bento').innerHTML = h;
}

function renderToolkit() {
  var core = corePkg(), mods = PACKAGES.filter(function (p) { return p !== core; });
  $('tkP').textContent = t('tk_p', { n: PACKAGES.length, core: core ? core.title : '' });
  if (!core) { $('graph').innerHTML = ''; $('pkgs').innerHTML = ''; return; }
  var cx = 230, cy = 210, R = 160, edges = '', nodes = '';
  mods.forEach(function (p, k) {
    var a = -Math.PI / 2 + k * 2 * Math.PI / mods.length, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R, i = PACKAGES.indexOf(p), w = p.title.length * 7 + 24;
    edges += '<line class="edge" data-k="' + i + '" x1="' + cx + '" y1="' + cy + '" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '"/>';
    nodes += '<g class="node" data-k="' + i + '" data-open="package" data-i="' + i + '" tabindex="0" role="button" aria-label="' + esc(p.title) + '"><rect x="' + (x - w / 2).toFixed(1) + '" y="' + (y - 15).toFixed(1) + '" width="' + w + '" height="30" rx="8"/><text x="' + x.toFixed(1) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="middle">' + esc(p.title) + '</text></g>';
  });
  var ci = PACKAGES.indexOf(core);
  nodes += '<g class="node core" data-k="' + ci + '" data-open="package" data-i="' + ci + '" tabindex="0" role="button" aria-label="' + esc(core.title) + '">' +
    '<rect class="pulse" x="' + (cx - 62) + '" y="' + (cy - 22) + '" width="124" height="44" rx="12" style="transform-origin:' + cx + 'px ' + cy + 'px"/>' +
    '<rect x="' + (cx - 62) + '" y="' + (cy - 22) + '" width="124" height="44" rx="12"/><text x="' + cx + '" y="' + (cy + 5) + '" text-anchor="middle">' + esc(core.title) + '</text></g>';
  $('graph').innerHTML = edges + nodes;
  var order = [core].concat(mods);
  $('pkgs').innerHTML = order.map(function (p) {
    var i = PACKAGES.indexOf(p);
    return '<button type="button" class="spot pkg clickable rv' + (p === core ? ' core' : '') + '" data-k="' + i + '" data-open="package" data-i="' + i + '">' +
      '<div class="row"><h5>' + esc(p.title) + '</h5><span class="ver">' + esc(p.version) + '</span></div><p>' + esc(loc(p.description)) + '</p></button>';
  }).join('');
}

function renderContact() {
  var email = (CONFIG.profile.contact || {}).email || '';
  $('mailTxt').textContent = email;
  $('mailBtn').href = 'mailto:' + email;
  $('termStatus').textContent = t('term');
  $('contactSoc').innerHTML = socialHTML();
}

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
    if (booted) el.classList.add('in'); // re-render (e.g. language switch): show instantly
    if (el.classList.contains('in')) { el.querySelectorAll('[data-to]').forEach(function (n) { n.dataset.done = '1'; }); return; }
    el.style.transitionDelay = ((i % 4) * 0.06) + 's';
    revealIO.observe(el);
  });
}

// ══════════════════════════════
// MODAL
// ══════════════════════════════
var M = { type: null, i: 0, opener: null };
var LISTS = { project: function () { return projectsSorted(); }, package: function () { return PACKAGES; }, skill: function () { return skillsSorted(); } };
var HASH = { project: 'p', package: 'k', skill: 's' };
function itemName(type, it) { return type === 'skill' ? it.name : it.title; }

function ytPlayer(id, autoplay) {
  var src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
  if (autoplay) return '<iframe src="' + src + '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Video"></iframe>';
  return '<div class="yt" role="button" tabindex="0" data-yt="' + id + '" aria-label="Play video"><img src="https://img.youtube.com/vi/' + id + '/maxresdefault.jpg" onerror="this.onerror=null;this.src=\'https://img.youtube.com/vi/' + id + '/hqdefault.jpg\'" alt=""><span class="play">' + IC.play + '</span></div>';
}

function fillModal(autoplay) {
  var list = LISTS[M.type](), it = list[M.i], media = '', kicker = '', tags = '', stats = '', desc = '', acts = '';
  var mediaEl = $('mMedia'); mediaEl.className = 'm-media';
  if (M.type === 'project') {
    var s = slug(it.title), hl = (EXTRA.highlights || {})[s];
    media = validYT(it.youtubeId) ? ytPlayer(it.youtubeId, autoplay) : mediaFor(it);
    if (!validYT(it.youtubeId)) mediaEl.className = 'm-media banner';
    kicker = t('game') + ' · ' + esc(it.studio);
    tags = '<span class="tag pk">' + esc(loc(it.role)) + '</span>';
    stats = '<div><b class="g">' + esc(it.downloads || '—') + '</b><span>' + t('downloads') + '</span></div>' +
            '<div><b>' + esc(loc(it.role) || '—') + '</b><span>' + t('role') + '</span></div>' +
            '<div><b>' + esc(it.studio || '—') + '</b><span>' + t('studio') + '</span></div>';
    desc = loc(it.description) ? '<p>' + esc(loc(it.description)) + '</p>' : '<p class="muted">' + t('no_desc') + '</p>';
    if (hl) desc += '<h5>' + t('what_i_did') + (hl.placeholder ? sample() : '') + '</h5><ul class="did">' + (hl[lang] || hl.en).map(function (x) { return '<li><span>' + esc(x) + '</span></li>'; }).join('') + '</ul>';
    if (it.downloadLink) acts = '<a class="btn btn-pri" href="' + esc(it.downloadLink) + '" target="_blank" rel="noopener">▶ ' + t('store') + '</a>';
  } else if (M.type === 'package') {
    var core = corePkg(), isCore = it === core;
    if (validYT(it.youtubeId)) media = ytPlayer(it.youtubeId, autoplay);
    else if (it.image) media = '<img src="' + esc(asset(it.image)) + '" alt="">';
    else { mediaEl.className = 'm-media banner'; media = '<div class="ph" style="background:linear-gradient(140deg,' + (isCore ? '#00e5ff,#062029' : '#7c4dff,#140b33') + ');font-size:3rem">⬡</div>'; }
    kicker = t('package') + ' · ' + esc(it.version);
    tags = it.tags.map(function (tg) { return '<span class="tag pu">' + esc(tg) + '</span>'; }).join('');
    stats = '<div><b>' + esc(it.version || '—') + '</b><span>' + t('version') + '</span></div>' +
            '<div><b>' + (isCore ? t('all_modules') : esc(core.title)) + '</b><span>' + (isCore ? t('required_by') : t('depends')) + '</span></div>' +
            (it.stars ? '<div><b>★ ' + it.stars + '</b><span>' + t('stars') + '</span></div>' : '');
    desc = '<p>' + esc(loc(it.description)) + '</p>';
    if (it.githubLink) acts = '<a class="btn btn-pri" href="' + esc(it.githubLink) + '" target="_blank" rel="noopener">' + IC.github + ' ' + t('github') + '</a>';
  } else {
    var k = rankOf(it.level);
    mediaEl.className = 'm-media banner';
    media = '<div class="ph" style="background:linear-gradient(140deg,#00e5ff33,#7c4dff44,#07090f);color:var(--cyan)">' + (IC[it.icon] || IC.code).replace(/width="20" height="20"/, 'width="56" height="56"') + '</div>';
    kicker = t('skill');
    tags = '<span class="rank r-' + k.toLowerCase() + '">' + k + '-RANK</span>';
    desc = '<p>' + esc(loc(it.description)) + '</p><h5>' + t('proficiency') + '</h5>' + pips(it.level).replace('class="pips"', 'class="pips go"');
  }
  mediaEl.innerHTML = media;
  $('mKicker').innerHTML = kicker;
  $('mTitle').textContent = itemName(M.type, it);
  $('mTags').innerHTML = tags;
  $('mStats').innerHTML = stats;
  $('mDesc').innerHTML = desc;
  $('mActions').innerHTML = acts;
  var n = list.length;
  $('mPrevT').textContent = itemName(M.type, list[(M.i - 1 + n) % n]);
  $('mNextT').textContent = itemName(M.type, list[(M.i + 1) % n]);
  $('mCount').textContent = (M.i + 1) + ' / ' + n;
  $('mPrev').parentNode.hidden = n < 2;
  $('mPanel').scrollTop = 0;
  try { history.replaceState(null, '', '#' + HASH[M.type] + '/' + slug(itemName(M.type, it))); } catch (e) {}
}

function openModal(type, i, opener, autoplay) {
  var modal = $('modal'), wasOpen = !modal.hidden;
  M.type = type; M.i = i; if (!wasOpen) M.opener = opener || document.activeElement;
  fillModal(autoplay);
  if (!wasOpen) {
    modal.hidden = false; document.body.classList.add('lock');
    requestAnimationFrame(function () { modal.classList.add('open'); });
    setTimeout(function () { modal.querySelector('.m-close').focus(); }, 50);
  }
}
function closeModal() {
  var modal = $('modal'); if (modal.hidden) return;
  modal.classList.remove('open'); document.body.classList.remove('lock');
  setTimeout(function () { modal.hidden = true; $('mMedia').innerHTML = ''; }, REDUCED ? 0 : 350);
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  if (M.opener && M.opener.focus) M.opener.focus({ preventScroll: true });
}
function stepModal(d) { var n = LISTS[M.type]().length; M.i = (M.i + d + n) % n; fillModal(false); }
function openFromHash() {
  var m = location.hash.match(/^#([pks])\/(.+)$/); if (!m) return;
  var type = { p: 'project', k: 'package', s: 'skill' }[m[1]], list = LISTS[type]();
  for (var i = 0; i < list.length; i++) if (slug(itemName(type, list[i])) === m[2]) { openModal(type, i, null); return; }
}

// ══════════════════════════════
// TOAST
// ══════════════════════════════
var toastT = null;
function toast(msg) { var el = $('toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('show'); }, 2400); }

// ══════════════════════════════
// INTERACTIONS
// ══════════════════════════════
function hl(k, on) {
  document.querySelectorAll('[data-k="' + k + '"]').forEach(function (el) { el.classList.toggle('hl', on); });
}
function bindDynamic() {
  document.querySelectorAll('.pkgs [data-k], #graph .node').forEach(function (el) {
    el.addEventListener('pointerenter', function () { hl(el.dataset.k, true); });
    el.addEventListener('pointerleave', function () { hl(el.dataset.k, false); });
    el.addEventListener('focus', function () { hl(el.dataset.k, true); });
    el.addEventListener('blur', function () { hl(el.dataset.k, false); });
  });
}

function bindStatic() {
  // delegated open
  document.addEventListener('click', function (e) {
    var yt = e.target.closest('[data-yt]');
    if (yt) { yt.outerHTML = ytPlayer(yt.dataset.yt, true); return; }
    if (e.target.closest('a[href]:not([href^="#"])')) return;
    var o = e.target.closest('[data-open]');
    if (o) { e.preventDefault(); openModal(o.dataset.open, +o.dataset.i, o.closest('[tabindex],button') || o, !!o.dataset.autoplay); return; }
    if (e.target.closest('[data-close]')) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    var modalOpen = !$('modal').hidden;
    if (modalOpen) {
      if (e.key === 'Escape') closeModal();
      else if (e.key === 'ArrowLeft') stepModal(-1);
      else if (e.key === 'ArrowRight') stepModal(1);
      else if (e.key === 'Tab') {
        var f = [].slice.call($('mPanel').querySelectorAll('a[href],button:not([hidden]),[tabindex="0"],iframe')).filter(function (x) { return x.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      return;
    }
    if (e.key === 'Escape' && $('drawer').classList.contains('open')) toggleDrawer(false);
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement && document.activeElement.matches('[data-open][tabindex], [data-yt]')) {
      e.preventDefault(); document.activeElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  });
  $('mPrev').onclick = function () { stepModal(-1); };
  $('mNext').onclick = function () { stepModal(1); };

  // swipe between items in modal (mobile)
  var sx = null;
  $('mPanel').addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  $('mPanel').addEventListener('touchend', function (e) { if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 70) stepModal(dx < 0 ? 1 : -1); sx = null; });

  // language
  document.querySelectorAll('.lang button').forEach(function (b) {
    b.onclick = function () { if (lang === b.dataset.lang) return; lang = b.dataset.lang; try { localStorage.setItem('nix-lang', lang); } catch (e) {} renderAll(); if (!$('modal').hidden) fillModal(false); };
  });

  // copy email
  $('copyBtn').onclick = function () {
    var email = (CONFIG.profile.contact || {}).email || '', btn = this;
    var done = function () { toast(t('copied')); btn.textContent = '✓'; setTimeout(function () { btn.textContent = t('copy'); }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(email).then(done, function () { location.href = 'mailto:' + email; });
    else location.href = 'mailto:' + email;
  };

  // drawer
  $('burger').onclick = function () { toggleDrawer(!$('drawer').classList.contains('open')); };
  $('drawer').addEventListener('click', function (e) { if (e.target.closest('a')) toggleDrawer(false); });

  // back to top
  $('totop').onclick = function () { window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }); };

  // pointer effects (desktop only)
  if (window.matchMedia('(hover: hover)').matches && !REDUCED) {
    var glow = $('glow');
    document.addEventListener('pointermove', function (e) {
      glow.style.setProperty('--mx', e.clientX + 'px'); glow.style.setProperty('--my', e.clientY + 'px');
      var c = e.target.closest && e.target.closest('.spot');
      if (c) { var r = c.getBoundingClientRect(); c.style.setProperty('--x', (e.clientX - r.left) + 'px'); c.style.setProperty('--y', (e.clientY - r.top) + 'px'); }
    }, { passive: true });
    var pc = $('pcard');
    pc.addEventListener('pointermove', function (e) {
      var r = pc.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      pc.style.setProperty('--ry', ((x - 0.5) * 14) + 'deg'); pc.style.setProperty('--rx', (-(y - 0.5) * 14) + 'deg');
      pc.style.setProperty('--gx', (x * 100) + '%'); pc.style.setProperty('--gy', (y * 100) + '%');
    });
    pc.addEventListener('pointerleave', function () { pc.style.setProperty('--ry', '0deg'); pc.style.setProperty('--rx', '0deg'); });
  }

  // scroll-driven UI
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
    // scroll spy
    var cur = null;
    ['work', 'experience', 'skills', 'toolkit', 'contact'].forEach(function (id) { var s = $(id); if (s && !s.hidden && s.getBoundingClientRect().top < innerHeight * 0.4) cur = id; });
    document.querySelectorAll('.links a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + cur); });
    // timeline progress
    var tl = $('timeline');
    if (tl && tl.offsetParent) {
      var r = tl.getBoundingClientRect(), mid = innerHeight * 0.6, tp = Math.min(Math.max((mid - r.top) / r.height, 0), 1);
      tl.style.setProperty('--tl', (tp * 100) + '%');
      tl.querySelectorAll('.tl-item').forEach(function (it) { it.classList.toggle('lit', it.getBoundingClientRect().top + 30 < mid); });
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
  function get(path, type) {
    return fetch(BASE + path).then(function (r) { if (!r.ok) throw new Error(path + ': ' + r.status); return type === 'json' ? r.json() : r.text(); })
      .then(function (v) { got++; fill.style.width = (got / total * 100) + '%'; return v; });
  }
  Promise.all([
    get('web-config.json', 'json'),
    get('Database/skills.md'),
    get('Database/packages.md'),
    get('Database/projects.md'),
    fetch('preview-data.json').then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; })
      .then(function (v) { got++; fill.style.width = (got / total * 100) + '%'; return v; })
  ]).then(function (res) {
    CONFIG = res[0]; SKILLS = parseSkills(res[1]); PACKAGES = parsePackages(res[2]); PROJECTS = parseProjects(res[3]); EXTRA = res[4] || {};
    renderAll();
    bindStatic();
    booted = true;
    setTimeout(function () {
      ld.classList.add('done');
      openFromHash();
    }, Math.max(0, 650 - (Date.now() - t0)));
  }).catch(function (err) {
    console.error(err);
    ld.innerHTML = '<div class="ld-logo"><b>[</b><span>NIX</span><b>]</b></div><div class="ld-err">⚠ ' + t('err') + '<br><br>Serve the site over HTTP (e.g. <b>python3 -m http.server</b>) — browsers block fetch() on file://.<br><br><span style="color:#6b7690">' + esc(err.message) + '</span></div>';
  });
}
boot();
})();
