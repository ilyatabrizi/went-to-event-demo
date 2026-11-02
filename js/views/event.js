/* One event. The top bar and tab bar step away; a floating glass dock carries back / share / save and the reserve bar. */
import { S } from '../store.js';
import { T, L, LL } from '../i18n.js';
import { ico } from '../icons.js';
import { esc, nf, money, dFull, dateOf, timeRange, relDay } from '../util.js';
import { getEvent, getHost, seats, eventsOf, isLive, byTime, following } from '../model.js';
import { FAQ, ME, jimg } from '../data.js';
import { poster, avatar, verified, sampleTag, catName, evTile, sectionHead, empty, on, dchip, openSheet } from '../ui.js';
import { followBtn } from '../cards.js';
import { navigate } from '../app.js';

export const title = (id) => { const e = getEvent(id); return e ? L(e.title) : T('رویداد', 'Event'); };

const fact = (icon, label, value, sub = '') => `
  <div class="fact"><span class="f-ico">${ico(icon, 19)}</span>
    <div><div class="micro">${label}</div><div class="f-v">${value}</div>${sub ? `<div class="small muted">${sub}</div>` : ''}</div></div>`;

const list = (items) => `<ul class="tick-list">${items.map((x) => `<li>${ico('check', 17)}<span>${esc(x)}</span></li>`).join('')}</ul>`;

export function render(id) {
  const e = getEvent(id);
  if (!e) {
    return `<div class="wrap">${empty('info', T('این رویداد پیدا نشد', 'Event not found'), T('شاید کنسل یا پاک شده باشه.', 'It may have been cancelled or removed.'), `<a class="btn btn-primary" href="#/">${T('برگرد به صفحه‌ی اول', 'Back to Discover')}</a>`)}</div>`;
  }
  const h = getHost(e.host), s = seats(e), d = dateOf(e.day);
  const body = LL(e.body), learn = LL(e.learn), inc = LL(e.includes);
  const more = eventsOf(e.host).filter((x) => isLive(x) && x.day >= 0 && x.id !== e.id).sort(byTime).slice(0, 8);
  const place = h.address ? L(h.address) : L(h.city);
  const gal = (e.gallery || []).filter(Boolean);
  const cancelled = e.status === 'cancelled';

  return `
  <div class="wrap ev-page">
    <div class="ev-grid">
      <div class="ev-side">
        <div class="ev-cover">
          ${poster(e, 960)}
          <div class="ev-cover-fade"></div>
          ${dchip(e)}
        </div>
      </div>

      <div class="ev-main">
        ${cancelled ? `<div class="banner warn">${ico('info', 18)}<span>${T('این رویداد کنسل شده.', 'This event has been cancelled.')}</span></div>` : ''}
        <div class="micro ev-kicker">${esc(catName(e))}${e.day === 0 ? ` · <span class="ember">${T('امروز', 'Today')}</span>` : ''}</div>
        <h1 class="h1 ev-h">${esc(L(e.title))}</h1>
        <p class="lede ev-lede">${esc(L(e.lede))}</p>

        <a class="ev-host-row" href="#/h/${h.id}">
          ${avatar(h, 44)}
          <div class="grow"><div class="h3">${esc(L(h.name))} ${h.verified ? verified(15) : ''}</div>
            <div class="micro" style="margin-top:2px"><span data-fcount="${h.id}">${nf(h.followersNow)}</span> ${T('دنبال‌کننده', 'followers')}${h.sample ? ' ' + sampleTag() : ''}</div></div>
          ${followBtn(h.id, 'sm')}
        </a>

        <div class="facts">
          ${fact('calendar', T('تاریخ', 'Date'), esc(dFull(d)), esc(relDay(e.day)))}
          ${fact('clock', T('ساعت', 'Time'), `${esc(timeRange(e.from, e.to))}`)}
          ${fact('pin', T('مکان', 'Where'), esc(place), h.addressNote && e.host === ME ? esc(L(h.addressNote)) : '')}
          ${fact('spark', T('سطح', 'Level'), esc(L(e.level) || T('برای همه', 'For everyone')))}
        </div>

        ${body.length ? `<section class="ev-sec"><h2 class="h2">${T('درباره‌ی این رویداد', 'About this event')}</h2>${body.map((p) => `<p class="body-p">${esc(p)}</p>`).join('')}</section>` : ''}

        ${learn.length ? `<section class="ev-sec"><h2 class="h2">${T('اونجا چی کار می‌کنیم', "What you'll do")}</h2>${list(learn)}</section>` : ''}
        ${inc.length ? `<section class="ev-sec"><h2 class="h2">${T('تو بلیتت هست', "What's included")}</h2>${list(inc)}</section>` : ''}

        ${e.day >= 0 && !cancelled ? `
        <section class="ev-sec">
          <div class="seat-card">
            <div class="grow">
              <div class="micro">${T('ظرفیت', 'Capacity')}</div>
              <div class="h3" style="margin-top:3px">${s.full ? T('ظرفیت پر شد', 'Sold out') : T(`${nf(s.left)} جا از ${nf(s.total)} جا مونده`, `${s.left} of ${s.total} spots left`)}</div>
              <div class="meter wide"><i style="width:${Math.round(s.fill * 100)}%"></i></div>
            </div>
          </div>
        </section>` : ''}

        ${gal.length ? `<section class="ev-sec"><h2 class="h2">${T('عکس‌های اینجا', 'From the space')}</h2>
          <div class="rail mini-gal" style="--gut:0px">${gal.map((k) => `<button class="g-th" data-act="photo" data-src="${jimg(k, 960)}"><img src="${jimg(k, 480)}" alt="" loading="lazy"></button>`).join('')}</div></section>` : ''}

        ${e.host === ME ? `<section class="ev-sec"><h2 class="h2">${T('پرسش‌های پرتکرار', 'Good to know')}</h2>
          <div>${FAQ.map((f) => `<details class="faq"><summary><span>${esc(L(f.q))}</span><span class="pm">${ico('plus', 15)}</span></summary><p>${esc(L(f.a))}</p></details>`).join('')}</div></section>` : ''}

        ${more.length ? `${sectionHead(T(`بقیه‌ی برنامه‌های ${L(h.name)}`, `More from ${L(h.name)}`), `<a class="link-more" href="#/h/${h.id}">${T('صفحه‌ی میزبان', 'Host page')}${ico('chev', 16)}</a>`)}
          <div class="rail" style="--gut:0px">${more.map(evTile).join('')}</div>` : ''}
      </div>
    </div>
  </div>`;
}

