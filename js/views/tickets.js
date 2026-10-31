/* Tickets: what you've reserved, what you've saved. */
import { S } from '../store.js';
import { T, L } from '../i18n.js';
import { ico } from '../icons.js';
import { esc, nf, money, dNum, dMonthShort, dateOf, timeRange, relDay, qr } from '../util.js';
import { ticketsFor, myUpcoming, myPast, getEvent, getHost } from '../model.js';
import { poster, avatar, evRow, empty, tabs, panel } from '../ui.js';

export const title = () => T('بلیت‌ها', 'Tickets');

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
          ${cancelled ? `<span class="pill off">${T('لغو شد', 'Cancelled')}</span>` : ''}
        </div>
      </div>
      <div class="tk-qr-s">${qr(b.code, 64)}<span class="code">${esc(b.code)}</span></div>
    </button>
  </article>`;
}

export function render() {
  const up = myUpcoming(), past = myPast();
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
      : empty('ticket', T('هنوز بلیتی نداری', 'No tickets yet'), T('یک رویداد پیدا کن و جایت را رزرو کن؛ بلیتت همین‌جا ساخته می‌شود.', 'Find an event and reserve a spot — your ticket will appear right here.'), `<a class="btn btn-primary" href="#/">${T('کشف رویدادها', 'Discover events')} ${ico('arrow', 18)}</a>`))}
    ${panel('tickets', 'saved', saved.length
      ? `<div class="list-stack cols">${saved.map((e) => evRow(e)).join('')}</div>`
      : empty('bookmark', T('چیزی ذخیره نکرده‌ای', 'Nothing saved'), T('روی نشانک هر رویداد بزن تا برای بعد بماند.', 'Tap the bookmark on any event to keep it for later.'), `<a class="btn btn-glass" href="#/explore">${T('جستجو', 'Search events')}</a>`))}
    ${past.length ? panel('tickets', 'past', `<div class="tk-list">${past.map(ticketCard).join('')}</div>`) : ''}
    </div>
  </div>`;
}
