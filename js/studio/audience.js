/* Audience — Jaryan's customers (people who booked) and engagers (people who follow or save but haven't booked yet). */
import { S, commit } from '../store.js';
import { T, L } from '../i18n.js';
import { ico } from '../icons.js';
import { esc, nf, money, compact, ago, fmtPhone, normPhone, csv, download, dFull, dateOf, relDay, DAY } from '../util.js';
import { audience, contact, SEGMENTS, segment, getEvent } from '../model.js';
import { TAGS, SOURCES, SEED_TAGS } from '../data.js';
import { person, empty, on, onInput, openSheet, closeSheets, placePill, toast } from '../ui.js';
import { pageHead } from './kit.js';
import { prefs as bprefs } from './broadcast.js';
import { navigate } from '../app.js';

export const title = () => T('مخاطبان', 'Audience');
export const prefs = { seg: 'all', q: '', sort: 'recent' };

const norm = (s) => String(s || '').toLowerCase();
const SORTS = [
  { id: 'recent', fa: 'تازه‌ترین', en: 'Newest' },
  { id: 'spent', fa: 'بیشترین خرید', en: 'Top spenders' },
  { id: 'name', fa: 'الفبا', en: 'A–Z' },
];

function rows() {
  const q = norm(prefs.q.trim());
  let list = segment(prefs.seg).filter((c) => !q || norm(L(c.name) + ' ' + c.phone + ' ' + c.tags.map((t) => L(TAGS.find((x) => x.id === t)))).includes(q));
  if (prefs.sort === 'spent') list.sort((a, b) => b.spent - a.spent || a.joined - b.joined);
  else if (prefs.sort === 'name') list.sort((a, b) => L(a.name).localeCompare(L(b.name), undefined, { sensitivity: 'base' }));
  else list.sort((a, b) => a.joined - b.joined);
  return list;
}

const meta = (c) => {
  if (c.isCustomer) return `${T('مشتری', 'Customer')} · ${T(`${nf(c.count)} بلیت`, `${c.count} ticket${c.count > 1 ? 's' : ''}`)}${c.spent ? ` · ${compact(c.spent)} ${T('تومان', 'toman')}` : ''}`;
  return `${T('دنبال‌کننده', 'Engager')} · ${c.follows ? T('دنبال می‌کند', 'follows') : ''}${c.follows && c.saves ? ' · ' : ''}${c.saves ? T(`${nf(c.saves)} ذخیره`, `${c.saves} saved`) : ''}`;
};
const row = (c) => {
  const tg = c.tags.slice(0, 2).map((t) => TAGS.find((x) => x.id === t)).filter(Boolean);
  return `<button class="c-row ${c.isMe ? 'is-me' : ''}" data-act="contact" data-id="${c.id}">
    ${person(c.name, 46)}
    <div class="grow">
      <div class="c-name"><span>${esc(L(c.name))}</span>
        ${c.isMe ? `<span class="pill em">${T('تو (دمو)', 'You (demo)')}</span>` : ''}
        ${c.walkin ? `<span class="pill">${T('حضوری', 'Walk-in')}</span>` : ''}
        ${c.vip ? `<span class="pill em">${ico('star', 12)} VIP</span>` : ''}
        ${c.lapsed ? `<span class="pill off">${T('ریزش', 'Lapsed')}</span>` : ''}</div>
      <div class="small muted">${meta(c)}</div>
    </div>
    <div class="c-side">
      ${tg.length ? `<div class="c-tags">${tg.map((t) => `<span class="tagchip">${esc(L(t))}</span>`).join('')}</div>` : ''}
      <span class="micro">${esc(L(SOURCES[c.src]) || '')}</span>
    </div>
  </button>`;
};

function listHtml() {
  const list = rows();
  if (!list.length) return empty('users', T('کسی پیدا نشد', 'No one found'), T('فیلتر یا عبارت جستجو را عوض کن.', 'Change the filter or the search.'));
  return `<div class="micro res-count">${T(`${nf(list.length)} نفر`, `${list.length} ${list.length > 1 ? 'people' : 'person'}`)}</div><div class="c-list">${list.map(row).join('')}</div>`;
}

