# kiebitz-site

Website for **[Kiebitz](https://github.com/Torim98/Kiebitz)** — a local-first
chess companion for desktop and Android. No account or chess-data cloud; analysis stays on your devices.

Live: <https://kiebitz.dev/>

## Build

The published site is generated from nine multilingual source templates. Each
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
scripts/contract-annex.mjs         self-contained contract annexes from the terms pages
scripts/check-site.mjs             generated-site validation
site.config.mjs                    canonical origin, version and localized SEO copy
index.html                         English landing page and x-default
de/, fr/, es/, zh/, hi/, ar/       localized page trees
plus/, plus/account/, plus/success/  Kiebitz Plus sign-in, account and checkout return
privacy/, terms/, impressum/       English legal pages
cancel/, withdraw/                 public cancellation and withdrawal forms
legal/                             self-contained contract annexes for the billing email
assets/                            shared styles, script, fonts, images and social card
robots.txt, sitemap.xml            generated crawler files
```

Edit the templates, shared assets, or `site.config.mjs`, then run both commands.
Do not edit generated HTML directly.

## Languages and URLs

English is served at `/` and acts as `x-default`. Other languages use stable
subdirectories such as `/de/` and `/fr/`. Privacy and legal pages follow the
same pattern, for example `/de/privacy/`, `/de/terms/`, `/de/cancel/` and
`/de/withdraw/`.

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
endpoint and forwards to `support@kiebitz.dev`. FormSubmit requires an
initial confirmation for that recipient address.

## Kiebitz Plus

`/plus/` explains the tiers and starts a passwordless sign-in, `/plus/account/`
shows the status and runs checkout, billing portal, sign-out and account
deletion, and `/plus/success/` is where Stripe returns after a purchase. All
three talk to `https://api.kiebitz.dev` with `credentials: "include"`; writing
calls add `X-Kiebitz-CSRF: 1`. The session is an HttpOnly cookie the page never
sees, and `assets/plus.js` must never touch `localStorage` — `npm run check`
enforces both.

Every state is present in the HTML in all seven languages; the script only
toggles which one is visible and fills in values such as the address or a date.
No chess data is involved. The account and success pages are `noindex` and stay
out of the sitemap, because they only ever show the state of one session.

Prices live in Stripe and Google Play. The website may name the current
marketing price; the app and the API deliberately do not.

## Contract terms

`/terms/` carries the terms of service for the Kiebitz account and the Kiebitz
Plus subscription: scope and provider, services, sign-in, conclusion of
contract, prices, trial, term and cancellation, right of withdrawal with the
model form, availability and changes, obligations, warranty and liability, and
the final provisions. The page follows the same document layout, table of
contents and seven languages as `/privacy/`; German is the binding version.

The page is reachable from every footer and from the header navigation of the
legal and Plus pages. Next to each purchase call to action — the pricing card on
the landing page, the sign-in form on `/plus/`, and the checkout button on
`/plus/account/` — a `legal-note` paragraph links the terms, the privacy policy
and the withdrawal section `#t8` directly. `npm run check` enforces both: every
page's footer must link `/terms/`, and each purchase call to action must be
followed by a notice that links terms and privacy.

### Contract annexes

The billing confirmation email attaches
`/legal/kiebitz-vertragsbedingungen.html`, and for every non-German
confirmation `/legal/kiebitz-contract-terms.html` alongside it. Both are
generated by `scripts/contract-annex.mjs` from the freshly built `/de/terms/`
and `/terms/` pages, so no legal text is maintained twice: change the terms
template, run the build, and the attachments follow.

German is binding. The English file is a reading aid, because an attachment
the recipient cannot read does not do its job; it inherits the “translation for
information only” notice from the English terms page and links the German
version. A German confirmation gets the binding version alone.

Unlike every other page these are single self-contained HTML5 documents —
inline `<style>`, no script, no font, no image, no relative link — because they
are opened years later from a mail archive with no server behind them. They
carry no navigation, no language selector and no marketing, they are `noindex`
so they do not compete with the terms pages, and they print on paper with the
web addresses spelled out. `npm run check` enforces all of it: the language
attribute, no foreign-language leftovers, the inline style, the absence of
scripts and external stylesheets, absolute references only, sections 1 to 12,
the withdrawal instruction, the model withdrawal form, and the cross-link
between the two languages.

Generated URLs: `/terms/` plus `/de/terms/`, `/fr/terms/`, `/es/terms/`,
`/zh/terms/`, `/hi/terms/` and `/ar/terms/`. All seven are indexable, carry
reciprocal `hreflang` links and are listed in `sitemap.xml`. Update the date at
the top of the page whenever the terms change, and announce changes to
subscribers as described in section 12.

## Cancellation and withdrawal

Two public forms let anyone end a contract without signing in — no session, no
account, no `plus.js`. `/cancel/` is the confirmation page for the cancellation
button required by § 312k BGB; `/withdraw/` takes withdrawal statements. Both
are reachable from a permanent pill in every footer, labelled “Verträge hier
kündigen” and “Vertrag widerrufen” in German and translated for the other six
languages. The German button labels are prescribed, so `npm run check` pins
them, along with the confirmation buttons “jetzt kündigen” and “Widerruf
bestätigen”.

`assets/legal.js` drives both pages. It posts to
`https://api.kiebitz.dev/v1/contracts/cancellation` and
`.../v1/contracts/withdrawal` with `credentials: "omit"` and
`X-Kiebitz-CSRF: 1`, and it never touches `localStorage` — `npm run check`
enforces all three. Every state is present in the HTML in all seven languages;
the script only toggles which one is visible and fills in the request number and
the time of receipt. A `201` shows the receipt; the error
`legal_confirmation_failed` with `details.received` shows the same receipt plus
a note that the confirmation email failed, because a stored declaration stays
stored. Without JavaScript both pages point to `support@kiebitz.dev`.

Cancellation collects name, email, payment route, contract, ordinary or
extraordinary cancellation, the requested end (`earliest` or a date) and a
reason that becomes mandatory for an extraordinary cancellation. Withdrawal
collects name, email, payment route, contract and an optional message. Section 7
and section 8 of the terms link the matching form, and section 9 of the privacy
policy documents the processing.

Generated URLs: `/cancel/` and `/withdraw/` plus the six localized variants each
(`/de/cancel/`, `/de/withdraw/`, and the same for `fr`, `es`, `zh`, `hi`, `ar`).
All are indexable and listed in `sitemap.xml`, because a cancellation button
nobody can find is no cancellation button.

## Privacy and maintenance

The site loads no CDN resources, analytics, advertising, or social scripts.
Fonts, styles, JavaScript, screenshots and the social card are self-hosted. The
language and motion preferences remain in browser `localStorage`.

Update the privacy policy date whenever the app or site gains a function that
changes data processing. Keep the version in `site.config.mjs` aligned with the
latest release.
