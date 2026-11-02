/* Reviews: what guests say, a public reply under each one, and a switch to keep a review off the page. */
import { S, commit } from '../store.js';
import { T, L } from '../i18n.js';
import { ico } from '../icons.js';
import { esc, nf, nf1, ago } from '../util.js';
import { reviewsOf, rating, getEvent } from '../model.js';
import { ME } from '../data.js';
import { on, openSheet, toast, empty, person } from '../ui.js';
import { pageHead } from './kit.js';

export const title = () => T('نظرات', 'Reviews');

export const stars = (n, size = 15) => `<span class="stars" aria-label="${n}/5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= Math.round(n) ? 'on' : ''}">${starSvg(size)}</i>`).join('')}</span>`;
export const starSvg = (s = 15) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.6 5.5 6 .8-4.4 4.1 1.1 5.9L12 16.6 6.7 19.5l1.1-5.9L3.4 9.5l6-.8z" fill="currentColor"/></svg>`;

export const ratingBlock = (r) => `
  <div class="rate-sum">
    <div class="rate-big"><b class="tnum">${r.n ? nf1(r.avg) : '–'}</b>${stars(r.avg, 16)}<span class="micro">${T(`از ${nf(r.n)} نظر`, `${r.n} reviews`)}</span></div>
    <div class="rate-bars">${[5, 4, 3, 2, 1].map((k) => `<div class="rb"><span class="micro tnum">${nf(k)}</span><div class="meter wide"><i style="width:${r.n ? Math.round((r.dist[k - 1] / r.n) * 100) : 0}%"></i></div></div>`).join('')}</div>
  </div>`;

export function render() {
  const list = reviewsOf(ME, { all: true });
  const r = rating(ME);
  const waiting = list.filter((x) => !x.reply && !x.hidden).length;
  return `
  <div class="wrap st-wrap">
    <a class="back-link" href="#/studio">${ico('back', 16)} ${T('پنل', 'Panel')}</a>
    ${pageHead(T('نظرات مهمون‌ها', 'Guest reviews'), T('نظرها تو صفحه‌ی عمومیت نشون داده می‌شن. یه جواب کوتاه و گرم، اعتماد بقیه رو هم جلب می‌کنه.', 'Reviews show on your public page. A short, warm reply builds trust with everyone reading.'))}
    <section class="card">${ratingBlock(r)}</section>
    ${waiting ? `<p class="small muted" style="margin:18px 2px 0">${ico('info', 15)} ${T(`${nf(waiting)} تا نظر هنوز جواب نگرفته`, `${waiting} reviews still need a reply`)}</p>` : ''}
    ${list.length ? `<div class="rev-list">${list.map((x) => {
      const ev = getEvent(x.event);
      return `<article class="rev card ${x.hidden ? 'dim' : ''}">
        <div class="rev-top">${person(x.name, 40)}<div class="grow"><b>${esc(x.name)}</b>${x.mine ? ` <span class="pill">${T('تو', 'You')}</span>` : ''}<div class="micro">${ev ? esc(L(ev.title)) + ' · ' : ''}${esc(ago(x.ts))}</div></div>${stars(x.stars, 14)}</div>
        <p class="rev-t">${esc(L(x.text))}</p>
        ${x.reply ? `<div class="rev-reply"><div class="micro ember">${T('جواب تو', 'Your reply')}</div><p>${esc(x.reply)}</p></div>` : ''}
        <div class="rev-acts">
          <button class="btn btn-glass btn-xs" data-act="revReply" data-id="${x.id}">${ico('send', 14)} ${x.reply ? T('ویرایش جواب', 'Edit reply') : T('جواب بده', 'Reply')}</button>
          <button class="btn btn-ghost btn-xs" data-act="revHide" data-id="${x.id}">${ico('eye', 14)} ${x.hidden ? T('نشونش بده', 'Show on page') : T('از صفحه برش دار', 'Hide from page')}</button>
        </div>
      </article>`;
    }).join('')}</div>` : empty('star', T('هنوز نظری نیومده', 'No reviews yet'), T('بعد از هر رویداد، مهمون‌ها می‌تونن از صفحه‌ت نظر بدن.', 'After each event, guests can leave a review on your page.'))}
  </div>`;
}

on({
  revReply(el) {
    const x = reviewsOf(ME, { all: true }).find((r) => r.id === el.dataset.id);
    const s = openSheet({
      title: T(`جواب به ${esc(x.name)}`, `Reply to ${esc(x.name)}`),
      body: `<blockquote class="rev-q">${esc(L(x.text))}</blockquote>
        <div class="field" style="margin-bottom:0"><label for="rv-t">${T('جوابت', 'Your reply')}</label><textarea id="rv-t" class="textarea" maxlength="300" placeholder="${T('مثلاً: مرسی که اومدی! دفعه‌ی بعد منتظرتیم 🌿', 'e.g. Thanks for coming — see you next time!')}">${esc(x.reply)}</textarea>
        <span class="hint">${T('زیر نظرش تو صفحه‌ی عمومیت نشون داده می‌شه.', 'Shown under the review on your public page.')}</span></div>`,
      foot: `<button class="btn btn-primary btn-block" data-save>${T('ثبت جواب', 'Post reply')}</button>`,
      onMount: (sh) => setTimeout(() => sh.$('#rv-t')?.focus(), 350),
    });
    s.el.addEventListener('click', (ev) => {
      if (!ev.target.closest('[data-save]')) return;
      const v = s.$('#rv-t').value.trim();
      commit((st) => { if (v) st.studio.replies[x.id] = v; else delete st.studio.replies[x.id]; });
      s.close(); toast(v ? T('جوابت ثبت شد', 'Reply posted') : T('جواب پاک شد', 'Reply removed'), 'check');
    });
  },
  revHide(el) {
    const id = el.dataset.id;
    const was = S().studio.hiddenReviews.includes(id);
    commit((st) => { st.studio.hiddenReviews = was ? st.studio.hiddenReviews.filter((x) => x !== id) : [...st.studio.hiddenReviews, id]; });
    toast(was ? T('دوباره تو صفحه‌ت نشون داده می‌شه', 'Back on your page') : T('از صفحه‌ی عمومی برداشته شد', 'Hidden from your page'), 'eye');
  },
});