export function render() {
  const all = audience();
  const counts = Object.fromEntries(SEGMENTS.map((s) => [s.id, all.filter(s.test).length]));
  const cust = counts.customers, eng = counts.engagers;
  const lapsed = counts.lapsed;
  return `
  <div class="wrap st-wrap">
    ${pageHead(T('مخاطبان', 'Audience'), T(`${nf(all.length)} نفر · ${nf(cust)} مشتری · ${nf(eng)} دنبال‌کننده`, `${all.length} people · ${cust} customers · ${eng} engagers`),
      `<button class="btn btn-glass btn-sm" data-act="audExport">${ico('download', 15)} CSV</button><button class="btn btn-primary btn-sm" data-act="audBroadcast">${ico('megaphone', 15)} ${T('پیام به این گروه', 'Message this group')}</button>`)}

    ${lapsed && prefs.seg !== 'lapsed' ? `<button class="nudge" data-act="audSeg" data-seg="lapsed">
      <span class="nudge-ico">${ico('refresh', 18)}</span>
      <span class="grow"><b>${T(`${nf(lapsed)} مشتری مدتی است برنگشته‌اند`, `${lapsed} customers haven't been back in a while`)}</b><span class="small muted"> · ${T('یک پیام کوتاه شاید برشان گرداند', 'A short note might bring them back')}</span></span>${ico('chev', 18)}</button>` : ''}

    <div class="chips seg-chips">${SEGMENTS.map((s) => `<button class="chip ${prefs.seg === s.id ? 'on' : ''}" data-act="audSeg" data-seg="${s.id}">${esc(L(s))}<em>${nf(counts[s.id])}</em></button>`).join('')}</div>

    <div class="a-tools">
      <label class="searchfield glass">${ico('search', 19)}<input data-in="aq" type="search" autocomplete="off" value="${esc(prefs.q)}" placeholder="${T('نام، شماره یا برچسب…', 'Name, number or tag…')}"></label>
      <div class="seg sort-seg"><span class="seg-pill"></span>${SORTS.map((s) => `<button class="${prefs.sort === s.id ? 'on' : ''}" data-act="audSort" data-sort="${s.id}">${esc(L(s))}</button>`).join('')}</div>
    </div>

    <div id="a-res">${listHtml()}</div>
  </div>`;
}

const paint = () => { const r = document.getElementById('a-res'); if (r) r.innerHTML = listHtml(); };

