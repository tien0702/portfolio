#!/usr/bin/env node
/* ══════════════════════════════════════════
   [NIX] Project Studio — local server (no dependencies)
   Run:  node _admin/server.mjs        → http://localhost:4000/_admin/
   Serves the whole site (for live preview) and a small API that
   reads/writes Database/Projects/. Listens on 127.0.0.1 only.
   ══════════════════════════════════════════ */
import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT) || 4000;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJ = path.join(ROOT, 'Database', 'Projects');
const INDEX = path.join(PROJ, 'index.json');
const ID_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;
const UPLOAD_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm', '.mov']);
const MAX_UPLOAD = 100 * 1024 * 1024; // GitHub rejects files over 100 MB
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime'
};

class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }

// Resolve `rel` inside `base`; refuse anything that escapes it.
function safeJoin(base, rel) {
  const p = path.resolve(base, '.' + path.sep + String(rel || ''));
  if (p !== base && !p.startsWith(base + path.sep)) throw new HttpError(400, 'Invalid path');
  return p;
}
function checkId(id) { if (!ID_RE.test(id || '')) throw new HttpError(400, 'Folder name must be lowercase letters, numbers and dashes'); return id; }
const exists = p => fsp.access(p).then(() => true, () => false);
const writeJSON = (p, v) => fsp.writeFile(p, JSON.stringify(v, null, 2) + '\n');

