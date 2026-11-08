/* Page — edit Jaryan's public page on the platform, with a live preview. Saves as you type. */
import { S, commit } from '../store.js';
import { T, L, LL } from '../i18n.js';
import { ico } from '../icons.js';
import { esc, nf, money, dNum, dMonthShort, dateOf } from '../util.js';
import { getHost, eventsOf, isLive, byTime, getEvent } from '../model.js';
import { ABOUT, ME } from '../data.js';
import { avatar, verified, on, onInput, toast } from '../ui.js';
import { pageHead, switchRow } from './kit.js';

export const title = () => T('صفحه', 'Page');
const MAXT = 80, MAXA = 700;

const aboutText = () => { const pg = S().studio.page; return pg.about ?? LL(ABOUT).join('\n\n'); };
const paras = () => aboutText().split(/\n{2,}|\n/).filter(Boolean);

function preview() {
  const pg = S().studio.page, h = getHost(ME);
  const ups = eventsOf(ME).filter((e) => isLive(e) && e.day >= 0).sort(byTime);
  const pin = ups.find((e) => e.id === pg.pinned);
  const tabs = [T('رویدادها', 'Events'), pg.showReviews ? T('نظرات', 'Reviews') : '', pg.showAbout ? T('درباره', 'About') : '', pg.showGallery ? T('گالری', 'Gallery') : '', pg.showFaq ? T('پرسش‌ها', 'FAQ') : ''].filter(Boolean);
  const contacts = [pg.phone && ['phone', T('تماس', 'Call')], pg.telegram && ['send', T('تلگرام', 'Telegram')], pg.instagram && ['ig', T('اینستاگرام', 'Instagram')]].filter(Boolean);
  return `
    <div class="pv-cover"><img src="${h.cover}" alt=""><div class="pv-fade"></div></div>
    <div class="pv-body">
      <div class="pv-id">${avatar(h, 54)}<div><div class="h3">${esc(L(h.name))} ${verified(15)}</div><div class="micro latin">@${esc(h.handle)}</div></div></div>
      <p class="small pv-tag" id="pv-tag">${esc(L(h.tagline))}</p>
      ${contacts.length ? `<div class="pv-contacts">${contacts.map(([i, t]) => `<span>${ico(i, 13)} ${t}</span>`).join('')}</div>` : ''}
      <div id="pv-pin">${pinHtml(pin)}</div>
      <div class="pv-tabs" id="pv-tabs">${tabs.map((t, i) => `<span class="${i === 0 ? 'on' : ''}">${esc(t)}</span>`).join('')}</div>
      <div class="pv-about" id="pv-about" ${pg.showAbout ? '' : 'hidden'}>${esc(paras()[0] || '')}</div>
    </div>`;
}
const pinHtml = (e) => e
  ? `<div class="pv-pin"><span class="pill em">${ico('star', 12)} ${T('سنجاق‌شده', 'Pinned')}</span><div class="pv-ev"><b>${esc(L(e.title))}</b><span class="micro">${dNum(dateOf(e.day))} ${dMonthShort(dateOf(e.day))} · ${money(e.price)}</span></div></div>`
  : '';

