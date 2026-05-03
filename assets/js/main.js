/* ══════════════════════════════════════════
   [NIX] Portfolio — Main Script
   ══════════════════════════════════════════ */

// ── STATE ──
var CONFIG = null;
var SKILLS = [];
var PACKAGES = [];
var PROJECTS = [];
var lang = 'en';

// ══════════════════════════════
// PATH RESOLUTION
// Works on local file:// AND GitHub Pages
// ══════════════════════════════
function getBaseUrl() {
  if (window.location.protocol === 'file:') return '';
  var path = window.location.pathname;
  return window.location.origin + path.substring(0, path.lastIndexOf('/') + 1);
}

function resolvePath(rel) {
  var base = getBaseUrl();
  return base ? base + rel : rel;
}

// ══════════════════════════════
// MARKDOWN PARSERS
// Parse .md files from Database/
// ══════════════════════════════
function parseSkillsMd(md) {
  var skills = [];
  md.split(/^## /m).filter(Boolean).forEach(function(block) {
    var lines = block.trim().split('\n');
    var name = lines[0].trim();
    if (name.startsWith('#')) return;
    var obj = { name: name, level: 50, icon: 'code', description: { en: '', vi: '' } };
    lines.slice(1).forEach(function(line) {
      var m = line.match(/^- (\w+):\s*(.*)$/);
      if (m) {
        if (m[1] === 'level') obj.level = parseInt(m[2]) || 50;
        else if (m[1] === 'icon') obj.icon = m[2].trim();
        else if (m[1] === 'en') obj.description.en = m[2].trim();
        else if (m[1] === 'vi') obj.description.vi = m[2].trim();
      }
    });
    skills.push(obj);
  });
  return skills;
}

function parsePackagesMd(md) {
  var packages = [];
  md.split(/^## /m).filter(Boolean).forEach(function(block) {
    var lines = block.trim().split('\n');
    var title = lines[0].trim();
    if (title.startsWith('#')) return;
    var obj = { title: title, tags: [], githubLink: '', stars: 0, version: '', youtubeId: '', image: '', description: { en: '', vi: '' } };
    lines.slice(1).forEach(function(line) {
      var m = line.match(/^- (\w+):\s*(.*)$/);
      if (m) {
        var k = m[1], v = m[2].trim();
        if (k === 'tags') obj.tags = v.split(',').map(function(s) { return s.trim(); });
        else if (k === 'github') obj.githubLink = v;
        else if (k === 'stars') obj.stars = parseInt(v) || 0;
        else if (k === 'version') obj.version = v;
        else if (k === 'youtubeId') obj.youtubeId = v;
        else if (k === 'image') obj.image = v;
        else if (k === 'en') obj.description.en = v;
        else if (k === 'vi') obj.description.vi = v;
      }
    });
    packages.push(obj);
  });
  return packages;
}

function parseProjectsMd(md) {
  var projects = [];
  md.split(/^## /m).filter(Boolean).forEach(function(block) {
    var lines = block.trim().split('\n');
    var title = lines[0].trim();
    if (title.startsWith('#')) return;
    var obj = {
      title: title, role: { en: '', vi: '' }, youtubeId: '', downloadLink: '',
      featured: false, downloads: '', studio: '', accentColor: '#00e5ff',
      description: { en: '', vi: '' }
    };
    lines.slice(1).forEach(function(line) {
      var m = line.match(/^- ([\w_]+):\s*(.*)$/);
      if (m) {
        var k = m[1], v = m[2].trim();
        if (k === 'role_en') obj.role.en = v;
        else if (k === 'role_vi') obj.role.vi = v;
        else if (k === 'youtubeId') obj.youtubeId = v;
        else if (k === 'downloadLink') obj.downloadLink = v;
        else if (k === 'featured') obj.featured = v === 'true';
        else if (k === 'downloads') obj.downloads = v;
        else if (k === 'studio') obj.studio = v;
        else if (k === 'accentColor') obj.accentColor = v;
        else if (k === 'en') obj.description.en = v;
        else if (k === 'vi') obj.description.vi = v;
      }
    });
    projects.push(obj);
  });
  return projects;
}

