/* Search — events across every host, or the hosts themselves. Filters never re-render the input. */
import { S } from '../store.js';
import { T, L } from '../i18n.js';
import { ico } from '../icons.js';
import { esc, nf, dFull, dateOf, relDay, compact } from '../util.js';
import { CATEGORIES, SUBS } from '../data.js';
import { upcoming, hosts, following } from '../model.js';
import { evRow, empty, on, onInput, avatar, verified, sampleTag, placePill } from '../ui.js';
import { followBtn } from '../cards.js';

export const title = () => T('جستجو', 'Search');
export const prefs = { q: '', cat: null, tab: 'events', focus: false };

const norm = (s) => String(s || '').toLowerCase().replace(/[يی]/g, 'ی').replace(/[كک]/g, 'ک');
const hay = (e, h) => norm([e.title?.fa, e.title?.en, e.lede?.fa, e.lede?.en, h.name.fa, h.name.en, e.sub ? SUBS[e.sub].fa + ' ' + SUBS[e.sub].en : '', CATEGORIES.find((c) => c.id === e.cat)?.fa, CATEGORIES.find((c) => c.id === e.cat)?.en].join(' '));

function eventResults() {
  const hs = Object.fromEntries(hosts().map((h) => [h.id, h]));
  const q = norm(prefs.q.trim());
  let list = upcoming().filter((e) => {
    if (prefs.cat === 'following') { if (!following(e.host)) return false; }
    else if (prefs.cat && e.cat !== prefs.cat) return false;
    return !q || hay(e, hs[e.host]).includes(q);
  });
  if (!list.length) {
    return empty('search', T('چیزی پیدا نشد', 'Nothing found'), prefs.cat === 'following'
      ? (S().following.length ? T('میزبان‌هایی که دنبالشون می‌کنی فعلاً رویداد پیش رو ندارن. خبر بعدیشون میاد تو اعلان‌هات.', "The hosts you follow have nothing coming up right now. Their next news lands in your inbox.") : T('هنوز کسی رو دنبال نکردی. از بخش «میزبان‌ها» شروع کن.', "You're not following any host yet. Start from the Hosts tab."))
      : T('یه کلمه‌ی دیگه امتحان کن یا فیلتر رو بردار.', 'Try another word or clear the filter.'));
  }
  const groups = new Map();
  list.forEach((e) => { if (!groups.has(e.day)) groups.set(e.day, []); groups.get(e.day).push(e); });
  return `<div class="micro res-count">${T(`${nf(list.length)} رویداد`, `${list.length} event${list.length > 1 ? 's' : ''}`)}</div>` +
    [...groups.entries()].map(([d, es]) => `
      <div class="day-group"><div class="day-h"><b>${esc(relDay(d))}</b><span class="micro">${esc(dFull(dateOf(d)))}</span></div>
      <div class="list-stack cols">${es.map((e) => evRow(e)).join('')}</div></div>`).join('');
}
function hostResults() {
  const q = norm(prefs.q.trim());
  const list = hosts().filter((h) => !q || norm([h.name.fa, h.name.en, h.tagline.fa, h.tagline.en, h.handle].join(' ')).includes(q));
  if (!list.length) return empty('users', T('میزبانی پیدا نشد', 'No hosts found'), T('یه کلمه‌ی دیگه امتحان کن.', 'Try another word.'));
  return `<div class="list-stack cols">${list.map((h) => `
    <article class="host-row">
      ${avatar(h, 56)}
      <div class="grow"><h3 class="h3"><a class="stretch" href="#/h/${h.id}">${esc(L(h.name))}</a> ${h.verified ? verified(15) : ''}</h3>
        <div class="micro" style="margin-top:2px"><span data-fcount="${h.id}">${compact(h.followersNow)}</span> ${T('دنبال‌کننده', 'followers')} · ${esc(L(h.city))}${h.sample ? ' ' + sampleTag() : ''}</div>
        <p class="small muted">${esc(L(h.tagline))}</p></div>
      ${followBtn(h.id, 'sm')}
    </article>`).join('')}</div>`;
}

export function render() {
  const chips = [{ id: null, fa: 'همه', en: 'All' }, ...CATEGORIES, { id: 'following', fa: 'دنبال‌شده‌ها', en: 'Following' }];
  return `
  <div class="wrap" style="--gut:clamp(16px,4.2vw,36px)">
    <h1 class="h1" style="margin-bottom:18px">${T('جستجو', 'Search')}</h1>
    <label class="searchfield glass">
      ${ico('search', 20)}
      <input id="q" data-in="q" type="search" enterkeyhint="search" autocomplete="off" value="${esc(prefs.q)}" placeholder="${T('رویداد، میزبان، دسته…', 'Events, hosts, categories…')}">
      <button class="clear" data-act="clearQ" aria-label="${T('پاک کردن', 'Clear')}" ${prefs.q ? '' : 'hidden'}>${ico('x', 16)}</button>
    </label>
    <div class="ex-ctl">
      <div class="seg tabs-seg ex-seg"><span class="seg-pill"></span>
        <button class="${prefs.tab === 'events' ? 'on' : ''}" data-act="exTab" data-tab="events">${T('رویدادها', 'Events')}</button>
        <button class="${prefs.tab === 'hosts' ? 'on' : ''}" data-act="exTab" data-tab="hosts">${T('میزبان‌ها', 'Hosts')}</button>
      </div>
    </div>
    <div class="chips ex-chips" ${prefs.tab === 'hosts' ? 'hidden' : ''}>${chips.map((c) => `<button class="chip ${prefs.cat === c.id ? 'on' : ''}" data-act="exCat" data-cat="${c.id ?? ''}">${esc(L(c))}</button>`).join('')}</div>
    <div id="ex-res" class="ex-res">${prefs.tab === 'events' ? eventResults() : hostResults()}</div>
  </div>`;
}

export function mount(root) {
  if (prefs.focus) { prefs.focus = false; root.querySelector('#q')?.focus(); }
}

const paint = () => {
  const r = document.getElementById('ex-res'); if (!r) return;
  r.innerHTML = prefs.tab === 'events' ? eventResults() : hostResults();
  document.querySelector('.ex-chips')?.toggleAttribute('hidden', prefs.tab === 'hosts');
  const c = document.querySelector('.clear'); if (c) c.hidden = !prefs.q;
};
onInput({ q(el) { prefs.q = el.value; paint(); } });
on({
  clearQ() { prefs.q = ''; const i = document.getElementById('q'); if (i) { i.value = ''; i.focus(); } paint(); },
  exCat(el) {
    prefs.cat = el.dataset.cat || null;
    document.querySelectorAll('.ex-chips .chip').forEach((c) => c.classList.toggle('on', (c.dataset.cat || null) === prefs.cat));
    paint();
  },
  exTab(el) {
    prefs.tab = el.dataset.tab;
    const seg = el.closest('.seg');
    seg.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === el));
    placePill(seg); paint();
  },
});
