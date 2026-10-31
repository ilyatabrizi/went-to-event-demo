/* Navigation chrome: one glass tab bar that minimises as you read, the way iOS 26 does it.
 *
 * Expanded: every tab, with a lens under the current one. The lens can be dragged along the bar.
 * Minimised (reading down a long page): the capsule shrinks to just the current tab at the leading edge and a
 * back-to-top button appears at the trailing edge. Scrolling up, tapping the capsule, or going anywhere opens it.
 *
 * Why it is built this way — every earlier glitch came from layout moving while it animated:
 * - Tabs never change size. They sit in a row of fixed width; minimising only narrows the capsule that clips the
 *   row and slides the row so the current tab is the one left showing. Nothing reflows, nothing squashes.
 * - All geometry is CSS (custom properties from the viewport); JS only says which tab is current and whether the
 *   bar is minimised. Nothing is ever measured in the middle of a transition.
 * - No transform, filter or opacity on any ancestor of the glass, so the blur keeps working while it moves.
 */
import { ico } from './icons.js';
import { on } from './ui.js';

const SETS = {
  attendee: [
    { id: 'discover', href: '#/',        icon: 'discover', label: 'Discover' },
    { id: 'explore',  href: '#/explore', icon: 'search',   label: 'Search' },
    { id: 'tickets',  href: '#/tickets', icon: 'ticket',   label: 'Tickets' },
    { id: 'me',       href: '#/me',      icon: 'user',     label: 'You' },
  ],
  studio: [
    { id: 'overview',  href: '#/studio',           icon: 'grid',      label: 'Overview' },
    { id: 'events',    href: '#/studio/events',    icon: 'calendar',  label: 'Events' },
    { id: 'audience',  href: '#/studio/audience',  icon: 'users',     label: 'Audience' },
    { id: 'broadcast', href: '#/studio/broadcast', icon: 'megaphone', label: 'Broadcast' },
    { id: 'page',      href: '#/studio/page',      icon: 'page',      label: 'Page' },
  ],
};

const $ = (s) => document.querySelector(s);
const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;
const haptic = () => { try { navigator.vibrate?.(4); } catch (_) { /* not everywhere */ } };
const rtl = () => document.documentElement.dir === 'rtl';

let bar = null, caps = null, row = null, tabs = [];
let mode = null, dir = null, active = -1, minimized = false;

/* ───────────────────────────────────────────────────────────── build */
function build(m) {
  const set = SETS[m];
  bar = $('#tabbar');
  bar.className = 'tabbar';
  bar.style.setProperty('--n', String(set.length));
  bar.innerHTML = `
    <div class="tabbar-in">
      <div class="tb glass" id="tabs">
        <div class="tb-row" id="tabs-row">
          <span class="tb-lens" aria-hidden="true"></span>
          ${set.map((t, i) => `
            <a class="tab" href="${t.href}" data-tab="${t.id}" data-i="${i}" aria-label="${t.label}" draggable="false">
              <span class="tab-ico">${ico(t.icon, 22)}</span><span class="tab-label">${t.label}</span>
            </a>`).join('')}
        </div>
      </div>
      <button class="tb-acc glass" data-act="toTop" aria-label="Back to top" tabindex="-1">${ico('toTop', 21)}</button>
    </div>`;
  caps = $('#tabs'); row = $('#tabs-row');
  tabs = [...row.querySelectorAll('.tab')];
  mode = m; dir = rtl(); active = -1; minimized = false;
  bindPointer();
}

/* The lens is placed in physical slots (left → right), so RTL just counts from the other end. */
function place() {
  if (!bar) return;
  const n = tabs.length;
  bar.classList.toggle('no-lens', active < 0);
  const i = Math.max(0, active);
  bar.style.setProperty('--li', String(rtl() ? n - 1 - i : i));
  /* minimised: slide the row so the current tab sits at the leading edge of the narrowed capsule */
  bar.style.setProperty('--shift', String(rtl() ? i : -i));
}

