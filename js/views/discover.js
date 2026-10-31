/* Discover — the platform's front door: what's on, which hosts are here. */
import { S } from '../store.js';
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
        <div class="micro hero-kick"><i class="dotlive"></i>${T('تبریز', 'Tabriz')} · ${T(`${nf(week)} رویداد این هفته`, `${week} events this week`)}</div>
        <h1 class="display">${T('رویدادهایی که <em>می‌ارزد</em> بروی.', 'Events worth <em>going</em> to.')}</h1>
        <p class="lede hero-sub">${T('میزبان‌ها رویدادشان را اینجا اداره می‌کنند؛ تو فقط بیا.', 'Hosts run their events here. You just show up.')}</p>
        <button class="searchbar glass" data-act="goSearch"><span>${ico('search', 19)}</span><span class="grow">${T('جستجوی رویداد، میزبان، دسته…', 'Search events, hosts, categories…')}</span><span class="kbd latin">/</span></button>
      </div>
      ${feat ? `<div class="hero-feat">${evHero(feat)}</div>` : ''}
    </section>

    <section class="block">
      <div class="rail cats">${CATEGORIES.map((c) => `<button class="cat" data-act="goCat" data-cat="${c.id}"><img src="${c.img}" alt="" loading="lazy" style="object-position:${c.pos}"><span>${esc(L(c))}</span></button>`).join('')}</div>
    </section>

    ${sectionHead(T('به‌زودی', 'Coming up'), linkBtn('#/explore', T('همه', 'See all')), T('رویدادهای نزدیک از همهٔ میزبان‌ها', 'Nearest events from every host'))}
    <div class="rail grid-lg">${rail.map(evTile).join('')}</div>

    ${sectionHead(T('میزبان‌ها', 'Hosts'), '', T('کسانی که اینجا رویدادشان را برگزار می‌کنند', 'The people who run events here'))}
    <div class="rail hosts">${hs.map(hostCard).join('')}</div>

    ${sectionHead(T('این هفته در جریان', 'This week at Jaryan'), linkBtn('#/h/jaryan', T('صفحهٔ میزبان', 'Host page')))}
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
        <h2 class="h1" style="margin-block:8px 10px">${T('رویدادت را اینجا اداره کن.', 'Run your events here.')}</h2>
        <p class="lede">${T('صفحهٔ اختصاصی، بلیت‌فروشی، لیست ورودی و مخاطبانی که می‌شناسی — همه در یک استودیو.', 'Your own page, ticketing, the door list and an audience you actually know — in one studio.')}</p>
      </div>
      <div class="cta-btns">
        <button class="btn btn-primary" data-act="mode" data-mode="studio">${T('دیدن استودیوی جریان', "See Jaryan's studio")} ${ico('arrow', 18)}</button>
      </div>
    </section>

    <p class="foot-note micro">${T('قیمت‌ها و تاریخ‌های جریان آزمایشی‌اند. سه میزبان دیگر نمونه‌اند و فقط برای نمایش پلتفرم اینجا هستند.', "Jaryan's prices and dates are placeholders. The other three hosts are samples, here only to show the platform.")}</p>
  </div>`;
}

on({
  goSearch() { prefs.q = ''; prefs.cat = null; prefs.focus = true; navigate('/explore'); },
  goCat(el) { prefs.cat = el.dataset.cat; prefs.q = ''; prefs.tab = 'events'; navigate('/explore'); },
});
