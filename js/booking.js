/* The reservation flow (a sheet) and the ticket sheet. Booking writes to the same store the studio reads. */
import { S, commit } from './store.js';
import { T, L, isFa } from './i18n.js';
import { ico } from './icons.js';
import { esc, money, nf, dFull, dateOf, timeRange, normPhone, validPhone, fmtPhone, qr, ticketPayload, uid, relDay } from './util.js';
import { getEvent, getHost, seats, userName, applyCode } from './model.js';
import { on, openSheet, closeSheets, toast, poster, confirmSheet, avatar } from './ui.js';
import { navigate } from './app.js';

const mini = (e) => {
  const h = getHost(e.host);
  return `<div class="bk-sum">
    <div class="thumb">${poster(e, 480)}</div>
    <div class="grow">
      <div class="micro">${esc(L(h.name))}</div>
      <h3 class="h3" style="margin-block:2px">${esc(L(e.title))}</h3>
      <div class="small muted">${esc(dFull(dateOf(e.day)))} · ${esc(timeRange(e.from, e.to))}</div>
    </div></div>`;
};

function newCode(prefix) {
  const taken = new Set(S().bookings.map((b) => b.code));
  let c; do { c = `${prefix}-${1000 + Math.floor(Math.random() * 8999)}`; } while (taken.has(c));
  return c;
}

