/* One event, as the host sees it: capacity, money, and the door list with check-in, scan and walk-ins. */
import { S, commit } from '../store.js';
import { T, L } from '../i18n.js';
import { ico } from '../icons.js';
import { esc, nf, money, compact, dFull, dateOf, timeRange, relDay, csv, download, normPhone, validPhone, fmtPhone, sum, uid } from '../util.js';
import { getEvent, seats, guests, audience, contact } from '../model.js';
import { ME } from '../data.js';
import { poster, person, ring, empty, on, onInput, openSheet, closeSheets, toast } from '../ui.js';
import { statusPill } from './kit.js';
import { openEventEditor } from './events.js';
import { openContact } from './audience.js';

export const title = (id) => { const e = getEvent(id); return e ? L(e.title) : T('رویداد', 'Event'); };
let gq = '';

function rowsFor(e) {
  const by = new Map(audience().map((c) => [c.id, c]));
  const past = e.day < 0;
  return guests(e.id).map((g) => {
    const c = by.get(g.c);
    return { ...g, in: past ? true : g.in, name: c ? L(c.name) : T('مهمان', 'Guest'), cname: c?.name, phone: c?.phone || '', isMe: !!c?.isMe, walk: g.kind === 'walk' };
  }).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

function stat(label, value, sub = '') { return `<div class="m-stat"><span class="micro">${label}</span><b class="tnum">${value}</b>${sub ? `<span class="small muted">${sub}</span>` : ''}</div>`; }

export function render(id) {
  const e = getEvent(id);
  if (!e || e.host !== ME) return `<div class="wrap st-wrap">${empty('calendar', T('رویداد پیدا نشد', 'Event not found'), '', `<a class="btn btn-primary" href="#/studio/events">${T('همهٔ رویدادها', 'All events')}</a>`)}</div>`;
  const s = seats(e), rows = rowsFor(e), past = e.day < 0, off = e.status === 'cancelled';
  const inPeople = sum(rows.filter((r) => r.in), (r) => r.qty);
  const paid = sum(rows.filter((r) => r.paid), (r) => r.qty) * e.price, pend = sum(rows.filter((r) => !r.paid), (r) => r.qty) * e.price;
  const q = gq.trim().toLowerCase();

  return `
  <div class="wrap st-wrap">
    <a class="back-link" href="#/studio/events">${ico('back', 17)} ${T('رویدادها', 'Events')}</a>
    <header class="m-head">
      <div class="thumb">${poster(e, 480)}</div>
      <div class="grow">
        <div class="se-top">${statusPill(e)}<span class="micro">${esc(relDay(e.day))}</span></div>
        <h1 class="h1 m-title">${esc(L(e.title))}</h1>
        <div class="small muted">${esc(dFull(dateOf(e.day)))} · ${esc(timeRange(e.from, e.to))}</div>
      </div>
      ${!past && !off ? `<button class="btn btn-glass btn-sm" data-act="seEdit" data-id="${e.id}">${ico('edit', 15)} ${T('ویرایش', 'Edit')}</button>` : ''}
    </header>

    <section class="m-stats">
      <div class="m-stat ringed">${ring(s.fill, 64, 7)}<div><span class="micro">${T('ظرفیت', 'Seats')}</span><b class="tnum">${nf(s.taken)}<span class="muted">/${nf(s.total)}</span></b><span class="small muted">${s.full ? T('تکمیل', 'Sold out') : T(`${nf(s.left)} جای خالی`, `${s.left} left`)}</span></div></div>
      ${stat(past ? T('حاضر شدند', 'Attended') : T('وارد شدند', 'Checked in'), `<span id="in-n">${nf(inPeople)}</span><span class="muted">/${nf(s.taken)}</span>`, past ? '' : T('نفر', 'people'))}
      ${stat(T('درآمد', 'Revenue'), compact(paid), pend ? T(`${compact(pend)} در انتظار پرداخت`, `${compact(pend)} pending`) : T('تومان', 'toman'))}
    </section>

    <div class="m-tools">
      ${!past && !off ? `<button class="btn btn-primary btn-sm" data-act="mScan" data-id="${e.id}">${ico('scan', 16)} ${T('اسکن بلیت', 'Scan ticket')}</button>
        <button class="btn btn-glass btn-sm" data-act="mWalk" data-id="${e.id}" ${s.full ? 'disabled' : ''}>${ico('plus', 16)} ${T('مهمان حضوری', 'Add walk-in')}</button>` : ''}
      <button class="btn btn-glass btn-sm" data-act="mExport" data-id="${e.id}">${ico('download', 16)} CSV</button>
    </div>

    <div class="m-list-head">
      <h2 class="h2">${T('لیست ورودی', 'Door list')}</h2>
      <label class="searchfield glass sm">${ico('search', 17)}<input data-in="gq" type="search" autocomplete="off" value="${esc(gq)}" placeholder="${T('نام یا کد…', 'Name or code…')}"></label>
    </div>

    ${rows.length ? `<div class="g-list" id="g-list" data-event="${e.id}">${rows.map((r) => `
      <div class="g-row ${r.in ? 'in' : ''}" data-key="${esc(r.key)}" data-qty="${r.qty}" data-search="${esc((r.name + ' ' + r.code).toLowerCase())}" ${q && !(r.name + ' ' + r.code).toLowerCase().includes(q) ? 'hidden' : ''}>
        <button class="g-check" data-act="gcheck" data-event="${e.id}" data-key="${esc(r.key)}" ${past || off ? 'disabled' : ''} aria-pressed="${r.in}" aria-label="${T('ورود', 'Check in')}">${ico('check', 20)}</button>
        <button class="g-who" data-act="contact" data-id="${r.c}">
          <span class="g-name">${esc(r.name)}${r.qty > 1 ? ` <span class="qty latin">×${r.qty}</span>` : ''}</span>
          <span class="small muted"><span class="code">${esc(r.code)}</span>${r.isMe ? ` · ${T('تو (دمو)', 'You (demo)')}` : ''}${r.walk ? ` · ${T('حضوری', 'Walk-in')}` : ''}</span>
        </button>
        <span class="pill ${r.paid ? 'ok' : 'em'}">${r.paid ? T('پرداخت‌شده', 'Paid') : T('پرداخت نشده', 'Unpaid')}</span>
      </div>`).join('')}</div>
      <div class="empty compact" id="g-none" hidden><p class="small muted">${T('موردی پیدا نشد.', 'No match.')}</p></div>`
      : empty('users', T('هنوز کسی رزرو نکرده', 'No guests yet'), T('وقتی کسی در <bdi class="latin">Went to Event</bdi> جا بگیرد، همین‌جا ظاهر می‌شود.', 'When someone reserves on Went to Event, they appear here.'))}
  </div>`;
}

/* ───────────────────────────────────────────────────── check-in (patched in place) */
function paintCounts() {
  const rows = [...document.querySelectorAll('#g-list .g-row')];
  const n = rows.filter((r) => r.classList.contains('in')).reduce((a, r) => a + Number(r.dataset.qty), 0);
  const el = document.getElementById('in-n'); if (el) el.textContent = nf(n);
}
function setIn(eventId, key, val) {
  commit((s) => { (s.studio.checkins[eventId] ||= {})[key] = val; }, { silent: true });
  const row = [...document.querySelectorAll('#g-list .g-row')].find((r) => r.dataset.key === key);
  if (row) { row.classList.toggle('in', val); row.querySelector('.g-check')?.setAttribute('aria-pressed', val); }
  paintCounts();
}
const findGuest = (eventId, input) => {
  let k = String(input || '').trim().toUpperCase().replace(/\s+/g, '');
  if (/^\d{4}$/.test(k)) k = 'JRN-' + k;
  return guests(eventId).find((g) => g.key.toUpperCase() === k) || null;
};

onInput({
  gq(el) {
    gq = el.value; const q = gq.trim().toLowerCase(); let shown = 0;
    document.querySelectorAll('#g-list .g-row').forEach((r) => { const m = !q || r.dataset.search.includes(q); r.hidden = !m; if (m) shown++; });
    const none = document.getElementById('g-none'); if (none) none.hidden = shown > 0;
  },
});

on({
  gcheck(el) {
    const { event, key } = el.dataset;
    const cur = !!(S().studio.checkins[event] || {})[key];
    const g = guests(event).find((x) => x.key === key);
    setIn(event, key, !cur);
    navigator.vibrate?.(8);
    if (!cur && g && !g.paid) toast(T('پرداخت این بلیت باقی مانده — دم در دریافت کن', 'Payment still pending — collect at the door'), 'wallet');
  },

  mScan(el) {
    const id = el.dataset.id;
    const s = openSheet({
      title: T('اسکن بلیت', 'Scan a ticket'), cls: 'scan',
      body: `
        <div class="scanner"><i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i><i class="beam"></i><span class="micro">${T('QR را داخل کادر بگیر', 'Hold the QR inside the frame')}</span></div>
        <div id="sc-res" class="sc-res" hidden></div>
        <div class="field" style="margin:16px 0 0"><label for="sc-code">${T('یا کد بلیت را وارد کن', 'Or type the ticket code')}</label>
          <div class="sc-row"><input id="sc-code" class="input code" autocomplete="off" placeholder="JRN-4821" style="text-align:start"><button class="btn btn-bone" data-go>${T('ثبت', 'Check in')}</button></div></div>`,
      foot: `<button class="btn btn-glass btn-block" data-sim>${ico('spark', 16)} ${T('شبیه‌سازی یک اسکن', 'Simulate a scan')}</button>`,
    });
    const show = (g, kind) => {
      const r = s.$('#sc-res'); r.hidden = false; r.className = `sc-res ${kind}`;
      const by = audience().find((c) => c.id === g?.c);
      r.innerHTML = kind === 'bad'
        ? `${ico('x', 20)}<div><b>${T('بلیت پیدا نشد', 'Ticket not found')}</b><div class="small">${T('کد را دوباره بررسی کن.', 'Double-check the code.')}</div></div>`
        : `${ico(kind === 'dup' ? 'info' : 'check', 20)}<div><b>${esc(L(by?.name) || T('مهمان', 'Guest'))}${g.qty > 1 ? ` ×${g.qty}` : ''}</b><div class="small">${kind === 'dup' ? T('قبلاً وارد شده', 'Already checked in') : T('وارد شد', 'Checked in')} · <span class="code">${esc(g.code)}</span>${g.paid ? '' : ' · ' + T('پرداخت نشده', 'unpaid')}</div></div>`;
    };
    const run = (code) => {
      const g = findGuest(id, code);
      if (!g) return show(null, 'bad');
      if (g.in) return show(g, 'dup');
      setIn(id, g.key, true); show(g, 'ok'); navigator.vibrate?.(12);
    };
    s.el.addEventListener('click', (ev) => {
      if (ev.target.closest('[data-go]')) { run(s.$('#sc-code').value); s.$('#sc-code').select(); }
      if (ev.target.closest('[data-sim]')) {
        const next = guests(id).find((g) => !g.in);
        if (!next) { const r = s.$('#sc-res'); r.hidden = false; r.className = 'sc-res dup'; r.innerHTML = `${ico('check', 20)}<div><b>${T('همه وارد شده‌اند', 'Everyone is in')}</b></div>`; return; }
        run(next.code);
      }
    });
    s.el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && ev.target.id === 'sc-code') { run(ev.target.value); ev.target.select(); } });
  },

  mWalk(el) {
    const id = el.dataset.id, e = getEvent(id), st = seats(e);
    let qty = 1; const max = Math.max(1, Math.min(6, st.left));
    const form = () => `
      <div class="field"><label for="w-n">${T('نام', 'Name')}</label><input id="w-n" class="input" autocomplete="off" placeholder="${T('نام مهمان', "Guest's name")}"></div>
      <div class="field"><label for="w-p">${T('موبایل (اختیاری)', 'Mobile (optional)')}</label><input id="w-p" class="input ltr" inputmode="tel" placeholder="0912 345 6789" style="text-align:start"><span class="err-t" id="w-e" hidden></span></div>
      <div class="bk-row"><div><div class="lbl-t">${T('تعداد نفرات', 'Guests')}</div><div class="hint">${T(`${nf(st.left)} جای خالی`, `${st.left} spots left`)}</div></div>
        <div class="stepper"><button data-q="-1" ${qty <= 1 ? 'disabled' : ''} aria-label="-">${ico('minus', 18)}</button><output class="tnum">${nf(qty)}</output><button data-q="1" ${qty >= max ? 'disabled' : ''} aria-label="+">${ico('plus', 18)}</button></div></div>
      <div class="bk-total"><div class="li-row tot"><span>${T('دریافت دم در', 'Collect at the door')}</span><b>${money(e.price * qty)}</b></div></div>`;
    const s = openSheet({ title: T('مهمان حضوری', 'Add a walk-in'), body: form(), foot: `<button class="btn btn-primary btn-block" data-add>${T('افزودن و ثبت ورود', 'Add & check in')}</button>` });
    s.el.addEventListener('click', (ev) => {
      const q = ev.target.closest('[data-q]');
      if (q) { const n = s.$('#w-n').value, p = s.$('#w-p').value; qty = Math.min(max, Math.max(1, qty + Number(q.dataset.q))); s.setBody(form()); s.$('#w-n').value = n; s.$('#w-p').value = p; return; }
      if (!ev.target.closest('[data-add]')) return;
      const name = s.$('#w-n').value.trim(), phone = s.$('#w-p').value.trim();
      if (name.length < 2) { s.$('#w-n').classList.add('err'); s.$('#w-n').focus(); return; }
      if (phone && !validPhone(phone)) { const x = s.$('#w-e'); x.hidden = false; x.textContent = T('شماره باید با ۰۹ شروع شود و ۱۱ رقم باشد', 'Enter a mobile number starting with 09 (11 digits)'); s.$('#w-p').focus(); return; }
      const code = 'JRN-W' + (100 + Math.floor(Math.random() * 899));
      commit((x) => {
        x.studio.walkins.push({ id: uid('w'), cid: uid('cw'), event: id, name, phone: phone ? normPhone(phone) : '', qty, at: Date.now(), code });
        (x.studio.checkins[id] ||= {})[code] = true;
      });
      s.close(); toast(T(`${name} اضافه و وارد شد`, `${name} added and checked in`), 'check');
    });
  },

  mExport(el) {
    const e = getEvent(el.dataset.id);
    const out = [[T('نام', 'Name'), T('موبایل', 'Phone'), T('کد', 'Code'), T('نفرات', 'Guests'), T('پرداخت', 'Paid'), T('ورود', 'In')]];
    rowsFor(e).forEach((r) => out.push([r.name, normPhone(r.phone), r.code, r.qty, r.paid ? T('بله', 'Yes') : T('خیر', 'No'), r.in ? T('بله', 'Yes') : T('خیر', 'No')]));
    download(`jaryan-${e.id}-door-list.csv`, csv(out));
    toast(T('لیست ورودی خروجی گرفته شد', 'Door list exported'), 'download');
  },
});