export function render() {
  const pg = S().studio.page, h = getHost(ME);
  const ups = eventsOf(ME).filter((e) => isLive(e) && e.day >= 0).sort(byTime);
  return `
  <div class="wrap st-wrap">
    ${pageHead(T('صفحه‌ی جریان', 'Your page'), T('این همون چیزیه که مردم می‌بینن. هر چی عوض کنی همون لحظه ذخیره می‌شه.', 'This is what people see on Went to Event. Changes save as you type.'),
      `<span class="saved-ind" id="pg-saved" aria-live="polite">${ico('check', 14)} ${T('ذخیره شد', 'Saved')}</span><a class="btn btn-bone btn-sm" href="#/h/jaryan">${ico('eye', 16)} ${T('دیدن صفحه‌م', 'View public page')}</a>`)}
    <div class="pg-grid">
      <div class="pg-form">
        <section class="card">
          <div class="field"><label for="pg-tag">${T('شعار', 'Tagline')}</label>
            <input id="pg-tag" class="input" data-in="pgTag" maxlength="${MAXT}" value="${esc(L(h.tagline))}" placeholder="${T('یه خط درباره‌ی جریان', 'One line about Jaryan')}">
            <span class="hint">${T('تو هر دو زبان نشون داده می‌شه.', 'Shown in both languages.')}</span></div>
          <div class="field" style="margin-bottom:0"><label for="pg-about">${T('درباره‌ی ما', 'About')}</label>
            <textarea id="pg-about" class="textarea tall" data-in="pgAbout" maxlength="${MAXA}">${esc(aboutText())}</textarea>
            <span class="hint">${T('بین پاراگراف‌ها یه خط خالی بذار.', 'Leave a blank line between paragraphs.')}</span></div>
        </section>

        <section class="card">
          <div class="field" style="margin-bottom:0"><label for="pg-pin">${T('رویداد سنجاق‌شده', 'Pinned event')}</label>
            <select id="pg-pin" class="select" data-in="pgPin">
              <option value="">${T('بدون سنجاق', 'None')}</option>
              ${ups.map((e) => `<option value="${e.id}" ${pg.pinned === e.id ? 'selected' : ''}>${esc(L(e.title))}</option>`).join('')}
            </select>
            <span class="hint">${T('بالای لیست رویدادهای صفحه‌ت می‌شینه.', 'Sits at the top of your events list.')}</span></div>
        </section>

        <section class="card">
          <div class="card-h"><b>${T('راه‌های تماس', 'Ways to reach you')}</b><span class="small muted">${T('دکمه‌هاش بالای صفحه‌ت نشون داده می‌شه', 'Shown as buttons at the top of your page')}</span></div>
          <div class="field-row">
            <div class="field"><label for="pg-phone">${T('شماره تماس', 'Phone')}</label><input id="pg-phone" class="input ltr" inputmode="tel" data-in="pgField" data-k="phone" value="${esc(pg.phone || '')}" placeholder="0914 000 0000" style="text-align:start"></div>
            <div class="field"><label for="pg-tg">${T('تلگرام', 'Telegram')}</label><input id="pg-tg" class="input ltr" data-in="pgField" data-k="telegram" value="${esc(pg.telegram || '')}" placeholder="@username" style="text-align:start"></div>
          </div>
          <div class="field-row">
            <div class="field" style="margin-bottom:0"><label for="pg-ig">${T('اینستاگرام', 'Instagram')}</label><input id="pg-ig" class="input ltr" data-in="pgField" data-k="instagram" value="${esc(pg.instagram || '')}" placeholder="@username" style="text-align:start"></div>
            <div class="field" style="margin-bottom:0"><label for="pg-web">${T('سایت', 'Website')}</label><input id="pg-web" class="input ltr" data-in="pgField" data-k="website" value="${esc(pg.website || '')}" placeholder="https://" style="text-align:start"></div>
          </div>
        </section>

        <section class="card sw-card">
          ${switchRow('pgToggle', 'showAbout', pg.showAbout, T('بخش «درباره»', 'About section'))}
          ${switchRow('pgToggle', 'showGallery', pg.showGallery, T('گالری عکس', 'Photo gallery'))}
          ${switchRow('pgToggle', 'showFaq', pg.showFaq, T('پرسش‌های پرتکرار', 'FAQ'))}
          ${switchRow('pgToggle', 'showReviews', pg.showReviews, T('نظرات مهمون‌ها', 'Guest reviews'), T('میانگین امتیاز هم کنار اسمت میاد', 'Your average rating shows next to your name'))}
        </section>
        <button class="btn btn-ghost btn-sm" data-act="pgReset">${ico('refresh', 15)} ${T('برگردون به متن اولیه', 'Restore default text')}</button>
      </div>

      <aside class="pg-side"><div class="micro" style="margin-bottom:10px">${T('پیش‌نمایش', 'Live preview')}</div><div class="pv glass" id="pv">${preview()}</div></aside>
    </div>
  </div>`;
}

let pvT = 0, svT = 0;
const saved = () => { const x = document.getElementById('pg-saved'); if (!x) return; x.classList.add('on'); clearTimeout(svT); svT = setTimeout(() => x.classList.remove('on'), 1600); };
const repaintPv = () => { const p = document.getElementById('pv'); if (p) p.innerHTML = preview(); saved(); };
onInput({
  pgTag(el) { const v = el.value.trim(); commit((s) => { s.studio.page.tagline = v || null; }, { silent: true }); const t = document.getElementById('pv-tag'); if (t) t.textContent = L(getHost(ME).tagline); saved(); },
  pgAbout(el) { commit((s) => { s.studio.page.about = el.value; }, { silent: true }); const a = document.getElementById('pv-about'); if (a) a.textContent = paras()[0] || ''; saved(); },
  pgField(el) {
    const k = el.dataset.k; let v = el.value.trim();
    if (k === 'telegram' || k === 'instagram') v = v.replace(/^@+/, '').replace(/.*(t\.me|instagram\.com)\//i, '').replace(/\/.*$/, '');
    if (k === 'website' && v && !/^https?:\/\//i.test(v)) v = /^[a-z][\w+.-]*:/i.test(v) ? '' : 'https://' + v;
    commit((s) => { s.studio.page[k] = v; }, { silent: true });
    clearTimeout(pvT); pvT = setTimeout(repaintPv, 250);
  },
  pgPin(el) { commit((s) => { s.studio.page.pinned = el.value || null; }, { silent: true }); const p = document.getElementById('pv-pin'); if (p) p.innerHTML = pinHtml(getEvent(el.value)); saved(); },
});
on({
  pgToggle(el) {
    const k = el.dataset.k;
    commit((s) => { s.studio.page[k] = !s.studio.page[k]; }, { silent: true });
    const on_ = S().studio.page[k];
    el.setAttribute('aria-checked', on_); el.querySelector('.switch').classList.toggle('on', on_);
    repaintPv();
  },
  pgReset() {
    commit((s) => { s.studio.page.about = null; s.studio.page.tagline = null; }, { silent: true });
    const h = getHost(ME);
    const t = document.getElementById('pg-tag'), a = document.getElementById('pg-about');
    if (t) t.value = L(h.tagline); if (a) a.value = aboutText();
    repaintPv(); toast(T('متن اولیه برگشت', 'Default text restored'), 'refresh');
  },
});
