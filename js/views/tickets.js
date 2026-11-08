/* Tickets: what you've reserved, what you've saved. */
import { S } from '../store.js';
import { T, L } from '../i18n.js';
import { ico } from '../icons.js';
import { esc, nf, money, dNum, dMonthShort, dateOf, timeRange, relDay, qr, ticketPayload } from '../util.js';
import { ticketsFor, myUpcoming, myPast, getEvent, getHost } from '../model.js';
import { poster, avatar, evRow, empty, tabs, panel } from '../ui.js';

export const title = () => T('بلیت‌ها', 'Tickets');

let reviewed = new Set();
function ticketCard(b) {
  const e = b.ev, h = getHost(e.host), d = dateOf(e.day);
  const cancelled = e.status === 'cancelled';
  return `<article class="tk-card ${e.day < 0 ? 'past' : ''}">
    <button class="tk-main" data-act="ticket" data-id="${b.id}" aria-label="${esc(L(e.title))}">
      <div class="tk-thumb">${poster(e, 480)}</div>
      <div class="tk-info">
        <div class="micro" style="display:flex;align-items:center;gap:7px">${avatar(h, 16)}<span>${esc(L(h.name))}</span></div>
        <h3 class="h3 tk-t">${esc(L(e.title))}</h3>
        <div class="small muted">${dNum(d)} ${dMonthShort(d)} · ${esc(timeRange(e.from, e.to))}</div>
        <div class="tk-chips">
          <span class="pill ${e.day === 0 ? 'em' : ''}">${esc(relDay(e.day))}</span>
          <span class="pill">${T(`${nf(b.qty)} نفر`, `${b.qty} guest${b.qty > 1 ? 's' : ''}`)}</span>
          ${cancelled ? `<span class="pill off">${T('کنسل شد', 'Cancelled')}</span>` : ''}
        </div>
      </div>
      <div class="tk-qr-s">${qr(ticketPayload(b), 64)}<span class="code">${esc(b.code)}</span></div>
    </button>
    ${e.day < 0 && !cancelled && !reviewed.has(e.id) ? `<button class="btn btn-glass btn-xs tk-rev" data-act="revWrite" data-host="${e.host}">${ico('star', 14)} ${T('چطور بود؟ نظر بده', 'How was it? Leave a review')}</button>` : ''}
  </article>`;
}

export function render() {
  const up = myUpcoming(), past = myPast();
  reviewed = new Set(S().reviews.map((r) => r.event));
  const saved = S().saved.map(getEvent).filter((e) => e && e.status !== 'cancelled');
  const items = [{ id: 'up', label: T('پیش رو', 'Upcoming'), n: up.length }, { id: 'saved', label: T('ذخیره‌شده', 'Saved'), n: saved.length }];
  if (past.length) items.push({ id: 'past', label: T('گذشته', 'Past'), n: past.length });
  return `
  <div class="wrap">
    <h1 class="h1" style="margin-bottom:20px">${T('بلیت‌ها', 'Tickets')}</h1>
    ${tabs('tickets', items, 'up')}
    <div class="tk-panels">
    ${panel('tickets', 'up', up.length
      ? `<div class="tk-list">${up.map(ticketCard).join('')}</div>`
      : empty('ticket', T('هنوز بلیت نداری', 'No tickets yet'), T('یه رویداد پیدا کن و جاتو رزرو کن؛ بلیتت همین‌جا ساخته می‌شه.', 'Find an event and reserve a spot — your ticket will appear right here.'), `<a class="btn btn-primary" href="#/">${T('بریم رویدادها رو ببینیم', 'Discover events')} ${ico('arrow', 18)}</a>`))}
    ${panel('tickets', 'saved', saved.length
      ? `<div class="list-stack cols">${saved.map((e) => evRow(e)).join('')}</div>`
      : empty('bookmark', T('هنوز چیزی ذخیره نکردی', 'Nothing saved'), T('روی آیکن ذخیره‌ی هر رویداد بزن تا برای بعد بمونه.', 'Tap the bookmark on any event to keep it for later.'), `<a class="btn btn-glass" href="#/explore">${T('جستجو', 'Search events')}</a>`))}
    ${past.length ? panel('tickets', 'past', `<div class="tk-list">${past.map(ticketCard).join('')}</div>`) : ''}
    </div>
  </div>`;
}
