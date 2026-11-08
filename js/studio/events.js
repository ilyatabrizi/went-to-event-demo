/* Events — everything Jaryan runs: create, edit, cancel. Edits write to the same store the attendee side reads. */
import { S, commit } from '../store.js';
import { T, L } from '../i18n.js';
import { ico } from '../icons.js';
import { esc, nf, money, compact, dFull, dateOf, today0, DAY, toLatinDigits, timeRange, sum, uid } from '../util.js';
import { eventsOf, getEvent, seats, guests, byTime } from '../model.js';
import { CATEGORIES, GALLERY, ME, jimg } from '../data.js';
import { poster, empty, tabs, panel, on, openSheet, confirmSheet, toast, catName } from '../ui.js';
import { pageHead, statusPill } from './kit.js';
import { navigate } from '../app.js';

export const title = () => T('رویدادها', 'Events');

const revenueOf = (e) => sum(guests(e.id).filter((g) => g.paid), (g) => g.amount);

function row(e) {
  const s = seats(e), d = dateOf(e.day), off = e.status === 'cancelled';
  return `<article class="se-row ${off ? 'is-off' : ''}" data-id="${e.id}">
    <div class="thumb">${poster(e, 480)}</div>
    <div class="grow">
      <div class="se-top">${statusPill(e)}<span class="micro">${esc(catName(e))}</span></div>
      <h3 class="h3 se-t">${off ? esc(L(e.title)) : `<a class="stretch" href="#/studio/events/${e.id}">${esc(L(e.title))}</a>`}</h3>
      <div class="small muted">${esc(dFull(d))} · ${esc(timeRange(e.from, e.to))}</div>
      <div class="se-nums">
        <span><b class="tnum">${nf(s.taken)}</b><span class="muted">/${nf(s.total)}</span></span>
        <span class="muted">${money(e.price)}</span>
        ${e.day < 0 || s.taken ? `<span class="se-rev">${compact(revenueOf(e))} ${T('تومان', 'toman')}</span>` : ''}
      </div>
      <div class="meter"><i style="width:${Math.round(s.fill * 100)}%"></i></div>
    </div>
    <div class="se-act">
      ${off ? `<button class="btn btn-glass btn-xs" data-act="seRestore" data-id="${e.id}">${ico('refresh', 14)} ${T('برگردون', 'Restore')}</button>` : `
        <a class="btn btn-glass btn-xs" href="#/studio/events/${e.id}">${ico(e.day < 0 ? 'users' : 'scan', 14)} ${e.day < 0 ? T('مهمون‌ها', 'Guests') : T('لیست ورودی', 'Door list')}</a>
        ${e.day >= 0 ? `<button class="btn btn-glass btn-xs" data-act="seEdit" data-id="${e.id}">${ico('edit', 14)} ${T('ویرایش', 'Edit')}</button>` : ''}
        <span class="grow"></span>
        <button class="icon-btn sq" data-act="share" data-id="${e.id}" aria-label="${T('اشتراک', 'Share')}" title="${T('اشتراک', 'Share')}">${ico('share', 17)}</button>
        ${e.day >= 0 ? `<button class="icon-btn sq" data-act="seCancel" data-id="${e.id}" aria-label="${T('کنسل کردن رویداد', 'Cancel event')}" title="${T('کنسل کردن رویداد', 'Cancel event')}">${ico('trash', 17)}</button>` : ''}`}
    </div>
  </article>`;
}

