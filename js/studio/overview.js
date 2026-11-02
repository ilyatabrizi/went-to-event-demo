/* Overview — the first thing a host sees: what to set up next, their tools, money, seats, audience, what just happened. */
import { S, commit } from '../store.js';
import { T, L } from '../i18n.js';
import { ico } from '../icons.js';
import { esc, nf, money, compact, ago, dFull, dShort, dateOf, today0, relDay, timeRange, sum } from '../util.js';
import { revenue, revenueSeries, followerSeries, audience, nextEvent, seats, upcoming, eventsOf, getHost, getEvent, sources, activity, SEGMENTS, codes, rating, finances } from '../model.js';
import { nf1 } from '../util.js';
import { ME, SOURCES } from '../data.js';
import { avatar, person, ring, bars, area, poster, on, openSheet, toast } from '../ui.js';
import { pageHead, kpi } from './kit.js';
import { prefs as aprefs, openContact } from './audience.js';
import { prefs as bprefs } from './broadcast.js';
import { navigate } from '../app.js';

export const title = () => T('نمای کلی', 'Overview');

const greet = () => {
  const h = new Date().getHours();
  return h < 5 ? T('شب بخیر', 'Good night') : h < 12 ? T('صبح بخیر', 'Good morning') : h < 17 ? T('ظهر بخیر', 'Good afternoon') : h < 21 ? T('عصر بخیر', 'Good evening') : T('شب بخیر', 'Good evening');
};

function feedItem(a, by) {
  const c = by.get(a.c);
  const name = c ? L(c.name) : '';
  const ev = a.event ? getEvent(a.event) : null;
  const t = ev ? L(ev.title) : '';
  let icon = 'ticket', text = '';
  if (a.kind === 'book') { icon = 'ticket'; text = T(`<b>${esc(name)}</b> ${a.qty > 1 ? `برای ${nf(a.qty)} نفر ` : ''}جا گرفت: ${esc(t)}`, `<b>${esc(name)}</b> reserved ${a.qty > 1 ? a.qty + ' spots ' : 'a spot '}for ${esc(t)}`); }
  else if (a.kind === 'follow') { icon = 'heart'; text = T(`<b>${esc(name)}</b> دنبالت کرد`, `<b>${esc(name)}</b> followed Jaryan`); }
  else if (a.kind === 'save') { icon = 'bookmark'; text = T(`<b>${esc(name)}</b> «${esc(t)}» رو ذخیره کرد`, `<b>${esc(name)}</b> saved ${esc(t)}`); }
  else if (a.kind === 'msg') { icon = 'megaphone'; text = T(`یه پیام برای ${nf(a.n)} نفر فرستادی`, `You messaged ${a.n} people`); }
  const click = c ? `data-act="contact" data-id="${c.id}"` : '';
  return `<${c ? 'button' : 'div'} class="feed-row ${a.live ? 'live' : ''}" ${click}>
    <span class="feed-ico">${ico(icon, 16)}</span>
    <span class="grow feed-t">${text}</span>
    ${a.live ? `<span class="pill em">${T('تازه', 'New')}</span>` : ''}<span class="micro">${esc(ago(a.ts))}</span>
  </${c ? 'button' : 'div'}>`;
}

const pageUrl = () => location.href.split('#')[0].split('?')[0] + '#/h/' + ME;

function setupCard() {
  const st = S().studio;
  if (st.setupHidden) return '';
  const steps = [
    { done: st.page.tagline != null || st.page.about != null, t: T('معرفی صفحه‌تو بنویس', 'Write your page intro'), s: T('یه خط شعار و چند جمله درباره‌ی خودتون', 'A one-line tagline and a few sentences about you'), go: 'href="#/studio/page"' },
    { done: !!(st.page.phone || st.page.telegram), t: T('راه تماس بذار', 'Add a way to reach you'), s: T('شماره یا تلگرام، که مهمون‌ها راحت بپرسن', 'A phone number or Telegram so guests can ask'), go: 'href="#/studio/page"' },
    { done: st.created.length > 0, t: T('یه رویداد جدید بساز', 'Create a new event'), s: T('کمتر از یه دقیقه طول می‌کشه', 'Takes under a minute'), go: 'data-act="seNew"' },
    { done: st.codes != null, t: T('یه کد تخفیف بساز', 'Make a discount code'), s: T('برای مشتری‌های ثابت یا پست اینستاگرام', 'For regulars or an Instagram post'), go: 'href="#/studio/codes"' },
    { done: st.sharedPage, t: T('لینک صفحه‌تو تو بیو اینستاگرام بذار', 'Put your page link in your Instagram bio'), s: T('بزن تا لینک کپی بشه', 'Tap to copy the link'), go: 'data-act="ovCopyLink"' },
    { done: st.broadcasts.length > 0, t: T('اولین پیامتو بفرست', 'Send your first message'), s: T('یه یادآوری یا خبر رویداد بعدی', 'A reminder or news of the next event'), go: 'href="#/studio/broadcast"' },
  ];
  const n = steps.filter((x) => x.done).length;
  if (n === steps.length) return '';
  return `
    <section class="setup card hi">
      <div class="setup-head">
        <div class="grow"><div class="micro ember">${T('شروع کار', 'Getting started')}</div><h2 class="h2" style="margin-top:6px">${T('صفحه‌تو کامل کن', 'Finish setting up')}</h2></div>
        <div class="setup-n tnum">${T(`${nf(n)} از ${nf(steps.length)}`, `${n} of ${steps.length}`)}</div>
      </div>
      <div class="meter wide setup-bar"><i style="width:${Math.round((n / steps.length) * 100)}%"></i></div>
      <ol class="setup-list">${steps.map((x) => `<li><${x.go.startsWith('href') ? 'a' : 'button'} class="setup-i ${x.done ? 'done' : ''}" ${x.go}>
        <span class="setup-ck">${x.done ? ico('check', 14) : ''}</span>
        <span class="grow"><b>${x.t}</b><span class="small muted">${x.s}</span></span>${x.done ? '' : ico('chev', 16, 'chev')}</${x.go.startsWith('href') ? 'a' : 'button'}></li>`).join('')}</ol>
      <button class="btn btn-ghost btn-xs setup-later" data-act="setupHide">${T('بعداً', 'Later')}</button>
    </section>`;
}

