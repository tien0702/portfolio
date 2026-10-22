# Star Cursor ("Stardust", gold) — implementation brief

Instructions for reproducing the custom mouse cursor used on the [NIX] portfolio in another web project.
The reference implementation is in this folder and is production code, copied unchanged from the live site.
Use it as-is. Rewrite it only if the target stack requires a different form, such as a React hook.

```
star-cursor/
├── README.md         ← this file
├── star-cursor.js    ← the whole effect (vanilla JS, no dependencies, ~120 lines)
├── star-cursor.css   ← 3 required rules
└── demo.html         ← open in a browser to see it working (no server needed)
```

---

## 1. What it looks like

- The system pointer is **replaced by a gold 4-point star** with a soft radial glow and a small white star at its core. It **spins slowly** all the time.
- **Moving the mouse sheds star particles** in gold tones. Each particle flies outward in a random direction, slows down from drag, **shrinks**, twinkles, and fades out after about 0.7–1.2 s. There is no gravity, so particles drift outward instead of falling. The faster the mouse moves, the more particles appear, up to 5 per move event.
- **Hovering anything clickable** (links, buttons, `.clickable`, …) makes the star **grow** (radius 9 → 15 px), glow brighter and **spin faster**. All three changes are eased.
- **Clicking** makes the star briefly **shrink to 60 %** and bounce back, and fires a **burst** of about 20 particles in a ring. Roughly 30 % of those are 5-point stars, so the burst looks different from the trail.
- Particles use additive blending (`globalCompositeOperation = 'lighter'`), so overlapping sparks glow.

Palette: `#ffd54f` (head, gold), particles randomly from `#ffd54f #ffe9a3 #ffb84d #fff6d6`.

## 2. Integration (plain HTML site)

1. Copy `star-cursor.js` and `star-cursor.css` into the project.
2. Link the CSS in `<head>`:
   ```html
   <link rel="stylesheet" href="star-cursor.css">
   ```
3. Load the script **at the end of `<body>`**, because it appends a `<canvas>` to `document.body` immediately:
   ```html
   <script src="star-cursor.js"></script>
   ```
4. Nothing else is needed. The script is a self-contained IIFE with no globals and no config call.

If the site has its own stylesheet, paste the 3 CSS rules into it instead of linking the file.

## 3. How it works

| Piece | Implementation |
|---|---|
| Rendering | One full-viewport `<canvas id="starfx">` (`position:fixed; pointer-events:none; z-index:9999`) redrawn every frame with `requestAnimationFrame`. Sized for `devicePixelRatio` (capped at 2) and resized on `resize`. |
| Star shape | `star(x, y, r, rot, points, inner)` builds a path that alternates between the outer radius `r` and an inner radius `r*inner`. Head: 4 points, inner 0.32. Particles: 4 points/0.36, or 5 points/0.45 for some burst particles. |
| Head | Drawn at the exact pointer position, with no smoothing so it never lags. Glow = radial gradient of radius `r*2.6`. `hover` (0→1) and `scale` are eased toward their targets each frame (`+= (target - value) * k`). |
| Particles | Plain objects `{x, y, vx, vy, drag, life, max, size, rot, vr, color, five}`. Each frame: velocity × `drag` (0.94 trail, 0.93 burst), move, rotate, and size × remaining life. Alpha = life × twinkle (`0.65 + 0.35·sin(...)`). Removed when `life >= max`. |
| Spawn rate | On `pointermove`: `n = min(5, distanceSinceLastEvent / 12 * DENSITY)`. On `pointerdown`: `round(20 * DENSITY)` evenly around a circle, with a little jitter. |
| Budget | At most `MAX_PARTS = 260` particles; the oldest is dropped. The rAF loop **stops** when the pointer leaves the page and restarts on the next move. |
| Hover detection | `pointerover` + `target.closest(CLICKABLE)`, using one delegated listener on `document`. |