/* ───────────────────────────────────────────────────────── contact sheet */
export function openContact(id) {
  const c = contact(id); if (!c) return;
  const tagBtn = (t, onNow) => `<button class="chip ${onNow ? 'on' : ''}" data-act="ctag" data-id="${c.id}" data-tag="${t.id}" aria-pressed="${onNow}">${esc(L(t))}</button>`;
  const sub = [
    esc(L(SOURCES[c.src]) || ''),
    c.joined === 0 ? T('همین حالا اضافه شد', 'Just added') : T(`از ${ago(Date.now() - c.joined * DAY)}`, `since ${ago(Date.now() - c.joined * DAY)}`),
  ].filter(Boolean).join(' · ');
  const phone = normPhone(c.phone);
  const s = openSheet({
    title: esc(L(c.name)),
    cls: 'contact',
    onClose: paint,
    body: `
      <div class="ct-head">
        ${person(c.name, 64)}
        <div class="grow">
          <div class="ct-phone latin ltr">${esc(fmtPhone(c.phone) || '—')}</div>
          <div class="micro" style="margin-top:3px">${sub}</div>
          <div class="ct-pills">
            <span class="pill ${c.isCustomer ? 'ok' : ''}">${c.isCustomer ? T('مشتری', 'Customer') : T('دنبال‌کننده', 'Engager')}</span>
            ${c.vip ? `<span class="pill em">${ico('star', 12)} VIP</span>` : ''}${c.lapsed ? `<span class="pill off">${T('در خطر ریزش', 'Lapsed')}</span>` : ''}
            ${c.follows ? `<span class="pill">${T('دنبال می‌کند', 'Follows')}</span>` : ''}${c.saves ? `<span class="pill">${T(`${nf(c.saves)} ذخیره`, `${c.saves} saved`)}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="ct-stats">
        <div><b>${c.spent ? money(c.spent) : '—'}</b><span class="micro">${T('مجموع خرید', 'Spent')}</span></div>
        <div><b>${nf(c.count)}</b><span class="micro">${T('بلیت', 'Tickets')}</span></div>
        <div><b>${c.hasUpcoming ? T('پیش رو', 'Upcoming') : c.lastDay != null ? esc(relDay(c.lastDay)) : '—'}</b><span class="micro">${T('آخرین حضور', 'Last visit')}</span></div>
      </div>

      <div class="ct-sec"><div class="micro">${T('رزروها', 'Bookings')}</div>
        ${c.bookings.length ? `<div class="list">${c.bookings.map((b) => { const e = getEvent(b.event); return `<div class="li"><div class="grow"><div class="li-t">${esc(L(e.title))}</div><div class="li-s">${esc(dFull(dateOf(e.day)))} · ${T(`${nf(b.qty)} نفر`, `${b.qty} guest${b.qty > 1 ? 's' : ''}`)}</div></div><span class="pill ${b.paid ? 'ok' : ''}">${b.paid ? T('پرداخت‌شده', 'Paid') : T('پرداخت نشده', 'Unpaid')}</span></div>`; }).join('')}</div>`
          : `<p class="small muted">${T('هنوز بلیتی نگرفته. می‌شود با یک پیام دعوتش کرد.', "Hasn't booked yet. A message could invite them.")}</p>`}
      </div>

      <div class="ct-sec"><div class="micro">${T('برچسب‌ها', 'Tags')}</div>
        <div class="chips wrapchips" id="ct-tags">${TAGS.map((t) => tagBtn(t, c.tags.includes(t.id))).join('')}</div></div>

      <div class="ct-sec"><div class="micro">${T('یادداشت خصوصی', 'Private note')}</div>
        <textarea class="textarea" data-in="cnote" data-id="${c.id}" placeholder="${T('مثلاً: همیشه با دوستش می‌آید…', 'e.g. always brings a friend…')}">${esc(c.note)}</textarea></div>`,
    foot: `<div class="row-btns eq">
      <button class="btn btn-glass" data-act="ctMsg" data-id="${c.id}">${ico('send', 17)} ${T('پیام', 'Message')}</button>
      ${phone.length === 11 ? `<a class="btn btn-primary" href="tel:${phone}">${T('تماس', 'Call')}</a>` : `<button class="btn btn-primary" disabled>${T('تماس', 'Call')}</button>`}
    </div>`,
  });
  return s;
}

onInput({
  aq(el) { prefs.q = el.value; paint(); },
  cnote(el) { const id = el.dataset.id; commit((s) => { s.studio.notes[id] = el.value; }, { silent: true }); },
});
on({
  audSeg(el) {
    prefs.seg = el.dataset.seg;
    if (document.getElementById('a-res')) {
      document.querySelectorAll('.seg-chips .chip').forEach((b) => b.classList.toggle('on', b.dataset.seg === prefs.seg));
      document.querySelector('.nudge')?.toggleAttribute('hidden', prefs.seg === 'lapsed');
      paint();
    } else navigate('/studio/audience');
  },
  audSort(el) {
    prefs.sort = el.dataset.sort;
    const seg = el.closest('.seg');
    seg.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === el));
    placePill(seg);
    paint();
  },
  contact(el) { openContact(el.dataset.id); },
  ctag(el) {
    const id = el.dataset.id, t = el.dataset.tag;
    const cur = contact(id)?.tags || [];
    const next = cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t];
    commit((s) => { s.studio.tags[id] = next; }, { silent: true });
    el.classList.toggle('on', next.includes(t)); el.setAttribute('aria-pressed', next.includes(t));
  },
  ctMsg(el) {
    bprefs.to = el.dataset.id; bprefs.seg = 'all';
    closeSheets();
    navigate('/studio/broadcast');
  },
  audBroadcast() { bprefs.to = null; bprefs.seg = prefs.seg; navigate('/studio/broadcast'); },
  audExport() {
    const list = rows();
    const out = [[T('نام', 'Name'), T('موبایل', 'Phone'), T('نوع', 'Type'), T('منبع', 'Source'), T('تعداد بلیت', 'Tickets'), T('مجموع خرید (تومان)', 'Spent (toman)'), T('برچسب‌ها', 'Tags'), T('یادداشت', 'Note')]];
    list.forEach((c) => out.push([L(c.name), normPhone(c.phone), c.isCustomer ? T('مشتری', 'Customer') : T('دنبال‌کننده', 'Engager'), L(SOURCES[c.src]), c.count, c.spent, c.tags.map((t) => L(TAGS.find((x) => x.id === t))).join(' | '), c.note]));
    download(`jaryan-audience-${prefs.seg}.csv`, csv(out));
    toast(T(`${nf(list.length)} مخاطب خروجی گرفته شد`, `Exported ${list.length} contacts`), 'download');
  },
});
