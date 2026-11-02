/* Small pieces every studio screen uses. */
import { T, L } from '../i18n.js';
import { ico } from '../icons.js';
import { esc, nf, compact, money } from '../util.js';

export const pageHead = (title, sub = '', actions = '') =>
  `<header class="st-head"><div><h1 class="h1">${title}</h1>${sub ? `<p class="muted st-sub">${sub}</p>` : ''}</div>${actions ? `<div class="st-actions">${actions}</div>` : ''}</header>`;

/* headline number. fmt: money | compact | int | pct */
export const kpi = ({ label, value, fmt = 'int', sub = '', icon = '', hi = false }) => `
  <div class="kpi ${hi ? 'hi' : ''}">
    <div class="kpi-top"><span class="micro">${label}</span>${icon ? `<span class="kpi-ico">${ico(icon, 16)}</span>` : ''}</div>
    <b class="kpi-v tnum" data-count="${value}" data-fmt="${fmt}">0</b>
    ${sub ? `<div class="kpi-s small muted">${sub}</div>` : ''}
  </div>`;

export const statusPill = (e) =>
  e.status === 'cancelled' ? `<span class="pill off">${T('کنسل شد', 'Cancelled')}</span>`
    : e.day < 0 ? `<span class="pill off">${T('برگزار شد', 'Held')}</span>`
    : e.day === 0 ? `<span class="pill em"><i class="dotlive"></i>${T('امروز', 'Today')}</span>`
    : `<span class="pill ok">${T('منتشرشده', 'Live')}</span>`;

export const srcName = (id, SOURCES) => L(SOURCES[id]) || id;

/* a switch row: label + hint on the start, switch on the end */
export const switchRow = (act, key, on_, label, hint = '') => `
  <button class="sw-row" data-act="${act}" data-k="${key}" role="switch" aria-checked="${on_}">
    <div class="grow"><div class="li-t">${label}</div>${hint ? `<div class="li-s">${hint}</div>` : ''}</div>
    <span class="switch ${on_ ? 'on' : ''}"></span>
  </button>`;
