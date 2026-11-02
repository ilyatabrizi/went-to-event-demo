/* Discount codes: make one in a few taps, see how many times it was used, switch it off. Booking checks them live. */
import { S, commit } from '../store.js';
import { T, L } from '../i18n.js';
import { ico } from '../icons.js';
import { esc, nf, money, uid, dFull, DAY } from '../util.js';
import { codes, eventsOf, isLive, getEvent } from '../model.js';
import { ME } from '../data.js';
import { on, openSheet, toast, confirmSheet, empty, placeAllPills, placePill } from '../ui.js';
import { pageHead } from './kit.js';

export const title = () => T('کدهای تخفیف', 'Discount codes');

const stateTxt = (c) => ({
  on: `<span class="pill ok">${T('فعال', 'Active')}</span>`,
  off: `<span class="pill off">${T('خاموش', 'Off')}</span>`,
  expired: `<span class="pill off">${T('تاریخش گذشته', 'Expired')}</span>`,
  full: `<span class="pill off">${T('تموم شده', 'Used up')}</span>`,
}[c.state]);
const valueTxt = (c) => (c.type === 'pct' ? T(`${nf(c.value)}٪ تخفیف`, `${c.value}% off`) : T(`${money(c.value)} تخفیف`, `${money(c.value)} off`));

/* writes go to the stored list; the first write copies the seeded set over */
const edit = (fn) => commit((s) => { s.studio.codes = s.studio.codes ?? codes().map(({ used, expired, full, state, ...c }) => ({ ...c, used: used - S().bookings.filter((b) => b.promo === c.code).length })); fn(s.studio.codes); });

export function render() {
  const list = codes();
  const live = list.filter((c) => c.state === 'on');
  const uses = list.reduce((a, c) => a + c.used, 0);
  return `
  <div class="wrap st-wrap">
    <a class="back-link" href="#/studio">${ico('back', 16)} ${T('پنل', 'Panel')}</a>
    ${pageHead(T('کدهای تخفیف', 'Discount codes'), T('یه کد بساز و تو اینستاگرام یا برای مشتری‌های ثابتت بفرست. موقع رزرو خودکار اعمال می‌شه.', 'Make a code and share it on Instagram or with regulars. It applies automatically at checkout.'),
      `<button class="btn btn-primary btn-sm" data-act="codeNew">${ico('plus', 15)} ${T('کد جدید', 'New code')}</button>`)}

    <section class="mini-kpis">
      <div class="card"><span class="micro">${T('کدهای فعال', 'Active codes')}</span><b class="tnum">${nf(live.length)}</b></div>
      <div class="card"><span class="micro">${T('دفعات استفاده', 'Times used')}</span><b class="tnum">${nf(uses)}</b></div>
    </section>

    ${list.length ? `<div class="code-list">${list.map((c) => {
      const ev = c.event ? getEvent(c.event) : null;
      const pct = c.limit ? Math.min(1, c.used / c.limit) : 0;
      return `<article class="code-card ${c.state !== 'on' ? 'dim' : ''}">
        <div class="code-top">
          <button class="code-chip latin" data-act="codeCopy" data-code="${esc(c.code)}" title="${T('کپی', 'Copy')}">${esc(c.code)} ${ico('copy', 14)}</button>
          ${stateTxt(c)}
        </div>
        <div class="code-val">${valueTxt(c)}</div>
        <div class="small muted">${ev ? T(`فقط برای «${esc(L(ev.title))}»`, `Only for “${esc(L(ev.title))}”`) : T('برای همه‌ی رویدادها', 'All events')} · ${c.expires ? (c.expired ? T('تموم شد', 'Ended') : T(`تا ${esc(dFull(new Date(c.expires)))}`, `Until ${esc(dFull(new Date(c.expires)))}`)) : T('بدون تاریخ انقضا', 'No end date')}</div>
        <div class="code-use"><div class="meter wide"><i style="width:${Math.round(pct * 100)}%"></i></div><span class="micro tnum">${nf(c.used)}${c.limit ? ` / ${nf(c.limit)}` : ''}</span></div>
        <div class="code-acts">
          ${c.state === 'expired' || c.state === 'full' ? '' : `<button class="btn btn-glass btn-xs" data-act="codeToggle" data-id="${c.id}">${c.active ? T('خاموشش کن', 'Turn off') : T('روشنش کن', 'Turn on')}</button>`}
          <button class="icon-btn sq" data-act="codeDel" data-id="${c.id}" aria-label="${T('حذف', 'Delete')}">${ico('trash', 16)}</button>
        </div>
      </article>`;
    }).join('')}</div>` : empty('tag', T('هنوز کدی نساختی', 'No codes yet'), T('با یه کد تخفیف کوچیک، مشتری‌های قدیمی‌تو برگردون.', 'A small discount brings regulars back.'), `<button class="btn btn-primary" data-act="codeNew">${T('اولین کدتو بساز', 'Make your first code')}</button>`)}
  </div>`;
}

const suggest = () => { const w = ['JARYAN', 'WELCOME', 'FRIEND', 'VIP', 'NIGHT']; return w[Math.floor(Math.random() * w.length)] + (10 + Math.floor(Math.random() * 40)); };

