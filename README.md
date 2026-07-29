# kiebitz-site

Website for **[Kiebitz](https://github.com/Torim98/Kiebitz)** — a local-first
chess companion for desktop and Android. No account, no cloud, no telemetry.

Live: <https://torim98.github.io/kiebitz-site/>

## Setup

Static site, no build step. GitHub Pages serves `main` from the repository root,
so `index.html` must stay at the top level. Nothing is fetched from a CDN — font,
styles, script and icon are all served from this repo.

```
index.html            landing page (DE/EN)
privacy/index.html    privacy policy (DE + EN) — required for Google Play
impressum/index.html  legal notice (§ 5 DDG)
assets/style.css      all styling for the three pages
assets/site.js        language switch, reveal, board choreography
assets/fonts/         Inter Variable (latin, latin-ext), SIL OFL 1.1
assets/icon*.png      app icon, taken from the app repo
```

## Language switching

Both languages live in the DOM. Every translated element carries `lang="de"` or
`lang="en"`; CSS hides the branch that does not match `<html data-lang>`. The
page therefore works without JavaScript. `assets/site.js` only flips the
attribute, keeps the choice in `localStorage` (`kiebitz-lang`) and swaps the
`<title>` via the `data-title-de` / `data-title-en` attributes on `<html>`.
Initial language: browser language, falling back to English.

Internal links are written as explicit `…/index.html` paths so the pages also
work when opened straight from disk, not only through GitHub Pages.

## Screenshots

The four feature blocks on the landing page contain labelled placeholders. Drop
real captures into `assets/shots/` and replace the `.shot-frame` div with the
`<img>` tag that is already prepared as an HTML comment inside each `<figure>`:

```
assets/shots/insights.png     1600 × 1000
assets/shots/repertoire.png   1600 × 1000
assets/shots/puzzles.png      1600 × 1000
assets/shots/study.png        1600 × 1000
```

## Downloads

Download links point at the release assets of the app repository, never at files
committed here:

- Windows installer and Android APK: <https://github.com/Torim98/Kiebitz/releases/latest>

A full-bleed banner (`.band`, between hero and section 01) advertises the closed
test: invitation on the left, the three moves as a connected route on the right,
over a faint chessboard texture (`.band-grid`). Below 900 px it stacks.

All three Android buttons (banner, hero and download section) carry `data-beta-open` and open
a dialog about the closed test on Google Play instead of following their `href`.
Without JavaScript the `href` still leads to the GitHub release, so the page keeps
working. The dialog lists the three steps and is defined at the end of
`index.html` (`#beta-android`), styled under `/* Dialog */` in `assets/style.css`:

1. Google Group: <https://groups.google.com/g/kiebitz-beta-test/>
2. Closed test: <https://play.google.com/apps/testing/de.torim.kiebitz>
3. Play listing: <https://play.google.com/store/apps/details?id=de.torim.kiebitz>

Once the app is in open testing or production, remove the `.band` section and
drop `data-beta-open` from the two remaining buttons; the dialog then never opens.

## Feedback form

The landing page contains a feedback form for general feedback, crash reports
and feature requests. JavaScript sends it in the background to FormSubmit's
AJAX endpoint, which forwards submissions to `kiebitz@gmail.com`; the regular
form action remains as a no-JavaScript fallback. The form uses a honeypot and
disables the provider captcha so it can stay inside the page.

FormSubmit requires one initial confirmation for the recipient address. After
the first submission, open the activation email sent to `kiebitz@gmail.com` and
confirm it. Until then, FormSubmit retains submissions and delivers them after
activation.

## Notes

- The site is separate from the app repository on purpose: website deploys stay
  decoupled from app releases, and GitHub Pages keeps working even if the app
  repository's visibility ever changes.
- A custom domain can be added later via a `CNAME` file plus DNS; do it before
  submitting the privacy policy URL to Play if possible, since changing it
  afterwards means editing the Play Console listing.
- The privacy policy and the legal notice both carry a "last updated" date
  (currently 26 July 2026) — update it whenever the app gains a function that
  touches the network, storage or device permissions.
