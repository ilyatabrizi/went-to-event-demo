/* Boot, hash router, and the two glass bars. */
import { S, commit, subscribe, resetAll } from './store.js';
import { T, L, isFa, applyLang, setLang } from './i18n.js';
import { ico } from './icons.js';
import { esc } from './util.js';
import { ME } from './data.js';
import { getHost, unread, myUpcoming } from './model.js';
import { initActions, on, toast, avatar, verified, placeAllPills, placePill, countUp, closeSheets, hasSheet } from './ui.js';

import './booking.js';
import './cards.js';
import * as discover from './views/discover.js';
import * as explore from './views/explore.js';
import * as event from './views/event.js';
import * as host from './views/host.js';
import * as tickets from './views/tickets.js';
import * as me from './views/me.js';
import * as inbox from './views/inbox.js';
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
  { re: /^\/studio\/?$/,            v: overview,   mode: 'studio',   tab: 'overview' },
  { re: /^\/studio\/events$/,       v: sevents,    mode: 'studio',   tab: 'events' },
  { re: /^\/studio\/events\/([\w-]+)$/, v: smanage, mode: 'studio',  tab: 'events' },
  { re: /^\/studio\/audience$/,     v: saudience,  mode: 'studio',   tab: 'audience' },
  { re: /^\/studio\/broadcast$/,    v: sbroadcast, mode: 'studio',   tab: 'broadcast' },
  { re: /^\/studio\/page$/,         v: spage,      mode: 'studio',   tab: 'page' },
];
const TAB_SETS = {
  attendee: [
    { id: 'discover', href: '#/',        icon: 'discover', fa: 'کشف',     en: 'Discover' },
    { id: 'explore',  href: '#/explore', icon: 'search',   fa: 'جستجو',   en: 'Search' },
    { id: 'tickets',  href: '#/tickets', icon: 'ticket',   fa: 'بلیت‌ها', en: 'Tickets' },
    { id: 'me',       href: '#/me',      icon: 'user',     fa: 'من',      en: 'You' },
  ],
  studio: [
    { id: 'overview',  href: '#/studio',           icon: 'grid',      fa: 'نمای کلی', en: 'Overview' },
    { id: 'events',    href: '#/studio/events',    icon: 'calendar',  fa: 'رویدادها', en: 'Events' },
    { id: 'audience',  href: '#/studio/audience',  icon: 'users',     fa: 'مخاطبان',  en: 'Audience' },
    { id: 'broadcast', href: '#/studio/broadcast', icon: 'megaphone', fa: 'پیام‌ها',   en: 'Broadcast' },
    { id: 'page',      href: '#/studio/page',      icon: 'page',      fa: 'صفحه',     en: 'Page' },
  ],
};

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

/* ───────────────────────────────────────────────────────────── the bars */
function buildTop() {
  const studio = S().mode === 'studio';
  const h = getHost(ME);
  const left = studio
    ? `<a class="host-chip" href="#/studio">${avatar(h, 34)}<span class="nm">${esc(L(h.name))}<span class="muted st-lbl"> ${T('استودیو', 'Studio')}</span></span>${verified(15)}</a>`
    : `<a class="brand-btn" href="#/" aria-label="Went to Event"><img class="mark" src="assets/brand/mark-bone.svg" alt=""><span class="brand-name latin">Went to Event</span></a>`;
  const n = unread();
  $('#topbar').innerHTML = `
    <div class="l">${left}</div>
    <div class="r">
      <div class="seg mode-seg" role="tablist" aria-label="${T('حالت', 'Mode')}">
        <span class="seg-pill"></span>
        <button role="tab" class="${studio ? '' : 'on'}" data-act="mode" data-mode="attendee">${T('کاوش', 'Explore')}</button>
        <button role="tab" class="${studio ? 'on' : ''}" data-act="mode" data-mode="studio">${T('استودیو', 'Studio')}</button>
      </div>
      <button class="icon-btn lang-btn" data-act="lang" aria-label="${T('زبان', 'Language')}">${isFa() ? 'EN' : 'FA'}</button>
      ${studio ? '' : `<a class="icon-btn" href="#/inbox" aria-label="${T('اعلان‌ها', 'Notifications')}">${ico('bell', 21)}${n ? '<i class="dot"></i>' : ''}</a>`}
    </div>`;
  placeAllPills($('#topbar'));
}

let builtMode = null, builtLang = null;
function buildTabs(activeTab) {
  const mode = S().mode;
  const tabs = TAB_SETS[mode];
  const bar = $('#tabbar');
  const tick = myUpcoming().length;
  if (builtMode !== mode || builtLang !== S().lang || !bar.firstChild) {
    bar.innerHTML = `<span class="tab-pill snap"></span>` + tabs.map((t) => `
      <a class="tab" href="${t.href}" data-tab="${t.id}" aria-label="${isFa() ? t.fa : t.en}">
        ${ico(t.icon, 22)}<span class="lbl">${isFa() ? t.fa : t.en}</span>
        ${t.id === 'tickets' && tick ? `<span class="badge">${tick}</span>` : ''}
      </a>`).join('');
    builtMode = mode; builtLang = S().lang;
  } else {
    const b = bar.querySelector('[data-tab="tickets"] .badge');
    const t = bar.querySelector('[data-tab="tickets"]');
    if (t) { if (tick && !b) t.insertAdjacentHTML('beforeend', `<span class="badge">${tick}</span>`); else if (b) { if (tick) b.textContent = tick; else b.remove(); } }
  }
  bar.querySelectorAll('.tab').forEach((t) => { const on_ = t.dataset.tab === activeTab; t.classList.toggle('on', on_); if (on_) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current'); });
  placeTabPill();
}
function placeTabPill(snap = false) {
  const bar = $('#tabbar'), pill = bar.querySelector('.tab-pill'), t = bar.querySelector('.tab.on');
  if (!pill || !t) return;
  const first = !pill.dataset.set;
  if (snap || first) pill.classList.add('snap');
  pill.style.width = t.offsetWidth + 'px';
  pill.style.transform = `translateX(${t.offsetLeft}px)`;
  pill.dataset.set = '1';
  if (snap || first) { pill.offsetWidth; pill.classList.remove('snap'); }
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
  buildTop();
  buildTabs(route.tab);
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
    builtLang = null;
    render({ keep: true });
    toast(T('زبان: فارسی', 'Language: English'), 'globe');
  },
  resetDemo() { doReset(); },
});
export function doReset() {
  resetAll();
  closeSheets();
  applyLang();
  builtLang = null;
  navigate('/', true);
  render();
  toast(T('دمو به حالت اول برگشت', 'Demo reset'), 'refresh');
}

/* ──────────────────────────────────────────────────────────────── boot */
function boot() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'en' || q === 'fa') setLang(q);
  applyLang();
  initActions();

  subscribe((opts) => { if (!opts.noRender) render({ keep: true }); });
  window.addEventListener('hashchange', () => { closeSheets(); render(); });
  window.addEventListener('resize', () => { placeTabPill(true); placeAllPills($('#topbar'), true); placeAllPills($('#view'), true); });
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
  document.fonts?.ready.then(() => { placeTabPill(true); placeAllPills(document, true); });
}
boot();