// ══════════════════════════════
// LANGUAGE
// ══════════════════════════════
function detectLang() {
  var nav = navigator.language || navigator.userLanguage || 'en';
  return nav.toLowerCase().startsWith('vi') ? 'vi' : 'en';
}

function setLang(l) {
  lang = l;
  document.getElementById('btnEn').classList.toggle('active', l === 'en');
  document.getElementById('btnVi').classList.toggle('active', l === 'vi');
  document.documentElement.lang = l;
  renderAll();
}

function t(key) {
  return CONFIG.i18n[lang][key] || key;
}

function loc(obj) {
  if (typeof obj === 'string') return obj;
  return obj[lang] || obj['en'] || '';
}

// ══════════════════════════════
// SVG ICONS (inline)
// ══════════════════════════════
var ICONS = {
  mail: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>',
  github: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>',
  linkedin: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  itchio: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M3.13 1.338C2.08 1.96.02 4.328 0 4.95v1.03c0 1.303 1.22 2.45 2.325 2.45 1.33 0 2.436-1.102 2.436-2.41 0 1.308 1.07 2.41 2.4 2.41 1.328 0 2.362-1.102 2.362-2.41 0 1.308 1.104 2.41 2.432 2.41h.024c1.33 0 2.432-1.102 2.432-2.41 0 1.308 1.034 2.41 2.363 2.41 1.33 0 2.4-1.102 2.4-2.41 0 1.308 1.105 2.41 2.435 2.41C22.78 8.43 24 7.282 24 5.98V4.95c-.02-.622-2.08-2.99-3.13-3.612C19.948 1 12.588 1 12 1c-.588 0-7.948 0-8.87.338z"/></svg>',
  download: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  play: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>',
  playLg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>',
  blog: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/></svg>'
};

// ══════════════════════════════
// SKILL ICONS (per category)
// ══════════════════════════════
var SKILL_ICONS = {
  unity:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 2.5L22 7.5v9l-8.5 5-8.5-5v-9zm0 2.3L7 8.4v7.2l6.5 3.8 6.5-3.8V8.4z"/></svg>',
  code:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  design: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4z"/></svg>',
  vfx:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  ui:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
  mobile: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>'
};

// ══════════════════════════════
// RENDER FUNCTIONS
// ══════════════════════════════
function renderAll() {
  renderHero();
  renderSkills();
  renderGames();
  renderPackages();
  renderI18nAttrs();
}

