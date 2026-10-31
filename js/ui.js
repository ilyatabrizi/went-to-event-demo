/* Shared UI: action delegation, sheets, toasts, posters, cards, charts, in-page tabs. */
import { S } from './store.js';
import { L, T, isFa } from './i18n.js';
import { ico } from './icons.js';
import { esc, money, nf, dNum, dMonthShort, dateOf, timeRange, compact, pct } from './util.js';
import { getHost, seats } from './model.js';
import { SUBS, CATEGORIES } from './data.js';
import { bloom } from './util.js';

/* ───────────────────────────────────────────────────────────── actions */
const ACTS = {}, INPUTS = {};
export const on = (o) => Object.assign(ACTS, o);
export const onInput = (o) => Object.assign(INPUTS, o);
export function initActions() {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const fn = ACTS[el.dataset.act];
    if (!fn) return;
    if (!el.hasAttribute('data-native')) e.preventDefault();
    fn(el, e);
  });
  document.addEventListener('input', (e) => {
    const el = e.target.closest('[data-in]');
    if (el && INPUTS[el.dataset.in]) INPUTS[el.dataset.in](el, e);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sheets.length) sheets[sheets.length - 1].close();
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('[role=button][data-act]')) { e.preventDefault(); e.target.click(); }
  });
}

/* ───────────────────────────────────────────────────────────── toast */
export function toast(text, icon = 'check') {
  const host = document.getElementById('toasts');
  if (!host) return;
  const el = document.createElement('div');
  el.className = 'toast glass';
  el.setAttribute('role', 'status');
  el.innerHTML = `<span class="t-ico">${ico(icon, 15)}</span><span>${esc(text)}</span>`;
  host.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 380); }, 2600);
  while (host.children.length > 2) host.firstChild.remove();
}

/* ───────────────────────────────────────────────────────────── sheets */
const sheets = [];
export function openSheet({ title = '', body = '', foot = '', full = false, cls = '', onClose, onMount } = {}) {
  const overlay = document.getElementById('overlay');
  const scrim = document.createElement('div'); scrim.className = 'scrim';
  const el = document.createElement('section');
  el.className = `sheet ${full ? 'full' : ''} ${cls}`;
  el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
  el.innerHTML = `
    <div class="sheet-grab" data-grab></div>
    ${title !== null ? `<div class="sheet-head" data-grab><h2 class="h2 sh-title">${title}</h2><button class="icon-btn" data-sheet-x aria-label="${T('بستن', 'Close')}">${ico('x', 20)}</button></div>` : ''}
    <div class="sheet-body">${body}</div>
    ${foot ? `<div class="sheet-foot">${foot}</div>` : ''}`;
  overlay.append(scrim, el);
  document.documentElement.classList.add('sheet-open');
  requestAnimationFrame(() => requestAnimationFrame(() => { scrim.classList.add('in'); el.classList.add('in'); }));

  const api = {
    el, scrim,
    $: (s) => el.querySelector(s),
    $$: (s) => [...el.querySelectorAll(s)],
    setBody(h) { el.querySelector('.sheet-body').innerHTML = h; },
    setFoot(h) {
      let f = el.querySelector('.sheet-foot');
      if (!h) { f?.remove(); return; }
      if (!f) { f = document.createElement('div'); f.className = 'sheet-foot'; el.appendChild(f); }
      f.innerHTML = h;
    },
    setTitle(h) { const t = el.querySelector('.sh-title'); if (t) t.innerHTML = h; },
    close() {
      if (api.closed) return; api.closed = true;
      const i = sheets.indexOf(api); if (i >= 0) sheets.splice(i, 1);
      el.classList.remove('in'); scrim.classList.remove('in');
      if (!sheets.length) document.documentElement.classList.remove('sheet-open');
      setTimeout(() => { el.remove(); scrim.remove(); }, 520);
      onClose?.();
    },
  };
  scrim.addEventListener('click', () => api.close());
  el.addEventListener('click', (e) => { if (e.target.closest('[data-sheet-x]')) api.close(); });

  /* drag the handle / header down to dismiss (bottom-sheet layout only) */
  let y0 = null, dy = 0, t0 = 0;
  el.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('[data-grab]') || e.target.closest('button') || matchMedia('(min-width:760px)').matches) return;
    y0 = e.clientY; dy = 0; t0 = performance.now(); el.classList.add('drag'); el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', (e) => {
    if (y0 == null) return;
    dy = Math.max(0, e.clientY - y0); el.style.transform = `translateY(${dy}px)`;
    scrim.style.opacity = String(Math.max(0, 1 - dy / 500));
  });
  const end = () => {
    if (y0 == null) return;
    const v = dy / Math.max(1, performance.now() - t0);
    y0 = null; el.classList.remove('drag');
    if (dy > 130 || v > 0.7) { el.style.transform = ''; scrim.style.opacity = ''; api.close(); }
    else { el.style.transform = ''; scrim.style.opacity = ''; }
  };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);

  sheets.push(api);
  onMount?.(api);
  return api;
}
export const closeSheets = () => [...sheets].forEach((s) => s.close());
export const hasSheet = () => sheets.length > 0;