/* ───────────────────────────────────────────────────────────── paint */
export function paintNav({ mode: m, tab, tickets = 0, open = true }) {
  if (mode !== m || dir !== rtl() || !tabs.length) build(m);
  active = tabs.findIndex((t) => t.dataset.tab === tab);
  tabs.forEach((t, i) => {
    if (i === active) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
    const b = t.querySelector('.badge');
    const n = t.dataset.tab === 'tickets' ? tickets : 0;
    if (n && !b) t.insertAdjacentHTML('beforeend', `<span class="badge">${n}</span>`);
    else if (b) { if (n) b.textContent = n; else b.remove(); }
  });
  place();
  if (open) setMin(false);
}
export const expand = () => setMin(false);

/* ──────────────────────────────────────────────────────── minimise on scroll */
function canMin() {
  return active >= 0 && innerWidth < 900 && !document.body.hasAttribute('data-away')
    && document.documentElement.scrollHeight - innerHeight > 600;   // never on a page you can already see the end of
}
function setMin(v) {
  if (v && !canMin()) return;
  if (v === minimized || !bar) return;
  minimized = v;
  bar.classList.toggle('min', v);
  const acc = bar.querySelector('.tb-acc'); if (acc) acc.tabIndex = v ? 0 : -1;
  caps?.setAttribute('aria-label', v ? 'Show all tabs' : 'Tabs');
}

let lastY = 0, run = 0;
addEventListener('scroll', () => {
  const y = scrollY, dy = y - lastY;
  lastY = y;
  if (y < 80) { run = 0; setMin(false); return; }
  /* travel has to add up in one direction, so a wobbly thumb never flips the bar back and forth */
  run = (dy > 0) === (run > 0) ? run + dy : dy;
  if (run > 60) setMin(true);
  else if (run < -40) setMin(false);
}, { passive: true });

on({ toTop() { scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); } });

/* ───────────────────────────────────────────── tap, re-tap, and drag the lens */
let drag = null, swallow = false;
function bindPointer() {
  caps.addEventListener('dragstart', (e) => e.preventDefault());   // a mouse drag over a link starts the browser's own drag

  caps.addEventListener('pointerdown', (e) => {
    if (minimized || e.button > 0) return;
    drag = { x0: e.clientX, id: e.pointerId, moved: false, idx: active };
  });
  caps.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.moved) {
      if (Math.abs(e.clientX - drag.x0) < 10) return;
      drag.moved = true;
      try { caps.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
      bar.classList.add('dragging');
    }
    const r = row.getBoundingClientRect(), w = r.width / tabs.length;
    const x = Math.min(r.width - w, Math.max(0, e.clientX - r.left - w / 2));
    bar.style.setProperty('--drag-x', `${x}px`);
    const slot = Math.round(x / w);
    const idx = rtl() ? tabs.length - 1 - slot : slot;
    if (idx !== drag.idx) { drag.idx = idx; haptic(); tabs.forEach((t, i) => t.classList.toggle('under', i === idx)); }
  });
  const end = (go) => {
    if (!drag) return;
    const d = drag; drag = null;
    bar.classList.remove('dragging');
    tabs.forEach((t) => t.classList.remove('under'));
    if (!d.moved) return;
    swallow = true; setTimeout(() => { swallow = false; }, 0);   // the click that follows a drag must not navigate too
    const t = tabs[d.idx];
    if (go && t && d.idx !== active) location.hash = t.getAttribute('href');
  };
  caps.addEventListener('pointerup', () => end(true));
  caps.addEventListener('pointercancel', () => end(false));      // a system gesture took over: put it back, go nowhere

  caps.addEventListener('click', (e) => {
    if (swallow) { e.preventDefault(); e.stopPropagation(); return; }
    if (minimized) { e.preventDefault(); e.stopPropagation(); setMin(false); return; }   // minimised: a tap opens it
    const t = e.target.closest('.tab');
    if (!t) return;
    haptic();
    const here = '#' + (location.hash.replace(/^#/, '') || '/');
    if (t.getAttribute('href') === here) {                        // already here: back to the top instead
      e.preventDefault();
      scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
    }
  }, true);
}
