/* A host's public page on the platform. For Jaryan it is driven by what the studio's Page editor saves. */
import { S } from '../store.js';
import { T, L, LL } from '../i18n.js';
import { ico } from '../icons.js';
import { esc, nf, compact, bloom } from '../util.js';
import { getHost, eventsOf, isLive, byTime, past as pastEvents } from '../model.js';
import { ABOUT, FAQ, GALLERY, ME, jimg } from '../data.js';
import { avatar, verified, sampleTag, evRow, empty, tabs, panel, on, openSheet } from '../ui.js';
import { followBtn } from '../cards.js';

export const title = (id) => { const h = getHost(id); return h ? L(h.name) : T('میزبان', 'Host'); };

const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;

export function render(id) {
  const h = getHost(id);
  if (!h) return `<div class="wrap">${empty('users', T('میزبان پیدا نشد', 'Host not found'), '', `<a class="btn btn-primary" href="#/">${T('بازگشت به کشف', 'Back to Discover')}</a>`)}</div>`;
  const mine = id === ME;
  const pg = S().studio.page;
  const all = eventsOf(id).filter(isLive);
  let ups = all.filter((e) => e.day >= 0).sort(byTime);
  const pinned = mine ? ups.find((e) => e.id === pg.pinned) : null;
  if (pinned) ups = [pinned, ...ups.filter((e) => e.id !== pinned.id)];
  const done = all.filter((e) => e.day < 0).sort((a, b) => b.day - a.day);

  const showAbout = !mine || pg.showAbout;
  const showGal = mine && pg.showGallery;
  const showFaq = mine && pg.showFaq;
  const aboutParas = mine ? (pg.about ? String(pg.about).split(/\n{2,}|\n/).filter(Boolean) : LL(ABOUT)) : [L(h.tagline)];

  const items = [{ id: 'events', label: T('رویدادها', 'Events'), n: ups.length }];
  if (showAbout) items.push({ id: 'about', label: T('درباره', 'About') });
  if (showGal) items.push({ id: 'gallery', label: T('گالری', 'Gallery') });
  if (showFaq) items.push({ id: 'faq', label: T('پرسش‌ها', 'FAQ') });

  const media = h.video && !reduced()
    ? `<video class="hp-vid" src="${h.video}" poster="${h.cover}" autoplay muted loop playsinline preload="metadata"></video>`
    : h.cover ? `<img src="${h.cover}" alt="">` : `<div class="hp-bloom" style="${bloom('cover-' + h.id)}"></div>`;

  const links = [];
  if (h.site) links.push(`<a class="btn btn-glass btn-sm" href="${h.site}" target="_blank" rel="noopener">${ico('globe', 16)} ${T('سایت جریان', 'Jaryan site')}</a>`);
  if (h.ig) links.push(`<a class="btn btn-glass btn-sm" href="${h.ig}" target="_blank" rel="noopener">${ico('ig', 16)} Instagram</a>`);

  return `
  <div class="wrap host-page">
    ${mine ? `<div class="own-bar glass"><span class="dotlive"></span><span class="grow small">${T('این صفحهٔ عمومی جریان در <bdi class="latin">Went to Event</bdi> است. ', "This is Jaryan's public page on Went to Event. ")}<span class="muted">${T('هر تغییر در استودیو همین‌جا دیده می‌شود.', 'Anything you change in Studio shows up here.')}</span></span><a class="btn btn-bone btn-xs" href="#/studio/page">${ico('edit', 14)} ${T('ویرایش', 'Edit')}</a></div>` : ''}
    <section class="hp-head">
      <div class="hp-cover">${media}<div class="hp-fade"></div></div>
      <div class="hp-card">
        <div class="hp-av">${avatar(h, 84)}</div>
        <div class="hp-id">
          <h1 class="h1">${esc(L(h.name))} ${h.verified ? verified(24) : ''}</h1>
          <div class="micro hp-handle"><span class="latin">@${esc(h.handle)}</span> · ${esc(L(h.city))}${h.sample ? ' ' + sampleTag() : ''}</div>
          <p class="lede hp-tag">${esc(L(h.tagline))}</p>
        </div>
        <div class="hp-stats">
          <div><b data-fcount="${h.id}">${compact(h.followersNow)}</b><span class="micro">${T('دنبال‌کننده', 'Followers')}</span></div>
          <div><b>${nf(all.length)}</b><span class="micro">${T('رویداد', 'Events')}</span></div>
          <div><b>${nf(done.length)}</b><span class="micro">${T('برگزارشده', 'Held')}</span></div>
        </div>
        <div class="hp-actions">${followBtn(h.id, 'lg')}${links.join('')}</div>
      </div>
    </section>

    <div class="hp-tabs">${tabs('host-' + id, items, 'events')}</div>

    ${panel('host-' + id, 'events', `
      ${ups.length ? `<div class="list-stack cols">${ups.map((e) => (pinned && e.id === pinned.id ? `<div class="pin-wrap"><span class="pill em">${ico('star', 13)} ${T('سنجاق‌شده', 'Pinned')}</span>${evRow(e, { showHost: false })}</div>` : evRow(e, { showHost: false }))).join('')}</div>`
        : empty('calendar', T('رویدادی در برنامه نیست', 'Nothing scheduled'), T('این میزبان هنوز رویداد تازه‌ای منتشر نکرده. دنبالش کن تا اول از همه بفهمی.', "This host hasn't posted a new event yet. Follow to hear first."))}
      ${done.length ? `<h2 class="h2 sub-h">${T('برگزارشده‌ها', 'Past events')}</h2><div class="list-stack cols past">${done.map((e) => evRow(e, { showHost: false })).join('')}</div>` : ''}
    `)}

    ${showAbout ? panel('host-' + id, 'about', `
      <div class="about-grid">
        <div>${aboutParas.map((p) => `<p class="body-p lg">${esc(p)}</p>`).join('')}</div>
        <div class="card about-card">
          ${h.address ? `<div class="li-plain">${ico('pin', 18)}<div><div class="micro">${T('نشانی', 'Address')}</div><div>${esc(L(h.address))}</div>${h.addressNote ? `<div class="small muted">${esc(L(h.addressNote))}</div>` : ''}</div></div>` : `<div class="li-plain">${ico('pin', 18)}<div><div class="micro">${T('شهر', 'City')}</div><div>${esc(L(h.city))}</div></div></div>`}
          <div class="li-plain">${ico('ig', 18)}<div><div class="micro">Instagram</div><div class="latin">@${esc(h.handle)}</div></div></div>
          <div class="li-plain">${ico('verified', 18)}<div><div class="micro">${T('وضعیت', 'Status')}</div><div>${h.sample ? T('میزبان نمونه', 'Sample host') : T('میزبان تأییدشده', 'Verified host')}</div></div></div>
        </div>
      </div>`) : ''}

    ${showGal ? panel('host-' + id, 'gallery', `<div class="gal-grid">${GALLERY.map((k) => `<button class="g-cell" data-act="photo" data-src="${jimg(k, 960)}"><img src="${jimg(k, 480)}" alt="" loading="lazy"></button>`).join('')}</div>`) : ''}

    ${showFaq ? panel('host-' + id, 'faq', `<div class="faq-wrap">${FAQ.map((f) => `<details class="faq"><summary><span>${esc(L(f.q))}</span><span class="pm">${ico('plus', 15)}</span></summary><p>${esc(L(f.a))}</p></details>`).join('')}</div>`) : ''}

    ${h.sample ? `<p class="foot-note micro">${T('این میزبان نمونه است و فقط برای نمایش پلتفرم اینجا هست.', 'This host is a sample, here only to show the platform.')}</p>` : ''}
  </div>`;
}
