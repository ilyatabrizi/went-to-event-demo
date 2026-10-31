/* The reservation flow (a sheet) and the ticket sheet. Booking writes to the same store the studio reads. */
import { S, commit } from './store.js';
import { T, L, isFa } from './i18n.js';
import { ico } from './icons.js';
import { esc, money, nf, dFull, dateOf, timeRange, normPhone, validPhone, fmtPhone, qr, uid, relDay } from './util.js';
import { getEvent, getHost, seats, userName } from './model.js';
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
  if (st.full) { toast(T('ظرفیت پر است', 'This event is sold out'), 'info'); return; }
  const max = Math.min(6, st.left);
  const h = getHost(e.host);
  let qty = 1;
  const user = { name: S().user.name || userName(), phone: S().user.phone || '' };

  const form = () => `
    ${mini(e)}
    <div class="bk-row">
      <div><div class="lbl-t">${T('تعداد نفرات', 'Guests')}</div><div class="hint">${T(`حداکثر ${nf(max)} نفر`, `Up to ${max}`)}</div></div>
      <div class="stepper"><button data-q="-1" aria-label="-" ${qty <= 1 ? 'disabled' : ''}>${ico('minus', 18)}</button><output class="tnum">${nf(qty)}</output><button data-q="1" aria-label="+" ${qty >= max ? 'disabled' : ''}>${ico('plus', 18)}</button></div>
    </div>
    <div class="field"><label for="bk-name">${T('نام', 'Name')}</label><input id="bk-name" class="input" autocomplete="name" value="${esc(user.name)}" placeholder="${T('نام و نام خانوادگی', 'Full name')}"></div>
    <div class="field"><label for="bk-phone">${T('شمارهٔ موبایل', 'Mobile number')}</label><input id="bk-phone" class="input ltr" inputmode="tel" autocomplete="tel" value="${esc(fmtPhone(user.phone))}" placeholder="0912 345 6789" style="text-align:start"><span class="err-t" id="bk-err" hidden></span></div>
    <div class="bk-total">
      <div class="li-row"><span class="muted">${nf(qty)} × ${money(e.price)}</span><span>${money(e.price * qty)}</span></div>
      <div class="li-row tot"><span>${T('جمع', 'Total')}</span><b>${money(e.price * qty)}</b></div>
    </div>
    <p class="small muted" style="margin-top:14px;display:flex;gap:8px;align-items:flex-start">${ico('info', 16)}<span>${T('تا ۴۸ ساعت قبل از شروع، رزرو بدون کسر برمی‌گردد. این یک دموست؛ پرداخت واقعی انجام نمی‌شود.', 'Free cancellation up to 48 hours before the start. This is a demo — no real payment is taken.')}</span></p>`;
  const foot = () => `<button class="btn btn-primary btn-block" data-pay>${T('پرداخت و رزرو', 'Pay & reserve')} · ${money(e.price * qty)}</button>`;

  const s = openSheet({
    title: T('رزرو جا', 'Reserve your spot'),
    body: form(), foot: foot(),
  });
  const paint = () => { const n = s.$('#bk-name'), p = s.$('#bk-phone'); user.name = n?.value ?? user.name; user.phone = p?.value ?? user.phone; s.setBody(form()); s.setFoot(foot()); };
  s.el.addEventListener('click', (ev) => {
    const q = ev.target.closest('[data-q]');
    if (q) { qty = Math.min(max, Math.max(1, qty + Number(q.dataset.q))); paint(); return; }
    if (ev.target.closest('[data-pay]')) pay();
  });
  const pay = () => {
    const name = s.$('#bk-name').value.trim(), phone = s.$('#bk-phone').value;
    const err = s.$('#bk-err');
    if (name.length < 2) { s.$('#bk-name').classList.add('err'); s.$('#bk-name').focus(); return; }
    if (!validPhone(phone)) {
      const p = s.$('#bk-phone'); p.classList.remove('err'); void p.offsetWidth; p.classList.add('err');
      err.hidden = false; err.textContent = T('شماره باید با ۰۹ شروع شود و ۱۱ رقم باشد', 'Enter a mobile number starting with 09 (11 digits)'); p.focus(); return;
    }
    const btn = s.$('[data-pay]'); btn.innerHTML = '<span class="spin"></span>'; btn.classList.add('is-off');
    setTimeout(() => {
      const code = newCode(h.prefix);
      const b = { id: uid('b'), event: e.id, qty, name, phone: normPhone(phone), at: Date.now(), code };
      commit((st2) => {
        st2.bookings.push(b);
        st2.user.name = name; st2.user.phone = b.phone;
        const when = `${dFull(dateOf(e.day))}`;
        st2.inbox.unshift({
          id: uid('n'), ts: Date.now(), kind: 'booking', host: e.host,
          title: { fa: 'رزرو تأیید شد', en: 'Reservation confirmed' },
          body: { fa: `بلیت ${code} برای «${e.title.fa || e.title}» ساخته شد.`, en: `Ticket ${code} for “${e.title.en || e.title}” is ready.` },
          read: false,
        });
        if (e.host === 'jaryan') st2.inbox.unshift({
          id: uid('n'), ts: Date.now() + 1, kind: 'host', host: e.host,
          title: { fa: 'جریان', en: 'Jaryan' },
          body: { fa: 'نشانی دقیق و لوکیشن به‌زودی در همین‌جا برایت ارسال می‌شود. برای دیدنت خوشحالیم!', en: "Your exact address and location will arrive here shortly. Can't wait to see you!" },
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
        <h2 class="h1">${T('جایت رزرو شد.', "You're in.")}</h2>
        <p class="lede">${T('بلیتت در «بلیت‌ها» ساخته شد.', 'Your ticket is waiting under Tickets.')}</p>
        <div class="mini-ticket">
          <div class="mt-l"><div class="micro">${esc(L(h.name))}</div><div class="h3" style="margin-block:3px 6px">${esc(L(e.title))}</div><div class="small muted">${esc(dFull(dateOf(e.day)))} · ${esc(e.from)}</div><div class="code mt-code">${esc(b.code)}</div></div>
          <div class="mt-qr">${qr(b.code, 92)}</div>
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
        <div class="tk-qr">${qr(b.code, 184)}</div>
        <div class="tk-code code">${esc(b.code)}</div>
        <div class="tk-meta">
          <div><div class="micro">${T('مهمان', 'Guest')}</div><b>${esc(b.name)}</b></div>
          <div><div class="micro">${T('نفرات', 'Admits')}</div><b>${nf(b.qty)}</b></div>
          <div><div class="micro">${T('پرداخت', 'Paid')}</div><b>${money(e.price * b.qty)}</b></div>
        </div>
      </div>
      <p class="small muted" style="margin-top:14px">${esc(L(h.addressNote || { fa: 'نشانی دقیق از طرف میزبان ارسال می‌شود.', en: 'The host sends the exact address.' }))}</p>`,
    foot: e.day >= 0 ? `<div class="row-btns eq"><button class="btn btn-danger" data-cancel>${T('لغو رزرو', 'Cancel reservation')}</button><button class="btn btn-glass" data-act="share" data-id="${e.id}">${ico('share', 18)} ${T('اشتراک', 'Share')}</button></div>` : '',
  });
  s.el.addEventListener('click', async (ev) => {
    if (!ev.target.closest('[data-cancel]')) return;
    const ok = await confirmSheet({ title: T('لغو این رزرو؟', 'Cancel this reservation?'), text: T('جایت آزاد می‌شود و بلیت از لیست تو و میزبان حذف می‌شود.', 'Your spot is released and the ticket is removed for you and the host.'), ok: T('بله، لغو کن', 'Yes, cancel'), danger: true });
    if (!ok) return;
    commit((st) => { st.bookings = st.bookings.filter((x) => x.id !== bid); });
    s.close(); toast(T('رزرو لغو شد', 'Reservation cancelled'), 'check');
  });
}

on({
  book(el) { openBooking(el.dataset.id); },
  ticket(el) { openTicket(el.dataset.id); },
});