export function openBooking(id) {
  const e = getEvent(id);
  if (!e || e.day < 0) return;
  const st = seats(e);
  if (st.full) { toast(T('ظرفیت پر شده', 'This event is sold out'), 'info'); return; }
  const max = Math.min(6, st.left);
  const h = getHost(e.host);
  let qty = 1;
  let promo = null, promoOpen = false, promoErr = '', promoDraft = '';
  const user = { name: S().user.name || '', phone: S().user.phone || '' };
  const gross = () => e.price * qty;
  const total = () => (promo ? promo.total : gross());
  const WHY = { empty: T('کد رو بنویس', 'Type a code'), nope: T('این کد معتبر نیست', "That code isn't valid"), expired: T('این کد تاریخش گذشته', 'That code has expired'), full: T('ظرفیت این کد تموم شده', 'That code has been used up'), event: T('این کد برای یه رویداد دیگه‌ست', "That code is for a different event") };
  const promoBlock = () => (e.price ? (promo
    ? `<div class="promo-on">${ico('tag', 16)}<span class="grow"><b class="latin">${esc(promo.code)}</b> · ${T(`${money(promo.off)} تخفیف`, `${money(promo.off)} off`)}</span><button class="btn btn-ghost btn-xs" data-promo-x>${T('حذف', 'Remove')}</button></div>`
    : promoOpen
      ? `<div class="promo-row"><input id="bk-promo" class="input ltr" value="${esc(promoDraft)}" placeholder="${T('کد تخفیف', 'Discount code')}" autocapitalize="characters" autocomplete="off" spellcheck="false"><button class="btn btn-glass" data-promo-go>${T('اعمال', 'Apply')}</button></div>${promoErr ? `<span class="err-t">${promoErr}</span>` : ''}`
      : `<button class="promo-link" data-promo-open>${ico('tag', 15)} ${T('کد تخفیف داری؟', 'Have a discount code?')}</button>`) : '');

  const form = () => `
    ${mini(e)}
    <div class="bk-row">
      <div><div class="lbl-t">${T('تعداد نفرات', 'Guests')}</div><div class="hint">${T(`حداکثر ${nf(max)} نفر`, `Up to ${max}`)}</div></div>
      <div class="stepper"><button data-q="-1" aria-label="-" ${qty <= 1 ? 'disabled' : ''}>${ico('minus', 18)}</button><output class="tnum">${nf(qty)}</output><button data-q="1" aria-label="+" ${qty >= max ? 'disabled' : ''}>${ico('plus', 18)}</button></div>
    </div>
    <div class="field"><label for="bk-name">${T('نام', 'Name')}</label><input id="bk-name" class="input" autocomplete="name" value="${esc(user.name)}" placeholder="${T('نام و نام خانوادگی', 'Full name')}"></div>
    <div class="field"><label for="bk-phone">${T('شماره موبایل', 'Mobile number')}</label><input id="bk-phone" class="input ltr" inputmode="tel" autocomplete="tel" value="${esc(fmtPhone(user.phone))}" placeholder="0912 345 6789" style="text-align:start"><span class="err-t" id="bk-err" hidden></span></div>
    <div class="promo">${promoBlock()}</div>
    <div class="bk-total">
      <div class="li-row"><span class="muted">${nf(qty)} × ${money(e.price)}</span><span>${money(gross())}</span></div>
      ${promo ? `<div class="li-row ok"><span>${T('تخفیف', 'Discount')}</span><span>− ${money(promo.off)}</span></div>` : ''}
      <div class="li-row tot"><span>${T('مبلغ قابل پرداخت', 'To pay')}</span><b>${money(total())}</b></div>
    </div>
    <p class="small muted" style="margin-top:14px;display:flex;gap:8px;align-items:flex-start">${ico('info', 16)}<span>${T('تا ۴۸ ساعت قبل از شروع، می‌تونی بدون جریمه کنسلش کنی و کل پولت برمی‌گرده.', 'Free cancellation up to 48 hours before the start — you get the full amount back.')}</span></p>`;
  const foot = () => `<button class="btn btn-primary btn-block" data-pay>${e.price ? `${T('پرداخت و رزرو', 'Pay & reserve')} · ${money(total())}` : T('رزرو رایگان', 'Reserve for free')}</button>`;

  const s = openSheet({
    title: T('رزرو کن', 'Reserve your spot'),
    body: form(), foot: foot(),
  });
  const paint = () => {
    const n = s.$('#bk-name'), p = s.$('#bk-phone'), c = s.$('#bk-promo');
    user.name = n?.value ?? user.name; user.phone = p?.value ?? user.phone; if (c) promoDraft = c.value;
    s.setBody(form()); s.setFoot(foot());
  };
  const tryPromo = () => {
    const c = s.$('#bk-promo'); promoDraft = c ? c.value : promoDraft;
    const r = applyCode(promoDraft, e, qty);
    if (r.ok) { promo = r; promoErr = ''; paint(); toast(T('کد تخفیف اعمال شد', 'Discount applied'), 'tag'); }
    else { promoErr = WHY[r.why]; paint(); s.$('#bk-promo')?.focus(); }
  };
  s.el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && ev.target.id === 'bk-promo') { ev.preventDefault(); tryPromo(); } });
  s.el.addEventListener('click', (ev) => {
    const q = ev.target.closest('[data-q]');
    if (q) {
      qty = Math.min(max, Math.max(1, qty + Number(q.dataset.q)));
      if (promo) { const r = applyCode(promo.code, e, qty); promo = r.ok ? r : null; }
      paint(); return;
    }
    if (ev.target.closest('[data-promo-open]')) { promoOpen = true; paint(); setTimeout(() => s.$('#bk-promo')?.focus(), 30); return; }
    if (ev.target.closest('[data-promo-go]')) { tryPromo(); return; }
    if (ev.target.closest('[data-promo-x]')) { promo = null; promoOpen = false; promoDraft = ''; paint(); return; }
    if (ev.target.closest('[data-pay]')) pay();
  });
  const pay = () => {
    const name = s.$('#bk-name').value.trim(), phone = s.$('#bk-phone').value;
    const err = s.$('#bk-err');
    if (name.length < 2) { s.$('#bk-name').classList.add('err'); s.$('#bk-name').focus(); return; }
    if (!validPhone(phone)) {
      const p = s.$('#bk-phone'); p.classList.remove('err'); void p.offsetWidth; p.classList.add('err');
      err.hidden = false; err.textContent = T('شماره باید با ۰۹ شروع بشه و ۱۱ رقم باشه', 'Enter a mobile number starting with 09 (11 digits)'); p.focus(); return;
    }
    const btn = s.$('[data-pay]'); btn.innerHTML = '<span class="spin"></span>'; btn.classList.add('is-off');
    setTimeout(() => {
      const code = newCode(h.prefix);
      const b = { id: uid('b'), event: e.id, qty, name, phone: normPhone(phone), at: Date.now(), code, total: total(), promo: promo ? promo.code : null, discount: promo ? promo.off : 0 };
      commit((st2) => {
        st2.bookings.push(b);
        st2.user.name = name; st2.user.phone = b.phone;
        const when = `${dFull(dateOf(e.day))}`;
        st2.inbox.unshift({
          id: uid('n'), ts: Date.now(), kind: 'booking', host: e.host,
          title: { fa: 'رزروت تأیید شد', en: 'Reservation confirmed' },
          body: { fa: `بلیت ${code} برای «${e.title.fa || e.title}» آماده‌ست.`, en: `Ticket ${code} for “${e.title.en || e.title}” is ready.` },
          read: false,
        });
        if (e.host === 'jaryan') st2.inbox.unshift({
          id: uid('n'), ts: Date.now() + 1, kind: 'host', host: e.host,
          title: { fa: 'جریان', en: 'Jaryan' },
          body: { fa: 'آدرس دقیق و لوکیشن رو به‌زودی همین‌جا برات می‌فرستیم. منتظرتیم!', en: "Your exact address and location will arrive here shortly. Can't wait to see you!" },
          read: false,
        });
      });
      done(b);
    }, 950);
  };
  const done = (b) => {
    s.setTitle('');
    s.setBody(`
      <div class="bk-done">
        <div class="ok-ring"><svg viewBox="0 0 52 52" width="52" height="52"><circle cx="26" cy="26" r="24" fill="none" stroke="var(--ember)" stroke-width="2.5" class="ok-c"/><path d="M15 27l8 8 14-16" fill="none" stroke="var(--ember)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="ok-p"/></svg></div>
        <h2 class="h1">${T('جات رزرو شد!', "You're in.")}</h2>
        <p class="lede">${T('بلیتت آماده‌ست و تو بخش «بلیت‌ها» منتظرته.', 'Your ticket is waiting under Tickets.')}</p>
        <div class="mini-ticket">
          <div class="mt-l"><div class="micro">${esc(L(h.name))}</div><div class="h3" style="margin-block:3px 6px">${esc(L(e.title))}</div><div class="small muted">${esc(dFull(dateOf(e.day)))} · ${esc(e.from)}</div><div class="code mt-code">${esc(b.code)}</div></div>
          <div class="mt-qr">${qr(ticketPayload(b), 92)}</div>
        </div>
      </div>`);
    s.setFoot(`<div class="row-btns eq"><button class="btn btn-glass" data-close>${T('بستن', 'Done')}</button><button class="btn btn-primary" data-go>${T('دیدن بلیت', 'View ticket')}</button></div>`);
    s.el.addEventListener('click', (ev) => {
      if (ev.target.closest('[data-close]')) s.close();
      if (ev.target.closest('[data-go]')) { s.close(); navigate('/tickets'); }
    });
  };
}

