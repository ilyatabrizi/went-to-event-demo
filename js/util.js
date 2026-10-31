/* Formatting, seeded randomness, small helpers. Dates are stored as an offset in
   days from "today" so the calendar never looks stale. */
import { isFa, T } from './i18n.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------------------------------------------------------------- numbers */
const locNum = () => (isFa() ? 'fa-IR' : 'en-US');
export const nf = (n) => new Intl.NumberFormat(locNum()).format(Math.round(n));
export const money = (n) => (n === 0 ? T('رایگان', 'Free') : `${nf(n)} ${T('تومان', 'toman')}`);
export function compact(n) {
  const f = (v, d = 1) => new Intl.NumberFormat(locNum(), { maximumFractionDigits: d }).format(v);
  if (n >= 1e9) return `${f(n / 1e9)}${T(' میلیارد', 'B')}`;
  if (n >= 1e6) return `${f(n / 1e6, n >= 1e8 ? 0 : 1)}${T(' میلیون', 'M')}`;
  if (n >= 1e3) return `${f(n / 1e3, n >= 1e5 ? 0 : 1)}${T(' هزار', 'K')}`;
  return f(n, 0);
}
export const pct = (n) => `${new Intl.NumberFormat(locNum()).format(Math.round(n))}${isFa() ? '٪' : '%'}`;
export const toLatinDigits = (s) => String(s ?? '')
  .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
  .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
export const normPhone = (s) => toLatinDigits(s).replace(/\D/g, '').replace(/^98/, '0').replace(/^9(\d{9})$/, '09$1');
export const validPhone = (s) => /^09\d{9}$/.test(normPhone(s));
export const fmtPhone = (s) => {
  const p = normPhone(s);
  return p.length === 11 ? `${p.slice(0, 4)} ${p.slice(4, 7)} ${p.slice(7)}` : p;
};
export const maskPhone = (s) => {
  const p = normPhone(s);
  return p.length === 11 ? `${p.slice(0, 4)} ••• ${p.slice(7)}` : s;
};

/* ------------------------------------------------------------------ dates */
export const DAY = 86400e3;
export const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
export const dateOf = (offset) => { const d = today0(); d.setDate(d.getDate() + offset); return d; };
const dl = () => (isFa() ? 'fa-IR-u-ca-persian-nu-arabext' : 'en-GB');
const fmt = (d, o) => new Intl.DateTimeFormat(dl(), o).format(d);
export const dNum = (d) => fmt(d, { day: 'numeric' });
export const dMonth = (d) => fmt(d, { month: 'long' });
export const dMonthShort = (d) => fmt(d, { month: 'short' });
export const dWeekday = (d) => fmt(d, { weekday: 'long' });
export const dWeekdayShort = (d) => fmt(d, { weekday: 'short' });
export const dFull = (d) => fmt(d, { weekday: 'long', day: 'numeric', month: 'long' });
export const dShort = (d) => fmt(d, { day: 'numeric', month: 'short' });
export const timeRange = (a, b) => `${a} – ${b}`;
export function relDay(off) {
  if (off === 0) return T('امروز', 'Today');
  if (off === 1) return T('فردا', 'Tomorrow');
  if (off === 2) return T('پس‌فردا', 'In 2 days');
  if (off === -1) return T('دیروز', 'Yesterday');
  if (off > 2 && off < 8) return T(`${nf(off)} روز دیگر`, `In ${off} days`);
  if (off < -1 && off > -8) return T(`${nf(-off)} روز پیش`, `${-off} days ago`);
  return dShort(dateOf(off));
}
export function ago(ts) {
  const s = Math.max(0, (Date.now() - ts) / 1000);
  if (s < 60) return T('همین الان', 'Just now');
  const m = Math.round(s / 60);
  if (m < 60) return T(`${nf(m)} دقیقه پیش`, `${m} min ago`);
  const h = Math.round(m / 60);
  if (h < 24) return T(`${nf(h)} ساعت پیش`, `${h} h ago`);
  const d = Math.round(h / 24);
  if (d === 1) return T('دیروز', 'Yesterday');
  if (d < 14) return T(`${nf(d)} روز پیش`, `${d} days ago`);
  return dShort(new Date(ts));
}

/* ----------------------------------------------------------------- random */
export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function rng(seed) {
  let a = typeof seed === 'string' ? hash(seed) : seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* An ember "bloom": the poster for an event that has no photograph. Deterministic
   per id, always ember-on-ink so a grid of them still reads as one family. */
export function bloom(id) {
  const r = rng('bloom:' + id);
  const x1 = Math.round(10 + r() * 80), y1 = Math.round(8 + r() * 55);
  const x2 = Math.round(r() * 100), y2 = Math.round(45 + r() * 55);
  const s1 = Math.round(46 + r() * 22), s2 = Math.round(40 + r() * 22);
  const a1 = (0.55 + r() * 0.3).toFixed(2), a2 = (0.25 + r() * 0.25).toFixed(2);
  return `background:
    radial-gradient(${s1}% ${s1 * 0.8}% at ${x1}% ${y1}%, rgba(255,91,61,${a1}), transparent 70%),
    radial-gradient(${s2}% ${s2}% at ${x2}% ${y2}%, rgba(216,64,31,${a2}), transparent 72%),
    radial-gradient(70% 60% at 50% 110%, rgba(255,124,96,.22), transparent 70%),
    linear-gradient(160deg,#241a24,#120d14)`;
}

/* Decorative QR-shaped mark seeded by the booking code. The readable code beside it is the real one. */
export function qr(code, size = 132) {
  const N = 25, r = rng('qr:' + code), cell = size / N;
  let rects = '';
  const finder = (ox, oy) => {
    rects += `<rect x="${ox * cell}" y="${oy * cell}" width="${7 * cell}" height="${7 * cell}" rx="${cell * 1.2}" fill="#0E0B10"/>`;
    rects += `<rect x="${(ox + 1) * cell}" y="${(oy + 1) * cell}" width="${5 * cell}" height="${5 * cell}" rx="${cell * .9}" fill="#fff"/>`;
    rects += `<rect x="${(ox + 2) * cell}" y="${(oy + 2) * cell}" width="${3 * cell}" height="${3 * cell}" rx="${cell * .6}" fill="#0E0B10"/>`;
  };
  finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const inF = (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
    if (inF) continue;
    if (r() > 0.52) rects += `<rect x="${x * cell + 0.4}" y="${y * cell + 0.4}" width="${cell - 0.8}" height="${cell - 0.8}" rx="${cell * .28}" fill="#0E0B10"/>`;
  }
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="QR">${rects}</svg>`;
}

/* ------------------------------------------------------------- downloads */
export function download(name, text, type = 'text/csv') {
  const blob = new Blob(['﻿' + text], { type: `${type};charset=utf-8` });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 400);
}
export const csv = (rows) => rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

export const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
export const sum = (arr, f = (x) => x) => arr.reduce((a, x) => a + f(x), 0);
export const uid = (p = 'x') => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
