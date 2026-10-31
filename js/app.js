/* Boot, hash router, and the two glass bars. */
import { S, commit, subscribe, resetAll } from './store.js';
import { T, L, isFa, applyLang, setLang } from './i18n.js';
import { ico } from './icons.js';
import { esc } from './util.js';
import { ME } from './data.js';
import { getHost, unread, myUpcoming } from './model.js';
import { initActions, on, toast, avatar, verified, placeAllPills, countUp, closeSheets } from './ui.js';
import { markSvg } from './brand.js';
import { paintNav, initGlassLight } from './nav.js';
import { toggleTheme, initTheme, syncButtons, theme } from './theme.js';

import './booking.js';
import './cards.js';
import * as discover from './views/discover.js';
import * as explore from './views/explore.js';
import * as event from './views/event.js';
import * as host from './views/host.js';
import * as tickets from './views/tickets.js';
import * as me from './views/me.js';
import * as inbox from './views/inbox.js';
import * as system from './views/system.js';
import * as overview from './studio/overview.js';
import * as sevents from './studio/events.js';
import * as smanage from './studio/manage.js';
import * as saudience from './studio/audience.js';
import * as sbroadcast from './studio/broadcast.js';
import * as spage from './studio/page.js';

const ROUTES = [
  { re: /^\/?$/,                    v: discover,   mode: 'attendee', tab: 'discover' },
  { re: /^\/explore$/,              v: explore,    mode: 'attendee', tab: 'explore' },
  { re: /^\/e\/([\w-]+)$/,          v: event,      mode: 'attendee', tab: 'discover', away: true },
  { re: /^\/h\/([\w-]+)$/,          v: host,       mode: 'attendee', tab: 'explore' },
  { re: /^\/tickets$/,              v: tickets,    mode: 'attendee', tab: 'tickets' },
  { re: /^\/me$/,                   v: me,         mode: 'attendee', tab: 'me' },
  { re: /^\/inbox$/,                v: inbox,      mode: 'attendee', tab: 'me' },
  { re: /^\/system$/,               v: system,     mode: 'attendee', tab: 'me' },
  { re: /^\/studio\/?$/,            v: overview,   mode: 'studio',   tab: 'overview' },
  { re: /^\/studio\/events$/,       v: sevents,    mode: 'studio',   tab: 'events' },
  { re: /^\/studio\/events\/([\w-]+)$/, v: smanage, mode: 'studio',  tab: 'events' },
  { re: /^\/studio\/audience$/,     v: saudience,  mode: 'studio',   tab: 'audience' },
  { re: /^\/studio\/broadcast$/,    v: sbroadcast, mode: 'studio',   tab: 'broadcast' },
  { re: /^\/studio\/page$/,         v: spage,      mode: 'studio',   tab: 'page' },
];
const $ = (s) => document.querySelector(s);
let cur = null;            // { route, params }
let dispose = null;
const scrollMem = {};
const lastAttendee = { hash: '#/' };

export const navigate = (path, replace = false) => {
  const h = '#' + path;
  if (location.hash === h) { render({ keep: true }); return; }
  if (replace) location.replace(h); else location.hash = h;
};
export const here = () => cur;

