/* ══════════════════════════════════════════
   [NIX] Project Studio — UI
   Talks to _admin/server.mjs. Every write sends the X-Studio header.
   ══════════════════════════════════════════ */
(function () {
'use strict';

var S = { order: [], projects: {}, files: {}, broken: {}, changed: new Set() };
var ED = null; // editor state
var ID_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;
var VIDEO_WARN = 50 * 1024 * 1024, VIDEO_MAX = 100 * 1024 * 1024;

// ══════════════════════════════
// HELPERS
// ══════════════════════════════
function $(id) { return document.getElementById(id); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function slug(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80); }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function fmtSize(b) { return b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }
function fileURL(id, rel) { return /^(https?:)?\/\//.test(rel) ? rel : '/Database/Projects/' + id + '/' + rel; }
function L(v) { return v && typeof v === 'object' ? { en: v.en || '', vi: v.vi || '' } : { en: v == null ? '' : String(v), vi: '' }; }
function parseYT(v) {
  v = String(v || '').trim();
  var m = v.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/);
  if (m) return m[1];
  return /^[\w-]{11}$/.test(v) ? v : '';
}

var toastT;
function toast(msg, kind) {
  var el = $('toast'); el.textContent = msg; el.className = 'toast show ' + (kind || 'ok');
  clearTimeout(toastT); toastT = setTimeout(function () { el.className = 'toast'; }, kind === 'err' ? 5000 : 2600);
}
function api(method, url, body) {
  return fetch(url, { method: method, headers: { 'X-Studio': '1', 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) })
    .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.error || ('HTTP ' + r.status)); return j; }); });
}
function upload(id, rel, blob, onProgress) {
  return new Promise(function (resolve, reject) {
    var x = new XMLHttpRequest();
    x.open('POST', '/api/projects/' + id + '/files?path=' + encodeURIComponent(rel));
    x.setRequestHeader('X-Studio', '1');
    x.upload.onprogress = function (e) { if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total); };
    x.onload = function () { var j = {}; try { j = JSON.parse(x.responseText); } catch (e) {} if (x.status < 300) resolve(j); else reject(new Error(j.error || 'Upload failed')); };
    x.onerror = function () { reject(new Error('Upload failed')); };
    x.send(blob);
  });
}
// Resize + re-encode in the browser (screenshots/poster → JPG, icon → PNG).
function compress(file, max, type, quality) {
  if (file.type === 'image/gif') return Promise.resolve(file);
  return createImageBitmap(file).then(function (bmp) {
    var s = Math.min(1, max / Math.max(bmp.width, bmp.height));
    var c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
    var g = c.getContext('2d');
    if (type === 'image/jpeg') { g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height); }
    g.drawImage(bmp, 0, 0, c.width, c.height);
    return new Promise(function (r) { c.toBlob(r, type, quality); });
  });
}
function pickFiles(accept, multiple) {
  return new Promise(function (resolve) {
    var i = document.createElement('input'); i.type = 'file'; i.accept = accept; i.multiple = !!multiple;
    i.onchange = function () { resolve([].slice.call(i.files)); }; i.click();
  });
}
function confirmDlg(title, html, yesLabel) {
  return new Promise(function (resolve) {
    $('dlgT').textContent = title; $('dlgB').innerHTML = html; $('dlgYes').textContent = yesLabel || 'Xoá';
    $('dlg').hidden = false; $('dlgNo').focus();
    function done(v) { $('dlg').hidden = true; $('dlgYes').onclick = $('dlgNo').onclick = null; resolve(v); }
    $('dlgYes').onclick = function () { done(true); }; $('dlgNo').onclick = function () { done(false); };
  });
}

// ══════════════════════════════
// DATA ↔ FORM
// ══════════════════════════════
var KEY_ORDER = ['placeholder', 'title', 'studio', 'accentColor', 'downloads', 'store', 'video', 'poster', 'icon', 'tagline', 'team', 'teamDetail', 'duration', 'status', 'platform', 'engine', 'year', 'overview', 'roles', 'learned', 'challenges', 'results', 'screenshots'];

function toDraft(o) {
  o = o || {};
  var v = o.video || {}, st = o.store || {};
  return {
    placeholder: !!o.placeholder, title: o.title || '', studio: o.studio || '', accentColor: o.accentColor || '#7c4dff', downloads: o.downloads || '',
    store: { googlePlay: st.googlePlay || '', appStore: st.appStore || '' },
    video: { youtube: v.youtube || '', file: v.file || '', orientation: v.orientation === 'portrait' ? 'portrait' : 'landscape' },
    poster: o.poster || '', icon: o.icon || '',
    tagline: L(o.tagline), team: o.team == null ? '' : String(o.team), teamDetail: L(o.teamDetail), duration: L(o.duration), status: L(o.status),
    platform: o.platform || '', engine: o.engine || '', year: o.year == null ? '' : String(o.year), overview: L(o.overview),
    roles: (o.roles || []).map(function (r) { return { name: L(r.name), summary: L(r.summary), did: pairs(r.did) }; }),
    learned: (o.learned || []).map(function (x) { return { title: L(x.title), text: pairs(x.text) }; }),
    challenges: (o.challenges || []).map(function (x) { return { title: L(x.title), problem: L(x.problem), solution: L(x.solution) }; }),
    results: (o.results || []).map(function (x) { return { value: x.value || '', label: L(x.label) }; }),
    screenshots: (o.screenshots || []).map(function (x) { return typeof x === 'string' ? { src: x, caption: L('') } : { src: x.src || '', caption: L(x.caption) }; })
  };
}

// {en:[…], vi:[…]} (or a plain string / array) → [{en, vi}, …] rows for the form
function pairs(v) {
  var arr = function (x) { return Array.isArray(x) ? x : x ? [x] : []; };
  var en = v && typeof v === 'object' && !Array.isArray(v) ? arr(v.en) : arr(v), vi = v && typeof v === 'object' && !Array.isArray(v) ? arr(v.vi) : [];
  var out = [];
  for (var i = 0; i < Math.max(en.length, vi.length); i++) out.push({ en: en[i] || '', vi: vi[i] || '' });
  return out;
}
// rows → {en:[…], vi:[…]}, dropping empty rows
function unpairs(rows) {
  var r = rows.filter(function (b) { return (b.en || '').trim() || (b.vi || '').trim(); });
  if (!r.length) return undefined;
  var col = function (k) { var c = r.map(function (b) { return (b[k] || '').trim(); }); return c.some(Boolean) ? c : []; }; // a language with no text stays []
  return { en: col('en'), vi: col('vi') };
}