function renderHero() {
  var p = CONFIG.profile;
  document.title = '[NIX] - Portfolio';

  var initials = p.name.replace(/\[.*?\]/g, '').trim().split(/\s+/).map(function(w) { return w[0]; }).join('').slice(0, 2).toUpperCase();

  // Logo
  var tag = p.name.match(/\[([^\]]+)\]/);
  document.getElementById('logoName').innerHTML = tag
    ? '<span class="bracket">[</span>' + tag[1] + '<span class="bracket">]</span>'
    : initials;

  if (p.avatar) {
    var img = document.getElementById('logoImg');
    img.src = p.avatar;
    img.style.display = 'block';
  }

  // Avatar
  var avatarBox = document.getElementById('avatarBox');
  if (p.avatar) {
    avatarBox.innerHTML = '<img src="' + p.avatar + '" alt="' + p.name + '"/>';
  } else {
    avatarBox.innerHTML = '<span style="position:relative;z-index:1">' + initials + '</span>';
  }

  // Eyebrow
  var roles = loc(p.title).split(',').map(function(s) { return s.trim().toUpperCase(); });
  document.getElementById('heroEyebrow').textContent = '// ' + roles.join(' · ');

  // Name
  var nameBase = p.name.replace(/\s*\[.*?\]/, '');
  var nameTag = p.name.match(/\[([^\]]+)\]/);
  document.getElementById('heroName').innerHTML = nameTag
    ? nameBase + ' <span class="name-tag">[' + nameTag[1] + ']</span>'
    : nameBase;

  document.getElementById('heroTitle').textContent = loc(p.bio);
  document.getElementById('statusText').textContent = loc(p.statusLabel);
  document.getElementById('statusSub').textContent = p.location || '';

  // Footer
  document.getElementById('footerText').textContent =
    '© ' + new Date().getFullYear() + ' ' + p.name + ' — Built with ☕ in ' + p.location.split(',')[0].trim();

  // Stats
  document.getElementById('statsRow').innerHTML = p.stats.map(function(s) {
    return '<div class="stat-item"><span class="stat-val">' + s.value + '</span><span class="stat-lbl">' + loc(s.label) + '</span></div>';
  }).join('');

  // Contact chips
  var links = [];
  if (p.contact.github) links.push('<a class="contact-chip" href="https://' + p.contact.github + '" target="_blank">' + ICONS.github + ' GitHub</a>');
  if (p.contact.blog) links.push('<a class="contact-chip" href="' + p.contact.blog + '" target="_blank">' + ICONS.blog + ' Blog</a>');
  if (p.contact.email) links.push('<a class="contact-chip" href="mailto:' + p.contact.email + '">' + ICONS.mail + ' Email</a>');
  if (p.contact.linkedin) links.push('<a class="contact-chip" href="' + p.contact.linkedin + '" target="_blank">' + ICONS.linkedin + ' LinkedIn</a>');
  if (p.contact.itchio) links.push('<a class="contact-chip" href="' + p.contact.itchio + '" target="_blank">' + ICONS.itchio + ' Itch.io</a>');
  document.getElementById('contactLinks').innerHTML = links.join('');

  document.getElementById('emailBtn').href = 'mailto:' + p.contact.email;
}

