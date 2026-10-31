/* The derived model: static seeds + whatever the person has done in the app.
   Everything the studio shows (revenue, door list, CRM, activity) is computed here
   from the same bookings the attendee side writes — that is the point of the demo. */
import { S } from './store.js';
import { EVENTS, HOSTS, CONTACTS, DOOR, ME, SEED_TAGS, SEED_NOTES } from './data.js';
import { L, T } from './i18n.js';
import { rng, hash, DAY, sum } from './util.js';

const NOW0 = Date.now();

/* ─────────────────────────────────────────────── seeded attendance (Jaryan) */
/* four customers who came once, to the oldest gathering, and haven't been back — the "lapsed" segment */
const LAPSE = ['c8', 'c13', 'c17', 'c19'];
const ATT = (() => {
  const out = {};
  const customers = CONTACTS.filter((c) => !c.eng).map((c) => c.id);
  const used = new Set(DOOR.map((d) => d.code));
  for (const ev of EVENTS.filter((e) => e.host === ME)) {
    const r = rng('att:' + ev.id);
    const list = [];
    if (ev.id === 'tiramisu') {
      DOOR.forEach((d) => list.push({ ...d }));
    } else {
      let order = customers.filter((id) => !LAPSE.includes(id) || ev.id === 'gathering');
      for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
      if (ev.id === 'gathering') order = [...LAPSE, ...order.filter((id) => !LAPSE.includes(id))];
      let left = ev.taken, i = 0;
      while (left > 0) {
        const cid = order[i % order.length];
        const q = Math.min(left, r() < 0.26 ? 2 : 1);
        const ex = list.find((x) => x.c === cid);
        if (ex) ex.qty += q;
        else {
          let code; do { code = 'JRN-' + (1000 + Math.floor(r() * 8999)); } while (used.has(code));
          used.add(code);
          const ago = ev.day >= 0 ? Math.floor(r() * 11) : -ev.day + 1 + Math.floor(r() * 8);
          list.push({ c: cid, qty: q, paid: r() > 0.06, code, ago });
        }
        left -= q; i++;
      }
    }
    list.forEach((a) => { a.ts = NOW0 - a.ago * DAY - ((hash(a.code) % 17) + 1) * 3600e3; });
    out[ev.id] = list;
  }
  return out;
})();

/* ─────────────────────────────────────────────────────────────── identity */
export const userName = () => S().user.name || T('دارا ک.', 'Dara K.');
export const initials = (name) => {
  const s = String(L(name) || '').trim();
  return s ? Array.from(s)[0].toUpperCase() : '·';
};

/* ───────────────────────────────────────────────────────────────── hosts */
export function getHost(id) {
  const h = HOSTS.find((x) => x.id === id);
  if (!h) return null;
  const out = { ...h, followersNow: h.followers + (S().following.includes(id) ? 1 : 0) };
  if (id === ME) {
    const p = S().studio.page;
    if (p.tagline) out.tagline = { fa: p.tagline, en: p.tagline };
  }
  return out;
}
export const hosts = () => HOSTS.map((h) => getHost(h.id));
export const following = (id) => S().following.includes(id);

/* ──────────────────────────────────────────────────────────────── events */
export function allEvents() {
  const st = S().studio;
  return [...EVENTS, ...st.created].map((e) => {
    const o = { ...e, ...(st.edits[e.id] || {}) };
    o.status = st.cancelled.includes(e.id) ? 'cancelled' : (o.status || 'live');
    return o;
  });
}
export const getEvent = (id) => allEvents().find((e) => e.id === id) || null;
export const isLive = (e) => e.status === 'live';
export const byTime = (a, b) => a.day - b.day || a.from.localeCompare(b.from);
export const upcoming = () => allEvents().filter((e) => isLive(e) && e.day >= 0).sort(byTime);
export const past = () => allEvents().filter((e) => isLive(e) && e.day < 0).sort((a, b) => b.day - a.day);
export const eventsOf = (host) => allEvents().filter((e) => e.host === host);
export const nextEvent = () => eventsOf(ME).filter((e) => isLive(e) && e.day >= 0).sort(byTime)[0] || null;

