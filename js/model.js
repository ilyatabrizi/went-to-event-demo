/* The derived model: static seeds + whatever the person has done in the app.
   Everything the studio shows (revenue, door list, CRM, activity) is computed here
   from the same bookings the visitor side writes, so a reservation shows up in the panel the moment it happens. */
import { S } from './store.js';
import { EVENTS, HOSTS, CONTACTS, DOOR, ME, SEED_TAGS, SEED_NOTES, REVIEWS, SEED_CODES } from './data.js';
import { L, T } from './i18n.js';
import { rng, hash, DAY, sum, today0 } from './util.js';

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
export const userName = () => S().user.name || T('مهمون', 'Guest');
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
  const doorPaid = st.doorPaid?.[eventId] || {};
  const seeded = (ATT[eventId] || []).map((a) => ({ key: a.code, c: a.c, qty: a.qty, paid: a.paid || !!doorPaid[a.code], door: !a.paid && !!doorPaid[a.code], code: a.code, ts: a.ts, kind: 'seed', amount: e.price * a.qty }));
  const mine = S().bookings.filter((b) => b.event === eventId).map((b) => ({ key: b.code, c: 'me', qty: b.qty, paid: true, code: b.code, ts: b.at, kind: 'live', bid: b.id, amount: b.total ?? e.price * b.qty, promo: b.promo || null }));
  /* walk-ins pay the host in person (door money, not held by the platform); tickets scanned from another phone were paid online */
  const walks = st.walkins.filter((w) => w.event === eventId).map((w) => ({ key: w.code, c: w.cid, qty: w.qty, paid: true, door: !w.online, code: w.code, ts: w.at, kind: 'walk', wid: w.id, amount: w.amount ?? e.price * w.qty }));
  const checked = st.checkins[eventId] || {};
  return [...seeded, ...mine, ...walks].map((g) => ({ ...g, in: !!checked[g.key] }));
}

/* ───────────────────────────────────────────────────────────── the audience */
export function rawContacts() {
  const st = S().studio;
  const list = CONTACTS.map((c) => ({ ...c }));
  st.walkins.forEach((w) => {
    if (!list.find((c) => c.id === w.cid)) list.push({ id: w.cid, name: { fa: w.name, en: w.name }, phone: w.phone || '', src: w.online ? 'went' : 'walk', eng: false, joined: 0, follows: false, saves: 0, walkin: !w.online });
  });
  /* this visitor shows up in Jaryan's audience the moment they follow, save or book */
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
    const spent = sum(bookings.filter((b) => b.paid), (b) => b.amount ?? b.price * b.qty);
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
  { id: 'next',      fa: 'مهمون‌های رویداد بعدی', en: 'Next event',  test: (c) => c.next },
  { id: 'lapsed',    fa: 'یه مدتیه نیومدن',   en: 'Lapsed',        test: (c) => c.lapsed },
];
export const segment = (id) => audience().filter((SEGMENTS.find((s) => s.id === id) || SEGMENTS[0]).test);