export function render() {
  const all = eventsOf(ME);
  const up = all.filter((e) => e.status !== 'cancelled' && e.day >= 0).sort(byTime);
  const past = all.filter((e) => e.status !== 'cancelled' && e.day < 0).sort((a, b) => b.day - a.day);
  const off = all.filter((e) => e.status === 'cancelled');
  const items = [{ id: 'up', label: T('پیش رو', 'Upcoming'), n: up.length }, { id: 'past', label: T('برگزارشده', 'Past'), n: past.length }];
  if (off.length) items.push({ id: 'off', label: T('کنسل‌شده', 'Cancelled'), n: off.length });
  return `
  <div class="wrap st-wrap">
    ${pageHead(T('رویدادها', 'Events'), T('همه‌ی رویدادهات، یه جا.', 'Everything Jaryan runs, in one place.'),
      `<button class="btn btn-primary btn-sm" data-act="seNew">${ico('plus', 16)} ${T('رویداد تازه', 'New event')}</button>`)}
    ${tabs('se', items, 'up')}
    <div class="se-panels">
      ${panel('se', 'up', up.length ? `<div class="se-list">${up.map(row).join('')}</div>` : empty('calendar', T('فعلاً رویدادی تو برنامه نداری', 'Nothing upcoming'), T('اولین رویدادتو بساز؛ همون لحظه تو صفحه‌ت نشون داده می‌شه.', 'Create your first event — it shows on your public page right away.'), `<button class="btn btn-primary" data-act="seNew">${ico('plus', 16)} ${T('رویداد تازه', 'New event')}</button>`))}
      ${panel('se', 'past', past.length ? `<div class="se-list">${past.map(row).join('')}</div>` : empty('clock', T('هنوز چیزی برگزار نشده', 'Nothing held yet'), ''))}
      ${off.length ? panel('se', 'off', `<div class="se-list">${off.map(row).join('')}</div>`) : ''}
    </div>
  </div>`;
}

