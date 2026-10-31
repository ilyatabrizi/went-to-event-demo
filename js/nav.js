/* The navigation chrome: a glass tab bar that folds as you read, and the header capsule that folds with it.
 *
 * - The lens — the lit capsule under the current tab — springs between tabs and follows a finger dragged
 *   along the bar; letting go lands on the nearest.
 * - Reading down a long page folds the tab bar to the tabs it keeps and the header to its switch and theme
 *   button. Scrolling back up, tapping the folded bar, or going anywhere opens them again.
 * - Folded, the trailing edge is taken by a back-to-top button, the way iOS 26 hands the spot to an accessory.
 * - Tapping the tab you are on scrolls to the top; from a pushed screen it goes to that tab's root.
 *
 * Ported from KAIRO, with the traps that came with it: one owner for geometry (JS measures, CSS reads custom
 * properties), measure only while the bar is open, never centre with a transform above a backdrop-filter,
 * and treat a cancelled pointer as "put it back".
 */
import { S } from './store.js';
import { ico } from './icons.js';
import { on } from './ui.js';

const SETS = {
  attendee: {
    keep: ['discover', 'me'],
    tabs: [
      { id: 'discover', href: '#/',        icon: 'discover', label: 'Discover' },
      { id: 'explore',  href: '#/explore', icon: 'search',   label: 'Search' },
      { id: 'tickets',  href: '#/tickets', icon: 'ticket',   label: 'Tickets' },
      { id: 'me',       href: '#/me',      icon: 'user',     label: 'You' },
    ],
  },
  studio: {
    keep: ['overview'],
    tabs: [
      { id: 'overview',  href: '#/studio',           icon: 'grid',      label: 'Overview' },
      { id: 'events',    href: '#/studio/events',    icon: 'calendar',  label: 'Events' },
      { id: 'audience',  href: '#/studio/audience',  icon: 'users',     label: 'Audience' },
      { id: 'broadcast', href: '#/studio/broadcast', icon: 'megaphone', label: 'Broadcast' },
      { id: 'page',      href: '#/studio/page',      icon: 'page',      label: 'Page' },
    ],
  },
};

const $ = (s) => document.querySelector(s);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;
const haptic = (ms = 4) => { try { navigator.vibrate?.(ms); } catch (_) { /* not everywhere */ } };
const PAD = 6;

let bar, caps, row, tabs = [];
let mode = null, active = null, minimized = false;
let tabW = 0, rowW = 0;
let badges = {};

/* ───────────────────────────────────────────────────────────── build */
function build(m) {
  const set = SETS[m];
  bar = $('#tabbar');
  bar.dataset.mode = m;
  bar.dataset.ready = '';
  bar.classList.remove('min', 'dragging');
  bar.style.removeProperty('--tab-w'); bar.style.removeProperty('--row-w'); bar.style.removeProperty('--kept-n');
  bar.innerHTML = `
    <div class="tabbar-in" style="--n:${set.tabs.length}">
      <div class="tabs glass" id="tabs">
        <div class="tabs-row" id="tabs-row">
          <span class="tabs-lens"></span>
          ${set.tabs.map((t) => `
            <a class="tab" href="${t.href}" data-tab="${t.id}" aria-label="${t.label}" draggable="false">
              <span class="tab-ico">${ico(t.icon, 22)}</span><span class="tab-label">${t.label}</span>
            </a>`).join('')}
        </div>
      </div>
      <button class="tabs-top glass" data-act="toTop" aria-label="Back to top" tabindex="-1">${ico('toTop', 22)}</button>
    </div>`;
  caps = $('#tabs'); row = $('#tabs-row');
  tabs = [...row.querySelectorAll('.tab')];
  mode = m;
  minimized = false;
  tabW = 0; rowW = 0;
  bindDrag();
}

/* ─────────────────────────────────────────────────────────── geometry */
/* Folded, the bar keeps the first tab, the "You" tab, and whichever tab you are actually on. */
const keptKeys = () => tabs.map((t) => t.dataset.tab).filter((k) => SETS[mode].keep.includes(k) || k === active);

function place() {
  if (!bar || !tabs.length) return;
  const i = tabs.findIndex((t) => t.dataset.tab === active);
  if (i < 0) { bar.classList.add('no-lens'); return; }
  bar.classList.remove('no-lens');

  /* Measured ONLY while the bar is open — a tab in the middle of collapsing would feed a wrong number back
     into the width that is doing the collapsing. */
  if (!minimized) {
    const w = caps.getBoundingClientRect().width;
    if (w > 40) { rowW = w - PAD * 2; tabW = rowW / tabs.length; }
  }
  if (!tabW) return;

  const kept = keptKeys();
  tabs.forEach((t) => { if (kept.includes(t.dataset.tab)) t.dataset.keep = '1'; else delete t.dataset.keep; });

  /* The lens is one tab wide in both states; only which slot it sits in changes — and the slot is counted
     from the leading edge, which is the right in Persian. */
  const slot = minimized ? kept.indexOf(active) : i;
  const rtl = document.documentElement.dir === 'rtl';
  const x = rtl ? rowW - (slot + 1) * tabW : slot * tabW;
  bar.style.setProperty('--tab-w', `${tabW}px`);
  bar.style.setProperty('--row-w', `${rowW}px`);
  bar.style.setProperty('--kept-n', String(kept.length));
  bar.style.setProperty('--lens-x', `${x}px`);
  bar.style.setProperty('--lens-w', `${tabW}px`);
  bar.dataset.ready = '1';
}

