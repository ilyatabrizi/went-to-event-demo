# Went to Event

The platform where hosts run their events: a public page, online booking with QR tickets, a door list with a camera
scanner, discount codes, guest reviews, an audience CRM, broadcasts and payouts — in one panel.

**Jaryan** (Tabriz) is the first host on the platform. Its events, copy and photos come from <https://ilyatabrizi.github.io/jaryan/>.

## Two sides
- **Visitors** (no account needed): discover, search, event pages, reserve with a name and a mobile number (discount codes
  apply at checkout), QR tickets, follow hosts, leave a review after attending, inbox.
- **Hosts** sign in at `#/login` and get the panel: overview with a setup checklist, events, door list (camera QR scanner,
  manual check-in, walk-ins), audience, broadcast, page editor (intro, contacts, sections), discount codes, reviews
  (reply / hide), money & payouts.

Everything a visitor does shows up in the host's panel immediately. Ticket QR codes carry the booking, so a host can admit a
guest who booked on another phone.

Persian (RTL, Jalali dates, everyday conversational Persian) is the default; English via the `EN` button or `?lang=en`.
Light / dark via the header, or `?theme=light`. `?reset` clears this browser's data.

## Tech
- No build step: plain ES modules, state in `localStorage`. The account check lives in `js/auth.js` and is the one place to
  swap for a real backend.
- Type: IRANYekanX (variable; Persian-digit and Latin-digit files).
- QR: `qrcode-generator` (MIT) to draw tickets, `jsQR` (Apache-2.0) to read them from the camera, in `js/vendor/`.

## Run locally
```
python3 -m http.server 8000   # then open http://localhost:8000
```
