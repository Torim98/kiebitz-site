# Desktop advertising

The desktop app loads `/desktop-ad/` in a sandboxed frame. Campaigns are read
from `campaigns.json`; no application release is needed when that file changes.

To publish a campaign:

1. Add the creative image to the website. Images must come from the website's
   own origin; third-party image URLs are rejected.
2. Add or edit a campaign entry. Set `enabled` to `true`, use an HTTPS target,
   and optionally set ISO-8601 `startsAt` and `endsAt` values.
3. Run the normal website build and publish the website.

When several campaigns are active they take turns: every 11 seconds the surface
fades to the next one and starts over after the last. `weight` controls the
order they are drawn in, so a heavier campaign is more likely to be the one
shown first. Rotation pauses while the window is hidden. An empty or invalid
configuration tells the app to collapse the ad slot. The page uses no cookies,
storage, identifiers, analytics, or remote scripts. The advertiser receives a
request only after the user clicks the ad.

The surface follows the website's design: Inter from `assets/fonts/`, the
Kiebitz accent, a faint chessboard texture and the footer's flock. All motion
is decorative and stops under `prefers-reduced-motion`. The slot is 72 px high;
keep headline and body short enough to fit one line each.
