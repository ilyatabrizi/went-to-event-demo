/* You: profile, who you follow, language, the way into the studio, and the demo reset. */
import { S, commit } from '../store.js';
import { T, L, isFa } from '../i18n.js';
import { ico } from '../icons.js';
import { esc, nf, fmtPhone, maskPhone, normPhone, validPhone } from '../util.js';
import { userName, hosts, myUpcoming, getHost, unread } from '../model.js';
import { ME } from '../data.js';
import { avatar, verified, sampleTag, person, on, openSheet, confirmSheet, toast } from '../ui.js';
import { followBtn } from '../cards.js';
import { doReset } from '../app.js';

export const title = () => T('من', 'You');

export function render() {
  const st = S();
  const name = userName();
  const fol = st.following.map(getHost).filter(Boolean);
  const n = unread();
  return `
  <div class="wrap narrow">
    <section class="me-head">
      ${person(name, 72)}
      <div class="grow">
        <h1 class="h1 me-name">${esc(name)}</h1>
        <div class="micro latin ltr" style="margin-top:4px">${esc(maskPhone(st.user.phone))}</div>
      </div>
      <button class="btn btn-glass btn-sm" data-act="editMe">${ico('edit', 15)} ${T('ویرایش', 'Edit')}</button>
    </section>

    <section class="me-stats">
      <a href="#/tickets"><b>${nf(myUpcoming().length)}</b><span class="micro">${T('بلیت', 'Tickets')}</span></a>
      <a href="#/tickets" data-saved><b>${nf(st.saved.length)}</b><span class="micro">${T('ذخیره', 'Saved')}</span></a>
      <a href="#/explore" data-follow><b>${nf(fol.length)}</b><span class="micro">${T('دنبال‌شده', 'Following')}</span></a>
    </section>

    <button class="card hi studio-cta" data-act="mode" data-mode="studio">
      <div class="grow">
        <div class="micro ember">${T('برای میزبان‌ها', 'For hosts')}</div>
        <h2 class="h2" style="margin-block:6px 6px">${T('استودیوی جریان را باز کن', "Open Jaryan's studio")}</h2>
        <p class="small muted">${T('ببین رزروها، مخاطبان و صفحهٔ یک میزبان واقعی چطور اینجا اداره می‌شود.', 'See how a real host runs bookings, audience and their page here.')}</p>
      </div>
      <span class="cta-arrow">${ico('arrow', 22)}</span>
    </button>

    <h2 class="h2 sub-h">${T('میزبان‌هایی که دنبال می‌کنی', "Hosts you follow")}</h2>
    ${fol.length ? `<div class="list">${fol.map((h) => `
      <div class="li">
        ${avatar(h, 44)}
        <a class="grow" href="#/h/${h.id}"><div class="li-t">${esc(L(h.name))} ${h.verified ? verified(14) : ''}</div><div class="li-s">${esc(L(h.tagline))}${h.sample ? ' · ' + T('نمونه', 'Sample') : ''}</div></a>
        ${followBtn(h.id, 'sm')}
      </div>`).join('')}</div>`
      : `<div class="empty compact"><p class="small muted">${T('هنوز کسی را دنبال نمی‌کنی. وقتی میزبانی را دنبال کنی، خبرهایش در اعلان‌ها می‌آید.', "You're not following anyone yet. Hosts you follow can message you in the inbox.")}</p><a class="btn btn-glass btn-sm" href="#/explore">${T('پیدا کردن میزبان', 'Find hosts')}</a></div>`}

    <h2 class="h2 sub-h">${T('تنظیمات', 'Settings')}</h2>
    <div class="list">
      <a class="li" href="#/inbox"><span class="li-ico">${ico('bell', 19)}</span><div class="grow"><div class="li-t">${T('اعلان‌ها', 'Inbox')}</div><div class="li-s">${n ? T(`${nf(n)} خوانده‌نشده`, `${n} unread`) : T('همه خوانده شده', 'All read')}</div></div>${ico('chev', 18, 'chev')}</a>
      <a class="li" href="#/system"><span class="li-ico">${ico('spark', 19)}</span><div class="grow"><div class="li-t">${T('سیستم طراحی', 'Design system')}</div><div class="li-s">${T('رنگ، شیشه، نوشتار و حرکت', 'Colour, glass, type and motion')}</div></div>${ico('chev', 18, 'chev')}</a>
      <div class="li"><span class="li-ico">${ico('globe', 19)}</span></span><div class="grow"><div class="li-t">${T('زبان', 'Language')}</div><div class="li-s">${T('فارسی یا English', 'Persian or English')}</div></div>
        <div class="seg lang-seg"><span class="seg-pill"></span>
          <button class="${isFa() ? 'on' : ''}" ${isFa() ? '' : 'data-act="lang"'}>فارسی</button>
          <button class="latin ${isFa() ? '' : 'on'}" ${isFa() ? 'data-act="lang"' : ''}>English</button>
        </div></div>
    </div>

    <h2 class="h2 sub-h">${T('دربارهٔ این دمو', 'About this demo')}</h2>
    <div class="card demo-note">
      <p class="small">${T('این یک پروتوتایپ کلیک‌پذیر است. هر چه انجام دهی — دنبال کردن، ذخیره، رزرو — فقط در همین مرورگر می‌ماند و بلافاصله در استودیوی جریان دیده می‌شود. پرداخت واقعی وجود ندارد.', 'This is a clickable prototype. Everything you do — follow, save, reserve — stays in this browser and shows up in Jaryan\'s studio immediately. No real payments happen.')}</p>
      <p class="small muted" style="margin-top:10px">${T('قیمت‌ها و تاریخ‌های جریان آزمایشی‌اند؛ سه میزبان دیگر نمونه‌اند.', "Jaryan's prices and dates are placeholders; the other three hosts are samples.")}</p>
      <button class="btn btn-danger btn-sm" style="margin-top:16px" data-act="askReset">${ico('refresh', 15)} ${T('بازگرداندن دمو به حالت اول', 'Reset demo')}</button>
    </div>
    <p class="foot-note micro" style="margin-top:26px">Went to Event · ${T('دموی پلتفرم', 'platform demo')}</p>
  </div>`;
}

