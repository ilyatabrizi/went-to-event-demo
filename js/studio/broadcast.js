/* Broadcast — message a segment of Jaryan's audience. A copy can land in the attendee inbox so the demo closes its own loop. */
import { S, commit } from '../store.js';
import { T, L } from '../i18n.js';
import { ico } from '../icons.js';
import { esc, nf, ago, relDay, uid } from '../util.js';
import { SEGMENTS, segment, contact, nextEvent, getHost, userName } from '../model.js';
import { ME } from '../data.js';
import { avatar, person, empty, on, onInput, toast, confirmSheet } from '../ui.js';
import { pageHead } from './kit.js';

export const title = () => T('پیام‌ها', 'Broadcast');
export const prefs = { seg: 'all', to: null };
let draft = '';
let copy = true;
const MAX = 300;

const first = (n) => String(L(n) || '').split(' ')[0] || '';

function templates() {
  const n = nextEvent();
  const ev = n ? L(n.title) : T('رویداد بعدی', 'our next event');
  const when = n ? relDay(n.day) : '';
  return [
    { id: 'rem', label: T('یادآوری', 'Reminder'), text: T(`{name} جان، ${when ? when + ' ' : ''}منتظرتیم: «${ev}». آدرس دقیق رو همین‌جا برات می‌فرستیم.`, `{name}, we're looking forward to ${when ? when.toLowerCase() + ' — ' : ''}“${ev}”. The exact address will land here.`) },
    { id: 'new', label: T('رویداد تازه', 'New event'), text: T(`{name} جان، ثبت‌نام «${ev}» باز شد! ظرفیت کمه، زودتر جاتو بگیر.`, `{name}, booking for “${ev}” is open. Spots are limited — grab yours early.`) },
    { id: 'miss', label: T('دلمون تنگ شده', 'We miss you'), text: T('{name} جان، خیلی وقته ندیدیمت! دورهمی بعدی با تو یه چیز دیگه‌ست.', "{name}, it's been a while. Our next gathering would be nicer with you in it.") },
    { id: 'thx', label: T('تشکر', 'Thank you'), text: T('{name} جان، مرسی که اومدی! عکس‌های اون شب رو تو صفحه‌ی جریان گذاشتیم.', "Thank you for coming, {name}! Photos from the night are up on our page.") },
  ];
}
const recipients = () => (prefs.to ? [contact(prefs.to)].filter(Boolean) : segment(prefs.seg));
const fill = (text, c) => text.replace(/\{name\}/g, c ? first(c.name) : T('دوست', 'friend'));

const stack = (list) => `${list.slice(0, 5).map((c) => person(c.name, 30)).join('')}${list.length > 5 ? `<span class="av av-more latin" style="width:30px;height:30px">+${list.length - 5}</span>` : ''}`;

export function render() {
  const list = recipients();
  const h = getHost(ME);
  const hist = S().studio.broadcasts;
  const direct = prefs.to ? contact(prefs.to) : null;
  const sample = list[0];
  return `
  <div class="wrap st-wrap">
    ${pageHead(T('پیام‌ها', 'Broadcast'), T('یه پیام برای مخاطب‌هات بفرست؛ مستقیم میره تو اعلان‌هاشون', 'Message your audience on Went to Event'))}
    <div class="bc-grid">
      <div class="bc-form">
        <section class="card">
          <div class="micro">${T('گیرنده', 'To')}</div>
          ${direct ? `<div class="chips wrapchips" style="margin-top:10px"><button class="chip on" data-act="bcClearTo">${esc(L(direct.name))} ${ico('x', 14)}</button></div>`
            : `<div class="chips wrapchips" id="bc-segs" style="margin-top:10px">${SEGMENTS.map((s) => `<button class="chip ${prefs.seg === s.id ? 'on' : ''}" data-act="bcSeg" data-seg="${s.id}">${esc(L(s))}<em>${nf(segment(s.id).length)}</em></button>`).join('')}</div>`}
          <div class="bc-to"><div class="stack" id="bc-stack">${stack(list)}</div><span class="small muted" id="bc-count">${T(`برای ${nf(list.length)} نفر فرستاده می‌شه`, `Goes to ${list.length} ${list.length === 1 ? 'person' : 'people'}`)}</span></div>
        </section>

        <section class="card">
          <div class="micro">${T('پیام', 'Message')}</div>
          <div class="chips wrapchips" style="margin-block:10px 12px">${templates().map((t) => `<button class="chip" data-act="bcTpl" data-id="${t.id}">${esc(t.label)}</button>`).join('')}</div>
          <textarea id="bc-msg" class="textarea" data-in="bmsg" maxlength="${MAX}" placeholder="${T('یه چیزی بنویس یا از بالا یه متن آماده انتخاب کن…', 'Write something, or pick a template…')}">${esc(draft)}</textarea>
          <div class="bc-meta"><button class="btn btn-ghost btn-xs" data-act="bcName">${ico('plus', 14)} {name}</button><span class="micro tnum" id="bc-cc">${nf(draft.length)}/${nf(MAX)}</span></div>
          <button class="sw-row" data-act="bcCopy" role="switch" aria-checked="${copy}">
            <div class="grow"><div class="li-t">${T('یه نسخه هم برای خودم بفرست', 'Send a copy to me too')}</div><div class="li-s">${T('تا ببینی دقیقاً چی به دست مخاطب می‌رسه.', 'So you can see what the recipient sees.')}</div></div>
            <span class="switch ${copy ? 'on' : ''}"></span>
          </button>
        </section>
        <button class="btn btn-primary btn-block" id="bc-send" data-act="bcSend" ${draft.trim() && list.length ? '' : 'disabled'}>${ico('send', 18)} ${T('بفرست', 'Send')}</button>
      </div>

      <aside class="bc-side">
        <div class="micro" style="margin-bottom:10px">${T('پیش‌نمایش', 'Preview')}</div>
        <div class="notif glass">
          ${avatar(h, 40)}
          <div class="grow"><div class="notif-top"><b>${esc(L(h.name))}</b><span class="micro">${T('همین حالا', 'now')}</span></div>
            <p class="small" id="bc-prev">${draft.trim() ? esc(fill(draft, sample)) : `<span class="muted">${T('پیامت اینجا نشون داده می‌شه.', 'Your message appears here.')}</span>`}</p></div>
        </div>
        ${sample ? `<p class="micro" style="margin-top:10px">${T(`{name} برای هر نفر با اسم خودش عوض می‌شه؛ مثلاً «${esc(first(sample.name))}».`, `{name} changes per person — e.g. “${esc(first(sample.name))}”.`)}</p>` : ''}

        <div class="micro" style="margin:28px 0 10px">${T('ارسال‌شده‌ها', 'Sent')}</div>
        ${hist.length ? `<div class="list">${hist.slice(0, 6).map((b) => `<div class="li"><div class="grow"><div class="li-t clamp2">${esc(b.text)}</div><div class="li-s">${T(`${nf(b.n)} نفر`, `${b.n} people`)} · ${esc(ago(b.ts))}</div></div></div>`).join('')}</div>`
          : `<div class="empty compact"><p class="small muted">${T('پیام‌هایی که می‌فرستی اینجا می‌مونن.', 'Messages you send are kept here.')}</p></div>`}
      </aside>
    </div>
  </div>`;
}

