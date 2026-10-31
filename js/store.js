/* One localStorage blob. No server, no accounts: this is a clickable prototype,
   and a "Reset demo" in Profile wipes it. */
const KEY = 'wte.v1';

const fresh = () => ({
  v: 1,
  lang: 'fa',
  mode: 'attendee',            // 'attendee' | 'studio'
  user: { name: '', phone: '09145550142' },
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
    page: { about: null, tagline: null, pinned: 'summer', showAbout: true, showGallery: true, showFaq: true },
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

/* first-ever visit: one welcome note so the bell has something honest in it */
if (!state.seeded) {
  state.seeded = true;
  state.inbox.push({
    id: 'welcome', ts: Date.now() - 6 * 60e3, kind: 'platform', host: null,
    title: { fa: 'به Went to Event خوش آمدی', en: 'Welcome to Went to Event' },
    body: {
      fa: 'هر میزبانی که دنبال کنی، خبرهایش همین‌جا می‌آید. رویدادی رزرو کن تا بلیتت در «بلیت‌ها» ساخته شود.',
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
