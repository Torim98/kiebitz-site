# kiebitz-site

Website for **[Kiebitz](https://github.com/Torim98/Kiebitz)** — a local-first
chess companion for desktop and Android. No account, no cloud, no telemetry.

Live: <https://torim98.github.io/kiebitz-site/>

## Setup

Static site, no build step required. GitHub Pages serves `main` from the
repository root, so `index.html` must stay at the top level.

## Required pages

- `/` — landing page: what Kiebitz is, feature highlights, screenshots, downloads.
- `/privacy/` — privacy policy, **German and English**. Google Play requires a
  publicly reachable privacy policy URL before an app can be submitted, and the
  URL has to stay stable afterwards.
- `/impressum/` — added once the app is monetized (German legal requirement).

## Downloads

Point download links at the release assets of the app repository, never at files
committed here:

- Windows installer and Android APK: <https://github.com/Torim98/Kiebitz/releases/latest>

## Notes

- The site is separate from the app repository on purpose: website deploys stay
  decoupled from app releases, and GitHub Pages keeps working even if the app
  repository's visibility ever changes.
- A custom domain can be added later via a `CNAME` file plus DNS; do it before
  submitting the privacy policy URL to Play if possible, since changing it
  afterwards means editing the Play Console listing.