function renderSkills() {
  var grid = document.getElementById('skillsGrid');
  grid.innerHTML = SKILLS.map(function(s, i) {
    var dc = ' reveal reveal-d' + Math.min(i + 1, 7);
    var lvlClass = s.level >= 75 ? ' skill-lvl-high' : s.level >= 50 ? ' skill-lvl-mid' : ' skill-lvl-low';
    var lvlLabel = lang === 'vi'
      ? (s.level >= 75 ? 'Thành thạo' : s.level >= 50 ? 'Trung cấp' : 'Đang học')
      : (s.level >= 75 ? 'Proficient' : s.level >= 50 ? 'Intermediate' : 'Learning');
    var iconHtml = (s.icon && SKILL_ICONS[s.icon])
      ? '<span class="skill-icon">' + SKILL_ICONS[s.icon] + '</span>'
      : '';
    return '<div class="skill-card' + dc + lvlClass + '" onclick=\'openSkillModal(' + JSON.stringify(s).replace(/'/g, "\\'") + ')\'>' +
      '<div class="skill-top">' +
        '<div class="skill-name-row">' + iconHtml + '<span class="skill-name">' + s.name + '</span></div>' +
        '<span class="skill-pct">' + s.level + '%</span>' +
      '</div>' +
      '<div class="skill-bar-bg"><div class="skill-bar-fill" style="width:0%" data-level="' + s.level + '"></div></div>' +
      '<div class="skill-footer"><span class="skill-level-label">' + lvlLabel + '</span></div>' +
      '<p class="skill-desc">' + loc(s.description) + '</p></div>';
  }).join('');
  refreshObserver();
}

function renderGames() {
  var grid = document.getElementById('gamesGrid');
  if (!PROJECTS.length) {
    grid.innerHTML = '<p style="color:var(--text-dim);font-size:0.82rem;">No game projects yet.</p>';
    return;
  }
  grid.innerHTML = PROJECTS.map(function(g, idx) {
    var dc = ' reveal reveal-d' + Math.min(idx + 1, 7);
    return '<div class="game-card' + dc + '" onclick=\'openModal(' + JSON.stringify(g).replace(/'/g, "\\'") + ')\'>' +
      '<div class="game-accent-bar" style="background:' + (g.accentColor || 'var(--accent)') + '"></div>' +
      (g.youtubeId ? '<div class="game-thumb" id="thumb-' + idx + '">' +
        '<img src="https://img.youtube.com/vi/' + g.youtubeId + '/mqdefault.jpg" onerror="this.src=\'https://img.youtube.com/vi/' + g.youtubeId + '/hqdefault.jpg\'" alt="' + g.title + '" />' +
        '<div class="game-thumb-play" onclick="event.stopPropagation();embedCardVideo(\'thumb-' + idx + '\',\'' + g.youtubeId + '\')">' + ICONS.play + '</div>' +
        '<div class="game-thumb-label">▶ Demo</div></div>' : '') +
      '<div class="game-body"><div class="game-meta">' +
        '<span class="game-studio">' + (g.studio || 'Personal') + '</span>' +
        '<span class="game-role">' + loc(g.role || 'Dev') + '</span></div>' +
      '<div class="game-title">' + g.title + '</div>' +
      '<p class="game-desc">' + loc(g.description) + '</p>' +
      '<div class="game-footer"><span class="game-downloads">⬇ ' + (g.downloads || '—') + '</span>' +
        (g.downloadLink ? '<a class="btn-store" href="' + g.downloadLink + '" target="_blank" onclick="event.stopPropagation()">' + ICONS.download + ' ' + t('view_on_store') + '</a>' : '') +
      '</div></div></div>';
  }).join('');
  refreshObserver();
}

function renderPackages() {
  var list = document.getElementById('packagesList');
  list.innerHTML = PACKAGES.map(function(pkg, i) {
    var dc = ' reveal reveal-d' + Math.min(i + 1, 7);
    return '<div class="pkg-item' + dc + '" onclick=\'openPkgModal(' + JSON.stringify(pkg).replace(/'/g, "\\'") + ')\'>' +
      '<div class="pkg-left"><div class="pkg-title-row"><span class="pkg-title">' + pkg.title + '</span>' +
        '<span class="pkg-version">' + pkg.version + '</span></div>' +
      '<p class="pkg-desc">' + loc(pkg.description) + '</p>' +
      '<div class="pkg-tags">' + pkg.tags.map(function(tag) { return '<span class="pkg-tag">' + tag + '</span>'; }).join('') + '</div></div>' +
      '<div class="pkg-right"><span class="pkg-stars">★ ' + pkg.stars + '</span>' +
        '<a class="btn-github" href="' + pkg.githubLink + '" target="_blank" onclick="event.stopPropagation()">' + ICONS.github + ' ' + t('view_on_github') + '</a></div></div>';
  }).join('');
  refreshObserver();
}

function renderI18nAttrs() {
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var val = t(el.dataset.i18n);
    if (val) el.textContent = val;
  });
}

// ══════════════════════════════
// TABS
// ══════════════════════════════
function switchTab(tab) {
  document.getElementById('panelGames').classList.toggle('active', tab === 'games');
  document.getElementById('panelPackages').classList.toggle('active', tab === 'packages');
  document.getElementById('tabGames').classList.toggle('active', tab === 'games');
  document.getElementById('tabPackages').classList.toggle('active', tab === 'packages');
  refreshObserver();
}

// ══════════════════════════════
// INTERSECTION OBSERVER (reveal + skill bars)
// ══════════════════════════════
var _observer = null;

function refreshObserver() {
  if (_observer) _observer.disconnect();
  _observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        entry.target.querySelectorAll('.skill-bar-fill').forEach(function(bar) {
          setTimeout(function() { bar.style.width = bar.dataset.level + '%'; }, 150);
        });
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal:not(.visible)').forEach(function(el) {
    _observer.observe(el);
  });
}

// ══════════════════════════════
// NAV SCROLL + ACTIVE LINK
// ══════════════════════════════
window.addEventListener('scroll', function() {
  var nav = document.querySelector('nav');
  nav.classList.toggle('scrolled', window.scrollY > 10);

  var ids = ['about', 'projects', 'skills', 'contact'];
  var pos = window.scrollY + 100;
  ids.forEach(function(id) {
    var sec = document.getElementById(id);
    var link = document.querySelector('.nav-links a[href="#' + id + '"]');
    if (sec && link) {
      var active = pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight;
      link.classList.toggle('active', active);
    }
  });
});

