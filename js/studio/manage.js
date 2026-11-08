/* One event, as the host sees it: capacity, money, and the door list with check-in, scan and walk-ins. */
import { S, commit } from '../store.js';
import { T, L } from '../i18n.js';
import { ico } from '../icons.js';
import { esc, nf, money, compact, dFull, dateOf, timeRange, relDay, csv, download, normPhone, validPhone, fmtPhone, sum, uid, readTicket, toLatinDigits } from '../util.js';
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
    return { ...g, in: past ? true : g.in, name: c ? L(c.name) : T('مهمون', 'Guest'), cname: c?.name, phone: c?.phone || '', isMe: !!c?.isMe, walk: g.kind === 'walk' };
  }).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

function stat(label, value, sub = '') { return `<div class="m-stat"><span class="micro">${label}</span><b class="tnum">${value}</b>${sub ? `<span class="small muted">${sub}</span>` : ''}</div>`; }

export function render(id) {
  const e = getEvent(id);
  if (!e || e.host !== ME) return `<div class="wrap st-wrap">${empty('calendar', T('این رویداد پیدا نشد', 'Event not found'), '', `<a class="btn btn-primary" href="#/studio/events">${T('همه‌ی رویدادها', 'All events')}</a>`)}</div>`;
  const s = seats(e), rows = rowsFor(e), past = e.day < 0, off = e.status === 'cancelled';
  const inPeople = sum(rows.filter((r) => r.in), (r) => r.qty);
  const paid = sum(rows.filter((r) => r.paid), (r) => r.amount), pend = sum(rows.filter((r) => !r.paid), (r) => r.amount);
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
      ${stat(past ? T('اومدن', 'Attended') : T('وارد شدن', 'Checked in'), `<span id="in-n">${nf(inPeople)}</span><span class="muted">/${nf(s.taken)}</span>`, past ? '' : T('نفر', 'people'))}
      ${stat(T('درآمد', 'Revenue'), compact(paid), pend ? T(`${compact(pend)} هنوز پرداخت نشده`, `${compact(pend)} pending`) : T('تومان', 'toman'))}
    </section>

    <div class="m-tools">
      ${!past && !off ? `<button class="btn btn-primary btn-sm" data-act="mScan" data-id="${e.id}">${ico('scan', 16)} ${T('اسکن بلیت', 'Scan ticket')}</button>
        <button class="btn btn-glass btn-sm" data-act="mWalk" data-id="${e.id}" ${s.full ? 'disabled' : ''}>${ico('plus', 16)} ${T('مهمون حضوری', 'Add walk-in')}</button>` : ''}
      <button class="btn btn-glass btn-sm" data-act="mExport" data-id="${e.id}">${ico('download', 16)} CSV</button>
    </div>

    <div class="m-list-head">
      <h2 class="h2">${T('لیست ورودی', 'Door list')}</h2>
      <label class="searchfield glass sm">${ico('search', 17)}<input data-in="gq" type="search" autocomplete="off" value="${esc(gq)}" placeholder="${T('اسم یا کد…', 'Name or code…')}"></label>
    </div>

    ${rows.length ? `<div class="g-list" id="g-list" data-event="${e.id}">${rows.map((r) => `
      <div class="g-row ${r.in ? 'in' : ''}" data-key="${esc(r.key)}" data-qty="${r.qty}" data-search="${esc((r.name + ' ' + r.code).toLowerCase())}" ${q && !(r.name + ' ' + r.code).toLowerCase().includes(q) ? 'hidden' : ''}>
        <button class="g-check" data-act="gcheck" data-event="${e.id}" data-key="${esc(r.key)}" ${past || off ? 'disabled' : ''} aria-pressed="${r.in}" aria-label="${T('ورود', 'Check in')}">${ico('check', 20)}</button>
        <button class="g-who" data-act="contact" data-id="${r.c}">
          <span class="g-name">${esc(r.name)}${r.qty > 1 ? ` <span class="qty latin">×${r.qty}</span>` : ''}</span>
          <span class="small muted"><span class="code">${esc(r.code)}</span>${r.isMe ? ` · ${T('تو', 'You')}` : ''}${r.walk ? ` · ${T('حضوری', 'Walk-in')}` : ''}</span>
        </button>
        ${r.paid ? `<span class="pill ok">${r.door ? T('دم در پرداخت شد', 'Paid at door') : T('پرداخت‌شده', 'Paid')}</span>`
          : `<button class="pill em pill-btn" data-act="gpaid" data-event="${e.id}" data-key="${esc(r.key)}" ${past || off ? 'disabled' : ''} title="${T('اگه پولشو گرفتی بزن', 'Tap once you have collected it')}">${ico('wallet', 12)} ${T('پرداخت نشده · ثبتش کن', 'Unpaid · mark paid')}</button>`}
      </div>`).join('')}</div>
      <div class="empty compact" id="g-none" hidden><p class="small muted">${T('چیزی پیدا نشد.', 'No match.')}</p></div>`
      : empty('users', T('هنوز کسی رزرو نکرده', 'No guests yet'), T('هر کی جا بگیره، اسمش همین‌جا میاد.', 'When someone reserves on Went to Event, they appear here.'))}
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
  let k = toLatinDigits(String(input || '')).trim().toUpperCase().replace(/[\s-]+/g, '');
  if (!k || k.startsWith('WTE1|')) return null;
  const flat = (c) => c.toUpperCase().replace(/-/g, '');
  const list = guests(eventId);
  return list.find((g) => flat(g.code) === k) || (/^W?\d{3,4}$/.test(k) ? list.find((g) => flat(g.code).endsWith(k)) : null) || null;
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
    if (!cur && g && !g.paid) toast(T('پول این بلیت هنوز داده نشده؛ بعد از گرفتن، روی «گرفتم» بزن', 'Payment still pending — tap “mark paid” once collected'), 'wallet');
  },
  gpaid(el) {
    const { event, key } = el.dataset;
    commit((s) => { (s.studio.doorPaid[event] ||= {})[key] = true; });
    toast(T('پرداخت دم در ثبت شد', 'Marked as paid at the door'), 'wallet');
  },

  mScan(el) {
    const id = el.dataset.id;
    let stream = null, raf = 0, busy = false, lastRaw = '';
    const stop = () => { cancelAnimationFrame(raf); raf = 0; stream?.getTracks().forEach((t) => t.stop()); stream = null; };
    const s = openSheet({
      title: T('اسکن بلیت', 'Scan a ticket'), cls: 'scan', onClose: stop,
      body: `
        <div class="scanner" id="sc-box">
          <video id="sc-v" playsinline muted hidden></video>
          <i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i><i class="beam"></i>
          <div class="sc-msg" id="sc-msg"><span class="spin"></span><span class="micro">${T('دارم دوربین رو روشن می‌کنم…', 'Starting the camera…')}</span></div>
        </div>
        <div id="sc-res" class="sc-res" hidden></div>
        <div class="field" style="margin:16px 0 0"><label for="sc-code">${T('یا کد بلیت رو تایپ کن', 'Or type the ticket code')}</label>
          <div class="sc-row"><input id="sc-code" class="input code" autocomplete="off" placeholder="JRN-4821" style="text-align:start"><button class="btn btn-bone" data-go>${T('ثبت ورود', 'Check in')}</button></div></div>`,
    });
    const show = (g, kind, extra = '') => {
      const r = s.$('#sc-res'); r.hidden = false; r.className = `sc-res ${kind}`;
      const by = g ? audience().find((c) => c.id === g.c) : null;
      const nm = g?.name || L(by?.name) || T('مهمون', 'Guest');
      r.innerHTML = kind === 'bad'
        ? `${ico('x', 20)}<div><b>${extra || T('بلیت پیدا نشد', 'Ticket not found')}</b><div class="small">${T('کد رو یه بار دیگه چک کن.', 'Double-check the code.')}</div></div>`
        : `${ico(kind === 'dup' ? 'info' : 'check', 20)}<div><b>${esc(nm)}${g.qty > 1 ? ` ×${nf(g.qty)}` : ''}</b><div class="small">${kind === 'dup' ? T('قبلاً وارد شده', 'Already checked in') : T('خوش اومد! ورودش ثبت شد', 'Welcome — checked in')} · <span class="code">${esc(g.code)}</span>${g.paid === false ? ' · ' + T('پرداخت نشده', 'unpaid') : ''}</div></div>`;
      navigator.vibrate?.(kind === 'bad' ? [30, 40, 30] : 14);
    };
    const run = (raw) => {
      const direct = findGuest(id, raw);
      if (direct) { if (direct.in) return show(direct, 'dup'); setIn(id, direct.key, true); return show(direct, 'ok'); }
      const t = readTicket(raw);
      if (!t) return show(null, 'bad');
      if (t.event && t.event !== id) return show(null, 'bad', T('این بلیت مال یه رویداد دیگه‌ست', 'This ticket is for another event'));
      const g = findGuest(id, t.code);
      if (g) { if (g.in) return show(g, 'dup'); setIn(id, g.key, true); return show(g, 'ok'); }
      if (!t.event) return show(null, 'bad');
      if (seats(getEvent(id)).left < t.qty) return show(null, 'bad', T('ظرفیت این رویداد پره', 'This event is full'));
      /* a ticket booked on another phone: the QR carries the booking, so admit it and add it to the list */
      commit((x) => {
        x.studio.walkins.push({ id: uid('w'), cid: uid('cw'), event: id, name: t.name || T('مهمون', 'Guest'), phone: '', qty: t.qty, at: Date.now(), code: t.code, online: true, amount: t.amount ?? undefined });
        (x.studio.checkins[id] ||= {})[t.code] = true;
      });
      show({ name: t.name, qty: t.qty, code: t.code, paid: true }, 'ok');
    };
    const msg = (html) => { const m = s.$('#sc-msg'); if (m) { m.hidden = !html; m.innerHTML = html; } };
    const loadJsQR = () => (window.jsQR ? Promise.resolve() : new Promise((ok, no) => { const sc = document.createElement('script'); sc.src = 'js/vendor/jsQR.min.js'; sc.onload = ok; sc.onerror = no; document.head.appendChild(sc); }));
    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) { msg(`<span class="micro">${T('این مرورگر به دوربین دسترسی نمی‌ده؛ کد رو تایپ کن', "This browser can't use the camera — type the code")}</span>`); return; }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        if (s.closed) { stop(); return; }
        try { await loadJsQR(); } catch (_) {
          stop(); msg(`${ico('info', 24)}<span class="micro">${T('اسکنر بارگذاری نشد (اینترنت ضعیفه). کد بلیت رو پایین تایپ کن.', "The scanner didn't load (weak connection). Type the ticket code below.")}</span><button class="btn btn-glass btn-xs" data-retry>${T('دوباره امتحان کن', 'Try again')}</button>`); return;
        }
        const v = s.$('#sc-v'); v.srcObject = stream; v.hidden = false; await v.play();
        msg(''); s.$('#sc-box').classList.add('live');
        const cv = document.createElement('canvas'); const cx = cv.getContext('2d', { willReadFrequently: true });
        let t0 = 0;
        const tick = (t) => {
          raf = requestAnimationFrame(tick);
          if (busy || t - t0 < 140 || !v.videoWidth) return;
          t0 = t;
          const w = 480, h = Math.round((v.videoHeight / v.videoWidth) * w);
          cv.width = w; cv.height = h; cx.drawImage(v, 0, 0, w, h);
          const hit = window.jsQR(cx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'dontInvert' });
          if (hit?.data && hit.data !== lastRaw) { lastRaw = hit.data; busy = true; run(hit.data); setTimeout(() => { busy = false; }, 1200); }
        };
        raf = requestAnimationFrame(tick);
      } catch (_) {
        stop();
        msg(`${ico('scan', 26)}<span class="micro">${T('دسترسی به دوربین داده نشد. از تنظیمات مرورگر اجازه بده یا کد رو تایپ کن.', 'No camera access. Allow it in browser settings, or type the code.')}</span><button class="btn btn-glass btn-xs" data-retry>${T('دوباره امتحان کن', 'Try again')}</button>`);
      }
    };
    start();
    s.el.addEventListener('click', (ev) => {
      if (ev.target.closest('[data-go]')) { run(s.$('#sc-code').value); s.$('#sc-code').select(); }
      if (ev.target.closest('[data-retry]')) { msg(`<span class="spin"></span>`); start(); }
    });
    s.el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && ev.target.id === 'sc-code') { run(ev.target.value); ev.target.select(); } });
  },

  mWalk(el) {
    const id = el.dataset.id, e = getEvent(id), st = seats(e);
    let qty = 1; const max = Math.max(1, Math.min(6, st.left));
    const form = () => `
      <div class="field"><label for="w-n">${T('نام', 'Name')}</label><input id="w-n" class="input" autocomplete="off" placeholder="${T('اسم مهمون', "Guest's name")}"></div>
      <div class="field"><label for="w-p">${T('موبایل (اختیاری)', 'Mobile (optional)')}</label><input id="w-p" class="input ltr" inputmode="tel" placeholder="0912 345 6789" style="text-align:start"><span class="err-t" id="w-e" hidden></span></div>
      <div class="bk-row"><div><div class="lbl-t">${T('تعداد نفرات', 'Guests')}</div><div class="hint">${T(`${nf(st.left)} جای خالی`, `${st.left} spots left`)}</div></div>
        <div class="stepper"><button data-q="-1" ${qty <= 1 ? 'disabled' : ''} aria-label="-">${ico('minus', 18)}</button><output class="tnum">${nf(qty)}</output><button data-q="1" ${qty >= max ? 'disabled' : ''} aria-label="+">${ico('plus', 18)}</button></div></div>
      <div class="bk-total"><div class="li-row tot"><span>${T('پرداخت دم در', 'Collect at the door')}</span><b>${money(e.price * qty)}</b></div></div>`;
    const s = openSheet({ title: T('مهمون حضوری', 'Add a walk-in'), body: form(), foot: `<button class="btn btn-primary btn-block" data-add>${T('اضافه کن و ورودشو بزن', 'Add & check in')}</button>` });
    s.el.addEventListener('click', (ev) => {
      const q = ev.target.closest('[data-q]');
      if (q) { const n = s.$('#w-n').value, p = s.$('#w-p').value; qty = Math.min(max, Math.max(1, qty + Number(q.dataset.q))); s.setBody(form()); s.$('#w-n').value = n; s.$('#w-p').value = p; return; }
      if (!ev.target.closest('[data-add]')) return;
      const name = s.$('#w-n').value.trim(), phone = s.$('#w-p').value.trim();
      if (name.length < 2) { s.$('#w-n').classList.add('err'); s.$('#w-n').focus(); return; }
      if (phone && !validPhone(phone)) { const x = s.$('#w-e'); x.hidden = false; x.textContent = T('شماره باید با ۰۹ شروع بشه و ۱۱ رقم باشه', 'Enter a mobile number starting with 09 (11 digits)'); s.$('#w-p').focus(); return; }
      const used = new Set(guests(id).map((g) => g.code));
      let code; do { code = 'JRN-W' + (100 + Math.floor(Math.random() * 900)); } while (used.has(code));
      commit((x) => {
        x.studio.walkins.push({ id: uid('w'), cid: uid('cw'), event: id, name, phone: phone ? normPhone(phone) : '', qty, at: Date.now(), code });
        (x.studio.checkins[id] ||= {})[code] = true;
      });
      s.close(); toast(T(`${name} اضافه شد و ورودش ثبت شد`, `${name} added and checked in`), 'check');
    });
  },

  mExport(el) {
    const e = getEvent(el.dataset.id);
    const out = [[T('نام', 'Name'), T('موبایل', 'Phone'), T('کد', 'Code'), T('نفرات', 'Guests'), T('پرداخت', 'Paid'), T('ورود', 'In')]];
    rowsFor(e).forEach((r) => out.push([r.name, normPhone(r.phone), r.code, r.qty, r.paid ? T('بله', 'Yes') : T('خیر', 'No'), r.in ? T('بله', 'Yes') : T('خیر', 'No')]));
    download(`jaryan-${e.id}-door-list.csv`, csv(out));
    toast(T('فایل لیست ورودی دانلود شد', 'Door list exported'), 'download');
  },
});
