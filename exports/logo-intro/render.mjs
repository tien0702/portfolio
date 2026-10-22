// Offline renderer for logo-intro.html (needs: npm i puppeteer-core, ffmpeg, Google Chrome)
//
//   node render.mjs logo-intro.html <out> [logo-intro.json | '{"aspect":"9:16"}'] [--fps=30] [--font=Acumin.otf]
//
// <out> decides the format:
//   name.mov   ProRes 4444 with alpha  (master for Premiere / After Effects / Resolve / Final Cut)
//   name.webm  VP9 with alpha          (web, OBS)
//   name.mp4   H.264, no alpha         (social / quick share)
//   folder/    PNG sequence with alpha (works everywhere)
// Turn on "Nền trong suốt" (transparent: true) in the params to get the alpha channel.
import puppeteer from "puppeteer-core";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith("--")).map(a => a.slice(2).split("=")));
const [html, out, cfgArg = "{}"] = args.filter(a => !a.startsWith("--"));
const cfg = JSON.parse(fs.existsSync(cfgArg) ? fs.readFileSync(cfgArg, "utf8") : cfgArg);
const fps = +(flags.fps || 30);

const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const page = await browser.newPage();
if (flags.font){
  // register the font file before the page script runs, under the family name the params use
  const b64 = fs.readFileSync(flags.font).toString("base64");
  const family = cfg.font || "Acumin Variable Concept";
  await page.evaluateOnNewDocument((b64, family) => {
    const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const face = new FontFace(family, bin.buffer, { weight: "100 900", stretch: "50% 200%" });
    document.fonts.add(face); face.load();
  }, b64, family);
}
await page.goto("file://" + path.resolve(html) + "?render&cfg=" + encodeURIComponent(JSON.stringify(cfg)), { waitUntil: "networkidle0" });
await page.evaluate(() => window.ready);
const { trim, size, fontOk } = await page.evaluate(() => ({ trim: window.TRIM, size: window.SIZE, fontOk: window.FONT_OK }));
if (!fontOk) console.warn("⚠ Font not found — rendered with the fallback font (Archivo). Use --font=<file> or fontCss.");
await page.setViewport({ width: size[0], height: size[1] });

const grab = async t => Buffer.from(await page.evaluate(t => { renderFrame(t); return document.getElementById("c").toDataURL("image/png").split(",")[1]; }, t), "base64");
// only the trimmed range [trimIn, trimOut] is rendered
const n = Math.round((trim[1] - trim[0]) * fps), at = i => trim[0] + i / fps;

if (flags.times){
  for (const t of flags.times.split(",")) fs.writeFileSync(`${out}_${t}.png`, await grab(+t));
} else if (out.endsWith("/")){
  fs.mkdirSync(out, { recursive: true });
  for (let i = 0; i < n; i++) fs.writeFileSync(path.join(out, `frame_${String(i).padStart(4, "0")}.png`), await grab(at(i)));
} else {
  const ext = path.extname(out).toLowerCase();
  const codec = {
    ".mov":  ["-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le", "-vendor", "apl0"],
    ".webm": ["-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "18", "-row-mt", "1"],
    ".mp4":  ["-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "14", "-preset", "slow", "-movflags", "+faststart"],
  }[ext];
  if (!codec) throw new Error("Unsupported output: " + out);
  const ff = spawn("ffmpeg", ["-y", "-v", "error", "-f", "image2pipe", "-framerate", String(fps), "-i", "-", ...codec, out], { stdio: ["pipe", "inherit", "inherit"] });
  for (let i = 0; i < n; i++){
    const buf = await grab(at(i));
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
  }
  ff.stdin.end();
  await new Promise(r => ff.on("close", r));
}
await browser.close();