/* ─────────────────────────────────────────────────────────── editor sheet */
const dayOpts = (cur) => {
  const days = [...new Set([...Array(120).keys(), Math.max(0, cur)])].sort((a, b) => a - b);
  return days.map((d) => `<option value="${d}" ${d === cur ? 'selected' : ''}>${esc(dFull(dateOf(d)))}${d === 0 ? ' · ' + T('امروز', 'today') : d === 1 ? ' · ' + T('فردا', 'tomorrow') : ''}</option>`).join('');
};
const timeOpts = (cur) => {
  const list = [];
  for (let m = 6 * 60; m < 24 * 60 + 30; m += 30) list.push(`${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  if (cur && !list.includes(cur)) list.push(cur);
  return list.map((t) => `<option value="${t}" ${t === cur ? 'selected' : ''}>${t}</option>`).join('');
};
const num = (v) => Number(toLatinDigits(String(v)).replace(/[^\d]/g, '')) || 0;

export function openEventEditor(id) {
  const cur = id ? getEvent(id) : null;
  const isNew = !cur;
  const e = cur || { id: '', cat: 'workshop', day: 3, from: '17:00', to: '19:00', price: 600000, seats: 12, taken: 0, img: GALLERY[0], title: '', lede: '' };
  const st = cur ? seats(cur) : { taken: 0 };
  let img = e.bloom ? null : e.img || null;
  const thumb = (k) => `<button type="button" class="ph ${img === k ? 'on' : ''}" data-ph="${k ?? ''}" aria-label="${k ?? 'none'}">${k ? `<img src="${jimg(k, 480)}" alt="">` : `<span>${T('بدون عکس', 'No photo')}</span>`}</button>`;

  const s = openSheet({
    title: isNew ? T('رویداد تازه', 'New event') : T('ویرایش رویداد', 'Edit event'),
    full: false, cls: 'editor',
    body: `
      <div class="field"><label for="ev-t">${T('عنوان', 'Title')}</label><input id="ev-t" class="input" value="${esc(isNew ? '' : L(e.title))}" placeholder="${T('مثلاً: ورکشاپ سفالگری', 'e.g. Pottery workshop')}" maxlength="70"></div>
      <div class="field"><label for="ev-l">${T('توضیح کوتاه', 'Short description')}</label><textarea id="ev-l" class="textarea" maxlength="220" placeholder="${T('یکی دو جمله که آدما رو ترغیب کنه بیان', 'One or two lines that make people want to come')}">${esc(isNew ? '' : L(e.lede))}</textarea></div>
      <div class="field"><label for="ev-c">${T('دسته', 'Category')}</label>
        <select id="ev-c" class="select">${CATEGORIES.map((c) => `<option value="${c.id}" ${e.cat === c.id ? 'selected' : ''}>${esc(L(c))}</option>`).join('')}</select></div>
      <div class="two">
        <div class="field"><label for="ev-d">${T('تاریخ', 'Date')}</label><select id="ev-d" class="select">${dayOpts(e.day)}</select></div>
        <div class="field"><label for="ev-from">${T('شروع', 'Starts')}</label><select id="ev-from" class="select">${timeOpts(e.from)}</select></div>
      </div>
      <div class="two">
        <div class="field"><label for="ev-to">${T('پایان', 'Ends')}</label><select id="ev-to" class="select">${timeOpts(e.to)}</select></div>
        <div class="field"><label for="ev-s">${T('ظرفیت', 'Seats')}</label><input id="ev-s" class="input ltr" inputmode="numeric" value="${nf(e.seats)}" style="text-align:start">${st.taken ? `<span class="hint">${T(`${nf(st.taken)} جا رزرو شده`, `${st.taken} already booked`)}</span>` : ''}</div>
      </div>
      <div class="field"><label for="ev-p">${T('قیمت هر نفر (تومان)', 'Price per person (toman)')}</label><input id="ev-p" class="input ltr" inputmode="numeric" value="${nf(e.price)}" style="text-align:start"><span class="hint">${T('اگه رایگانه، ۰ بنویس', '0 means free')}</span></div>
      <div class="field" style="margin-bottom:0"><label>${T('پوستر', 'Poster')}</label>
        <div class="ph-rail" id="ev-ph">${[null, ...GALLERY].map(thumb).join('')}</div></div>
      <span class="err-t" id="ev-err" hidden style="display:block;margin-top:12px"></span>`,
    foot: `<button class="btn btn-primary btn-block" data-save>${isNew ? T('منتشرش کن', 'Publish event') : T('ذخیره‌ی تغییرات', 'Save changes')}</button>`,
  });

  s.el.addEventListener('input', (ev) => {
    if (ev.target.id !== 'ev-p' && ev.target.id !== 'ev-s') return;
    const n = num(ev.target.value); ev.target.value = n ? nf(n) : '';
    ev.target.classList.remove('err'); s.$('#ev-err').hidden = true;
  });
  s.el.addEventListener('click', (ev) => {
    const p = ev.target.closest('[data-ph]');
    if (p) { img = p.dataset.ph || null; s.$$('.ph').forEach((b) => b.classList.toggle('on', b === p)); return; }
    if (!ev.target.closest('[data-save]')) return;
    const err = (msg, sel) => { const x = s.$('#ev-err'); x.hidden = false; x.textContent = msg; const f = s.$(sel); f?.classList.add('err'); f?.focus(); };
    s.$$('.err').forEach((f) => f.classList.remove('err'));
    const t = s.$('#ev-t').value.trim(), l = s.$('#ev-l').value.trim();
    const day = s.$('#ev-d').value !== '' ? Number(s.$('#ev-d').value) : NaN;
    const seatsN = num(s.$('#ev-s').value), price = num(s.$('#ev-p').value);
    if (t.length < 2) return err(T('یه اسم براش بنویس.', 'Give it a title.'), '#ev-t');
    if (!isFinite(day) || day < 0) return err(T('تاریخ باید امروز یا بعدش باشه.', 'Pick today or a later date.'), '#ev-d');
    if (!s.$('#ev-from').value || !s.$('#ev-to').value) return err(T('ساعت شروع و پایان رو مشخص کن.', 'Set a start and end time.'), '#ev-from');
    if (s.$('#ev-from').value === s.$('#ev-to').value) return err(T('ساعت پایان با شروع یکیه؛ یکی‌شو عوض کن.', 'The end time is the same as the start.'), '#ev-to');
    if (seatsN < 1) return err(T('ظرفیت حداقل باید ۱ نفر باشه.', 'Seats must be at least 1.'), '#ev-s');
    if (seatsN < st.taken) return err(T(`ظرفیت نمی‌تونه از ${nf(st.taken)} (تعداد رزروها) کمتر باشه.`, `Seats can't go below ${st.taken} — already booked.`), '#ev-s');

    const lang = S().lang, cat = s.$('#ev-c').value;
    const common = { cat, day, from: s.$('#ev-from').value, to: s.$('#ev-to').value, price, seats: seatsN, img, bloom: !img };
    if (isNew) {
      const body = l ? [l] : [];
      commit((x) => {
        x.studio.created.push({
          id: uid('ev'), host: ME, taken: 0, gallery: [], level: { fa: 'برای همه', en: 'For everyone' },
          learn: { fa: [], en: [] }, includes: { fa: [], en: [] },
          title: { fa: t, en: t }, lede: { fa: l, en: l }, body: { fa: body, en: body }, ...common,
        });
      });
      toast(T('رویدادت منتشر شد 🎉', 'Event published'), 'check');
    } else {
      const patch = { ...common, sub: cat === cur.cat ? cur.sub : null, title: { ...cur.title, [lang]: t }, lede: { ...cur.lede, [lang]: l } };
      /* a host-made event's "about" was its short description: keep the two in step */
      if (S().studio.created.some((c) => c.id === id)) patch.body = { ...(cur.body || {}), [lang]: l ? [l] : [] };
      commit((x) => {
        const i = x.studio.created.findIndex((c) => c.id === id);
        if (i >= 0) Object.assign(x.studio.created[i], patch);
        else x.studio.edits[id] = { ...(x.studio.edits[id] || {}), ...patch };
      });
      toast(T('تغییرات ذخیره شد', 'Changes saved'), 'check');
    }
    s.close();
  });
}