// Build data.json from the draft: empty fields are dropped, unknown keys from the original file are kept.
function fromDraft(d, orig, vsrc) {
  var s = function (v) { v = String(v == null ? '' : v).trim(); return v || undefined; };
  var l = function (x) { var en = (x.en || '').trim(), vi = (x.vi || '').trim(); return en || vi ? { en: en, vi: vi } : undefined; };
  var list = function (arr, fn) { var out = arr.map(fn).filter(Boolean); return out.length ? out : undefined; };
  var store = {}; if (s(d.store.googlePlay)) store.googlePlay = s(d.store.googlePlay); if (s(d.store.appStore)) store.appStore = s(d.store.appStore);
  var video;
  if (vsrc === 'youtube' && s(d.video.youtube)) video = { youtube: s(d.video.youtube), orientation: d.video.orientation };
  if (vsrc === 'file' && s(d.video.file)) video = { file: s(d.video.file), orientation: d.video.orientation };
  var team = s(d.team);
  var known = {
    placeholder: d.placeholder ? true : undefined,
    title: (d.title || '').trim(), studio: s(d.studio), accentColor: s(d.accentColor), downloads: s(d.downloads),
    store: Object.keys(store).length ? store : undefined, video: video, poster: s(d.poster), icon: s(d.icon),
    tagline: l(d.tagline), team: team && /^\d+$/.test(team) ? +team : team, teamDetail: (function (x) { return x && !x.vi ? x.en : x; })(l(d.teamDetail)), duration: l(d.duration), status: l(d.status),
    platform: s(d.platform), engine: s(d.engine), year: s(d.year), overview: l(d.overview),
    roles: list(d.roles, function (r) {
      var name = l(r.name); if (!name) return null;
      var out = { name: name };
      if (l(r.summary)) out.summary = l(r.summary);
      if (unpairs(r.did)) out.did = unpairs(r.did);
      return out;
    }),
    learned: list(d.learned, function (x) { var tx = unpairs(x.text); return l(x.title) || tx ? { title: l(x.title) || { en: '', vi: '' }, text: tx || { en: [], vi: [] } } : null; }),
    challenges: list(d.challenges, function (x) { return l(x.title) || l(x.problem) || l(x.solution) ? { title: l(x.title) || { en: '', vi: '' }, problem: l(x.problem) || { en: '', vi: '' }, solution: l(x.solution) || { en: '', vi: '' } } : null; }),
    results: list(d.results, function (x) { return s(x.value) || l(x.label) ? { value: s(x.value) || '', label: l(x.label) || { en: '', vi: '' } } : null; }),
    screenshots: list(d.screenshots, function (x) { return !s(x.src) ? null : l(x.caption) ? { src: x.src, caption: l(x.caption) } : x.src; })
  };
  var out = {};
  KEY_ORDER.forEach(function (k) { if (known[k] !== undefined) out[k] = known[k]; });
  Object.keys(orig || {}).forEach(function (k) { if (KEY_ORDER.indexOf(k) < 0) out[k] = orig[k]; });
  return out;
}
// Media files a data object points at (used to clean up removed uploads on save).
function refs(o) {
  var r = new Set();
  if (!o) return r;
  if (o.video && o.video.file) r.add(o.video.file);
  if (o.icon) r.add(o.icon);
  if (o.poster) r.add(o.poster);
  (o.screenshots || []).forEach(function (x) { r.add(typeof x === 'string' ? x : x.src); });
  return r;
}

function getPath(obj, path) { return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, obj); }
function setPath(obj, path, val) {
  var ks = path.split('.'), last = ks.pop();
  var o = ks.reduce(function (o, k) { return o[k]; }, obj); o[last] = val;
}