/* patch the live parts — typing never re-renders the page */
function refresh() {
  const list = recipients(), sample = list[0];
  const q = (s) => document.querySelector(s);
  if (!q('#bc-msg')) return;
  q('#bc-stack').innerHTML = stack(list);
  q('#bc-count').textContent = T(`برای ${nf(list.length)} نفر فرستاده می‌شه`, `Goes to ${list.length} ${list.length === 1 ? 'person' : 'people'}`);
  q('#bc-cc').textContent = `${nf(draft.length)}/${nf(MAX)}`;
  q('#bc-prev').innerHTML = draft.trim() ? esc(fill(draft, sample)) : `<span class="muted">${T('پیامت اینجا نشون داده می‌شه.', 'Your message appears here.')}</span>`;
  q('#bc-send').disabled = !(draft.trim() && list.length);
  document.querySelectorAll('#bc-segs .chip').forEach((b) => b.classList.toggle('on', b.dataset.seg === prefs.seg));
}

onInput({ bmsg(el) { draft = el.value; refresh(); } });
on({
  bcSeg(el) {
    prefs.seg = el.dataset.seg; prefs.to = null;
    const c = el.closest('#bc-segs'); c?.querySelectorAll('.chip').forEach((b) => b.classList.toggle('on', b === el));
    refresh();
  },
  bcClearTo() { prefs.to = null; commit(() => {}); },
  bcTpl(el) {
    const t = templates().find((x) => x.id === el.dataset.id); if (!t) return;
    draft = t.text; const ta = document.getElementById('bc-msg'); if (ta) { ta.value = draft; ta.focus(); }
    refresh();
  },
  bcName() {
    const ta = document.getElementById('bc-msg'); if (!ta) return;
    const s = ta.selectionStart ?? ta.value.length, e = ta.selectionEnd ?? s;
    ta.value = (ta.value.slice(0, s) + '{name}' + ta.value.slice(e)).slice(0, MAX);
    draft = ta.value; ta.focus(); ta.setSelectionRange(s + 6, s + 6); refresh();
  },
  bcCopy(el) {
    copy = !copy; el.setAttribute('aria-checked', copy); el.querySelector('.switch').classList.toggle('on', copy);
  },
  async bcSend() {
    const list = recipients(); const text = draft.trim();
    if (!text || !list.length) return;
    const ok = await confirmSheet({
      title: T(`برای ${nf(list.length)} نفر بفرستم؟`, `Send to ${list.length} ${list.length === 1 ? 'person' : 'people'}?`),
      text: fill(text, list[0]),
      ok: T('بفرست', 'Send'),
    });
    if (!ok) return;
    const mine = userName(), to = prefs.to || null, seg = prefs.seg;
    draft = ''; prefs.to = null;            // clear first: commit re-renders synchronously
    commit((s) => {
      s.studio.broadcasts.unshift({ id: uid('b'), ts: Date.now(), text: text.length > 140 ? text.slice(0, 140) + '…' : text, n: list.length, to, seg });
      if (copy) {
        const body = text.replace(/\{name\}/g, String(mine).split(' ')[0]);
        s.inbox.unshift({ id: uid('n'), ts: Date.now() + 2, kind: 'host', host: ME, title: { fa: 'جریان', en: 'Jaryan' }, body: { fa: body, en: body }, read: false });
      }
    });
    toast(T(`برای ${nf(list.length)} نفر فرستاده شد`, `Sent to ${list.length} ${list.length === 1 ? 'person' : 'people'}`), 'send');
  },
});