/* ───────────────────────────────────────────────────────────── paint */
/* Called on every render. `open` is true when arriving somewhere, false on a state refresh in place. */
export function paintNav({ mode: m, tab, tickets = 0, open = true }) {
  if (mode !== m || !tabs.length) build(m);
  active = tab;
  tabs.forEach((t) => {
    const cur = t.dataset.tab === tab;
    if (cur) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
  });
  badges = { tickets };
  tabs.forEach((t) => {
    const b = t.querySelector('.badge'); const n = badges[t.dataset.tab] || 0;
    if (n && !b) t.insertAdjacentHTML('beforeend', `<span class="badge">${n}</span>`);
    else if (b) { if (n) b.textContent = n; else b.remove(); }
  });
  if (open) setMin(false);
  requestAnimationFrame(place);
}
export const expand = () => setMin(false);

/* ──────────────────────────────────────────────────────── fold on scroll */
function setMin(v) {
  /* Never fold a page you can see the end of — the bars would close and reopen on one flick. */
  if (v && (!active || document.documentElement.scrollHeight - innerHeight < 700 || document.body.hasAttribute('data-away'))) return;
  if (v === minimized) return;
  minimized = v;
  bar?.classList.toggle('min', v);
  $('#topbar')?.classList.toggle('min', v);
  const tp = $('.tabs-top'); if (tp) tp.tabIndex = v ? 0 : -1;
  place();
}

let lastY = scrollY, run = 0;
addEventListener('scroll', () => {
  const y = scrollY, dy = y - lastY;
  lastY = y;
  if (y < 120) { run = 0; setMin(false); return; }
  /* accumulate travel in one direction so a jittery finger does not toggle the bars every frame */
  run = Math.sign(dy) === Math.sign(run) ? run + dy : dy;
  if (run > 48) setMin(true);
  else if (run < -28) setMin(false);
}, { passive: true });
addEventListener('resize', () => { if (minimized) { minimized = false; bar?.classList.remove('min'); $('#topbar')?.classList.remove('min'); } place(); });

on({
  toTop() { scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); },
});

/* ───────────────────────────────────────────────────── drag the lens */
let drag = null, swallow = false, dragBound = null;
function bindDrag() {
  if (dragBound === caps) return;
  dragBound = caps;

  /* The tabs are links, and a mouse dragged across a link starts the browser's own drag — which fires
     pointercancel on the first move and kills ours. Touch never shows this; only a mouse does. */
  caps.addEventListener('dragstart', (e) => e.preventDefault());

  caps.addEventListener('pointerdown', (e) => {
    if (minimized || e.button > 0 || !tabs.length) return;
    drag = { x0: e.clientX, id: e.pointerId, moved: false, idx: -1 };
  });
  caps.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0;
    if (!drag.moved) {
      if (Math.abs(dx) < 8) return;
      drag.moved = true;
      try { caps.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
      bar.classList.add('dragging');
      bar.classList.remove('no-lens');
    }
    const w = tabW || tabs[0].offsetWidth;
    const r = row.getBoundingClientRect();
    const x = clamp(e.clientX - r.left - w / 2, 0, r.width - w);     // physical left within the row, either direction
    bar.style.setProperty('--lens-x', `${x}px`);
    bar.style.setProperty('--lens-w', `${w}px`);
    let idx = 0, best = Infinity;
    tabs.forEach((t, i) => {
      const tr = t.getBoundingClientRect(); const d = Math.abs(tr.left + tr.width / 2 - e.clientX);
      if (d < best) { best = d; idx = i; }
    });
    if (idx !== drag.idx) {
      drag.idx = idx; haptic(4);
      tabs.forEach((t, i) => t.classList.toggle('under', i === idx));
    }
  });
  const clear = () => { bar.classList.remove('dragging'); tabs.forEach((t) => t.classList.remove('under')); };
  caps.addEventListener('pointerup', () => {
    if (!drag) return;
    const d = drag; drag = null; clear();
    if (!d.moved) return;
    /* the click that follows the release must not also navigate */
    swallow = true; setTimeout(() => { swallow = false; }, 0);
    const t = tabs[d.idx];
    if (t && location.hash !== t.getAttribute('href')) location.hash = t.getAttribute('href');
    else place();
  });
  /* a cancelled pointer — a system gesture taking over — puts the lens back and goes nowhere */
  caps.addEventListener('pointercancel', () => { drag = null; clear(); place(); });

  caps.addEventListener('click', (e) => {
    if (swallow) { e.preventDefault(); e.stopPropagation(); return; }
    /* a folded bar opens on tap instead of navigating — the tabs you cannot see are the ones you would aim at */
    if (minimized) { e.preventDefault(); e.stopPropagation(); setMin(false); return; }
    const t = e.target.closest('.tab');
    if (!t) return;
    haptic(4);
    const here = '#' + (location.hash.replace(/^#/, '') || '/');
    if (t.getAttribute('href') === here) {
      e.preventDefault();
      scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
    }
  }, true);
}

/* ─────────────────────────────────────── the light on glass follows you */
export function initGlassLight() {
  let raf = 0, el = null, px = 0, py = 0;
  const paint = () => {
    raf = 0; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${px - r.left}px`);
    el.style.setProperty('--my', `${py - r.top}px`);
  };
  const set = (e) => {
    const g = e.target.closest?.('.glass,.glass-thin,.glass-thick');
    if (g !== el) { el?.removeAttribute('data-lit'); el = g || null; el?.setAttribute('data-lit', ''); }
    if (!el) return;
    px = e.clientX; py = e.clientY;
    if (!raf) raf = requestAnimationFrame(paint);
  };
  document.addEventListener('pointermove', set, { passive: true });
  document.addEventListener('pointerdown', set, { passive: true });
  const off = () => { el?.removeAttribute('data-lit'); el = null; };
  document.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') off(); }, { passive: true });
  document.addEventListener('pointerleave', off, { passive: true });
  document.addEventListener('pointercancel', off, { passive: true });
}