function toolsGrid(next) {
  const cs = codes().filter((c) => c.state === 'on').length;
  const r = rating(ME), f = finances();
  const tiles = [
    { href: '#/studio/money', icon: 'wallet', t: T('مالی و تسویه', 'Money'), s: T(`${compact(f.available)} قابل برداشت`, `${compact(f.available)} ready`) },
    { href: '#/studio/codes', icon: 'tag', t: T('کد تخفیف', 'Discounts'), s: T(`${nf(cs)} کد فعال`, `${cs} active`) },
    { href: '#/studio/reviews', icon: 'star', t: T('نظرات', 'Reviews'), s: r.n ? T(`${nf1(r.avg)} از ${nf(r.n)} نظر`, `${nf1(r.avg)} · ${r.n} reviews`) : T('هنوز نظری نیست', 'None yet') },
    { href: next ? `#/studio/events/${next.id}` : '#/studio/events', icon: 'scan', t: T('اسکن بلیت', 'Scan tickets'), s: next ? esc(L(next.title)) : T('رویداد بعدی', 'Next event') },
    { href: '#/h/' + ME, icon: 'eye', t: T('صفحه‌ی عمومی', 'Public page'), s: T('ببین مردم چی می‌بینن', 'See what visitors see') },
    { act: 'ovCopyLink', icon: 'link', t: T('لینک صفحه', 'Page link'), s: T('کپی برای اینستاگرام', 'Copy for Instagram') },
  ];
  return `<section class="tools">${tiles.map((x) => `<${x.href ? `a href="${x.href}"` : `button data-act="${x.act}"`} class="tool"><span class="tool-ico">${ico(x.icon, 19)}</span><b>${x.t}</b><span class="small muted">${x.s}</span></${x.href ? 'a' : 'button'}>`).join('')}</section>`;
}