// ══════════════════════════════
// LOAD + ROUTING
// ══════════════════════════════
function load() {
  return fetch('/api/projects').then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(function (j) {
    S.order = j.order; S.projects = j.projects; S.files = j.files; S.broken = j.broken;
    $('srv').classList.remove('off');
  });
}
function route() {
  var h = location.hash || '#/';
  var m = h.match(/^#\/edit\/([a-z0-9-]+)/);
  if (m) return openEditor(m[1]);
  if (h === '#/new') return openEditor(null);
  ED = null; renderList();
}
var lastHash = location.hash;
window.addEventListener('hashchange', function () {
  if (ED && isDirty() && !confirm('Bạn có thay đổi chưa lưu. Rời trang?')) { history.replaceState(null, '', lastHash); return; }
  lastHash = location.hash; route();
});
window.addEventListener('beforeunload', function (e) { if (ED && isDirty()) { e.preventDefault(); e.returnValue = ''; } });

// ══════════════════════════════
// LIST VIEW
// ══════════════════════════════
function thumbHTML(id) {
  var p = S.projects[id] || {}, src = '';
  if (p.icon) src = fileURL(id, p.icon);
  else if (p.poster) src = fileURL(id, p.poster);
  else if (p.video && p.video.youtube) src = 'https://img.youtube.com/vi/' + p.video.youtube + '/default.jpg';
  return src ? '<img src="' + esc(src) + '" alt="">' : '<span style="background:' + esc(p.accentColor || '#7c4dff') + ';width:100%;height:100%;display:grid;place-items:center">' + esc((p.title || id).charAt(0)) + '</span>';
}
function renderList() {
  var orphans = Object.keys(S.files).filter(function (id) { return S.order.indexOf(id) < 0; });
  var ids = S.order.filter(function (id) { return S.files[id]; });
  var rows = ids.map(function (id, i) { return rowHTML(id, i, true); }).join('');
  var orphanRows = orphans.map(function (id) { return rowHTML(id, -1, false); }).join('');
  $('app').innerHTML =
    '<div class="ph"><div><h1>Dự án <span style="color:var(--dim);font-weight:500">(' + ids.length + ')</span></h1>' +
      '<p>Kéo <b>⠿</b> để đổi thứ tự hiển thị trên trang chủ — thứ tự được lưu vào <code>index.json</code> ngay.</p></div>' +
      '<div class="acts"><a class="btn pri" href="#/new">+ Thêm dự án</a></div></div>' +
    (ids.length ? '<ul class="plist" id="plist">' + rows + '</ul>' : '<div class="empty">Chưa có dự án nào. Bấm <b>+ Thêm dự án</b> để bắt đầu.</div>') +
    (orphans.length ? '<h3 style="margin:26px 0 10px;color:var(--gold);font-size:.9rem">Thư mục chưa có trong index.json (không hiện trên site)</h3><ul class="plist">' + orphanRows + '</ul>' : '') +
    gitBox();
  bindListDnD();
}
function rowHTML(id, i, listed) {
  var p = S.projects[id], broken = S.broken[id];
  var badges = [];
  if (broken) badges.push('<span class="bdg r" title="' + esc(broken) + '">lỗi data.json</span>');
  else {
    if (p.video && p.video.file) badges.push('<span class="bdg c">▶ mp4' + (p.video.orientation === 'portrait' ? ' · dọc' : '') + '</span>');
    else if (p.video && p.video.youtube) badges.push('<span class="bdg c">▶ YouTube' + (p.video.orientation === 'portrait' ? ' · dọc' : '') + '</span>');
    if ((p.screenshots || []).length) badges.push('<span class="bdg">' + p.screenshots.length + ' ảnh</span>');
    if (p.downloads) badges.push('<span class="bdg g">' + esc(p.downloads) + '</span>');
    if (p.placeholder) badges.push('<span class="bdg y">sample data</span>');
  }
  return '<li class="prow' + (broken ? ' broken' : '') + '" data-id="' + id + '"' + (listed ? ' draggable="true"' : '') + '>' +
    (listed ? '<span class="handle" title="Kéo để sắp xếp">⠿</span><span class="num">' + String(i + 1).padStart(2, '0') + '</span>' : '<span></span><span></span>') +
    '<div class="thumb">' + (broken ? '!' : thumbHTML(id)) + '</div>' +
    '<div class="t"><b>' + esc(broken ? id : p.title || id) + '</b><span>' + esc(broken ? broken : id) + '</span></div>' +
    '<div class="badges">' + badges.join('') + '</div>' +
    '<div class="row-acts">' +
      (listed ? '<div class="updown"><button type="button" data-act="mv" data-id="' + id + '" data-d="-1" aria-label="Lên">▲</button><button type="button" data-act="mv" data-id="' + id + '" data-d="1" aria-label="Xuống">▼</button></div>'
              : '<button class="btn ghost sm" type="button" data-act="addIndex" data-id="' + id + '">Thêm vào danh sách</button>') +
      (broken ? '' : '<a class="btn ghost sm" href="#/edit/' + id + '">Sửa</a>') +
      '<a class="icon-btn" href="/project.html?p=' + id + '" target="_blank" rel="noopener" title="Xem trên site">↗</a>' +
      '<button class="icon-btn del" type="button" data-act="delProject" data-id="' + id + '" title="Xoá dự án">🗑</button>' +
    '</div></li>';
}
function gitBox() {
  var ch = [].slice.call(S.changed);
  return '<div class="gitbox"><div><b style="color:var(--bright)">Xong thì commit để đăng lên web</b>' +
    (ch.length ? '<ul>' + ch.slice(0, 12).map(function (c) { return '<li>• ' + esc(c) + '</li>'; }).join('') + (ch.length > 12 ? '<li>… +' + (ch.length - 12) + '</li>' : '') + '</ul>' : '<div style="font-size:.78rem;color:var(--dim)">Chưa có thay đổi trong phiên này.</div>') +
    '</div><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><code id="gitCmd">git add Database/Projects && git commit -m "Update projects"</code><button class="btn ghost sm" type="button" data-act="copyGit">Copy</button></div></div>';
}
function saveOrder(order) {
  return api('PUT', '/api/order', { order: order }).then(function () { S.order = order; S.changed.add('Database/Projects/index.json'); renderList(); toast('Đã lưu thứ tự'); })
    .catch(function (e) { toast(e.message, 'err'); });
}
function bindListDnD() {
  var list = $('plist'); if (!list) return;
  var dragId = null;
  list.addEventListener('dragstart', function (e) { var r = e.target.closest('.prow'); if (!r) return; dragId = r.dataset.id; r.classList.add('drag'); e.dataTransfer.effectAllowed = 'move'; });
  list.addEventListener('dragend', function (e) { var r = e.target.closest('.prow'); if (r) r.classList.remove('drag'); });
  list.addEventListener('dragover', function (e) { var r = e.target.closest('.prow'); if (!r || !dragId) return; e.preventDefault(); list.querySelectorAll('.over').forEach(function (x) { x.classList.remove('over'); }); r.classList.add('over'); });
  list.addEventListener('dragleave', function (e) { var r = e.target.closest('.prow'); if (r) r.classList.remove('over'); });
  list.addEventListener('drop', function (e) {
    e.preventDefault(); var r = e.target.closest('.prow'); if (!r || !dragId || r.dataset.id === dragId) return;
    var order = S.order.filter(function (x) { return x !== dragId; });
    order.splice(order.indexOf(r.dataset.id) + (S.order.indexOf(dragId) < S.order.indexOf(r.dataset.id) ? 1 : 0), 0, dragId);
    dragId = null; saveOrder(order);
  });
}
function deleteProject(id) {
  var files = S.files[id] || [], p = S.projects[id] || {};
  return confirmDlg('Xoá dự án?',
    '<p>Sẽ xoá vĩnh viễn thư mục <code>Database/Projects/' + esc(id) + '/</code> (' + (files.length + 1) + ' file' + (files.length ? ', ' + fmtSize(files.reduce(function (a, f) { return a + f.size; }, 0)) : '') + ') và gỡ khỏi <code>index.json</code>.</p>' +
    '<p><b style="color:var(--bright)">' + esc(p.title || id) + '</b></p><p style="color:var(--dim);font-size:.78rem">Nếu đã commit trước đó, bạn vẫn có thể khôi phục bằng git.</p>')
    .then(function (ok) {
      if (!ok) return false;
      return api('DELETE', '/api/projects/' + id).then(function () {
        S.changed.add('Database/Projects/' + id + '/ (deleted)'); S.changed.add('Database/Projects/index.json');
        toast('Đã xoá ' + (p.title || id)); return load().then(function () { return true; });
      });
    }).catch(function (e) { toast(e.message, 'err'); return false; });
}

// ══════════════════════════════
// EDITOR
// ══════════════════════════════
function openEditor(id) {
  if (id && !S.projects[id]) { toast('Không tìm thấy dự án "' + id + '"', 'err'); location.hash = '#/'; return; }
  var orig = id ? S.projects[id] : {};
  var d = toDraft(orig);
  ED = {
    id: id, orig: orig, d: d, folder: id || '', folderTouched: !!id,
    vsrc: d.video.file ? 'file' : d.video.youtube ? 'youtube' : 'none',
    uploaded: new Set(), pvMobile: ED && ED.pvMobile, pvStamp: Date.now()
  };
  ED.saved = snapshot();
  renderEditor();
  window.scrollTo(0, 0);
}
function snapshot() { return JSON.stringify([fromDraft(ED.d, ED.orig, ED.vsrc), ED.folder]); }
function isDirty() { return ED && snapshot() !== ED.saved; }
function updateDirty() { var el = $('dirtyFlag'); if (el) el.hidden = !isDirty(); }

// ── form building blocks ──
function inp(path, label, o) {
  o = o || {};
  var v = path.charAt(0) === '@' ? ED[path.slice(1)] : getPath(ED.d, path);
  return '<div class="f">' + (label ? '<label>' + label + (o.key ? ' <code>' + o.key + '</code>' : '') + '</label>' : '') +
    '<input type="' + (o.type || 'text') + '" data-path="' + path + '" value="' + esc(v) + '"' + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + (o.id ? ' id="' + o.id + '"' : '') + '>' +
    (o.hint ? '<span class="hint">' + o.hint + '</span>' : '') + (o.errId ? '<span class="err" id="' + o.errId + '"></span>' : '') + '</div>';
}
function bi(path, label, o) {
  o = o || {};
  var v = getPath(ED.d, path) || { en: '', vi: '' };
  var tag = function (lang) {
    return o.area ? '<textarea data-path="' + path + '.' + lang + '" rows="' + (o.rows || 3) + '">' + esc(v[lang]) + '</textarea>'
                  : '<input type="text" data-path="' + path + '.' + lang + '" value="' + esc(v[lang]) + '">';
  };
  return '<div class="f">' + (label ? '<label>' + label + (o.key ? ' <code>' + o.key + '</code>' : '') + '</label>' : '') +
    '<div class="bi"><div data-l="EN">' + tag('en') + '</div><div data-l="VI">' + tag('vi') + '</div></div>' + (o.hint ? '<span class="hint">' + o.hint + '</span>' : '') + '</div>';
}
function seg(act, path, value, opts) {
  return '<div class="seg">' + opts.map(function (o) { return '<button type="button" data-act="' + act + '" data-path="' + path + '" data-v="' + o[0] + '" class="' + (value === o[0] ? 'on' : '') + '">' + o[1] + '</button>'; }).join('') + '</div>';
}
function itemHead(listPath, i, n, label) {
  return '<div class="item-h"><b>' + label + ' ' + (i + 1) + '</b>' +
    '<button class="icon-btn" type="button" data-act="mvItem" data-path="' + listPath + '" data-i="' + i + '" data-d="-1" ' + (i ? '' : 'disabled') + ' title="Lên">↑</button>' +
    '<button class="icon-btn" type="button" data-act="mvItem" data-path="' + listPath + '" data-i="' + i + '" data-d="1" ' + (i < n - 1 ? '' : 'disabled') + ' title="Xuống">↓</button>' +
    '<button class="icon-btn del" type="button" data-act="rmItem" data-path="' + listPath + '" data-i="' + i + '" title="Xoá">✕</button></div>';
}
function bulletRows(path, label) {
  var rows = getPath(ED.d, path);
  return '<div class="f"><span class="lbl">' + label + ' <code>EN | VI — mỗi dòng là một gạch đầu dòng</code></span><div class="bullets">' + rows.map(function (b, j) {
    return '<div class="bullet"><input type="text" data-path="' + path + '.' + j + '.en" value="' + esc(b.en) + '" placeholder="EN">' +
      '<input class="vi" type="text" data-path="' + path + '.' + j + '.vi" value="' + esc(b.vi) + '" placeholder="VI">' +
      '<button class="icon-btn del" type="button" data-act="rmItem" data-path="' + path + '" data-i="' + j + '" title="Xoá dòng">✕</button></div>';
  }).join('') + '</div><button class="btn ghost sm add" type="button" data-act="addItem" data-path="' + path + '" data-t="did">+ Dòng</button></div>';
}
function sec(id, title, body, note) { return '<section class="sec" id="' + id + '"><h2>' + title + (note ? '<small>' + note + '</small>' : '') + '</h2><div class="sec-b">' + body + '</div></section>'; }

var TEMPLATES = {
  roles: function () { return { name: L(''), summary: L(''), did: [L('')] }; },
  did: function () { return L(''); },
  learned: function () { return { title: L(''), text: [L('')] }; },
  challenges: function () { return { title: L(''), problem: L(''), solution: L('') }; },
  results: function () { return { value: '', label: L('') }; }
};

function renderEditor() {
  var d = ED.d, isNew = !ED.id;
  var bar = '<div class="ed-bar"><div><div class="crumb"><a href="#/">← Dự án</a> / ' + esc(isNew ? 'mới' : ED.id) + '</div>' +
    '<h1>' + esc(isNew ? 'Thêm dự án' : d.title || ED.id) + ' <span class="dirty" id="dirtyFlag" hidden>● chưa lưu</span></h1></div>' +
    '<div class="acts">' + (isNew ? '' : '<button class="btn danger sm" type="button" data-act="delCurrent">Xoá dự án</button><a class="btn ghost sm" href="/project.html?p=' + ED.id + '" target="_blank" rel="noopener">Mở trang ↗</a>') +
    '<button class="btn pri" type="button" data-act="save" id="saveBtn">' + (isNew ? 'Tạo dự án' : 'Lưu <span style="opacity:.6;font-weight:400">⌘S</span>') + '</button></div></div>';

  var basics = sec('s-basic', 'Thông tin chính',
    '<div class="grid2">' + inp('title', 'Tên dự án *', { key: 'title', id: 'fTitle' }) +
      inp('@folder', 'Thư mục', { key: 'Database/Projects/…', id: 'fFolder', errId: 'folderErr', hint: isNew ? 'Tự tạo từ tên dự án — chữ thường, số, gạch ngang. Dùng trong link project.html?p=…' : 'Đổi tên sẽ đổi luôn link của trang dự án.' }) + '</div>' +
    '<div class="grid3">' + inp('studio', 'Studio', { key: 'studio' }) + inp('downloads', 'Lượt tải', { key: 'downloads', ph: '10M+' }) +
      '<div class="f"><label>Màu nhấn <code>accentColor</code></label><div class="color-row"><input type="color" data-path="accentColor" value="' + esc(d.accentColor) + '"><input type="text" data-path="accentColor" value="' + esc(d.accentColor) + '"></div></div></div>' +
    '<div class="grid2">' + inp('store.googlePlay', 'Google Play', { key: 'store.googlePlay', type: 'url', ph: 'https://play.google.com/store/apps/details?id=…' }) +
      inp('store.appStore', 'App Store', { key: 'store.appStore', type: 'url', ph: 'https://apps.apple.com/…' }) + '</div>' +
    '<label class="check"><input type="checkbox" data-path="placeholder"' + (d.placeholder ? ' checked' : '') + '> Đánh dấu là <b style="color:var(--gold)">dữ liệu mẫu</b> (hiện nhãn "sample data" trên site)</label>');

  if (isNew) {
    $('app').innerHTML = bar + '<div class="ed nopv"><div>' + basics +
      '<div class="empty">Sau khi bấm <b>Tạo dự án</b>, bạn có thể thêm video, ảnh, vai trò, bài học… </div></div></div>';
    afterRender(); return;
  }

  var id = ED.id, v = d.video;
  var ytId = parseYT(v.youtube);
  var media = sec('s-media', 'Video & hình ảnh',
    '<div class="f"><span class="lbl">Video giới thiệu <code>video</code></span>' + seg('vsrc', '', ED.vsrc, [['none', 'Không có'], ['youtube', 'YouTube'], ['file', 'File mp4']]) + '</div>' +
    (ED.vsrc === 'youtube' ? '<div class="media-row"><div style="flex:1;min-width:260px">' + inp('video.youtube', 'Link hoặc ID YouTube', { key: 'video.youtube', ph: 'https://youtu.be/… hoặc youtube.com/shorts/…', id: 'fYT', hint: 'Dán link bất kỳ (kể cả Shorts) — ID sẽ được tách tự động.' }) + '</div>' +
       '<div class="yt-prev" id="ytPrev">' + (ytId ? '<img src="https://img.youtube.com/vi/' + ytId + '/hqdefault.jpg" alt="">' : '') + '</div></div>' : '') +
    (ED.vsrc === 'file' ? (v.file ? mediaCard(id, v.file, 'video', 'rmVideo') : '') +
       '<div class="drop" data-drop="video">Kéo thả file <b>.mp4</b> vào đây, hoặc <b>bấm để chọn</b><br><span class="hint">Lưu thành <code>video.mp4</code> trong thư mục dự án. Nên &lt; 50 MB (GitHub chặn file &gt; 100 MB).</span><div class="prog" id="vidProg" hidden><i></i></div></div>' : '') +
    (ED.vsrc !== 'none' ? '<div class="f"><span class="lbl">Hướng màn hình <code>video.orientation</code></span>' + seg('set', 'video.orientation', v.orientation, [['landscape', '▭ Ngang'], ['portrait', '▯ Dọc (khung điện thoại)']]) + '</div>' : '') +
    '<div class="grid2">' +
      '<div class="f"><span class="lbl">Icon <code>icon</code></span>' + (d.icon ? mediaCard(id, d.icon, 'img', 'rmIcon') : '') +
        '<div class="drop" data-drop="icon">Thả <b>icon</b> (vuông) — tự resize 512px PNG</div></div>' +
      '<div class="f"><span class="lbl">Ảnh bìa <code>poster</code></span>' + (d.poster ? mediaCard(id, d.poster, 'img', 'rmPoster') : '') +
        '<div class="drop" data-drop="poster">Thả <b>ảnh bìa</b> — hiện trước khi video chạy' + (ED.vsrc === 'youtube' ? ' (mặc định: thumbnail YouTube)' : '') + '</div></div>' +
    '</div>', 'upload lưu ngay vào thư mục dự án');

  var details = sec('s-details', 'Chi tiết',
    bi('tagline', 'Tagline', { key: 'tagline', hint: 'Một câu ngắn dưới tên dự án.' }) +
    '<div class="grid3">' + inp('team', 'Team (số người)', { key: 'team', ph: '5' }) + inp('platform', 'Nền tảng', { key: 'platform', ph: 'Android · iOS' }) + inp('engine', 'Engine', { key: 'engine', ph: 'Unity · C#' }) + '</div>' +
    '<div class="grid3">' + inp('year', 'Năm', { key: 'year', ph: '2024' }) + '</div>' +
    bi('teamDetail', 'Cơ cấu team', { key: 'teamDetail', hint: 'Hiện dưới số người thay cho chữ "TEAM". VD: 1Dev - 2Art - 2GD - 1Anim (để trống ô VI nếu giống EN).' }) +
    bi('duration', 'Thời gian phát triển', { key: 'duration' }) + bi('status', 'Trạng thái', { key: 'status', hint: 'VD: Live / Đang phát hành' }) +
    bi('overview', 'Tổng quan', { key: 'overview', area: true, rows: 4 }));

  var roles = sec('s-roles', 'Trách nhiệm (Responsibilities)',
    '<div class="items">' + d.roles.map(function (r, i) {
      return '<div class="item">' + itemHead('roles', i, d.roles.length, 'Vai trò') + '<div class="item-b">' +
        bi('roles.' + i + '.name', 'Tên vai trò') + bi('roles.' + i + '.summary', 'Tóm tắt') +
        bulletRows('roles.' + i + '.did', 'Đã làm gì') +
      '</div></div>';
    }).join('') + '</div><button class="btn ghost sm add" type="button" data-act="addItem" data-path="roles" data-t="roles">+ Vai trò</button>', 'roles[]');

  var learned = sec('s-learned', 'Những điều học được (What I learned)',
    '<div class="items">' + d.learned.map(function (x, i) {
      return '<div class="item">' + itemHead('learned', i, d.learned.length, 'Bài học') + '<div class="item-b">' + bi('learned.' + i + '.title', 'Tiêu đề') + bulletRows('learned.' + i + '.text', 'Những điều học được') + '</div></div>';
    }).join('') + '</div><button class="btn ghost sm add" type="button" data-act="addItem" data-path="learned" data-t="learned">+ Bài học</button>', 'learned[]');

  var chal = sec('s-challenges', 'Thử thách & giải pháp',
    '<div class="items">' + d.challenges.map(function (x, i) {
      return '<div class="item">' + itemHead('challenges', i, d.challenges.length, 'Thử thách') + '<div class="item-b">' + bi('challenges.' + i + '.title', 'Tiêu đề') + bi('challenges.' + i + '.problem', 'Vấn đề', { area: true, rows: 2 }) + bi('challenges.' + i + '.solution', 'Giải pháp', { area: true, rows: 2 }) + '</div></div>';
    }).join('') + '</div><button class="btn ghost sm add" type="button" data-act="addItem" data-path="challenges" data-t="challenges">+ Thử thách</button>', 'challenges[]');

  var results = sec('s-results', 'Kết quả',
    '<div class="items">' + d.results.map(function (x, i) {
      return '<div class="item">' + itemHead('results', i, d.results.length, 'Kết quả') + '<div class="item-b"><div class="grid3">' + inp('results.' + i + '.value', 'Con số', { ph: '70M+' }) + '</div>' + bi('results.' + i + '.label', 'Mô tả') + '</div></div>';
    }).join('') + '</div><button class="btn ghost sm add" type="button" data-act="addItem" data-path="results" data-t="results">+ Kết quả</button>', 'results[]');

  var shots = sec('s-shots', 'Ảnh chụp màn hình',
    '<div class="shots" id="shots">' + d.screenshots.map(function (x, i) {
      return '<div class="shot" draggable="true" data-i="' + i + '"><div class="im"><img src="' + esc(fileURL(id, x.src)) + '?v=' + ED.pvStamp + '" alt=""><span class="n">' + (i + 1) + '</span>' +
        '<button class="icon-btn del x" type="button" data-act="rmItem" data-path="screenshots" data-i="' + i + '" title="Bỏ ảnh">✕</button></div>' +
        '<input type="text" data-path="screenshots.' + i + '.caption.en" value="' + esc(x.caption.en) + '" placeholder="Caption EN">' +
        '<input type="text" data-path="screenshots.' + i + '.caption.vi" value="' + esc(x.caption.vi) + '" placeholder="Caption VI"></div>';
    }).join('') + '</div>' +
    '<div class="drop" data-drop="shots">Kéo thả <b>nhiều ảnh</b> vào đây, hoặc <b>bấm để chọn</b> — tự resize ≤1600px, nén JPG, lưu thành <code>images/screenshot-N.jpg</code>. Kéo ảnh để đổi thứ tự.<div class="prog" id="shotProg" hidden><i></i></div></div>', 'screenshots[]');

  var nav = '<nav class="secnav">' + [['s-basic', 'Chính'], ['s-media', 'Video & ảnh'], ['s-details', 'Chi tiết'], ['s-roles', 'Trách nhiệm'], ['s-learned', 'Học được'], ['s-challenges', 'Thử thách'], ['s-results', 'Kết quả'], ['s-shots', 'Screenshots']]
    .map(function (x) { return '<a href="javascript:void 0" data-act="goto" data-to="' + x[0] + '">' + x[1] + '</a>'; }).join('') + '</nav>';

  var pv = '<aside class="pv' + (ED.pvMobile ? ' mobile' : '') + '"><div class="pv-bar"><span>Xem trước · cập nhật khi Lưu</span>' +
    seg('pvMode', '', ED.pvMobile ? 'm' : 'd', [['d', 'Desktop'], ['m', 'Mobile']]) +
    '<button class="icon-btn" type="button" data-act="pvReload" title="Tải lại">⟳</button></div>' +
    '<div class="pv-frame"><iframe id="pvFrame" title="Preview" src="/project.html?p=' + id + '&_=' + ED.pvStamp + '"></iframe></div></aside>';

  $('app').innerHTML = bar + '<div class="ed"><div>' + nav + basics + media + details + roles + learned + chal + results + shots + '</div>' + pv + '</div>';
  afterRender();
}
function mediaCard(id, rel, kind, act) {
  var f = (S.files[id] || []).filter(function (x) { return x.path === rel; })[0];
  return '<div class="media-card">' + (kind === 'img' ? '<img src="' + esc(fileURL(id, rel)) + '?v=' + ED.pvStamp + '" alt="">' : '<span style="font-size:1.6rem">🎬</span>') +
    '<div><div class="nm">' + esc(rel) + '</div><div class="sz">' + (f ? fmtSize(f.size) : 'chưa có file') + '</div></div>' +
    '<button class="icon-btn del" type="button" data-act="' + act + '" title="Bỏ">✕</button></div>';
}
function afterRender() {
  updateDirty(); validateFolder();
  var shots = $('shots'); if (shots) bindShotDnD(shots);
}

// ── validation ──
function validateFolder() {
  var el = $('fFolder'), err = $('folderErr'); if (!el) return true;
  var v = ED.folder, msg = '';
  if (!ID_RE.test(v)) msg = 'Chỉ dùng chữ thường a-z, số và dấu gạch ngang.';
  else if (v !== ED.id && (S.files[v] || S.projects[v])) msg = 'Thư mục "' + v + '" đã tồn tại.';
  el.classList.toggle('bad', !!msg); err.textContent = msg;
  return !msg;
}

// ── save ──
function save() {
  if (!ED) return;
  var data = fromDraft(ED.d, ED.orig, ED.vsrc);
  if (!data.title) { toast('Cần nhập tên dự án', 'err'); $('fTitle').focus(); return; }
  if (!validateFolder()) { toast('Tên thư mục chưa hợp lệ', 'err'); $('fFolder').focus(); return; }
  var btn = $('saveBtn'); btn.disabled = true;
  if (!ED.id) {
    return api('POST', '/api/projects', { id: ED.folder, data: data }).then(function () {
      S.changed.add('Database/Projects/' + ED.folder + '/data.json'); S.changed.add('Database/Projects/index.json');
      var id = ED.folder; ED = null; toast('Đã tạo dự án — giờ thêm video, ảnh…');
      return load().then(function () { location.hash = '#/edit/' + id; });
    }).catch(function (e) { toast(e.message, 'err'); btn.disabled = false; });
  }
  var oldId = ED.id, newId = ED.folder;
  // Media that was used before (or uploaded now) but is no longer referenced gets deleted.
  var keep = refs(data), stale = [];
  refs(ED.orig).forEach(function (r) { if (!keep.has(r)) stale.push(r); });
  ED.uploaded.forEach(function (r) { if (!keep.has(r) && stale.indexOf(r) < 0) stale.push(r); });
  stale = stale.filter(function (r) { return !/^(https?:)?\/\//.test(r); });
  return api('PUT', '/api/projects/' + oldId, { data: data, newId: newId !== oldId ? newId : undefined }).then(function (j) {
    var id = j.id;
    return Promise.all(stale.map(function (r) { return api('DELETE', '/api/projects/' + id + '/files?path=' + encodeURIComponent(r)).catch(function () {}); })).then(function () {
      S.changed.add('Database/Projects/' + id + '/data.json');
      if (id !== oldId) { S.changed.add('Database/Projects/' + oldId + '/ → ' + id + '/'); S.changed.add('Database/Projects/index.json'); }
      stale.forEach(function (r) { S.changed.add('Database/Projects/' + id + '/' + r + ' (deleted)'); });
      return load().then(function () {
        var keepPv = ED.pvMobile, scroll = window.scrollY;
        toast('Đã lưu' + (stale.length ? ' · xoá ' + stale.length + ' file không dùng' : ''));
        if (id !== oldId) { ED = null; location.hash = '#/edit/' + id; return; }
        openEditor(id); ED.pvMobile = keepPv; renderEditor(); window.scrollTo(0, scroll);
      });
    });
  }).catch(function (e) { toast(e.message, 'err'); btn.disabled = false; });
}

// ── uploads ──
function nextShotName() {
  var used = new Set((S.files[ED.id] || []).map(function (f) { return f.path; }).concat(ED.d.screenshots.map(function (s) { return s.src; })));
  for (var n = 1; ; n++) { var p = 'images/screenshot-' + n + '.jpg'; if (!used.has(p)) return p; }
}
function progress(id, frac) { var p = $(id); if (!p) return; p.hidden = frac == null; p.firstChild.style.width = Math.round((frac || 0) * 100) + '%'; }
function handleFiles(kind, files) {
  if (!ED || !ED.id || !files.length) return;
  var id = ED.id;
  if (kind === 'video') {
    var f = files[0];
    if (!/^video\//.test(f.type)) { toast('Hãy chọn file video (.mp4)', 'err'); return; }
    if (f.size > VIDEO_MAX) { toast('Video ' + fmtSize(f.size) + ' — GitHub chặn file > 100 MB. Hãy nén lại.', 'err'); return; }
    if (f.size > VIDEO_WARN) toast('Video ' + fmtSize(f.size) + ' khá nặng — nên nén dưới 50 MB.', 'err');
    var rel = 'video.' + ((f.name.split('.').pop() || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp4');
    progress('vidProg', 0);
    return upload(id, rel, f, function (x) { progress('vidProg', x); }).then(function (j) {
      ED.d.video.file = rel; ED.uploaded.add(rel); fileUploaded(id, rel, j.size); toast('Đã tải video lên — bấm Lưu để áp dụng');
    }).catch(function (e) { toast(e.message, 'err'); progress('vidProg', null); });
  }
  var imgs = files.filter(function (f) { return /^image\//.test(f.type); });
  if (!imgs.length) { toast('Hãy chọn file ảnh', 'err'); return; }
  if (kind === 'icon' || kind === 'poster') {
    var isIcon = kind === 'icon', rel2 = isIcon ? 'images/icon.png' : 'images/cover.jpg';
    return compress(imgs[0], isIcon ? 512 : 1600, isIcon ? 'image/png' : 'image/jpeg', 0.86).then(function (blob) { return upload(id, rel2, blob); })
      .then(function (j) { ED.d[kind] = rel2; ED.uploaded.add(rel2); fileUploaded(id, rel2, j.size); toast('Đã tải ' + (isIcon ? 'icon' : 'ảnh bìa') + ' — bấm Lưu để áp dụng'); })
      .catch(function (e) { toast(e.message, 'err'); });
  }
  // screenshots: one by one so names stay sequential
  var done = 0; progress('shotProg', 0);
  return imgs.reduce(function (p, f) {
    return p.then(function () {
      var rel = nextShotName();
      return compress(f, 1600, 'image/jpeg', 0.85).then(function (blob) { return upload(id, rel, blob); }).then(function (j) {
        ED.d.screenshots.push({ src: rel, caption: L('') }); ED.uploaded.add(rel);
        (S.files[id] = S.files[id] || []).push({ path: rel, size: j.size });
        progress('shotProg', ++done / imgs.length);
      });
    });
  }, Promise.resolve()).then(function () { toast('Đã thêm ' + done + ' ảnh — bấm Lưu để áp dụng'); rerenderKeepScroll(); })
    .catch(function (e) { toast(e.message, 'err'); rerenderKeepScroll(); });
}
function fileUploaded(id, rel, size) {
  var list = S.files[id] = (S.files[id] || []).filter(function (x) { return x.path !== rel; });
  list.push({ path: rel, size: size }); ED.pvStamp = Date.now(); rerenderKeepScroll();
}
function rerenderKeepScroll() { var y = window.scrollY; renderEditor(); window.scrollTo(0, y); }

function bindShotDnD(box) {
  var from = null;
  box.addEventListener('dragstart', function (e) { var s = e.target.closest('.shot'); if (!s) return; from = +s.dataset.i; s.classList.add('drag'); e.dataTransfer.effectAllowed = 'move'; });
  box.addEventListener('dragend', function () { box.querySelectorAll('.drag,.over').forEach(function (x) { x.classList.remove('drag', 'over'); }); });
  box.addEventListener('dragover', function (e) { var s = e.target.closest('.shot'); if (!s || from == null) return; e.preventDefault(); box.querySelectorAll('.over').forEach(function (x) { x.classList.remove('over'); }); s.classList.add('over'); });
  box.addEventListener('drop', function (e) {
    var s = e.target.closest('.shot'); if (!s || from == null) return; e.preventDefault(); e.stopPropagation();
    var to = +s.dataset.i, arr = ED.d.screenshots, it = arr.splice(from, 1)[0]; arr.splice(to, 0, it); from = null; rerenderKeepScroll();
  });
}

// ══════════════════════════════
// EVENTS (delegated)
// ══════════════════════════════
document.addEventListener('input', function (e) {
  var el = e.target, path = el.dataset && el.dataset.path; if (!ED || !path) return;
  var val = el.type === 'checkbox' ? el.checked : el.value;
  if (path === '@folder') { ED.folder = val.trim(); ED.folderTouched = true; validateFolder(); updateDirty(); return; }
  setPath(ED.d, path, val);
  // keep twin inputs (color picker + text) in sync
  document.querySelectorAll('[data-path="' + path + '"]').forEach(function (x) { if (x !== el && x.type !== 'checkbox') x.value = val; });
  if (path === 'title' && !ED.id && !ED.folderTouched) { ED.folder = slug(val); var ff = $('fFolder'); if (ff) ff.value = ED.folder; validateFolder(); }
  if (path === 'video.youtube') {
    var id = parseYT(val), prev = $('ytPrev'); ED.d.video.youtube = id || val.trim();
    if (prev) prev.innerHTML = id ? '<img src="https://img.youtube.com/vi/' + id + '/hqdefault.jpg" alt="">' : '';
    if (id && id !== val.trim() && e.type === 'input') { el.value = id; }
  }
  updateDirty();
});

document.addEventListener('click', function (e) {
  var b = e.target.closest('[data-act]');
  var dz = e.target.closest('[data-drop]');
  if (dz && !b) {
    var kind = dz.dataset.drop;
    pickFiles(kind === 'video' ? 'video/*' : 'image/*', kind === 'shots').then(function (fs) { handleFiles(kind, fs); });
    return;
  }
  if (!b) return;
  var act = b.dataset.act, p = b.dataset.path, i = +b.dataset.i;
  switch (act) {
    case 'mv': {
      var id = b.dataset.id, o = S.order.slice(), k = o.indexOf(id), j = k + +b.dataset.d;
      if (j < 0 || j >= o.length) return; o.splice(k, 1); o.splice(j, 0, id); saveOrder(o); return;
    }
    case 'addIndex': saveOrder(S.order.concat([b.dataset.id])); return;
    case 'delProject': deleteProject(b.dataset.id).then(function (ok) { if (ok) renderList(); }); return;
    case 'delCurrent': {
      var cur = ED.id;
      deleteProject(cur).then(function (ok) { if (ok) { ED = null; location.hash = '#/'; renderList(); } }); return;
    }
    case 'copyGit': navigator.clipboard.writeText($('gitCmd').textContent).then(function () { toast('Đã copy lệnh git'); }); return;
    case 'save': save(); return;
    case 'goto': $(b.dataset.to).scrollIntoView({ behavior: 'smooth', block: 'start' }); return;
    case 'addItem': getPath(ED.d, p).push(TEMPLATES[b.dataset.t]()); rerenderKeepScroll(); updateDirty(); return;
    case 'rmItem': getPath(ED.d, p).splice(i, 1); rerenderKeepScroll(); updateDirty(); return;
    case 'mvItem': {
      var arr = getPath(ED.d, p), j2 = i + +b.dataset.d; if (j2 < 0 || j2 >= arr.length) return;
      arr.splice(j2, 0, arr.splice(i, 1)[0]); rerenderKeepScroll(); updateDirty(); return;
    }
    case 'set': setPath(ED.d, p, b.dataset.v); rerenderKeepScroll(); return;
    case 'vsrc': ED.vsrc = b.dataset.v; rerenderKeepScroll(); return;
    case 'rmVideo': ED.d.video.file = ''; rerenderKeepScroll(); return;
    case 'rmIcon': ED.d.icon = ''; rerenderKeepScroll(); return;
    case 'rmPoster': ED.d.poster = ''; rerenderKeepScroll(); return;
    case 'pvMode': ED.pvMobile = b.dataset.v === 'm'; rerenderKeepScroll(); return;
    case 'pvReload': ED.pvStamp = Date.now(); $('pvFrame').src = '/project.html?p=' + ED.id + '&_=' + ED.pvStamp; return;
  }
});

// drag & drop files onto drop zones
['dragover', 'dragleave', 'drop'].forEach(function (type) {
  document.addEventListener(type, function (e) {
    var dz = e.target.closest && e.target.closest('[data-drop]');
    if (!dz || !e.dataTransfer || [].indexOf.call(e.dataTransfer.types, 'Files') < 0) return;
    e.preventDefault();
    dz.classList.toggle('over', type === 'dragover');
    if (type === 'drop') handleFiles(dz.dataset.drop, [].slice.call(e.dataTransfer.files));
  });
});

document.addEventListener('keydown', function (e) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's' && ED) { e.preventDefault(); save(); }
  if (e.key === 'Escape' && !$('dlg').hidden) $('dlgNo').click();
});

// ══════════════════════════════
// BOOT
// ══════════════════════════════
load().then(route).catch(function () {
  $('srv').classList.add('off'); $('srv').lastChild.textContent = 'offline';
  $('app').innerHTML = '<div class="offline"><h2>Project Studio chỉ chạy trên máy local</h2><p>Mở terminal ở thư mục portfolio và chạy:</p><code>node _admin/server.mjs</code><p style="margin-top:12px;color:var(--dim);font-size:.82rem">Sau đó mở http://localhost:4000/_admin/</p></div>';
});
})();