## 4. Tunables (top of `star-cursor.js`)

| Constant | Default | Meaning |
|---|---|---|
| `COLORS` | `['#ffd54f','#ffe9a3','#ffb84d','#fff6d6']` | particle colours (picked at random) |
| `HEAD` | `'#ffd54f'` | colour of the cursor star and its glow |
| `DENSITY` | `1` | particle amount multiplier (0.3 = subtle, 2 = heavy) |
| `MAX_PARTS` | `260` | hard cap on live particles |
| `CLICKABLE` | `'a,button,[role="button"],.clickable,[data-open],[data-lb],label,select,summary'` | selectors that trigger the hover state. Add the target project's own clickable classes here |

Other look-and-feel numbers are inline. Change them only if asked:
- Head radius: `9 + hover*6`.
- Spin speed: `0.02 + hover*0.06` rad/frame.
- Particle lifetime: 40–70 frames for the trail, 45–75 frames for the burst.
- Particle speed: 0.6–2.4 for the trail, 2–5.5 for the burst.

## 5. Behaviour rules (keep all of these)

1. **Mouse devices only.** The script exits immediately unless `matchMedia('(hover: hover) and (pointer: fine)')` matches. Touch devices keep native behaviour. It also ignores events whose `pointerType` is not `'mouse'`.
2. **The system cursor is hidden only after the script runs.** The script adds `.star-cursor` to `<html>`, and the CSS hides the cursor only under that class. Without JS, or on touch devices, the normal cursor stays.
3. **Text fields keep the I-beam cursor** (`input`, `textarea`, `[contenteditable]`).
4. **Reduced motion.** With `prefers-reduced-motion: reduce`, the star still follows the pointer but **no particles** are created.
5. **Iframes.** Over an `<iframe>` (YouTube, embeds) the star hides itself, because the browser shows its own cursor inside the iframe and the canvas would otherwise freeze at the edge. It reappears on the next `pointermove` in the page.
6. **Leaving the page.** On `mouseleave` of `<html>` or window `blur`, particles are cleared, the canvas is wiped, and the loop stops.
7. **Never block clicks.** The canvas must keep `pointer-events: none`.
8. **Stacking.** `z-index: 9999` keeps the cursor above modals and overlays. If the target project uses higher z-indexes, raise it.

## 6. Adapting to other stacks

- **SPA / React / Next.js / Vue:** run the script **once, client-side only**, after the DOM exists (for example `useEffect(() => {...}, [])` in the root layout, or `onMounted` in the root component). It is an IIFE with no cleanup, so make sure it cannot run twice. Hot reload or React StrictMode would otherwise create two canvases. A simple guard at the top is enough: `if (document.getElementById('starfx')) return;`. If you need cleanup, wrap the body in a function that returns a disposer: remove listeners, cancel the rAF, remove the canvas, remove the `.star-cursor` class.
- **SSR:** never touch `window` or `document` during server render. Load it as a client-only module or a `<script>` tag.
- **Theming:** change `HEAD` and `COLORS` for another brand colour. Keep 3–4 shades of one hue so the trail stays cohesive.

## 7. Test checklist

- [ ] Open `demo.html`: the star follows the mouse with no lag and sheds gold particles that drift outward and shrink.
- [ ] Hovering a link or button makes the star grow, glow brighter and spin faster; moving away eases it back.
- [ ] Clicking produces a ring burst and a small "press" squash on the star.
- [ ] The text input shows the normal I-beam cursor.
- [ ] Touch device or mobile emulation: no canvas, normal behaviour.
- [ ] OS "reduce motion" on: the star still shows, with no particles.
- [ ] Moving over a YouTube iframe hides the star; moving back out shows it again.
- [ ] Moving the mouse out of the window clears everything (no frozen star left behind).
- [ ] Clicks still work everywhere (the canvas never intercepts them).
- [ ] No console errors. CPU stays low when the mouse is idle outside the page, because the loop stops.