function match() {
  const path = location.hash.replace(/^#/, '') || '/';
  for (const r of ROUTES) {
    const m = path.match(r.re);
    if (m) return { route: r, params: m.slice(1), path };
  }
  return { route: ROUTES[0], params: [], path: '/' };
}

/* ───────────────────────────────────────────────────────────── the header */
/* Rebuilt only when something it shows has changed — re-making a backdrop-filter surface on every render
   would flicker it for no reason. Its fold state lives on #topbar, so it survives a rebuild. */
let topKey = '';
function buildTop() {
  const studio = S().mode === 'studio';
  const n = unread();
  const key = [S().mode, S().lang, n ? 1 : 0, theme()].join('|');
  if (key === topKey && $('#topbar').firstChild) return;
  topKey = key;
  const h = getHost(ME);
  const left = studio
    ? `<a class="host-chip" href="#/studio" aria-label="${esc(L(h.name))} studio">${avatar(h, 34)}<span class="fold-x" style="max-width:220px;margin-inline-start:9px"><span class="nm">${esc(L(h.name))}<span class="muted st-lbl"> Studio</span></span><span style="margin-inline-start:6px">${verified(15)}</span></span></a>`
    : `<a class="brand-btn" href="#/" aria-label="Went to Event">${markSvg('mark')}<span class="brand-name latin fold-x" style="margin-inline-start:9px">Went to Event</span></a>`;
  $('#topbar').innerHTML = `
    <div class="top-cap glass">
      <div class="l">${left}</div>
      <div class="r">
        <div class="seg mode-seg" role="tablist" aria-label="Mode">
          <span class="seg-pill"></span>
          <button role="tab" class="${studio ? '' : 'on'}" data-act="mode" data-mode="attendee">Explore</button>
          <button role="tab" class="${studio ? 'on' : ''}" data-act="mode" data-mode="studio">Studio</button>
        </div>
        <button class="icon-btn theme-btn" data-act="theme" aria-label="Switch theme">${ico('sun', 20, 'sun')}${ico('moon', 20, 'moon')}</button>
        <div class="fold-x">
          <button class="icon-btn lang-btn" data-act="lang" aria-label="${T('زبان', 'Language')}">${isFa() ? 'EN' : 'FA'}</button>
          ${studio ? '' : `<a class="icon-btn" href="#/inbox" aria-label="${T('اعلان‌ها', 'Notifications')}">${ico('bell', 20)}${n ? '<i class="dot"></i>' : ''}</a>`}
        </div>
      </div>
    </div>`;
  placeAllPills($('#topbar'));
  syncButtons();
}

/* ────────────────────────────────────────────────────────────── render */
function render({ keep = false } = {}) {
  const { route, params, path } = match();
  const prev = cur;
  cur = { route, params, path };
  if (route.mode !== S().mode) commit((s) => { s.mode = route.mode; }, { silent: true });
  if (route.mode === 'attendee') lastAttendee.hash = location.hash || '#/';

  const main = $('#view');
  if (prev && !keep) scrollMem[prev.path] = window.scrollY;
  if (dispose) { try { dispose(); } catch (_) { /* ignore */ } dispose = null; }

  const y = keep ? window.scrollY : 0;
  main.innerHTML = route.v.render(...params);
  main.classList.remove('enter');
  if (!keep) { void main.offsetWidth; main.classList.add('enter'); }
  const dock = $('#dock');
  dock.innerHTML = route.v.dock ? route.v.dock(...params) : '';

  const ret = route.v.mount?.(main, ...params);
  if (typeof ret === 'function') dispose = ret;
  placeAllPills(main);
  if (!keep) countUp(main);

  const isTop = ['discover', 'explore', 'tickets', 'me', 'overview', 'events', 'audience', 'broadcast', 'page'].includes(route.tab) && !params.length;
  window.scrollTo(0, keep ? y : (isTop && scrollMem[path] ? scrollMem[path] : 0));

  document.title = (route.v.title ? route.v.title(...params) + ' · ' : '') + 'Went to Event';
  $('#topbar').classList.toggle('away', !!route.away);
  $('#tabbar').classList.toggle('hide', !!route.away);
  document.body.toggleAttribute('data-away', !!route.away);
  buildTop();
  paintNav({ mode: route.mode, tab: route.tab, tickets: myUpcoming().length, open: !keep });
  main.focus({ preventScroll: true });
}

/* ──────────────────────────────────────────────────────────── actions */
on({
  mode(el) {
    const m = el.dataset.mode;
    if (m === S().mode) return;
    closeSheets();
    if (m === 'studio') navigate('/studio');
    else navigate((lastAttendee.hash || '#/').replace(/^#/, '') || '/');
  },
  lang() {
    setLang(isFa() ? 'en' : 'fa');
    render({ keep: true });
    toast(T('زبان: فارسی', 'Language: English'), 'globe');
  },
  theme(el) {
    const r = el.getBoundingClientRect();
    toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  },
  resetDemo() { doReset(); },
});
export function doReset() {
  resetAll();
  closeSheets();
  applyLang();
  topKey = '';
  navigate('/', true);
  render();
  toast(T('دمو به حالت اول برگشت', 'Demo reset'), 'refresh');
}

/* ──────────────────────────────────────────────────────────────── boot */
function boot() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'en' || q === 'fa') setLang(q);
  applyLang();
  initTheme();
  initActions();
  initGlassLight();

  subscribe((opts) => { if (!opts.noRender) render({ keep: true }); });
  window.addEventListener('hashchange', () => { closeSheets(); render(); });
  window.addEventListener('resize', () => { placeAllPills($('#topbar'), true); placeAllPills($('#view'), true); });
  history.scrollRestoration = 'manual';

  if (!location.hash) location.hash = '#/';
  render();

  const splash = $('#boot');
  const seen = (() => { try { return sessionStorage.getItem('wte.boot'); } catch (_) { return null; } })();
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (seen || reduce || new URLSearchParams(location.search).has('nosplash')) { splash.classList.add('gone'); }
  else setTimeout(() => { splash.classList.add('gone'); try { sessionStorage.setItem('wte.boot', '1'); } catch (_) { /* ignore */ } }, 1500);
  setTimeout(() => splash.remove(), 2600);

  if ('serviceWorker' in navigator && location.protocol.startsWith('http') && !/localhost|127\.0\.0\.1/.test(location.hostname)) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline shell is a nicety */ });
  }
  document.fonts?.ready.then(() => { placeAllPills(document, true); });
}
boot();
