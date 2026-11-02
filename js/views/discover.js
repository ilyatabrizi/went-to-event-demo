/* Discover — the platform's front door: what's on, which hosts are here. */
import { S, commit } from '../store.js';
import { authed } from '../auth.js';
import { T, L } from '../i18n.js';
import { ico } from '../icons.js';
import { esc, nf, money, compact, relDay } from '../util.js';
import { CATEGORIES, ME } from '../data.js';
import { upcoming, hosts, getHost, eventsOf, seats, isLive, byTime } from '../model.js';
import { sectionHead, linkBtn, evTile, evRow, on, avatar, verified } from '../ui.js';
import { evHero, hostCard, followBtn } from '../cards.js';
import { prefs } from './explore.js';
import { navigate } from '../app.js';

export const title = () => T('کشف', 'Discover');

export function render() {
  const ups = upcoming();
  const feat = ups[0];
  const week = ups.filter((e) => e.day <= 7).length;
  const rail = ups.slice(1, 10);
  const jar = getHost(ME);
  const jarNext = eventsOf(ME).filter((e) => isLive(e) && e.day >= 0).sort(byTime).slice(0, 3);
  const hs = hosts();

  return `
  <div class="wrap" style="--gut:clamp(16px,4.2vw,36px)">
    <section class="hero-grid">
      <div class="hero-copy">
        <div class="micro hero-kick"><i class="dotlive"></i>${T('تبریز', 'Tabriz')} · ${T(`${nf(week)} تا رویداد این هفته`, `${week} events this week`)}</div>
        <h1 class="display">${T('رویدادهایی که <em>ارزش رفتن</em> دارن.', 'Events worth <em>going</em> to.')}</h1>
        <p class="lede hero-sub">${T('رویدادهای باحال شهرت رو پیدا کن، با دو تا تپ جاتو بگیر و فقط بیا.', 'Find the best events in your city, grab a spot in two taps, and just show up.')}</p>
        <button class="searchbar glass" data-act="goSearch"><span>${ico('search', 19)}</span><span class="grow">${T('دنبال چی می‌گردی؟ رویداد، میزبان…', 'Search events, hosts, categories…')}</span><span class="kbd latin">/</span></button>
      </div>
      ${feat ? `<div class="hero-feat">${evHero(feat)}</div>` : ''}
    </section>

    ${S().howDismissed ? '' : `
    <section class="how card">
      <div class="how-head"><div><div class="micro ember">${T('اولین باره اینجایی؟', 'First time here?')}</div><h2 class="h3" style="margin-top:4px">${T('اینجا اینجوری کار می‌کنه', 'Here is how it works')}</h2></div>
        <button class="icon-btn" data-act="howHide" aria-label="${T('بستن', 'Close')}">${ico('x', 18)}</button></div>
      <ol class="how-steps">
        <li><span class="how-n">${ico('search', 18)}</span><div><b>${T('یه رویداد پیدا کن', 'Find an event')}</b><span>${T('از دسته‌ها، جستجو یا صفحه‌ی میزبان‌ها', 'By category, search or host pages')}</span></div></li>
        <li><span class="how-n">${ico('ticket', 18)}</span><div><b>${T('با دو تا تپ رزرو کن', 'Reserve in two taps')}</b><span>${T('فقط اسم و شماره‌ت لازمه، حساب کاربری نمی‌خواد', 'Just your name and number — no account needed')}</span></div></li>
        <li><span class="how-n">${ico('scan', 18)}</span><div><b>${T('دم در بلیتتو نشون بده', 'Show your ticket at the door')}</b><span>${T('بلیتت تو بخش Tickets منتظرته', 'It waits for you under Tickets')}</span></div></li>
      </ol>
    </section>`}

    <section class="block">
      <div class="rail cats">${CATEGORIES.map((c) => `<button class="cat" data-act="goCat" data-cat="${c.id}"><img src="${c.img}" alt="" loading="lazy" style="object-position:${c.pos}"><span>${esc(L(c))}</span></button>`).join('')}</div>
    </section>

    ${sectionHead(T('به‌زودی', 'Coming up'), linkBtn('#/explore', T('همه', 'See all')), T('نزدیک‌ترین رویدادها از همه‌ی میزبان‌ها', 'Nearest events from every host'))}
    <div class="rail grid-lg">${rail.map(evTile).join('')}</div>

    ${sectionHead(T('میزبان‌ها', 'Hosts'), '', T('کسایی که رویداداشونو اینجا برگزار می‌کنن', 'The people who run events here'))}
    <div class="rail hosts">${hs.map(hostCard).join('')}</div>

    ${sectionHead(T('این هفته تو جریان', 'This week at Jaryan'), linkBtn('#/h/jaryan', T('صفحه‌ی میزبان', 'Host page')))}
    <section class="spot">
      <a class="spot-card" href="#/h/jaryan">
        <img src="media/hero-poster.webp" alt="" loading="lazy">
        <div class="spot-over">
          <div class="spot-top">${avatar(jar, 46)}<div><div class="h3" style="display:flex;gap:6px;align-items:center">${esc(L(jar.name))} ${verified(16)}</div><div class="micro">${esc(L(jar.city))}</div></div></div>
          <div><p class="spot-line">${esc(L(jar.tagline))}</p></div>
        </div>
      </a>
      <div class="list-stack">${jarNext.map((e) => evRow(e, { showHost: false })).join('')}</div>
    </section>

    <section class="cta-band">
      <div>
        <div class="micro ember">${T('برای میزبان‌ها', 'For hosts')}</div>
        <h2 class="h1" style="margin-block:8px 10px">${T('رویدادتو اینجا برگزار کن.', 'Run your events here.')}</h2>
        <p class="lede">${T('صفحه‌ی اختصاصی، فروش بلیت، لیست ورودی و مخاطب‌هایی که می‌شناسیشون؛ همه تو یه پنل.', 'Your own page, ticketing, the door list and an audience you actually know — in one panel.')}</p>
      </div>
      <div class="cta-btns">
        <a class="btn btn-primary" href="${authed() ? '#/studio' : '#/login'}">${authed() ? T('رفتن به پنل', 'Go to your panel') : T('ورود میزبان‌ها', 'Host sign-in')} ${ico('arrow', 18)}</a>
      </div>
    </section>
  </div>`;
}

on({
  howHide() { commit((s) => { s.howDismissed = true; }); },
  goSearch() { prefs.q = ''; prefs.cat = null; prefs.focus = true; navigate('/explore'); },
  goCat(el) { prefs.cat = el.dataset.cat; prefs.q = ''; prefs.tab = 'events'; navigate('/explore'); },
});
