/* A host's public page. For Jaryan it is driven by what the panel saves: intro, contacts, pinned event,
 * which sections show, and the replies to guest reviews. */
import { S, commit } from '../store.js';
import { T, L, LL } from '../i18n.js';
import { ico } from '../icons.js';
import { esc, nf, nf1, compact, bloom, uid, ago } from '../util.js';
import { getHost, eventsOf, isLive, byTime, reviewsOf, rating, canReview, getEvent, userName } from '../model.js';
import { ABOUT, FAQ, GALLERY, ME, jimg } from '../data.js';
import { avatar, verified, evRow, empty, tabs, panel, on, openSheet, toast, person, copyText } from '../ui.js';
import { followBtn, evHero } from '../cards.js';
import { authed, authHost } from '../auth.js';
import { stars, ratingBlock, starSvg } from '../studio/reviews.js';

export const title = (id) => { const h = getHost(id); return h ? L(h.name) : T('میزبان', 'Host'); };

const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;

function contactsOf(h) {
  const pg = h.id === ME ? S().studio.page : {};
  const ig = h.id === ME ? pg.instagram : (h.ig || '').replace(/.*instagram\.com\//, '').replace(/\/$/, '');
  const site = h.id === ME ? pg.website : h.site;
  const out = [];
  if (pg.phone) out.push({ i: 'phone', t: T('تماس', 'Call'), href: `tel:${pg.phone.replace(/\s/g, '')}` });
  if (pg.telegram) out.push({ i: 'send', t: T('تلگرام', 'Telegram'), href: `https://t.me/${pg.telegram}` });
  if (ig) out.push({ i: 'ig', t: T('اینستاگرام', 'Instagram'), href: `https://instagram.com/${ig}` });
  if (site && /^https?:\/\/[^\s]+$/i.test(site)) out.push({ i: 'globe', t: T('سایت', 'Website'), href: site });
  if (h.address) out.push({ i: 'route', t: T('مسیریابی', 'Directions'), href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(L(h.address) + '، تبریز')}` });
  return out;
}

const reviewCard = (x, h) => {
  const ev = getEvent(x.event);
  return `<article class="rev card">
    <div class="rev-top">${person(x.name, 40)}<div class="grow"><b>${esc(x.name)}</b><div class="micro">${ev ? esc(L(ev.title)) + ' · ' : ''}${esc(ago(x.ts))}</div></div>${stars(x.stars, 14)}</div>
    <p class="rev-t">${esc(L(x.text))}</p>
    ${x.reply ? `<div class="rev-reply"><div class="micro ember">${T(`جواب ${esc(L(h.name))}`, `${esc(L(h.name))} replied`)}</div><p>${esc(x.reply)}</p></div>` : ''}
  </article>`;
};

export function render(id) {
  const h = getHost(id);
  if (!h) return `<div class="wrap">${empty('users', T('این میزبان پیدا نشد', 'Host not found'), '', `<a class="btn btn-primary" href="#/">${T('برگرد به صفحه‌ی اول', 'Back to Discover')}</a>`)}</div>`;
  const mine = id === ME;
  const owner = authed() && authHost() === id;
  const pg = S().studio.page;
  const all = eventsOf(id).filter(isLive);
  let ups = all.filter((e) => e.day >= 0).sort(byTime);
  const pinned = mine ? ups.find((e) => e.id === pg.pinned) : null;
  const spotlight = ups[0] || null;
  if (pinned) ups = [pinned, ...ups.filter((e) => e.id !== pinned.id)];
  const done = all.filter((e) => e.day < 0).sort((a, b) => b.day - a.day);

  const showAbout = !mine || pg.showAbout;
  const showGal = mine && pg.showGallery;
  const showFaq = mine && pg.showFaq;
  const revs = (mine ? pg.showReviews : true) ? reviewsOf(id) : [];
  const r = rating(id);
  const showRev = (mine ? pg.showReviews : r.n > 0);
  const aboutParas = mine ? (pg.about != null ? String(pg.about).split(/\n{2,}|\n/).filter(Boolean) : LL(ABOUT)) : [L(h.tagline)];
  const contacts = contactsOf(h);

  const items = [{ id: 'events', label: T('رویدادها', 'Events'), n: ups.length }];
  if (showRev) items.push({ id: 'reviews', label: T('نظرات', 'Reviews'), n: r.n });
  if (showAbout) items.push({ id: 'about', label: T('درباره', 'About') });
  if (showGal) items.push({ id: 'gallery', label: T('گالری', 'Gallery') });
  if (showFaq) items.push({ id: 'faq', label: T('سؤال‌ها', 'FAQ') });

  const media = h.video && !reduced()
    ? `<video class="hp-vid" src="${h.video}" poster="${h.cover}" autoplay muted loop playsinline preload="metadata"></video>`
    : h.cover ? `<img src="${h.cover}" alt="">` : `<div class="hp-bloom" style="${bloom('cover-' + h.id)}"></div>`;

  const pending = canReview(id);

  return `
  <div class="wrap host-page">
    ${owner ? `<div class="own-bar glass"><span class="dotlive"></span><span class="grow small">${T('این صفحه‌ی عمومی توئه؛ همونیه که بقیه می‌بینن. ', 'This is your public page — exactly what visitors see. ')}<span class="muted">${T('هر چی تو پنل عوض کنی، اینجا هم عوض می‌شه.', 'Anything you change in the panel shows up here.')}</span></span><a class="btn btn-bone btn-xs" href="#/studio/page">${ico('edit', 14)} ${T('ویرایش', 'Edit')}</a></div>` : ''}
    <section class="hp-head">
      <div class="hp-cover">${media}<div class="hp-fade"></div>
        <button class="icon-btn glass hp-share" data-act="sharePage" data-id="${h.id}" aria-label="${T('اشتراک صفحه', 'Share page')}">${ico('share', 19)}</button>
      </div>
      <div class="hp-card">
        <div class="hp-av">${avatar(h, 84)}</div>
        <div class="hp-id">
          <h1 class="h1">${esc(L(h.name))} ${h.verified ? verified(24) : ''}</h1>
          <div class="micro hp-handle"><span class="latin">@${esc(h.handle)}</span> · ${esc(L(h.city))}</div>
          ${showRev && r.n ? `<button class="hp-rate" data-act="hpReviews" data-id="${h.id}"><span class="star1">${starSvg(15)}</span><b class="tnum">${nf1(r.avg)}</b><span class="muted">${T(`(${nf(r.n)} نظر)`, `(${r.n} reviews)`)}</span></button>` : ''}
          <p class="lede hp-tag">${esc(L(h.tagline))}</p>
        </div>
        <div class="hp-stats">
          <div><b data-fcount="${h.id}">${compact(h.followersNow)}</b><span class="micro">${T('دنبال‌کننده', 'Followers')}</span></div>
          <div><b>${nf(ups.length)}</b><span class="micro">${T('رویداد پیش رو', 'Upcoming')}</span></div>
          <div><b>${nf(done.length)}</b><span class="micro">${T('برگزارشده', 'Held')}</span></div>
        </div>
        <div class="hp-actions">${followBtn(h.id, 'lg')}</div>
        ${contacts.length ? `<div class="hp-contacts">${contacts.map((c) => `<a class="hp-ct" href="${esc(c.href)}" target="_blank" rel="noopener"><span>${ico(c.i, 19)}</span>${c.t}</a>`).join('')}</div>` : ''}
      </div>
    </section>

    ${spotlight ? `<section class="hp-spot"><div class="micro hp-spot-l"><i class="dotlive"></i>${T('نزدیک‌ترین برنامه', 'Up next')}</div>${evHero(spotlight)}</section>` : ''}

    <div class="hp-tabs">${tabs('host-' + id, items, 'events')}</div>

    ${panel('host-' + id, 'events', `
      ${ups.length ? `<div class="list-stack cols">${ups.map((e) => (pinned && e.id === pinned.id ? `<div class="pin-wrap"><span class="pill em">${ico('star', 13)} ${T('پیشنهاد ویژه', 'Featured')}</span>${evRow(e, { showHost: false })}</div>` : evRow(e, { showHost: false }))).join('')}</div>`
        : empty('calendar', T('فعلاً رویدادی تو برنامه نیست', 'Nothing scheduled'), T('هنوز رویداد جدیدی نذاشته. دنبالش کن تا اولین نفر باخبر بشی.', "This host hasn't posted a new event yet. Follow to hear first."))}
      ${done.length ? `<h2 class="h2 sub-h">${T('رویدادهای قبلی', 'Past events')}</h2><div class="list-stack cols past">${done.map((e) => evRow(e, { showHost: false })).join('')}</div>` : ''}
    `)}

    ${showRev ? panel('host-' + id, 'reviews', `
      <div class="rev-head card">${ratingBlock(r)}
        ${pending.length ? `<button class="btn btn-primary btn-sm" data-act="revWrite" data-host="${h.id}">${ico('star', 15)} ${T('نظرتو بنویس', 'Write a review')}</button>`
          : `<p class="small muted rev-note">${ico('info', 15)} ${T('بعد از اینکه تو یکی از رویدادها شرکت کردی، می‌تونی اینجا نظر بدی.', "Once you've been to one of the events, you can leave a review here.")}</p>`}
      </div>
      ${revs.length ? `<div class="rev-list">${revs.map((x) => reviewCard(x, h)).join('')}</div>` : empty('star', T('هنوز نظری ثبت نشده', 'No reviews yet'), '')}
    `) : ''}

    ${showAbout ? panel('host-' + id, 'about', `
      <div class="about-grid">
        <div>${aboutParas.map((p) => `<p class="body-p lg">${esc(p)}</p>`).join('')}</div>
        <div class="card about-card">
          ${h.address ? `<div class="li-plain">${ico('pin', 18)}<div><div class="micro">${T('آدرس', 'Address')}</div><div>${esc(L(h.address))}</div>${h.addressNote ? `<div class="small muted">${esc(L(h.addressNote))}</div>` : ''}</div></div>` : `<div class="li-plain">${ico('pin', 18)}<div><div class="micro">${T('شهر', 'City')}</div><div>${esc(L(h.city))}</div></div></div>`}
          <div class="li-plain">${ico('ig', 18)}<div><div class="micro">${T('اینستاگرام', 'Instagram')}</div><div class="latin">@${esc(mine ? (pg.instagram || h.handle) : h.handle)}</div></div></div>
          <div class="li-plain">${ico('verified', 18)}<div><div class="micro">${T('وضعیت', 'Status')}</div><div>${T('میزبان تأییدشده', 'Verified host')}</div></div></div>
        </div>
      </div>`) : ''}

    ${showGal ? panel('host-' + id, 'gallery', `<div class="gal-grid">${GALLERY.map((k) => `<button class="g-cell" data-act="photo" data-src="${jimg(k, 960)}"><img src="${jimg(k, 480)}" alt="" loading="lazy"></button>`).join('')}</div>`) : ''}

    ${showFaq ? panel('host-' + id, 'faq', `<div class="faq-wrap">${FAQ.map((f) => `<details class="faq"><summary><span>${esc(L(f.q))}</span><span class="pm">${ico('plus', 15)}</span></summary><p>${esc(L(f.a))}</p></details>`).join('')}</div>`) : ''}
  </div>`;
}

on({
  sharePage(el) {
    const h = getHost(el.dataset.id);
    const url = location.href.split('#')[0].split('?')[0] + '#/h/' + h.id;
    if (navigator.share) navigator.share({ title: `${L(h.name)} · Went to Event`, url }).catch(() => {});
    else copyText(url, T('لینک صفحه کپی شد', 'Page link copied'));
  },
  hpReviews(el) {
    const b = document.querySelector(`[data-tabs="host-${el.dataset.id}"] [data-tab="reviews"]`);
    if (b) { b.click(); setTimeout(() => document.querySelector('.hp-tabs')?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }), 60); }
  },
  revWrite(el) {
    const host = el.dataset.host;
    const list = canReview(host);
    if (!list.length) return;
    let starsN = 5;
    const s = openSheet({
      title: T('نظرت چی بود؟', 'How was it?'),
      body: `
        ${list.length > 1 ? `<div class="field"><label for="rw-ev">${T('کدوم رویداد؟', 'Which event?')}</label><select id="rw-ev" class="select">${list.map((b) => `<option value="${b.ev.id}">${esc(L(b.ev.title))}</option>`).join('')}</select></div>` : `<div class="micro" style="margin-bottom:10px">${esc(L(list[0].ev.title))}</div>`}
        <div class="star-pick" role="radiogroup" aria-label="${T('امتیاز', 'Rating')}">${[1, 2, 3, 4, 5].map((i) => `<button type="button" data-s="${i}" class="on" aria-label="${i}">${starSvg(30)}</button>`).join('')}</div>
        <div class="field" style="margin-bottom:0"><label for="rw-t">${T('چند خط بنویس', 'A few words')}</label><textarea id="rw-t" class="textarea" maxlength="400" placeholder="${T('چی دوست داشتی؟ به بقیه پیشنهادش می‌کنی؟', 'What did you like? Would you recommend it?')}"></textarea></div>`,
      foot: `<button class="btn btn-primary btn-block" data-send>${T('ثبت نظر', 'Post review')}</button>`,
    });
    const paintStars = () => s.$$('[data-s]').forEach((b) => b.classList.toggle('on', Number(b.dataset.s) <= starsN));
    s.el.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-s]');
      if (b) { starsN = Number(b.dataset.s); paintStars(); return; }
      if (!ev.target.closest('[data-send]')) return;
      const t = s.$('#rw-t');
      if (t.value.trim().length < 3) { t.classList.add('err'); t.focus(); return; }
      const event = s.$('#rw-ev')?.value || list[0].ev.id;
      commit((st) => { st.reviews.unshift({ id: uid('rv'), host, event, name: userName(), stars: starsN, text: t.value.trim(), ts: Date.now() }); });
      s.close(); toast(T('مرسی! نظرت ثبت شد', 'Thanks — review posted'), 'star');
    });
  },
});