on({
  editMe() {
    const st = S();
    const s = openSheet({
      title: T('ویرایش مشخصات', 'Edit profile'),
      body: `
        <div class="field"><label for="me-n">${T('نام', 'Name')}</label><input id="me-n" class="input" value="${esc(st.user.name || userName())}" autocomplete="name"></div>
        <div class="field"><label for="me-p">${T('شمارهٔ موبایل', 'Mobile number')}</label><input id="me-p" class="input ltr" inputmode="tel" value="${esc(fmtPhone(st.user.phone))}" style="text-align:start"><span class="err-t" id="me-e" hidden></span></div>
        <p class="small muted">${T('میزبان‌هایی که دنبال می‌کنی یا از آن‌ها بلیت می‌گیری، نام و شمارهٔ تو را در لیست مخاطبانشان می‌بینند.', 'Hosts you follow or book with see your name and number in their audience list.')}</p>`,
      foot: `<button class="btn btn-primary btn-block" data-save>${T('ذخیره', 'Save')}</button>`,
    });
    s.el.addEventListener('click', (ev) => {
      if (!ev.target.closest('[data-save]')) return;
      const name = s.$('#me-n').value.trim(), phone = s.$('#me-p').value;
      if (name.length < 2) { s.$('#me-n').classList.add('err'); s.$('#me-n').focus(); return; }
      if (!validPhone(phone)) { const e = s.$('#me-e'); e.hidden = false; e.textContent = T('شماره باید با ۰۹ شروع شود و ۱۱ رقم باشد', 'Enter a mobile number starting with 09 (11 digits)'); s.$('#me-p').focus(); return; }
      commit((x) => { x.user.name = name; x.user.phone = normPhone(phone); });
      s.close(); toast(T('ذخیره شد', 'Saved'), 'check');
    });
  },
  async askReset() {
    const ok = await confirmSheet({ title: T('بازگرداندن دمو؟', 'Reset the demo?'), text: T('همهٔ رزروها، ذخیره‌ها، دنبال‌کردن‌ها و تغییراتی که در استودیو داده‌ای پاک می‌شود.', 'All bookings, saves, follows and studio changes will be cleared.'), ok: T('بله، پاک کن', 'Yes, reset'), danger: true });
    if (ok) doReset();
  },
});