/* ──────────────────────────────────────────────────────────────── numbers */
export function revenue() {
  const evs = eventsOf(ME).filter((e) => e.status !== 'cancelled');
  let paid = 0, pending = 0;
  for (const e of evs) for (const g of guests(e.id)) { (g.paid ? (paid += g.amount) : (pending += g.amount)); }
  return { paid, pending };
}
export function revenueSeries(days = 14) {
  const arr = new Array(days).fill(0);
  for (const e of eventsOf(ME).filter((x) => x.status !== 'cancelled')) {
    for (const g of guests(e.id)) {
      if (!g.paid) continue;
      const ago = Math.floor((Date.now() - g.ts) / DAY);
      if (ago >= 0 && ago < days) arr[days - 1 - ago] += g.amount;
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
/* a ticket remembers the calendar day it was booked for, so once that day has gone it moves to Past and can be reviewed */
export const ticketsFor = () => S().bookings.map((b) => {
  const e = getEvent(b.event); if (!e) return null;
  const day = b.evAt ? Math.round((b.evAt - today0().getTime()) / DAY) : e.day;
  return { ...b, ev: day === e.day ? e : { ...e, day } };
}).filter(Boolean);
export const myUpcoming = () => ticketsFor().filter((b) => b.ev.day >= 0).sort((a, b) => a.ev.day - b.ev.day);
export const myPast = () => ticketsFor().filter((b) => b.ev.day < 0);

/* ─────────────────────────────────────────────────────────── discount codes */
export function codes() {
  const base = S().studio.codes ?? SEED_CODES.map((c) => ({ ...c, expires: NOW0 + c.days * DAY }));
  const usedLive = {};
  S().bookings.forEach((b) => { if (b.promo) usedLive[b.promo] = (usedLive[b.promo] || 0) + 1; });
  return base.map((c) => {
    const used = (c.used || 0) + (usedLive[c.code] || 0);
    const expired = c.expires && c.expires < Date.now();
    const full = c.limit && used >= c.limit;
    return { ...c, used, expired, full, state: !c.active ? 'off' : expired ? 'expired' : full ? 'full' : 'on' };
  });
}
/* the price after a code, or a reason it doesn't apply */
export function applyCode(raw, e, qty) {
  const code = String(raw || '').trim().toUpperCase();
  if (!code) return { ok: false, why: 'empty' };
  if (e.host !== ME) return { ok: false, why: 'nope' };
  const c = codes().find((x) => x.code === code);
  if (!c) return { ok: false, why: 'nope' };
  if (c.state === 'expired') return { ok: false, why: 'expired' };
  if (c.state === 'full') return { ok: false, why: 'full' };
  if (c.state !== 'on') return { ok: false, why: 'nope' };
  if (c.event && c.event !== e.id) return { ok: false, why: 'event' };
  const gross = e.price * qty;
  const off = Math.min(gross, c.type === 'pct' ? Math.round((gross * c.value) / 100 / 1000) * 1000 : c.value * qty);
  return { ok: true, code: c.code, off, total: gross - off, c };
}

/* ─────────────────────────────────────────────────────────────── reviews */
export function reviewsOf(host, { all = false } = {}) {
  const st = S();
  const byId = new Map(CONTACTS.map((c) => [c.id, c]));
  const seeded = REVIEWS.filter((r) => r.host === host).map((r) => ({
    ...r, name: L(byId.get(r.c)?.name) || '', ts: NOW0 - r.ago * DAY - (hash(r.id) % 9) * 3600e3, mine: false,
  }));
  const mine = st.reviews.filter((r) => r.host === host).map((r) => ({ ...r, text: { fa: r.text, en: r.text }, mine: true }));
  return [...mine, ...seeded]
    .map((r) => ({ ...r, reply: st.studio.replies[r.id] || '', hidden: st.studio.hiddenReviews.includes(r.id) }))
    .filter((r) => all || !r.hidden)
    .sort((a, b) => b.ts - a.ts);
}
export function rating(host) {
  const list = reviewsOf(host);
  if (!list.length) return { avg: 0, n: 0, dist: [0, 0, 0, 0, 0] };
  const dist = [0, 0, 0, 0, 0];
  list.forEach((r) => { dist[r.stars - 1]++; });
  return { avg: sum(list, (r) => r.stars) / list.length, n: list.length, dist };
}
/* events this visitor attended with a host and hasn't reviewed yet */
export function canReview(host) {
  const done = new Set(S().reviews.map((r) => r.event));
  return ticketsFor().filter((b) => b.ev.host === host && b.ev.day < 0 && !done.has(b.ev.id));
}

/* ──────────────────────────────────────────────────────────────── money */
export function finances() {
  const evs = eventsOf(ME).filter((e) => e.status !== 'cancelled');
  let held = 0, upcomingPaid = 0, unpaid = 0, door = 0;
  const rows = [];
  for (const e of evs) {
    let p = 0, u = 0, d = 0, promo = 0;
    for (const g of guests(e.id)) {
      if (g.paid && g.door) d += g.amount; else if (g.paid) p += g.amount; else u += g.amount;
      if (g.promo) promo += e.price * g.qty - g.amount;
    }
    if (e.day < 0) held += p; else upcomingPaid += p;
    unpaid += u; door += d;
    if (p || u || d) rows.push({ e, paid: p, unpaid: u, door: d, promo });
  }
  /* two settlements already paid out, as a share of what past events earned */
  const seed = [
    { id: 'p-s1', amount: Math.round((held * 0.46) / 100000) * 100000, ts: NOW0 - 12 * DAY, status: 'done', ref: 'STL-48210' },
    { id: 'p-s2', amount: Math.round((held * 0.31) / 100000) * 100000, ts: NOW0 - 27 * DAY, status: 'done', ref: 'STL-47735' },
  ];
  const payouts = [...S().studio.payouts, ...seed].sort((a, b) => b.ts - a.ts);
  const settled = sum(payouts, (p) => p.amount);
  return { available: Math.max(0, held - settled), upcoming: upcomingPaid, unpaid, door, held, settled, payouts, rows: rows.sort((a, b) => b.e.day - a.e.day) };
}
