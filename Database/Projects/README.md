# Projects data

**Easiest way to edit:** run the local Project Studio — `node _admin/server.mjs` → http://localhost:4000/_admin/
(add / edit / reorder / delete projects, upload video & screenshots, live preview). Then commit as usual.
`_admin/` is ignored by GitHub Pages, so it never goes public.

Each project lives in its own folder:

```
Database/Projects/
├── index.json                  ← list of folder names, in display order
└── <project-name>/
    ├── data.json               ← all project info
    ├── video.mp4               ← optional local video
    └── images/
        ├── icon.png            ← optional app icon
        ├── cover.jpg           ← optional poster (shown before the video plays)
        ├── screenshot-1.jpg
        └── screenshot-2.jpg …
```

To add a project: create the folder + `data.json`, then add the folder name to `index.json`
(the site can't list folders on GitHub Pages, so `index.json` is required).

## data.json

Every text field can be a plain string or `{ "en": "...", "vi": "..." }`.
File paths are relative to the project folder (e.g. `images/screenshot-1.jpg`); full URLs also work.

| Field | Example | Notes |
|---|---|---|
| `title` | `"Jelly Master: Mukbang Asmr"` | |
| `studio` | `"Champion Game Studio"` | |
| `accentColor` | `"#f48fb1"` | placeholder color when there is no image |
| `downloads` | `"70M+"` | |
| `store` | `{ "googlePlay": "https://…", "appStore": "", "apk": "" }` | each button shows only when its link is set; `apk` = external URL or a file in the project folder |
| `video.youtube` | `"Yd7vDterctQ"` | YouTube id (Shorts ids work too) |
| `video.file` | `"video.mp4"` | local file; used instead of YouTube when set |
| `video.orientation` | `"landscape"` / `"portrait"` | `portrait` shows the video in a phone frame |
| `poster`, `icon` | `"images/cover.jpg"` | optional; YouTube thumbnail is used as fallback |
| `tagline` | `{ "en": "…", "vi": "…" }` | one line under the title |
| `team`, `duration`, `status`, `platform`, `engine`, `year` | `6`, `{ "en": "8 months" }`, … | shown in the header / stats |
| `teamDetail` | `"1Dev - 2Art - 2GD - 1Anim"` | shown under the team size instead of "TEAM" |
| `overview` | `{ "en": "…", "vi": "…" }` | |
| `roles` | `[{ "name": {…}, "summary": {…}, "did": { "en": ["…"], "vi": ["…"] } }]` | Responsibilities section |
| `learned` | `[{ "title": {…}, "text": { "en": ["…"], "vi": ["…"] } }]` | What I learned — each string is one bullet |
| `challenges` | `[{ "title": {…}, "problem": {…}, "solution": {…} }]` | |
| `results` | `[{ "value": "70M+", "label": {…} }]` | |
| `screenshots` | `["images/screenshot-1.jpg", { "src": "images/screenshot-2.jpg", "caption": {…} }]` | portrait or landscape |
| `placeholder` | `true` | shows a "sample data" badge — remove once the content is real |
