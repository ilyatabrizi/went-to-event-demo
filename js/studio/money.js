/* Money: what's ready to withdraw, what's waiting on upcoming events, what each event sold, and payouts. */
import { commit } from '../store.js';
import { T, L } from '../i18n.js';
import { ico } from '../icons.js';
import { esc, nf, money, compact, dFull, uid } from '../util.js';
import { finances } from '../model.js';
import { PAYOUT_ACCOUNT } from '../data.js';
import { on, openSheet, toast, poster } from '../ui.js';
import { pageHead } from './kit.js';

export const title = () => T('مالی و تسویه', 'Money & payouts');

const status = (p) => (p.status === 'done'
  ? `<span class="pill ok">${T('واریز شد', 'Paid out')}</span>`
  : `<span class="pill em">${T('در حال بررسی', 'Processing')}</span>`);

export function render() {
  const f = finances();
  return `
  <div class="wrap st-wrap">
    <a class="back-link" href="#/studio">${ico('back', 16)} ${T('پنل', 'Panel')}</a>
    ${pageHead(T('مالی و تسویه', 'Money & payouts'), T('پول هر رویداد بعد از برگزاری‌ش آزاد می‌شه و می‌تونی برداشتش کنی.', 'Money from each event is released once it has happened, ready to withdraw.'))}

    <section class="money-hero card hi">
      <div class="micro">${T('قابل برداشت', 'Available to withdraw')}</div>
      <div class="money-big tnum" data-count="${f.available}" data-fmt="int">0</div>
      <div class="small muted">${T('تومان', 'toman')}</div>
      <button class="btn btn-primary" data-act="payReq" ${f.available < 100000 ? 'disabled' : ''}>${ico('wallet', 17)} ${T('درخواست تسویه', 'Request payout')}</button>
      <div class="small muted money-acct">${ico('lock', 14)} ${T(`به حساب شبای منتهی به ${nf(Number(PAYOUT_ACCOUNT.last4))}`, `To the IBAN ending ${PAYOUT_ACCOUNT.last4}`)}</div>
    </section>

    <section class="mini-kpis three">
      <div class="card"><span class="micro">${T('مال رویدادهای پیش رو', 'Held for upcoming')}</span><b class="tnum">${compact(f.upcoming)}</b><span class="small muted">${T('بعد از برگزاری آزاد می‌شه', 'Released after the event')}</span></div>
      <div class="card"><span class="micro">${T('دم در گرفته می‌شه', 'To collect at the door')}</span><b class="tnum">${compact(f.unpaid)}</b><span class="small muted">${T('رزروهایی که هنوز پرداخت نشدن', 'Bookings not paid yet')}</span></div>
      <div class="card"><span class="micro">${T('تا حالا واریز شده', 'Paid out so far')}</span><b class="tnum">${compact(f.settled)}</b><span class="small muted">${T(`${nf(f.payouts.length)} بار تسویه`, `${f.payouts.length} payouts`)}</span></div>
    </section>

    <h2 class="h2 sub-h">${T('فروش هر رویداد', 'Sales by event')}</h2>
    <div class="list money-rows">${f.rows.map((r) => `
      <a class="li" href="#/studio/events/${r.e.id}">
        <div class="thumb sm">${poster(r.e, 480)}</div>
        <div class="grow"><div class="li-t">${esc(L(r.e.title))}</div><div class="li-s">${esc(dFull(new Date(Date.now() + r.e.day * 864e5)))}${r.promo ? ` · ${T(`${compact(r.promo)} تخفیف داده شد`, `${compact(r.promo)} in discounts`)}` : ''}</div></div>
        <div class="money-cell"><b class="tnum">${compact(r.paid)}</b>${r.unpaid ? `<span class="micro ember">+${compact(r.unpaid)} ${T('دم در', 'at door')}</span>` : `<span class="micro">${r.e.day < 0 ? T('آزاد شده', 'Released') : T('در انتظار', 'Held')}</span>`}</div>
      </a>`).join('')}</div>

    <h2 class="h2 sub-h">${T('تسویه‌ها', 'Payouts')}</h2>
    <div class="list">${f.payouts.map((p) => `
      <div class="li"><span class="li-ico">${ico('wallet', 18)}</span>
        <div class="grow"><div class="li-t tnum">${money(p.amount)}</div><div class="li-s">${esc(dFull(new Date(p.ts)))} · <span class="latin">${esc(p.ref)}</span></div></div>
        ${status(p)}</div>`).join('')}</div>
  </div>`;
}

on({
  payReq() {
    const f = finances();
    const s = openSheet({
      title: T('درخواست تسویه', 'Request a payout'),
      body: `
        <div class="pay-sum"><span class="micro">${T('مبلغ', 'Amount')}</span><b class="tnum">${money(f.available)}</b></div>
        <div class="li-plain" style="margin-top:14px">${ico('lock', 18)}<div><div class="micro">${T('واریز به', 'Paid to')}</div><div>${esc(L(PAYOUT_ACCOUNT.holder))} · ${T(`شبای منتهی به ${nf(Number(PAYOUT_ACCOUNT.last4))}`, `IBAN ending ${PAYOUT_ACCOUNT.last4}`)}</div></div></div>
        <p class="small muted" style="margin-top:14px">${T('معمولاً تا یه روز کاری به حسابت می‌رسه.', 'Usually lands within one working day.')}</p>`,
      foot: `<button class="btn btn-primary btn-block" data-go>${T('تأیید و ثبت درخواست', 'Confirm request')}</button>`,
    });
    s.el.addEventListener('click', (ev) => {
      if (!ev.target.closest('[data-go]')) return;
      commit((st) => { st.studio.payouts.unshift({ id: uid('p'), amount: f.available, ts: Date.now(), status: 'pending', ref: 'STL-' + (48300 + st.studio.payouts.length + 1) }); });
      s.close(); toast(T('درخواستت ثبت شد', 'Payout requested'), 'wallet');
    });
  },
});