async function readIndex() {
  try { const v = JSON.parse(await fsp.readFile(INDEX, 'utf8')); return Array.isArray(v) ? v : []; }
  catch (e) { if (e.code === 'ENOENT') return []; throw new HttpError(500, 'index.json is not valid JSON'); }
}
async function listFiles(dir, base = dir) {
  const out = [];
  for (const e of await fsp.readdir(dir, { withFileTypes: true }).catch(() => [])) {
    if (e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await listFiles(full, base));
    else if (e.name !== 'data.json') out.push({ path: path.relative(base, full).split(path.sep).join('/'), size: (await fsp.stat(full)).size });
  }
  return out;
}
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on('data', c => { size += c.length; if (size > limit) { reject(new HttpError(413, 'File too large (max 100 MB)')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
async function readJSON(req) {
  try { return JSON.parse((await readBody(req, 5 * 1024 * 1024)).toString('utf8') || '{}'); }
  catch (e) { throw e instanceof HttpError ? e : new HttpError(400, 'Invalid JSON body'); }
}
function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

// ── API ──
async function api(req, res, url) {
  const parts = url.pathname.split('/').filter(Boolean).slice(1); // drop "api"
  const m = req.method;

  // Writes must come from the Studio page: a custom header can't be sent cross-site without CORS (which we never allow).
  if (m !== 'GET' && req.headers['x-studio'] !== '1') throw new HttpError(403, 'Forbidden');

  if (parts[0] === 'projects' && parts.length === 1 && m === 'GET') {
    const order = await readIndex(), projects = {}, files = {}, broken = {};
    const dirs = (await fsp.readdir(PROJ, { withFileTypes: true }).catch(() => [])).filter(d => d.isDirectory() && !d.name.startsWith('.')).map(d => d.name);
    for (const id of new Set([...order, ...dirs])) {
      const dir = path.join(PROJ, id);
      if (!ID_RE.test(id) || !(await exists(dir))) continue;
      try { projects[id] = JSON.parse(await fsp.readFile(path.join(dir, 'data.json'), 'utf8')); }
      catch (e) { broken[id] = e.code === 'ENOENT' ? 'missing data.json' : 'data.json is not valid JSON: ' + e.message; }
      files[id] = await listFiles(dir);
    }
    return send(res, 200, { order, projects, files, broken });
  }

  if (parts[0] === 'projects' && parts.length === 1 && m === 'POST') {
    const { id, data } = await readJSON(req);
    checkId(id);
    if (!data || !String(data.title || '').trim()) throw new HttpError(400, 'Title is required');
    const dir = path.join(PROJ, id);
    if (await exists(dir)) throw new HttpError(409, 'Folder "' + id + '" already exists');
    await fsp.mkdir(path.join(dir, 'images'), { recursive: true });
    await writeJSON(path.join(dir, 'data.json'), data);
    const order = await readIndex(); order.unshift(id); await writeJSON(INDEX, order);
    return send(res, 201, { id });
  }

  if (parts[0] === 'projects' && parts.length === 2) {
    const id = checkId(parts[1]), dir = path.join(PROJ, id);
    if (!(await exists(dir))) throw new HttpError(404, 'Project not found');

    if (m === 'PUT') {
      const { data, newId } = await readJSON(req);
      if (!data || !String(data.title || '').trim()) throw new HttpError(400, 'Title is required');
      let target = id;
      if (newId && newId !== id) {
        checkId(newId);
        if (await exists(path.join(PROJ, newId))) throw new HttpError(409, 'Folder "' + newId + '" already exists');
        await fsp.rename(dir, path.join(PROJ, newId));
        const order = (await readIndex()).map(x => x === id ? newId : x); await writeJSON(INDEX, order);
        target = newId;
      }
      await writeJSON(path.join(PROJ, target, 'data.json'), data);
      return send(res, 200, { id: target });
    }
    if (m === 'DELETE') {
      await fsp.rm(dir, { recursive: true, force: true });
      await writeJSON(INDEX, (await readIndex()).filter(x => x !== id));
      return send(res, 200, { deleted: id });
    }
  }

  if (parts[0] === 'projects' && parts[2] === 'files' && parts.length === 3) {
    const id = checkId(parts[1]), dir = path.join(PROJ, id);
    if (!(await exists(dir))) throw new HttpError(404, 'Project not found');
    const rel = url.searchParams.get('path') || '';
    const file = safeJoin(dir, rel);
    if (path.basename(file) === 'data.json') throw new HttpError(400, 'Use the project endpoint to edit data.json');
    if (m === 'POST') {
      if (!UPLOAD_EXT.has(path.extname(file).toLowerCase())) throw new HttpError(400, 'Unsupported file type');
      const buf = await readBody(req, MAX_UPLOAD);
      await fsp.mkdir(path.dirname(file), { recursive: true });
      await fsp.writeFile(file, buf);
      return send(res, 201, { path: path.relative(dir, file).split(path.sep).join('/'), size: buf.length });
    }
    if (m === 'DELETE') {
      await fsp.rm(file, { force: true });
      return send(res, 200, { deleted: rel });
    }
  }

  if (parts[0] === 'order' && m === 'PUT') {
    const { order } = await readJSON(req);
    if (!Array.isArray(order) || new Set(order).size !== order.length) throw new HttpError(400, 'Order must be a list of unique folder names');
    for (const id of order) if (!(await exists(path.join(PROJ, checkId(id), 'data.json')))) throw new HttpError(400, 'Unknown project "' + id + '"');
    await writeJSON(INDEX, order);
    return send(res, 200, { order });
  }

  throw new HttpError(404, 'Unknown API route');
}

// ── static files (site + studio), with Range support for video seeking ──
async function serveStatic(req, res, url) {
  if (url.pathname.split('/').some(s => s.startsWith('.'))) throw new HttpError(404, 'Not found'); // no .git, .DS_Store…
  let file = safeJoin(ROOT, decodeURIComponent(url.pathname));
  let st = await fsp.stat(file).catch(() => null);
  if (st && st.isDirectory()) {
    if (!url.pathname.endsWith('/')) { res.writeHead(301, { Location: url.pathname + '/' + url.search }); return res.end(); }
    file = path.join(file, 'index.html'); st = await fsp.stat(file).catch(() => null);
  }
  if (!st) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
  const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (range) {
    const start = range[1] ? +range[1] : Math.max(0, st.size - +range[2]);
    const end = range[1] && range[2] ? Math.min(+range[2], st.size - 1) : st.size - 1;
    if (start > end || start >= st.size) { res.writeHead(416, { 'Content-Range': 'bytes */' + st.size }); return res.end(); }
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, 'Cache-Control': 'no-store' });
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': st.size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    // Block DNS-rebinding: only answer requests addressed to this machine.
    const host = String(req.headers.host || '').replace(/:\d+$/, '');
    if (!['localhost', '127.0.0.1', '[::1]'].includes(host)) throw new HttpError(403, 'Forbidden host');
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) {
      await api(req, res, url);
      if (req.method !== 'GET') console.log(new Date().toLocaleTimeString(), req.method, url.pathname + url.search);
    } else {
      await serveStatic(req, res, url);
    }
  } catch (e) {
    const status = e.status || 500;
    if (status === 500) console.error(e);
    if (!res.headersSent) send(res, status, { error: e.message || 'Server error' });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('\n  [NIX] Project Studio');
  console.log('  → Studio:  http://localhost:' + PORT + '/_admin/');
  console.log('  → Site:    http://localhost:' + PORT + '/');
  console.log('  Data:      ' + path.relative(process.cwd(), PROJ) + '\n');
});
server.on('error', e => { console.error(e.code === 'EADDRINUSE' ? `Port ${PORT} is busy — run with PORT=4001 node _admin/server.mjs` : e); process.exit(1); });