// ══════════════════════════════
// MOBILE NAV
// ══════════════════════════════
function toggleMobileNav() {
  document.getElementById('navLinks').classList.toggle('mobile-open');
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    a.addEventListener('click', function() {
      document.getElementById('navLinks').classList.remove('mobile-open');
    });
  });
});

// ══════════════════════════════
// YOUTUBE EMBED
// ══════════════════════════════
function embedCardVideo(thumbId, videoId) {
  var thumb = document.getElementById(thumbId);
  if (!thumb) return;
  thumb.innerHTML = '<div class="yt-wrapper"><iframe src="https://www.youtube.com/embed/' + videoId +
    '?autoplay=1&rel=0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe></div>';
  thumb.onclick = function(e) { e.stopPropagation(); };
}

function loadYTIframe(placeholder, videoId) {
  var w = document.createElement('div');
  w.className = 'yt-wrapper';
  w.innerHTML = '<iframe src="https://www.youtube.com/embed/' + videoId +
    '?autoplay=1&rel=0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe>';
  placeholder.replaceWith(w);
}

// ══════════════════════════════
// MODAL
// ══════════════════════════════
function _showModal() {
  document.getElementById('projectModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function _resetModal() {
  ['modalMetaRow', 'modalSkillSection', 'modalPkgSection', 'modalVideoSection', 'modalCaseSection'].forEach(function(id) {
    document.getElementById(id).style.display = 'none';
  });
  document.getElementById('modalLink').style.display = 'none';
  document.getElementById('modalVideoBox').innerHTML = '';
}

function openModal(g) {
  _resetModal();
  document.getElementById('modalTitle').textContent = g.title;
  document.getElementById('modalSub').textContent = g.studio || 'Personal';
  document.getElementById('modalDesc').textContent = loc(g.description);
  document.getElementById('modalMetaRow').style.display = 'flex';
  document.getElementById('modalRole').textContent = loc(g.role || 'Dev');
  document.getElementById('modalDownloads').textContent = '⬇ ' + (g.downloads || '—');

  if (g.youtubeId && g.youtubeId !== '' && !g.youtubeId.startsWith('VIDEO_ID')) {
    document.getElementById('modalVideoSection').style.display = 'block';
    document.getElementById('modalVideoBox').innerHTML =
      '<div class="yt-placeholder" onclick="loadYTIframe(this,\'' + g.youtubeId + '\')">' +
      '<img src="https://img.youtube.com/vi/' + g.youtubeId + '/maxresdefault.jpg" onerror="this.src=\'https://img.youtube.com/vi/' + g.youtubeId + '/hqdefault.jpg\'" alt="Video" />' +
      '<div class="yt-play-btn">' + ICONS.playLg + '</div></div>';
  }
  if (g.caseStudy) {
    document.getElementById('modalCaseSection').style.display = 'block';
    document.getElementById('modalCaseStudy').textContent = loc(g.caseStudy);
  }
  if (g.downloadLink) {
    var btn = document.getElementById('modalLink');
    btn.style.display = 'inline-block';
    btn.href = g.downloadLink;
    btn.textContent = t('view_on_store');
  }
  _showModal();
}

function openSkillModal(s) {
  _resetModal();
  document.getElementById('modalTitle').textContent = s.name;
  document.getElementById('modalSub').textContent = '// skill';
  document.getElementById('modalDesc').textContent = loc(s.description);
  document.getElementById('modalSkillSection').style.display = 'block';
  document.getElementById('modalSkillPct').textContent = s.level + '%';
  requestAnimationFrame(function() {
    setTimeout(function() { document.getElementById('modalSkillBar').style.width = s.level + '%'; }, 60);
  });
  _showModal();
}

function openPkgModal(pkg) {
  _resetModal();
  document.getElementById('modalTitle').textContent = pkg.title;
  document.getElementById('modalSub').textContent = pkg.version || '';
  document.getElementById('modalDesc').textContent = loc(pkg.description);
  document.getElementById('modalPkgSection').style.display = 'block';
  document.getElementById('modalPkgTags').innerHTML = (pkg.tags || []).map(function(tag) { return '<span class="pkg-tag">' + tag + '</span>'; }).join('');
  document.getElementById('modalPkgStars').textContent = pkg.stars ? '★ ' + pkg.stars : '';
  document.getElementById('modalPkgVersion').textContent = pkg.version || '';
  if (pkg.youtubeId) {
    document.getElementById('modalVideoSection').style.display = 'block';
    document.getElementById('modalVideoBox').innerHTML =
      '<div class="yt-placeholder" onclick="loadYTIframe(this,\'' + pkg.youtubeId + '\')">' +
      '<img src="https://img.youtube.com/vi/' + pkg.youtubeId + '/maxresdefault.jpg" ' +
      'onerror="this.src=\'https://img.youtube.com/vi/' + pkg.youtubeId + '/hqdefault.jpg\'" alt="Demo" />' +
      '<div class="yt-play-btn">' + ICONS.playLg + '</div></div>';
  } else if (pkg.image) {
    document.getElementById('modalVideoSection').style.display = 'block';
    document.getElementById('modalVideoBox').innerHTML =
      '<img src="' + pkg.image + '" alt="' + pkg.title + '">';
  }
  if (pkg.githubLink) {
    var btn = document.getElementById('modalLink');
    btn.style.display = 'inline-block';
    btn.href = pkg.githubLink;
    btn.textContent = t('view_on_github');
  }
  _showModal();
}

function closeModal() {
  document.getElementById('projectModal').classList.remove('show');
  document.body.style.overflow = '';
  document.getElementById('modalVideoBox').innerHTML = '';
  document.getElementById('modalSkillBar').style.width = '0%';
}

window.addEventListener('click', function(e) {
  if (e.target === document.getElementById('projectModal')) closeModal();
});
window.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

// ══════════════════════════════
// INIT — load all data files
// ══════════════════════════════
function loadAll() {
  Promise.all([
    fetch(resolvePath('web-config.json')).then(function(r) { if (!r.ok) throw new Error('web-config.json: ' + r.status); return r.json(); }),
    fetch(resolvePath('Database/skills.md')).then(function(r) { if (!r.ok) throw new Error('skills.md: ' + r.status); return r.text(); }),
    fetch(resolvePath('Database/packages.md')).then(function(r) { if (!r.ok) throw new Error('packages.md: ' + r.status); return r.text(); }),
    fetch(resolvePath('Database/projects.md')).then(function(r) { if (!r.ok) throw new Error('projects.md: ' + r.status); return r.text(); })
  ]).then(function(res) {
    CONFIG = res[0];
    SKILLS = parseSkillsMd(res[1]);
    PACKAGES = parsePackagesMd(res[2]);
    PROJECTS = parseProjectsMd(res[3]);

    lang = detectLang();
    setLang(lang);

    setTimeout(function() {
      document.getElementById('loader').classList.add('hidden');
      refreshObserver();
      countUpStats();
    }, 600);
  }).catch(function(err) {
    console.error(err);
    document.getElementById('loader').innerHTML =
      '<div style="color:#ff6b6b;font-family:monospace;font-size:0.78rem;text-align:center;padding:2rem;max-width:480px;line-height:1.7;">' +
      '⚠ Could not load data files.<br><br>' +
      'Make sure <b>web-config.json</b> and <b>Database/</b> folder (skills.md, packages.md, projects.md) are alongside index.html.<br><br>' +
      '<span style="color:#6a7590;font-size:0.68rem;">Error: ' + err.message + '</span></div>';
  });
}

function countUpStats() {
  document.querySelectorAll('.stat-val').forEach(function(el) {
    var text = el.textContent.trim();
    var match = text.match(/^(\d+)(.*)/);
    if (!match) return;
    var target = parseInt(match[1]);
    var suffix = match[2];
    var duration = 900;
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var p = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

loadAll();
