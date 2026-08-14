# kiebitz-site

Website for **[Kiebitz](https://github.com/Torim98/Kiebitz)** — a local-first
chess companion for desktop and Android. No account or chess-data cloud; analysis stays on your devices.

Live: <https://kiebitz.dev/>

## Build

The published site is generated from three multilingual source templates. Each
output page contains exactly one language so search engines and assistive
technology see an unambiguous document.

```powershell
npm run build
npm run check
```

Node.js is the only build dependency; no package installation is required.
Generated HTML stays committed because GitHub Pages serves `main` from the
repository root. The same build also prepares an ignored `dist/` package for
the private Codex Sites deployment.

```text
src/pages/                         multilingual source templates
scripts/build-site.mjs             locale, metadata, sitemap and robots build
scripts/check-site.mjs             generated-site validation
site.config.mjs                    canonical origin, version and localized SEO copy
index.html                         English landing page and x-default
de/, fr/, es/, zh/, hi/, ar/       localized page trees
privacy/, impressum/               English legal pages
assets/                            shared styles, script, fonts, images and social card
robots.txt, sitemap.xml            generated crawler files
```

Edit the templates, shared assets, or `site.config.mjs`, then run both commands.
Do not edit generated HTML directly.

## Languages and URLs

English is served at `/` and acts as `x-default`. Other languages use stable
subdirectories such as `/de/` and `/fr/`. Privacy and legal pages follow the
same pattern, for example `/de/privacy/`.

Every generated page includes:

- a self-referencing canonical URL;
- reciprocal `hreflang` links for all seven languages and `x-default`;
- one localized title and meta description;
- localized Open Graph and X/Twitter metadata;
- the 1200×630 social card in `assets/og-kiebitz.png`;
- `SoftwareApplication` JSON-LD on landing pages.

The language selector navigates between locale URLs and keeps the equivalent
page and anchor. It does not swap hidden content in the DOM.

## Custom domain

After buying the domain:

1. Change `site.origin` in `site.config.mjs` to the final HTTPS origin.
2. Run `npm run build` and `npm run check` so canonical URLs, `hreflang`, the
   sitemap, structured data and social metadata all use the new domain.
3. Add the domain in the repository's GitHub Pages settings. For an apex domain,
   configure GitHub's four `A` records (and optionally the four `AAAA` records)
   at the registrar. Point `www` to `torim98.github.io` with a `CNAME`.
4. Keep the `CNAME` file GitHub creates, enable **Enforce HTTPS**, and verify
   both the apex and `www` variants.
5. Update the website/privacy URL in Google Play Console, Search Console, Bing
   Webmaster Tools, the GitHub repository description, and any app/store links.

Do not add a production `CNAME` before the domain is registered and connected.

## Search submission

After publishing, submit `/sitemap.xml` in Google Search Console and Bing
Webmaster Tools. Inspect at least the English and German landing pages and
request indexing.

## Downloads and feedback

Desktop download links point to the app repository's releases overview, so
publishing a new app version does not require a website update. Android buttons
link straight to the Google Play listing; the GitHub APK stays available as an
alternative. The footer's support entry opens a dialog with both donation
options and falls back to the GitHub Sponsors link without JavaScript.

The feedback form sends only after deliberate submission to FormSubmit's AJAX
endpoint and forwards to `kiebitz.chess@gmail.com`. FormSubmit requires an
initial confirmation for that recipient address.

## Privacy and maintenance

The site loads no CDN resources, analytics, advertising, or social scripts.
Fonts, styles, JavaScript, screenshots and the social card are self-hosted. The
language and motion preferences remain in browser `localStorage`.

Update the privacy policy date whenever the app or site gains a function that
changes data processing. Keep the version in `site.config.mjs` aligned with the
latest release.