export function confirmSheet({ title, text, ok, danger = false }) {
  return new Promise((resolve) => {
    let done = false;
    const s = openSheet({
      title: esc(title), cls: 'confirm',
      body: `<p class="lede">${esc(text)}</p>`,
      foot: `<div class="row-btns"><button class="btn btn-glass" data-c="0">${T('انصراف', 'Cancel')}</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-c="1">${esc(ok)}</button></div>`,
      onClose: () => { if (!done) resolve(false); },
    });
    s.el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-c]'); if (!b) return;
      done = true; resolve(b.dataset.c === '1'); s.close();
    });
  });
}

/* ──────────────────────────────────────────────────────── identity bits */
export const verified = (s = 14) => `<span class="vf" title="${T('میزبان تأییدشده', 'Verified host')}">${ico('verified', s)}</span>`;
export const sampleTag = () => `<span class="tag-sample">${T('نمونه', 'Sample')}</span>`;

export function avatar(h, size = 40, cls = '') {
  const st = `width:${size}px;height:${size}px;font-size:${Math.round(size * 0.42)}px`;
  if (h.avatar) return `<span class="av ${cls}" style="${st}"><img src="${h.avatar}" alt="" width="${size}" height="${size}"></span>`;
  return `<span class="av av-mono latin ${cls}" style="${st};${bloom('av-' + h.id)}">${esc(h.mono || (L(h.name)[0] || '·'))}</span>`;
}
export function person(name, size = 38) {
  const ch = Array.from(String(L(name) || '·'))[0].toUpperCase();
  return `<span class="av av-p" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.4)}px">${esc(ch)}</span>`;
}

/* ───────────────────────────────────────────────────────────── posters */
export function poster(e, w = 480) {
  if (e.bloom) {
    return `<div class="poster bloom" style="${bloom(e.id)}"></div>`;
  }
  const key = e.img || 'workshop-table';
  const src = e.cover || `assets/jaryan/${key}-${w}.webp`;
  return `<div class="poster"><img src="${src}" alt="" loading="lazy" decoding="async"></div>`;
}
export const catName = (e) => L(e.sub ? SUBS[e.sub] : CATEGORIES.find((c) => c.id === e.cat));

function leftBadge(e) {
  const s = seats(e);
  if (e.day < 0) return '';
  if (s.full) return `<span class="left-badge off">${T('تکمیل', 'Sold out')}</span>`;
  if (s.left <= 5) return `<span class="left-badge">${T(`${nf(s.left)} جای خالی`, `${s.left} left`)}</span>`;
  return '';
}
function saveBtn(e) {
  const on_ = S().saved.includes(e.id);
  return `<button class="save-btn glass ${on_ ? 'on' : ''}" data-act="save" data-id="${e.id}" aria-pressed="${on_}" aria-label="${T('ذخیره', 'Save')}">${ico('bookmark', 17)}</button>`;
}
export function dchip(e) {
  const d = dateOf(e.day);
  return `<div class="dchip glass"><b class="latin">${dNum(d)}</b><span>${dMonthShort(d)}</span></div>`;
}