on({
  codeNew() {
    const evs = eventsOf(ME).filter((e) => isLive(e) && e.day >= 0);
    let type = 'pct';
    const s = openSheet({
      title: T('کد تخفیف جدید', 'New discount code'),
      body: `
        <div class="field"><label for="cd-code">${T('خود کد', 'Code')}</label>
          <div class="promo-row"><input id="cd-code" class="input ltr latin" value="${suggest()}" maxlength="16" autocapitalize="characters" spellcheck="false"><button class="btn btn-glass" data-gen type="button">${ico('refresh', 16)}</button></div>
          <span class="hint">${T('حروف انگلیسی و عدد؛ مشتری همینو موقع رزرو وارد می‌کنه.', 'Letters and numbers — guests type this at checkout.')}</span></div>
        <div class="field"><label>${T('نوع تخفیف', 'Type')}</label>
          <div class="seg seg-full" id="cd-type"><span class="seg-pill"></span><button class="on" data-t="pct" type="button">${T('درصدی', 'Percent')}</button><button data-t="amt" type="button">${T('مبلغ ثابت', 'Fixed amount')}</button></div></div>
        <div class="field"><label for="cd-val" id="cd-val-l">${T('چند درصد؟', 'How many percent?')}</label><input id="cd-val" class="input ltr" inputmode="numeric" value="10"></div>
        <div class="field-row">
          <div class="field"><label for="cd-lim">${T('چند بار قابل استفاده‌ست؟', 'How many uses?')}</label><input id="cd-lim" class="input ltr" inputmode="numeric" value="30"><span class="hint">${T('خالی یعنی نامحدود', 'Blank = unlimited')}</span></div>
          <div class="field"><label for="cd-days">${T('تا چند روز؟', 'Valid for (days)')}</label><input id="cd-days" class="input ltr" inputmode="numeric" value="14"></div>
        </div>
        <div class="field" style="margin-bottom:0"><label for="cd-ev">${T('برای کدوم رویداد؟', 'Which event?')}</label>
          <select id="cd-ev" class="select"><option value="">${T('همه‌ی رویدادها', 'All events')}</option>${evs.map((e) => `<option value="${e.id}">${esc(L(e.title))}</option>`).join('')}</select></div>
        <span class="err-t" id="cd-err" hidden></span>`,
      foot: `<button class="btn btn-primary btn-block" data-make>${T('ساختن کد', 'Create code')}</button>`,
      onMount: (sh) => { setTimeout(() => placeAllPills(sh.el, true), 40); },
    });
    s.el.addEventListener('click', (ev) => {
      if (ev.target.closest('[data-gen]')) { s.$('#cd-code').value = suggest(); return; }
      const t = ev.target.closest('#cd-type button');
      if (t) {
        type = t.dataset.t;
        s.el.querySelectorAll('#cd-type button').forEach((b) => b.classList.toggle('on', b === t));
        placePill(s.$('#cd-type'));
        s.$('#cd-val-l').textContent = type === 'pct' ? T('چند درصد؟', 'How many percent?') : T('چند تومن؟', 'How many toman?');
        s.$('#cd-val').value = type === 'pct' ? '10' : '50000';
        return;
      }
      if (!ev.target.closest('[data-make]')) return;
      const err = s.$('#cd-err'); err.hidden = true;
      const code = s.$('#cd-code').value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      const val = Number(String(s.$('#cd-val').value).replace(/[^\d]/g, ''));
      const lim = Number(String(s.$('#cd-lim').value).replace(/[^\d]/g, '')) || 0;
      const days = Number(String(s.$('#cd-days').value).replace(/[^\d]/g, '')) || 0;
      const bad = (m) => { err.hidden = false; err.textContent = m; };
      if (code.length < 3) return bad(T('کد حداقل ۳ حرف باشه', 'Use at least 3 characters'));
      if (codes().some((c) => c.code === code)) return bad(T('این کد رو قبلاً ساختی', 'You already have this code'));
      if (!val || (type === 'pct' && val > 90)) return bad(type === 'pct' ? T('درصد باید بین ۱ تا ۹۰ باشه', 'Percent must be 1–90') : T('مبلغ رو وارد کن', 'Enter an amount'));
      edit((list) => list.unshift({ id: uid('k'), code, type, value: val, limit: lim, used: 0, expires: days ? Date.now() + days * DAY : null, event: s.$('#cd-ev').value || null, active: true }));
      s.close(); toast(T(`کد ${code} ساخته شد`, `Code ${code} created`), 'tag');
    });
  },
  codeToggle(el) { edit((list) => { const c = list.find((x) => x.id === el.dataset.id); if (c) c.active = !c.active; }); },
  async codeDel(el) {
    const c = codes().find((x) => x.id === el.dataset.id);
    const ok = await confirmSheet({ title: T('این کد پاک بشه؟', 'Delete this code?'), text: T(`کد «${c.code}» دیگه کار نمی‌کنه. رزروهایی که باهاش انجام شده سر جاشون می‌مونن.`, `“${c.code}” stops working. Bookings that used it stay as they are.`), ok: T('آره، پاکش کن', 'Yes, delete'), danger: true });
    if (ok) edit((list) => { const i = list.findIndex((x) => x.id === el.dataset.id); if (i >= 0) list.splice(i, 1); });
  },
  codeCopy(el) { navigator.clipboard?.writeText(el.dataset.code).then(() => toast(T('کد کپی شد', 'Code copied'), 'copy')).catch(() => toast(el.dataset.code, 'tag')); },
});
