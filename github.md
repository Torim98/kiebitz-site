repo: Torim98/Kiebitz
branch: main

## Last sync

date: 2026-07-26T00:00:00Z

### Updated in this project

- Website copy, feature sections and privacy wording derived from the app's README, `src/index.css` design tokens and `src/lib/i18n.tsx` strings.
- Colour tokens, Inter Variable font files and the app icon taken directly from the app repository.
- Privacy policy network/permission list checked against `src/lib/importer.ts`, `src/lib/settings.ts`, `src/lib/sync.ts` and `src/lib/updater.ts`.
- First real app screenshot (`assets/shots/insights.png`) wired into the Insights feature block.

## Screen map

| Project file | Built from (repo files) |
| --- | --- |
| `index.html` — landing page | `README.md`, `src/index.css`, `src/lib/i18n.tsx`, `src/App.tsx`, `src/components/ui.tsx`, `src/components/Board.tsx` |
| `privacy/index.html` — privacy policy | `src/lib/importer.ts`, `src/lib/settings.ts`, `src/lib/sync.ts`, `src/lib/updater.ts`, `src/lib/notify.ts`, `src/lib/i18n.tsx` |
| `impressum/index.html` — legal notice | `README.md`, `LICENSE`, `THIRD_PARTY_NOTICES.md` |
| `assets/style.css` — design tokens | `src/index.css` (`@theme` block) |
| `assets/fonts/*` | `@fontsource-variable/inter` as used by `src/index.css` |
| `assets/icon*.png` | `src-tauri/icons/icon.png`, `src-tauri/icons/128x128.png` |

## Notes

This project is the **website** repository (`kiebitz-site`), not the app. The app
repository above is source material only; nothing here is generated from its build.