/* portrait card — used in rails */
export function evTile(e) {
  const h = getHost(e.host);
  return `<article class="ev-tile" data-id="${e.id}">
    <div class="ev-media">${poster(e, 480)}${dchip(e)}${saveBtn(e)}${leftBadge(e)}
      <div class="ev-over">
        <div class="ev-host">${avatar(h, 20)}<span>${esc(L(h.name))}</span></div>
        <h3 class="ev-title"><a class="stretch" href="#/e/${e.id}">${esc(L(e.title))}</a></h3>
        <div class="ev-sub"><span>${esc(timeRange(e.from, e.to))}</span><i></i><span>${money(e.price)}</span></div>
      </div>
    </div></article>`;
}

/* compact row — used in lists */
export function evRow(e, { showHost = true } = {}) {
  const h = getHost(e.host), s = seats(e), d = dateOf(e.day);
  return `<article class="ev-row" data-id="${e.id}">
    <div class="thumb">${poster(e, 480)}</div>
    <div class="body">
      <div class="micro">${esc(L(e.sub ? SUBS[e.sub] : CATEGORIES.find((c) => c.id === e.cat)))}${showHost ? ` · ${esc(L(h.name))}` : ''}</div>
      <h3 class="t"><a class="stretch" href="#/e/${e.id}">${esc(L(e.title))}</a></h3>
      <div class="when small muted">${dNum(d)} ${dMonthShort(d)} · ${esc(timeRange(e.from, e.to))}</div>
      ${e.day >= 0 ? `<div class="meter" title="${nf(s.taken)}/${nf(s.total)}"><i style="width:${Math.round(s.fill * 100)}%"></i></div>` : ''}
    </div>
    <div class="side">
      <span class="price">${money(e.price)}</span>
      ${e.day >= 0 ? (s.full ? `<span class="micro ember">${T('تکمیل', 'Sold out')}</span>` : s.left <= 5 ? `<span class="micro ember">${T(`${nf(s.left)} جای خالی`, `${s.left} left`)}</span>` : `<span class="micro">${T(`${nf(s.left)} جای خالی`, `${s.left} left`)}</span>`) : `<span class="micro">${T('برگزار شد', 'Held')}</span>`}
    </div>
  </article>`;
}

/* ──────────────────────────────────────────────────────────── structure */
export const sectionHead = (title, link = '', sub = '') =>
  `<div class="sec-head"><div><h2 class="h2">${title}</h2>${sub ? `<div class="micro" style="margin-top:4px">${sub}</div>` : ''}</div>${link}</div>`;
export const linkBtn = (href, label) => `<a class="link-more" href="${href}">${label}${ico('chev', 16)}</a>`;
export function empty(icon, title, text, cta = '') {
  return `<div class="empty"><div class="e-ico">${ico(icon, 26)}</div><h3 class="h3">${title}</h3><p class="small muted">${text}</p>${cta}</div>`;
}

