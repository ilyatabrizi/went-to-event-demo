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
  const tabs = [T('رویدادها', 'Events'), pg.showAbout ? T('درباره', 'About') : '', pg.showGallery ? T('گالری', 'Gallery') : '', pg.showFaq ? T('پرسش‌ها', 'FAQ') : ''].filter(Boolean);
  return `
    <div class="pv-cover"><img src="${h.cover}" alt=""><div class="pv-fade"></div></div>
    <div class="pv-body">
      <div class="pv-id">${avatar(h, 54)}<div><div class="h3">${esc(L(h.name))} ${verified(15)}</div><div class="micro latin">@${esc(h.handle)}</div></div></div>
      <p class="small pv-tag" id="pv-tag">${esc(L(h.tagline))}</p>
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
    ${pageHead(T('صفحهٔ جریان', 'Your page'), T('این چیزی است که مردم در <bdi class="latin">Went to Event</bdi> می‌بینند. تغییرها همان لحظه ذخیره می‌شوند.', 'This is what people see on Went to Event. Changes save as you type.'),
      `<a class="btn btn-bone btn-sm" href="#/h/jaryan">${ico('eye', 16)} ${T('دیدن صفحهٔ عمومی', 'View public page')}</a>`)}
    <div class="pg-grid">
      <div class="pg-form">
        <section class="card">
          <div class="field"><label for="pg-tag">${T('شعار', 'Tagline')}</label>
            <input id="pg-tag" class="input" data-in="pgTag" maxlength="${MAXT}" value="${esc(L(h.tagline))}" placeholder="${T('یک خط دربارهٔ جریان', 'One line about Jaryan')}">
            <span class="hint">${T('در هر دو زبان نمایش داده می‌شود.', 'Shown in both languages.')}</span></div>
          <div class="field" style="margin-bottom:0"><label for="pg-about">${T('دربارهٔ ما', 'About')}</label>
            <textarea id="pg-about" class="textarea tall" data-in="pgAbout" maxlength="${MAXA}">${esc(aboutText())}</textarea>
            <span class="hint">${T('بین پاراگراف‌ها یک خط خالی بگذار.', 'Leave a blank line between paragraphs.')}</span></div>
        </section>

        <section class="card">
          <div class="field" style="margin-bottom:0"><label for="pg-pin">${T('رویداد سنجاق‌شده', 'Pinned event')}</label>
            <select id="pg-pin" class="select" data-in="pgPin">
              <option value="">${T('بدون سنجاق', 'None')}</option>
              ${ups.map((e) => `<option value="${e.id}" ${pg.pinned === e.id ? 'selected' : ''}>${esc(L(e.title))}</option>`).join('')}
            </select>
            <span class="hint">${T('بالای فهرست رویدادهای صفحه می‌نشیند.', 'Sits at the top of your events list.')}</span></div>
        </section>

        <section class="card sw-card">
          ${switchRow('pgToggle', 'showAbout', pg.showAbout, T('بخش «درباره»', 'About section'))}
          ${switchRow('pgToggle', 'showGallery', pg.showGallery, T('گالری عکس', 'Photo gallery'))}
          ${switchRow('pgToggle', 'showFaq', pg.showFaq, T('پرسش‌های پرتکرار', 'FAQ'))}
        </section>
        <button class="btn btn-ghost btn-sm" data-act="pgReset">${ico('refresh', 15)} ${T('بازگشت به متن پیش‌فرض', 'Restore default text')}</button>
      </div>

      <aside class="pg-side"><div class="micro" style="margin-bottom:10px">${T('پیش‌نمایش', 'Live preview')}</div><div class="pv glass" id="pv">${preview()}</div></aside>
    </div>
  </div>`;
}

const repaintPv = () => { const p = document.getElementById('pv'); if (p) p.innerHTML = preview(); };
onInput({
  pgTag(el) { const v = el.value.trim(); commit((s) => { s.studio.page.tagline = v || null; }, { silent: true }); const t = document.getElementById('pv-tag'); if (t) t.textContent = L(getHost(ME).tagline); },
  pgAbout(el) { commit((s) => { s.studio.page.about = el.value; }, { silent: true }); const a = document.getElementById('pv-about'); if (a) a.textContent = paras()[0] || ''; },
  pgPin(el) { commit((s) => { s.studio.page.pinned = el.value || null; }, { silent: true }); const p = document.getElementById('pv-pin'); if (p) p.innerHTML = pinHtml(getEvent(el.value)); },
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
    repaintPv(); toast(T('متن پیش‌فرض برگشت', 'Default text restored'), 'refresh');
  },
});