export function openTicket(bid) {
  const b = S().bookings.find((x) => x.id === bid);
  if (!b) return;
  const e = getEvent(b.event); const h = getHost(e.host);
  const s = openSheet({
    title: T('بلیت', 'Ticket'),
    body: `
      <div class="tk-big">
        <div class="tk-top"><div class="thumb">${poster(e, 480)}</div>
          <div class="grow"><div class="micro" style="display:flex;align-items:center;gap:7px">${avatar(h, 18)} ${esc(L(h.name))}</div><h3 class="h2" style="margin-block:4px">${esc(L(e.title))}</h3>
          <div class="small muted">${esc(dFull(dateOf(e.day)))} · ${esc(timeRange(e.from, e.to))}</div></div></div>
        <div class="tk-cut"><i></i><b></b><i></i></div>
        <div class="tk-qr">${qr(ticketPayload(b), 184)}</div>
        <div class="tk-code code">${esc(b.code)}</div>
        <div class="tk-meta">
          <div><div class="micro">${T('مهمون', 'Guest')}</div><b>${esc(b.name)}</b></div>
          <div><div class="micro">${T('نفرات', 'Admits')}</div><b>${nf(b.qty)}</b></div>
          <div><div class="micro">${T('پرداخت', 'Paid')}</div><b>${money(b.total ?? e.price * b.qty)}</b></div>
        </div>
      </div>
      <p class="small muted" style="margin-top:14px">${esc(L(h.addressNote || { fa: 'آدرس دقیق رو میزبان برات می‌فرسته.', en: 'The host sends the exact address.' }))}</p>`,
    foot: e.day >= 0 ? `<div class="row-btns eq"><button class="btn btn-danger" data-cancel>${T('لغو رزرو', 'Cancel reservation')}</button><button class="btn btn-glass" data-act="share" data-id="${e.id}">${ico('share', 18)} ${T('اشتراک', 'Share')}</button></div>` : '',
  });
  s.el.addEventListener('click', async (ev) => {
    if (!ev.target.closest('[data-cancel]')) return;
    const ok = await confirmSheet({ title: T('رزروت کنسل بشه؟', 'Cancel this reservation?'), text: T('جات آزاد می‌شه و بلیتت هم از لیست تو و میزبان پاک می‌شه.', 'Your spot is released and the ticket is removed for you and the host.'), ok: T('آره، کنسلش کن', 'Yes, cancel'), danger: true });
    if (!ok) return;
    commit((st) => { st.bookings = st.bookings.filter((x) => x.id !== bid); });
    s.close(); toast(T('رزروت کنسل شد', 'Reservation cancelled'), 'check');
  });
}

on({
  book(el) { openBooking(el.dataset.id); },
  ticket(el) { openTicket(el.dataset.id); },
});