/* ─────────────────────────────────────────────────────────────── charts */
export function ring(p, size = 64, stroke = 7, label = '') {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, p));
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" style="stroke:var(--track)" stroke-width="${stroke}"/>
    <circle class="ring-arc" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--ember)" stroke-width="${stroke}" stroke-linecap="round"
      stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - v)}" transform="rotate(-90 ${size / 2} ${size / 2})" style="--c:${c}"/></svg>
    <span class="ring-l">${label || pct(v * 100)}</span></div>`;
}
export function bars(values, { h = 110, labels = [] } = {}) {
  const max = Math.max(...values, 1);
  return `<div class="bars" style="height:${h}px">${values.map((v, i) => {
    const last = i === values.length - 1;
    return `<div class="bar ${last ? 'now' : ''}" title="${esc(labels[i] || '')}${labels[i] ? ' · ' : ''}${money(v)}"><i style="height:${Math.max(3, Math.round((v / max) * 100))}%;animation-delay:${i * 30}ms"></i></div>`;
  }).join('')}</div>`;
}
export function area(values, { h = 90 } = {}) {
  const min = Math.min(...values), max = Math.max(...values), span = Math.max(1, max - min);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * 100, 100 - ((v - min) / span) * 82 - 9]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
  const last = pts[pts.length - 1];
  return `<div class="area" style="height:${h}px">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%">
      <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF5B3D" stop-opacity=".38"/><stop offset="1" stop-color="#FF5B3D" stop-opacity="0"/></linearGradient></defs>
      <path d="${line} L100,100 L0,100 Z" fill="url(#ag)"/>
      <path d="${line}" fill="none" stroke="#FF5B3D" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
    </svg><i class="area-dot" style="left:${last[0]}%;top:${last[1]}%"></i></div>`;
}

/* count-up for headline numbers: <b data-count="123456" data-fmt="money|compact|int|pct"> */
export function countUp(root) {
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  root.querySelectorAll('[data-count]').forEach((el) => {
    const to = Number(el.dataset.count), f = el.dataset.fmt || 'int';
    const fmt = { money: (v) => nf(v), compact: (v) => compact(v), int: (v) => nf(v), pct: (v) => pct(v) }[f];
    if (reduce || !isFinite(to)) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), D = 900;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(to * e);
      if (k < 1) requestAnimationFrame(tick); else el.textContent = fmt(to);
    };
    requestAnimationFrame(tick);
  });
}

/* ─────────────────────────────────────────────── in-page tabs (no re-render) */
const tabMem = {};
export function tabs(key, items, def) {
  const cur = tabMem[key] && items.some((i) => i.id === tabMem[key]) ? tabMem[key] : def || items[0].id;
  tabMem[key] = cur;
  return `<div class="seg tabs-seg" data-tabs="${key}" role="tablist">
    <span class="seg-pill"></span>
    ${items.map((i) => `<button role="tab" class="${i.id === cur ? 'on' : ''}" data-act="tab" data-key="${key}" data-tab="${i.id}" aria-selected="${i.id === cur}">${i.label}${i.n != null ? `<em>${nf(i.n)}</em>` : ''}</button>`).join('')}
  </div>`;
}
export const panel = (key, id, html) => `<div class="tab-panel" data-panel="${key}:${id}" ${tabMem[key] === id ? '' : 'hidden'}>${html}</div>`;
export const tabCur = (key) => tabMem[key];

export function placePill(seg, snap = false) {
  const pill = seg.querySelector('.seg-pill'); const b = seg.querySelector('button.on');
  if (!pill || !b) return;
  const sr = seg.getBoundingClientRect(), br = b.getBoundingClientRect();
  if (!br.width) return;
  if (snap) pill.style.transition = 'none';
  pill.style.width = br.width + 'px';
  pill.style.transform = `translateX(${br.left - sr.left - (parseFloat(getComputedStyle(seg).borderLeftWidth) || 0)}px)`;
  if (snap) { pill.offsetWidth; pill.style.transition = ''; }
}
export function placeAllPills(root = document, snap = true) { root.querySelectorAll('.seg').forEach((s) => placePill(s, snap)); }

on({
  tab(el) {
    const { key, tab } = el.dataset;
    tabMem[key] = tab;
    const seg = el.closest('.seg');
    seg.querySelectorAll('button').forEach((b) => { const o = b === el; b.classList.toggle('on', o); b.setAttribute('aria-selected', o); });
    placePill(seg);
    document.querySelectorAll(`[data-panel^="${key}:"]`).forEach((p) => { p.hidden = p.dataset.panel !== `${key}:${tab}`; });
  },
});