/* floating controls + reserve bar — outside #view so position:fixed isn't trapped by its entry animation */
export function dock(id) {
  const e = getEvent(id); if (!e) return '';
  const s = seats(e);
  const mine = S().bookings.filter((b) => b.event === e.id);
  const saved = S().saved.includes(e.id);
  let buy;
  if (e.status === 'cancelled') {
    buy = `<div class="dk-price"><b>${T('کنسل شد', 'Cancelled')}</b></div><a class="btn btn-glass" href="#/h/${e.host}">${T('رویدادهای دیگر', 'Other events')}</a>`;
  } else if (e.day < 0) {
    buy = `<div class="dk-price"><b>${T('برگزار شد', 'Held')}</b><span class="micro">${esc(relDay(e.day))}</span></div><a class="btn btn-glass" href="#/h/${e.host}">${T('برنامه‌های بعدی', 'Upcoming events')}</a>`;
  } else if (mine.length) {
    const n = mine.reduce((a, b) => a + b.qty, 0);
    buy = `<div class="dk-price"><b>${T('جات رزرو شده', "You're in")}</b><span class="micro">${T(`${nf(n)} نفر`, `${n} guest${n > 1 ? 's' : ''}`)}</span></div>
      <button class="btn btn-bone" data-act="ticket" data-id="${mine[0].id}">${ico('ticket', 18)} ${T('دیدن بلیت', 'View ticket')}</button>`;
  } else if (s.full) {
    buy = `<div class="dk-price"><b>${T('ظرفیت پر شده', 'Sold out')}</b><span class="micro">${T('اگه جا خالی شد خبرم کن', 'Follow to hear first')}</span></div>
      <button class="btn btn-glass" disabled>${T('تکمیل', 'Sold out')}</button>`;
  } else {
    buy = `<div class="dk-price"><b>${money(e.price)}</b><span class="micro">${s.left <= 5 ? `<span class="ember">${T(`${nf(s.left)} جای خالی`, `${s.left} left`)}</span>` : T('برای هر نفر', 'per person')}</span></div>
      <button class="btn btn-primary" data-act="book" data-id="${e.id}">${T('رزرو کن', 'Reserve')} ${ico('arrow', 18)}</button>`;
  }
  return `
  <div class="dk-top">
    <button class="icon-btn glass dk-btn" data-act="back" aria-label="${T('برگشت', 'Back')}">${ico('back', 20)}</button>
    <div class="dk-top-r">
      <button class="icon-btn glass dk-btn" data-act="share" data-id="${e.id}" aria-label="${T('اشتراک', 'Share')}">${ico('share', 19)}</button>
      <button class="icon-btn glass dk-btn dk-save ${saved ? 'on' : ''}" data-act="save" data-id="${e.id}" aria-pressed="${saved}" aria-label="${T('ذخیره', 'Save')}">${ico('bookmark', 19)}</button>
    </div>
  </div>
  <div class="dk-buy glass">${buy}</div>`;
}

on({
  back() { if (history.length > 1) history.back(); else navigate('/'); },
  photo(el) { openSheet({ title: '', cls: 'lightbox', body: `<img class="lb-img" src="${el.dataset.src}" alt="">` }); },
});