on({
  seNew() { openEventEditor(); },
  seEdit(el) { openEventEditor(el.dataset.id); },
  async seCancel(el) {
    const id = el.dataset.id, e = getEvent(id); if (!e) return;
    const n = S().bookings.filter((b) => b.event === id).length;
    const ok = await confirmSheet({
      title: T('این رویداد کنسل بشه؟', 'Cancel this event?'),
      text: T(`«${L(e.title)}» از صفحه‌ت برداشته می‌شه و پول رزروها برمی‌گرده.${n ? ' به همه‌ی رزروکننده‌ها هم پیام می‌ره.' : ''}`, `“${L(e.title)}” comes off your public page and bookings are refunded.${n ? ' Attendees are notified.' : ''}`),
      ok: T('آره، کنسلش کن', 'Yes, cancel it'), danger: true,
    });
    if (!ok) return;
    commit((s) => {
      s.studio.cancelled.push(id);
      const had = s.bookings.some((b) => b.event === id);
      s.bookings = s.bookings.filter((b) => b.event !== id);
      if (had) s.inbox.unshift({ id: uid('n'), ts: Date.now(), kind: 'host', host: ME, title: { fa: 'رویداد لغو شد', en: 'Event cancelled' }, body: { fa: `«${e.title.fa || L(e.title)}» لغو شد. مبلغ رزروت کامل برمی‌گردد.`, en: `“${e.title.en || L(e.title)}” was cancelled. Your reservation is refunded in full.` }, read: false });
    });
    toast(T('رویداد کنسل شد', 'Event cancelled'), 'trash');
  },
  seRestore(el) { const id = el.dataset.id; commit((s) => { s.studio.cancelled = s.studio.cancelled.filter((x) => x !== id); }); toast(T('رویداد برگشت', 'Event restored'), 'refresh'); },
});
