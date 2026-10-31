/* Cards shared by several screens, plus the save / follow / share actions. */
import { S, commit } from './store.js';
import { T, L } from './i18n.js';
import { ico } from './icons.js';
import { esc, money, nf, compact, dNum, dMonthShort, dateOf, timeRange, relDay, bloom, uid } from './util.js';
import { getHost, getEvent, seats, nextEvent, following } from './model.js';
import { ME, CATEGORIES } from './data.js';
import { on, toast, avatar, verified, sampleTag, poster, dchip } from './ui.js';

const saved = (id) => S().saved.includes(id);

/* the big featured card on Discover / host pages */
export function evHero(e, { label } = {}) {
  const h = getHost(e.host), s = seats(e);
  const when = label || (e.day === 0 ? T('امشب', 'Tonight') : relDay(e.day));
  return `<article class="ev-hero" data-id="${e.id}">
    <div class="ev-media">
      ${poster(e, 960)}${dchip(e)}
      <button class="save-btn glass ${saved(e.id) ? 'on' : ''}" data-act="save" data-id="${e.id}" aria-pressed="${saved(e.id)}" aria-label="${T('ذخیره', 'Save')}">${ico('bookmark', 17)}</button>
      <div class="ev-over">
        <div class="hero-flag"><i class="dotlive"></i><span>${when}</span></div>
        <div class="ev-host">${avatar(h, 22)}<span>${esc(L(h.name))}</span>${h.verified ? '<span class="vf">' + ico('verified', 13) + '</span>' : ''}</div>
        <h2 class="hero-title"><a class="stretch" href="#/e/${e.id}">${esc(L(e.title))}</a></h2>
        <p class="hero-lede">${esc(L(e.lede))}</p>
        <div class="hero-foot">
          <span class="btn btn-primary btn-sm">${s.full ? T('تکمیل ظرفیت', 'Sold out') : T('رزرو', 'Reserve')} ${ico('arrow', 16)}</span>
          <span class="small">${esc(timeRange(e.from, e.to))} · <b>${money(e.price)}</b></span>
        </div>
      </div>
    </div></article>`;
}

/* a host in a rail */
export function hostCard(h) {
  const f = following(h.id);
  const cover = h.cover ? `<img src="${h.cover}" alt="" loading="lazy">` : '';
  return `<article class="host-card" data-host="${h.id}">
    <div class="hc-cover" style="${h.cover ? '' : bloom('hc-' + h.id)}">${cover}</div>
    <div class="hc-av">${avatar(h, 58)}</div>
    <div class="hc-body">
      <h3 class="h3"><a class="stretch" href="#/h/${h.id}">${esc(L(h.name))}</a> ${h.verified ? verified(15) : ''}</h3>
      <div class="micro" style="margin-top:3px"><span data-fcount="${h.id}">${compact(h.followersNow)}</span> ${T('دنبال‌کننده', 'followers')}${h.sample ? ' ' + sampleTag() : ''}</div>
      <p class="small muted hc-tag">${esc(L(h.tagline))}</p>
    </div>
    ${followBtn(h.id, 'sm')}
  </article>`;
}
export function followBtn(id, size = 'sm') {
  const f = following(id);
  return `<button class="btn btn-${size === 'sm' ? 'sm' : 'primary'} follow ${f ? 'btn-glass is-on' : (size === 'sm' ? 'btn-bone' : '')}" data-act="follow" data-id="${id}" aria-pressed="${f}" style="position:relative;z-index:2">${f ? ico('check', 15) + ' ' + T('دنبال می‌کنی', 'Following') : ico('plus', 15) + ' ' + T('دنبال کردن', 'Follow')}</button>`;
}

/* ─────────────────────────────────────────────────────────────── actions */
on({
  save(el, ev) {
    ev.stopPropagation();
    const id = el.dataset.id, was = saved(id);
    commit((s) => { s.saved = was ? s.saved.filter((x) => x !== id) : [...s.saved, id]; }, { silent: true });
    document.querySelectorAll(`.save-btn[data-id="${id}"], .dk-save[data-id="${id}"]`).forEach((b) => { b.classList.toggle('on', !was); b.setAttribute('aria-pressed', !was); });
    toast(was ? T('از ذخیره‌ها برداشته شد', 'Removed from saved') : T('ذخیره شد', 'Saved'), 'bookmark');
  },
  follow(el, ev) {
    ev.stopPropagation();
    const id = el.dataset.id, was = following(id);
    commit((s) => {
      if (was) { s.following = s.following.filter((x) => x !== id); delete s.followedAt[id]; }
      else { s.following.push(id); s.followedAt[id] = Date.now(); }
    }, { silent: true });
    const h = getHost(id);
    document.querySelectorAll(`[data-act="follow"][data-id="${id}"]`).forEach((b) => {
      const sm = b.classList.contains('btn-sm');
      b.classList.toggle('is-on', !was); b.classList.toggle('btn-glass', !was);
      if (sm) b.classList.toggle('btn-bone', was);
      b.setAttribute('aria-pressed', !was);
      b.innerHTML = !was ? `${ico('check', 15)} ${T('دنبال می‌کنی', 'Following')}` : `${ico('plus', 15)} ${T('دنبال کردن', 'Follow')}`;
    });
    document.querySelectorAll(`[data-fcount="${id}"]`).forEach((n) => { n.textContent = compact(h.followersNow); });
    toast(was ? T('دیگر دنبال نمی‌کنی', 'Unfollowed') : T(`${L(h.name)} را دنبال می‌کنی`, `You follow ${L(h.name)}`), 'check');
    if (id === ME && !was) toast(T('به مخاطبان جریان اضافه شدی', "You're now in Jaryan's audience"), 'users');
  },
  share(el) {
    const id = el.dataset.id; const e = id ? getEvent(id) : null;
    const url = location.href.split('#')[0] + (e ? `#/e/${e.id}` : '');
    const data = { title: e ? L(e.title) : 'Went to Event', url };
    if (navigator.share) navigator.share(data).catch(() => {});
    else navigator.clipboard?.writeText(url).then(() => toast(T('لینک کپی شد', 'Link copied'), 'link')).catch(() => toast(T('لینک کپی نشد', "Couldn't copy"), 'info'));
    if (!navigator.share && !navigator.clipboard) toast(url, 'link');
  },
});