export function seats(e) {
  const mine = S().bookings.filter((b) => b.event === e.id).reduce((a, b) => a + b.qty, 0);
  const walk = S().studio.walkins.filter((w) => w.event === e.id).reduce((a, w) => a + w.qty, 0);
  const taken = (e.taken || 0) + mine + walk;
  const left = Math.max(0, e.seats - taken);
  return { taken, left, total: e.seats, fill: e.seats ? Math.min(1, taken / e.seats) : 0, full: left === 0 };
}

/* the door list for one of Jaryan's events: seeded guests + live bookings + walk-ins */
export function guests(eventId) {
  const e = getEvent(eventId);
  if (!e) return [];
  const st = S().studio;
  const seeded = (ATT[eventId] || []).map((a) => ({ key: a.code, c: a.c, qty: a.qty, paid: a.paid, code: a.code, ts: a.ts, kind: 'seed' }));
  const mine = S().bookings.filter((b) => b.event === eventId).map((b) => ({ key: b.code, c: 'me', qty: b.qty, paid: true, code: b.code, ts: b.at, kind: 'live', bid: b.id }));
  const walks = st.walkins.filter((w) => w.event === eventId).map((w) => ({ key: w.code, c: w.cid, qty: w.qty, paid: true, code: w.code, ts: w.at, kind: 'walk', wid: w.id }));
  const checked = st.checkins[eventId] || {};
  return [...seeded, ...mine, ...walks].map((g) => ({ ...g, in: !!checked[g.key] }));
}

/* ───────────────────────────────────────────────────────────── the audience */
export function rawContacts() {
  const st = S().studio;
  const list = CONTACTS.map((c) => ({ ...c }));
  st.walkins.forEach((w) => {
    if (!list.find((c) => c.id === w.cid)) list.push({ id: w.cid, name: { fa: w.name, en: w.name }, phone: w.phone || '', src: 'walk', eng: false, joined: 0, follows: false, saves: 0, walkin: true });
  });
  /* the person using the demo shows up in Jaryan's CRM the moment they follow, save or book */
  const bookedJaryan = S().bookings.some((b) => getEvent(b.event)?.host === ME);
  const savedJaryan = S().saved.filter((id) => getEvent(id)?.host === ME).length;
  const f = following(ME);
  if (bookedJaryan || savedJaryan || f) {
    list.unshift({ id: 'me', name: { fa: userName(), en: userName() }, phone: S().user.phone, src: 'went', eng: !bookedJaryan, joined: 0, follows: f, saves: savedJaryan, isMe: true });
  }
  return list;
}

export function audience() {
  const st = S().studio;
  const evs = new Map(eventsOf(ME).filter((e) => e.status !== 'cancelled').map((e) => [e.id, e]));
  const byC = new Map();
  for (const ev of evs.values()) {
    for (const g of guests(ev.id)) {
      if (!byC.has(g.c)) byC.set(g.c, []);
      byC.get(g.c).push({ ...g, event: ev.id, day: ev.day, price: ev.price });
    }
  }
  const next = nextEvent();
  return rawContacts().map((c) => {
    const bookings = (byC.get(c.id) || []).sort((a, b) => b.day - a.day);
    const spent = sum(bookings.filter((b) => b.paid), (b) => b.price * b.qty);
    const pastB = bookings.filter((b) => b.day < 0);
    const hasUpcoming = bookings.some((b) => b.day >= 0);
    const lastDay = pastB.length ? pastB[0].day : null;
    const tags = st.tags[c.id] ?? SEED_TAGS[c.id] ?? [];
    const note = st.notes[c.id] ?? (SEED_NOTES[c.id] ? L(SEED_NOTES[c.id]) : '');
    const isCustomer = bookings.length > 0;
    return {
      ...c, bookings, spent, tags, note, isCustomer, hasUpcoming,
      lastDay, count: sum(bookings, (b) => b.qty),
      vip: spent >= 3500000,
      lapsed: isCustomer && !hasUpcoming && lastDay !== null && -lastDay >= 14,
      next: !!(next && bookings.some((b) => b.event === next.id)),
    };
  });
}
export const contact = (id) => audience().find((c) => c.id === id) || null;