export function render() {
  const h = getHost(ME);
  const rev = revenue();
  const next = nextEvent();
  const aud = audience();
  const by = new Map(aud.map((c) => [c.id, c]));
  const series = revenueSeries(14);
  const fol = followerSeries(14);
  const act = activity(8);
  const src = sources();
  const ups = upcoming().filter((e) => e.host === ME);
  const taken = sum(ups, (e) => seats(e).taken), cap = sum(ups, (e) => e.seats);
  const counts = Object.fromEntries(SEGMENTS.map((s) => [s.id, aud.filter(s.test).length]));
  const labels = series.map((_, i) => dShort(dateOf(-(13 - i))));
  const week = sum(series.slice(-7));
  const ns = next ? seats(next) : null;

  return `
  <div class="wrap st-wrap">
    ${pageHead(`${greet()}${T('،', ',')} ${esc(L(h.name))}`, esc(dFull(today0())),
      `<button class="btn btn-glass btn-sm" data-act="seNew">${ico('plus', 15)} ${T('رویداد تازه', 'New event')}</button><a class="btn btn-primary btn-sm" href="#/studio/broadcast">${ico('megaphone', 15)} ${T('پیام به مخاطب‌ها', 'Message audience')}</a>`)}

    ${setupCard()}

    <section class="kpis">
      ${kpi({ label: T('درآمد', 'Revenue'), value: rev.paid, fmt: 'compact', sub: rev.pending ? T(`${compact(rev.pending)} تو راهه`, `${compact(rev.pending)} pending`) : T('تومان', 'toman'), icon: 'wallet', hi: true })}
      ${kpi({ label: T('جاهای رزروشده', 'Seats booked'), value: taken, sub: T(`از ${nf(cap)} جای رویدادهای پیش رو`, `of ${cap} across upcoming`), icon: 'ticket' })}
      ${kpi({ label: T('مخاطب‌ها', 'Audience'), value: aud.length, sub: T(`${nf(counts.customers)} مشتری · ${nf(counts.engagers)} دنبال‌کننده`, `${counts.customers} customers · ${counts.engagers} engagers`), icon: 'users' })}
      ${kpi({ label: T('دنبال‌کننده‌ها', 'Followers'), value: h.followersNow, fmt: 'int', sub: T(`+${nf(fol[13] - fol[0])} در ۱۴ روز`, `+${fol[13] - fol[0]} in 14 days`), icon: 'heart' })}
    </section>

    ${toolsGrid(next)}

    <section class="ov-grid">
      <div class="card ov-rev">
        <div class="card-top"><div><div class="micro">${T('درآمد ۱۴ روز اخیر', 'Revenue · last 14 days')}</div><div class="h2 tnum" style="margin-top:4px">${compact(sum(series))} <span class="small muted">${T('تومان', 'toman')}</span></div></div>
          <span class="pill">${T(`${compact(week)} این هفته`, `${compact(week)} this week`)}</span></div>
        ${bars(series, { h: 132, labels })}
        <div class="axis micro"><span>${labels[0]}</span><span>${T('امروز', 'Today')}</span></div>
      </div>

      ${next ? `<div class="card ov-next">
        <div class="micro">${T('رویداد بعدی', 'Next event')} · ${esc(relDay(next.day))}</div>
        <div class="ov-next-row">
          <div class="thumb">${poster(next, 480)}</div>
          <div class="grow"><h3 class="h2 clamp2">${esc(L(next.title))}</h3><div class="small muted">${esc(dFull(dateOf(next.day)))} · ${esc(timeRange(next.from, next.to))}</div></div>
        </div>
        <div class="ov-next-stats">${ring(ns.fill, 58, 6)}<div><b class="tnum">${nf(ns.taken)}<span class="muted">/${nf(ns.total)}</span></b><div class="small muted">${ns.full ? T('تکمیل', 'Sold out') : T(`${nf(ns.left)} جای خالی`, `${ns.left} spots left`)}</div></div></div>
        <div class="row-btns eq"><a class="btn btn-glass btn-sm" href="#/studio/events/${next.id}">${ico('scan', 15)} ${T('لیست ورودی', 'Door list')}</a><button class="btn btn-glass btn-sm" data-act="ovMsgNext">${ico('megaphone', 15)} ${T('پیام به مهمون‌ها', 'Message guests')}</button></div>
      </div>` : `<div class="card ov-next"><div class="micro">${T('رویداد بعدی', 'Next event')}</div><p class="small muted" style="margin-block:10px 16px">${T('فعلاً رویدادی تو برنامه نداری.', 'Nothing upcoming.')}</p><button class="btn btn-primary btn-sm" data-act="seNew">${T('رویداد تازه', 'New event')}</button></div>`}
    </section>

    <section class="ov-grid b">
      <div class="card">
        <div class="card-top"><div class="micro">${T('مخاطب‌ها', 'Audience')}</div><a class="link-more" href="#/studio/audience">${T('همه', 'Open')}${ico('chev', 16)}</a></div>
        <div class="seg-tiles">
          ${[['customers', 'users'], ['engagers', 'heart'], ['vip', 'star'], ['lapsed', 'refresh']].map(([id, ic]) => { const s = SEGMENTS.find((x) => x.id === id); return `<button class="seg-tile" data-act="ovSeg" data-seg="${id}"><span class="kpi-ico">${ico(ic, 16)}</span><b class="tnum">${nf(counts[id])}</b><span class="small muted">${esc(L(s))}</span></button>`; }).join('')}
        </div>
        <div class="micro" style="margin:20px 0 8px">${T('رشد دنبال‌کننده‌ها', 'Follower growth')}</div>
        ${area(fol, { h: 74 })}
      </div>

      <div class="card">
        <div class="micro">${T('مخاطب‌هات از کجا اومدن', 'Where your audience comes from')}</div>
        <div class="srcs">${src.map((s) => `<div class="src"><div class="src-top"><span>${esc(L(SOURCES[s.id]) || s.id)}</span><span class="micro tnum">${nf(s.n)}</span></div><div class="meter wide"><i style="width:${Math.round(s.share * 100)}%"></i></div></div>`).join('')}</div>
      </div>

      <div class="card feed">
        <div class="card-top"><div class="micro">${T('تازه‌ترین‌ها', 'Recent activity')}</div><span class="dotlive"></span></div>
        ${act.length ? act.map((a) => feedItem(a, by)).join('') : `<p class="small muted">${T('هنوز خبری نیست.', 'Nothing yet.')}</p>`}
      </div>
    </section>
  </div>`;
}

on({
  setupHide() { commit((s) => { s.studio.setupHidden = true; }); },
  ovCopyLink() {
    const url = pageUrl();
    const done = () => { commit((s) => { s.studio.sharedPage = true; }); toast(T('لینک صفحه کپی شد؛ بذارش تو بیو اینستاگرام', 'Link copied — put it in your Instagram bio'), 'link'); };
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done).catch(done); else done();
  },
  ovSeg(el) { aprefs.seg = el.dataset.seg; navigate('/studio/audience'); },
  ovMsgNext() { bprefs.to = null; bprefs.seg = 'next'; navigate('/studio/broadcast'); },
});
