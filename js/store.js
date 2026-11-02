/* One localStorage blob holds everything this browser has done: the visitor's bookings, follows and reviews,
   and — once a host signs in — the host's panel data. `?reset` in the URL wipes it. */
const KEY = 'wte.v1';

const fresh = () => ({
  v: 1,
  lang: 'fa',
  mode: 'attendee',            // 'attendee' | 'studio'
  user: { name: '', phone: '' },
  auth: null,                  // { host, at } once a host signs in
  howDismissed: false,         // the first-visit "how it works" strip
  reviews: [],                 // { id, host, event, name, stars, text, ts } written by this visitor
  hostRequests: [],            // "become a host" requests sent from the login page
  following: [],
  saved: [],
  followedAt: {},
  bookings: [],                // { id, event, qty, name, phone, at, code }
  inbox: [],                   // { id, ts, kind, host, title, body, read }
  studio: {
    created: [],               // events the host made in the studio
    edits: {},                 // id -> partial overrides on a seed event
    cancelled: [],
    checkins: {},              // eventId -> { contactId: true }
    walkins: [],               // { id, event, name, qty, at }
    notes: {},                 // contactId -> text
    tags: {},                  // contactId -> [tag]
    broadcasts: [],
    page: { about: null, tagline: null, pinned: 'summer', showAbout: true, showGallery: true, showFaq: true, showReviews: true,
            phone: '', telegram: '', instagram: 'jaryanplat', website: 'https://ilyatabrizi.github.io/jaryan/' },
    codes: null,               // discount codes (null = the seeded set)
    replies: {},               // reviewId -> host reply
    hiddenReviews: [],
    payouts: [],               // payout requests the host sends
    sharedPage: false,         // getting-started: shared the page link
    setupHidden: false,
    introDismissed: false,
  },
  seeded: false,
});

let state;
const subs = new Set();
let mem = null;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.v === 1) return mergeDefaults(fresh(), s);
    }
  } catch (_) { /* private mode, blocked storage… fall through */ }
  return mem ? mergeDefaults(fresh(), mem) : fresh();
}
function mergeDefaults(base, s) {
  for (const k of Object.keys(s)) {
    if (s[k] && typeof s[k] === 'object' && !Array.isArray(s[k]) && base[k] && typeof base[k] === 'object') {
      base[k] = mergeDefaults(base[k], s[k]);
    } else base[k] = s[k];
  }
  return base;
}
function save() {
  mem = state;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { /* in-memory only */ }
}

state = load();
if (new URLSearchParams(location.search).has('reset')) { try { localStorage.removeItem(KEY); } catch (_) { /* ignore */ } state = fresh(); }

/* first-ever visit: one welcome note so the bell has something honest in it */
if (!state.seeded) {
  state.seeded = true;
  state.inbox.push({
    id: 'welcome', ts: Date.now() - 6 * 60e3, kind: 'platform', host: null,
    title: { fa: 'به Went to Event خوش اومدی!', en: 'Welcome to Went to Event' },
    body: {
      fa: 'هر میزبانی رو دنبال کنی، خبرهاش همین‌جا میاد. یه رویداد رزرو کن تا بلیتت تو «بلیت‌ها» ساخته بشه.',
      en: 'Updates from the hosts you follow land here. Reserve an event and your ticket appears under Tickets.',
    },
    read: false,
  });
  save();
}

export const S = () => state;
export function commit(fn, opts = {}) {
  fn(state);
  save();
  if (!opts.silent) subs.forEach((cb) => cb(opts));
}
export const subscribe = (cb) => { subs.add(cb); return () => subs.delete(cb); };
export function resetAll() {
  try { localStorage.removeItem(KEY); } catch (_) { /* ignore */ }
  mem = null;
  state = fresh();
  state.seeded = false;
  save();
}
