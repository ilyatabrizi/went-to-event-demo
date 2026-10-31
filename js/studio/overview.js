/* Overview — the first thing a host sees: money, seats, audience, what just happened. */
import { S, commit } from '../store.js';
import { T, L } from '../i18n.js';
import { ico } from '../icons.js';
import { esc, nf, money, compact, ago, dFull, dShort, dateOf, today0, relDay, timeRange, sum } from '../util.js';
import { revenue, revenueSeries, followerSeries, audience, nextEvent, seats, upcoming, eventsOf, getHost, getEvent, sources, activity, SEGMENTS } from '../model.js';
import { ME, SOURCES } from '../data.js';
import { avatar, person, ring, bars, area, poster, on, openSheet } from '../ui.js';
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
  else if (a.kind === 'follow') { icon = 'heart'; text = T(`<b>${esc(name)}</b> جریان را دنبال کرد`, `<b>${esc(name)}</b> followed Jaryan`); }
  else if (a.kind === 'save') { icon = 'bookmark'; text = T(`<b>${esc(name)}</b> «${esc(t)}» را ذخیره کرد`, `<b>${esc(name)}</b> saved ${esc(t)}`); }
  else if (a.kind === 'msg') { icon = 'megaphone'; text = T(`پیامی برای ${nf(a.n)} نفر فرستادی`, `You messaged ${a.n} people`); }
  const click = c ? `data-act="contact" data-id="${c.id}"` : '';
  return `<${c ? 'button' : 'div'} class="feed-row ${a.live ? 'live' : ''}" ${click}>
    <span class="feed-ico">${ico(icon, 16)}</span>
    <span class="grow feed-t">${text}</span>
    ${a.live ? `<span class="pill em">${T('تازه', 'New')}</span>` : ''}<span class="micro">${esc(ago(a.ts))}</span>
  </${c ? 'button' : 'div'}>`;
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
      `<button class="btn btn-glass btn-sm" data-act="seNew">${ico('plus', 15)} ${T('رویداد تازه', 'New event')}</button><a class="btn btn-primary btn-sm" href="#/studio/broadcast">${ico('megaphone', 15)} ${T('پیام به مخاطبان', 'Message audience')}</a>`)}

    ${S().studio.introDismissed ? '' : `
    <section class="intro card hi">
      <button class="icon-btn intro-x" data-act="introHide" aria-label="${T('بستن', 'Dismiss')}">${ico('x', 18)}</button>
      <div class="micro ember">${T('خوش آمدی', 'Welcome')}</div>
      <h2 class="h2" style="margin-block:6px 8px">${T('این فضای کار جریان در <bdi class="latin">Went to Event</bdi> است.', "This is Jaryan's workspace on Went to Event.")}</h2>
      <p class="small muted" style="max-width:56ch">${T('هر کاری در بخش «کاوش» بکنی — دنبال کردن، ذخیره، رزرو — همین‌جا لحظه‌ای دیده می‌شود. امتحانش کن:', 'Anything you do in Explore — follow, save, reserve — shows up here instantly. Try it:')}</p>
      <ol class="intro-steps">
        <li><span>1</span>${T('صفحهٔ جریان را باز کن و دنبالش کن.', "Open Jaryan's page and follow it.")}</li>
        <li><span>2</span>${T('یک ورکشاپ رزرو کن.', 'Reserve a workshop.')}</li>
        <li><span>3</span>${T('برگرد: در مخاطبان، لیست ورودی و درآمد پیدا می‌شوی.', "Come back: you're in Audience, the door list and revenue.")}</li>
      </ol>
      <a class="btn btn-primary btn-sm" href="#/h/jaryan">${T('باز کردن صفحهٔ جریان', "Open Jaryan's page")} ${ico('arrow', 16)}</a>
    </section>`}

    <section class="kpis">
      ${kpi({ label: T('درآمد', 'Revenue'), value: rev.paid, fmt: 'compact', sub: rev.pending ? T(`${compact(rev.pending)} در انتظار`, `${compact(rev.pending)} pending`) : T('تومان', 'toman'), icon: 'wallet', hi: true })}
      ${kpi({ label: T('جاهای رزروشده', 'Seats booked'), value: taken, sub: T(`از ${nf(cap)} در رویدادهای پیش رو`, `of ${cap} across upcoming`), icon: 'ticket' })}
      ${kpi({ label: T('مخاطبان', 'Audience'), value: aud.length, sub: T(`${nf(counts.customers)} مشتری · ${nf(counts.engagers)} دنبال‌کننده`, `${counts.customers} customers · ${counts.engagers} engagers`), icon: 'users' })}
      ${kpi({ label: T('دنبال‌کننده‌ها', 'Followers'), value: h.followersNow, fmt: 'int', sub: T(`+${nf(fol[13] - fol[0])} در ۱۴ روز`, `+${fol[13] - fol[0]} in 14 days`), icon: 'heart' })}
    </section>

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
        <div class="row-btns eq"><a class="btn btn-glass btn-sm" href="#/studio/events/${next.id}">${ico('scan', 15)} ${T('لیست ورودی', 'Door list')}</a><button class="btn btn-glass btn-sm" data-act="ovMsgNext">${ico('megaphone', 15)} ${T('پیام به حاضران', 'Message guests')}</button></div>
      </div>` : `<div class="card ov-next"><div class="micro">${T('رویداد بعدی', 'Next event')}</div><p class="small muted" style="margin-block:10px 16px">${T('رویداد پیش‌رویی نداری.', 'Nothing upcoming.')}</p><button class="btn btn-primary btn-sm" data-act="seNew">${T('رویداد تازه', 'New event')}</button></div>`}
    </section>

    <section class="ov-grid b">
      <div class="card">
        <div class="card-top"><div class="micro">${T('مخاطبان', 'Audience')}</div><a class="link-more" href="#/studio/audience">${T('همه', 'Open')}${ico('chev', 16)}</a></div>
        <div class="seg-tiles">
          ${[['customers', 'users'], ['engagers', 'heart'], ['vip', 'star'], ['lapsed', 'refresh']].map(([id, ic]) => { const s = SEGMENTS.find((x) => x.id === id); return `<button class="seg-tile" data-act="ovSeg" data-seg="${id}"><span class="kpi-ico">${ico(ic, 16)}</span><b class="tnum">${nf(counts[id])}</b><span class="small muted">${esc(L(s))}</span></button>`; }).join('')}
        </div>
        <div class="micro" style="margin:20px 0 8px">${T('رشد دنبال‌کننده‌ها', 'Follower growth')}</div>
        ${area(fol, { h: 74 })}
      </div>

      <div class="card">
        <div class="micro">${T('مخاطبانت از کجا آمده‌اند', 'Where your audience comes from')}</div>
        <div class="srcs">${src.map((s) => `<div class="src"><div class="src-top"><span>${esc(L(SOURCES[s.id]) || s.id)}</span><span class="micro tnum">${nf(s.n)}</span></div><div class="meter wide"><i style="width:${Math.round(s.share * 100)}%"></i></div></div>`).join('')}</div>
      </div>

      <div class="card feed">
        <div class="card-top"><div class="micro">${T('تازه‌ترین‌ها', 'Recent activity')}</div><span class="dotlive"></span></div>
        ${act.length ? act.map((a) => feedItem(a, by)).join('') : `<p class="small muted">${T('هنوز فعالیتی نیست.', 'Nothing yet.')}</p>`}
      </div>
    </section>
  </div>`;
}

on({
  introHide() { commit((s) => { s.studio.introDismissed = true; }); },
  ovSeg(el) { aprefs.seg = el.dataset.seg; navigate('/studio/audience'); },
  ovMsgNext() { bprefs.to = null; bprefs.seg = 'next'; navigate('/studio/broadcast'); },
});
