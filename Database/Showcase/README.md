# Showcase data

Same layout as `Database/Projects/`: one folder per item + `index.json` listing the folder names in display order.
The home page shows them in Showcase › **Prototypes** (3D carousel) and **Frameworks** (2-column grid). Each item has a detail page: `project.html?s=<item-id>`.
**Other Projects** are not here — they are regular projects in `Database/Projects/` with `"category": "other"` (see that README).

```
Database/Showcase/
├── index.json
└── <item-id>/
    ├── data.json
    └── images/…             ← optional poster, icon, screenshots
```

## data.json

Every text field can be a plain string or `{ "en": "...", "vi": "..." }`.

| Field | Example | Notes |
|---|---|---|
| `publish` | `true` / `false` | `false` hides the item |
| `kind` | `"prototype"` / `"tool"` | which group it shows in (`"tool"` = Frameworks) |
| `title` | `"NIX Audio · Audio Studio"` | |
| `year` | `2026` | optional; shown next to the type when set |
| `tagline` | `{ "en": "…", "vi": "…" }` | one line under the title |
| `focus` | `{ "en": "…", "vi": "…" }` | "Shows" line on the card + "What it shows" section on the detail page |
| `overview` | `{ "en": "…", "vi": "…" }` | detail page: Overview |
| `features` | `{ "en": ["…"], "vi": ["…"] }` | detail page: Features — one bullet per string |
| `api` | `[{ "title": {…}, "note": {…}, "code": "handle.Play(\"run\")…" }]` | detail page: API — short C# snippets shown with syntax colours, two per row; keep each to a few lines that show the unit's strength |
| `tech` | `["Unity", "C#"]` | chips |
| `poster`, `icon` | `"images/cover.jpg"` | relative to the item folder, or a full URL; without a poster a gradient in `accentColor` + `glyph` is shown |
| `video` | `{ "youtube": "…" }` or `{ "file": "video.mp4" }` | detail page player — same format as in Projects |
| `screenshots` | `["images/1.png"]` | detail page gallery — same format as in Projects |
| `accentColor`, `glyph` | `"#ffd54f"`, `"✦"` | card glow / placeholder art |
| `links.play` | `"https://…"` | "Explore" button — a full URL or a path from the site root |
| `links.source`, `links.post` | URLs | extra "Source" / "Write-up" buttons |
| `access` | `"internal"` | tool with no public link: shows "Internal tool · not public" |
| `impact` | `{ "value": "3×", "label": {…} }` | Frameworks only |
| `usedIn` | `["Sticker Diary"]` | Frameworks only |
| `placeholder` | `true` | shows the "sample data" badge — remove once the content is real |

The Project Studio (`_admin/`) does not edit Showcase items yet — edit the JSON files by hand.
