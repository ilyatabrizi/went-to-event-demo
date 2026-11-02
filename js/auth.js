/* Host sign-in. Visitors never need an account: they browse, follow and reserve with just a name and a number.
 * Hosts sign in to reach their panel. This build runs entirely in the browser, so the account list lives here;
 * when the backend lands, `signIn` becomes one request and nothing else in the app changes. */
import { S, commit } from './store.js';

const ACCOUNTS = [
  { host: 'jaryan', ids: ['jaryan', 'jaryanplat', '@jaryanplat'], pass: 'jaryan1405' },
];

export const authed = () => !!S().auth;
export const authHost = () => S().auth?.host || null;

export function signIn(id, pass) {
  const key = String(id || '').trim().toLowerCase();
  const acc = ACCOUNTS.find((a) => a.ids.includes(key));
  if (!acc || acc.pass !== String(pass || '')) return false;
  commit((s) => { s.auth = { host: acc.host, at: Date.now() }; s.mode = 'studio'; }, { silent: true });
  return true;
}
export function signOut() {
  commit((s) => { s.auth = null; s.mode = 'attendee'; }, { silent: true });
}

/* where to go once signed in (set when a panel link is opened while signed out) */
let next = '/studio';
export const setNext = (p) => { next = p && p.startsWith('/studio') ? p : '/studio'; };
export const takeNext = () => { const n = next; next = '/studio'; return n; };