export const SEGMENTS = [
  { id: 'all',       fa: 'همه',              en: 'Everyone',      test: () => true },
  { id: 'customers', fa: 'مشتری‌ها',          en: 'Customers',     test: (c) => c.isCustomer },
  { id: 'engagers',  fa: 'دنبال‌کننده‌ها',    en: 'Engagers',      test: (c) => !c.isCustomer },
  { id: 'vip',       fa: 'ویژه',             en: 'VIP',           test: (c) => c.vip },
  { id: 'next',      fa: 'حاضران رویداد بعد',  en: 'Next event',    test: (c) => c.next },
  { id: 'lapsed',    fa: 'در خطر ریزش',       en: 'Lapsed',        test: (c) => c.lapsed },
];
export const segment = (id) => audience().filter((SEGMENTS.find((s) => s.id === id) || SEGMENTS[0]).test);

/* ──────────────────────────────────────────────────────────────── numbers */
export function revenue() {
  const evs = eventsOf(ME).filter((e) => e.status !== 'cancelled');
  let paid = 0, pending = 0;
  for (const e of evs) for (const g of guests(e.id)) { (g.paid ? (paid += e.price * g.qty) : (pending += e.price * g.qty)); }
  return { paid, pending };
}
export function revenueSeries(days = 14) {
  const arr = new Array(days).fill(0);
  for (const e of eventsOf(ME).filter((x) => x.status !== 'cancelled')) {
    for (const g of guests(e.id)) {
      if (!g.paid) continue;
      const ago = Math.floor((Date.now() - g.ts) / DAY);
      if (ago >= 0 && ago < days) arr[days - 1 - ago] += e.price * g.qty;
    }
  }
  return arr;
}
export function followerSeries(days = 14) {
  const r = rng('followers');
  let v = 1284 - 118;
  return Array.from({ length: days }, () => (v += Math.round(3 + r() * 14)));
}
export function sources() {
  const aud = audience();
  const counts = {};
  aud.forEach((c) => { counts[c.src] = (counts[c.src] || 0) + 1; });
  return Object.entries(counts).map(([id, n]) => ({ id, n, share: n / aud.length })).sort((a, b) => b.n - a.n);
}

/* ─────────────────────────────────────────────────────────── activity feed */
export function activity(limit = 8) {
  const items = [];
  for (const e of eventsOf(ME)) {
    if (e.status === 'cancelled') continue;
    for (const g of guests(e.id)) {
      if (Date.now() - g.ts > 6 * DAY) continue;
      items.push({ ts: g.ts, kind: 'book', c: g.c, qty: g.qty, event: e.id, paid: g.paid, live: g.kind === 'live' });
    }
  }
  CONTACTS.filter((c) => c.follows && c.joined <= 9).forEach((c) => items.push({ ts: NOW0 - c.joined * DAY * 0.7 - hash(c.id) % 9e6, kind: 'follow', c: c.id }));
  CONTACTS.filter((c) => c.saves && c.joined <= 8).slice(0, 3).forEach((c) => items.push({ ts: NOW0 - c.joined * DAY * 0.5 - (hash(c.id) % 7e6), kind: 'save', c: c.id, event: 'summer' }));
  if (following(ME)) items.push({ ts: Date.now() - 1, kind: 'follow', c: 'me', live: true });
  S().studio.broadcasts.forEach((b) => items.push({ ts: b.ts, kind: 'msg', text: b.text, n: b.n }));
  return items.sort((a, b) => b.ts - a.ts).slice(0, limit);
}

/* ─────────────────────────────────────────────── notification helpers */
export const unread = () => S().inbox.filter((n) => !n.read).length;
export const ticketsFor = () => S().bookings.map((b) => ({ ...b, ev: getEvent(b.event) })).filter((b) => b.ev);
export const myUpcoming = () => ticketsFor().filter((b) => b.ev.day >= 0).sort((a, b) => a.ev.day - b.ev.day);
export const myPast = () => ticketsFor().filter((b) => b.ev.day < 0);
