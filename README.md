# Went to Event — platform demo

A clickable prototype of **Went to Event**: a platform where event hosts have an account, a public page,
ticketing, a door list and an audience (customers + engagers) they can message.

**Jaryan** (Tabriz) is the demo host. Its events, copy and photos come from <https://ilyatabrizi.github.io/jaryan/>.

- **Explore** — what an attendee sees: discover, search, event pages, reserve, tickets, inbox.
- **Studio** — what Jaryan sees: overview, events, door list (check-in / scan / walk-ins), audience CRM, broadcast, page editor.
- Everything an attendee does (follow, save, reserve) shows up in the Studio immediately — and a broadcast from the Studio lands in the attendee inbox.

Persian (RTL, Jalali dates) is the default; English via the `FA / EN` button or `?lang=en`.

## Notes
- No build step, no backend: plain ES modules, state in `localStorage` (`Reset demo` lives in *You*).
- Jaryan's prices, dates and capacities are placeholders. The other three hosts (Pulse Live, Stride Club, Atlas Trips) are **samples**, labelled as such in the UI.
- Payments are simulated. QR marks are decorative; the printed code is what the scanner accepts.

## Run locally
```
python3 -m http.server 8000   # then open http://localhost:8000
```
