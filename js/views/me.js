/* You: profile, who you follow, language, and the way in for hosts. */
import { S, commit } from '../store.js';
import { T, L, isFa } from '../i18n.js';
import { ico } from '../icons.js';
import { esc, nf, fmtPhone, maskPhone, normPhone, validPhone } from '../util.js';
import { userName, hosts, myUpcoming, getHost, unread } from '../model.js';
import { ME } from '../data.js';
import { avatar, verified, person, on, openSheet, toast, setTab } from '../ui.js';
import { prefs as xprefs } from './explore.js';
import { getEvent } from '../model.js';
import { authed } from '../auth.js';
import { followBtn } from '../cards.js';

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
        ${st.user.phone ? `<div class="micro latin ltr" style="margin-top:4px">${esc(maskPhone(st.user.phone))}</div>` : `<div class="small muted" style="margin-top:4px">${T('اسم و شماره‌تو بذار تا رزرو سریع‌تر بشه', 'Add your name and number to book faster')}</div>`}
      </div>
      <button class="btn btn-glass btn-sm" data-act="editMe">${ico('edit', 15)} ${st.user.name ? T('ویرایش', 'Edit') : T('تکمیل', 'Add')}</button>
    </section>

    <section class="me-stats">
      <a href="#/tickets"><b>${nf(myUpcoming().length)}</b><span class="micro">${T('بلیت', 'Tickets')}</span></a>
      <a href="#/tickets" data-act="meSaved" data-native><b>${nf(st.saved.map(getEvent).filter((e) => e && e.status !== 'cancelled').length)}</b><span class="micro">${T('ذخیره', 'Saved')}</span></a>
      <a href="#/explore" data-act="meFollow" data-native><b>${nf(fol.length)}</b><span class="micro">${T('دنبال‌شده', 'Following')}</span></a>
    </section>

    ${authed() ? `<a class="card hi studio-cta" href="#/studio">
      <div class="grow">
        <div class="micro ember">${T('حساب میزبان', 'Host account')}</div>
        <h2 class="h2" style="margin-block:6px 6px">${T('رفتن به پنل مدیریت', 'Go to your panel')}</h2>
        <p class="small muted">${T('رویدادها، فروش، مخاطب‌ها و صفحه‌ت، همه یه جا.', 'Events, sales, audience and your page in one place.')}</p>
      </div>
      <span class="cta-arrow">${ico('arrow', 22)}</span>
    </a>` : `<a class="card hi studio-cta" href="#/login">
      <div class="grow">
        <div class="micro ember">${T('برای میزبان‌ها', 'For hosts')}</div>
        <h2 class="h2" style="margin-block:6px 6px">${T('رویدادتو اینجا برگزار کن', 'Run your events here')}</h2>
        <p class="small muted">${T('صفحه‌ی اختصاصی، فروش بلیت و لیست مخاطب‌ها، همه تو یه پنل. اگه میزبانی، وارد شو.', 'Your own page, ticketing and audience in one panel. Hosts, sign in here.')}</p>
      </div>
      <span class="cta-arrow">${ico('arrow', 22)}</span>
    </a>`}

    <h2 class="h2 sub-h">${T('میزبان‌هایی که دنبالشون می‌کنی', "Hosts you follow")}</h2>
    ${fol.length ? `<div class="list">${fol.map((h) => `
      <div class="li">
        ${avatar(h, 44)}
        <a class="grow" href="#/h/${h.id}"><div class="li-t">${esc(L(h.name))} ${h.verified ? verified(14) : ''}</div><div class="li-s">${esc(L(h.tagline))}</div></a>
        ${followBtn(h.id, 'sm')}
      </div>`).join('')}</div>`
      : `<div class="empty compact"><p class="small muted">${T('هنوز کسی رو دنبال نمی‌کنی. هر میزبانی رو دنبال کنی، خبرهاش میاد تو اعلان‌هات.', "You're not following anyone yet. Hosts you follow can message you in the inbox.")}</p><a class="btn btn-glass btn-sm" href="#/explore">${T('پیدا کردن میزبان', 'Find hosts')}</a></div>`}

    <h2 class="h2 sub-h">${T('تنظیمات', 'Settings')}</h2>
    <div class="list">
      <a class="li" href="#/inbox"><span class="li-ico">${ico('bell', 19)}</span><div class="grow"><div class="li-t">${T('اعلان‌ها', 'Inbox')}</div><div class="li-s">${n ? T(`${nf(n)} تا نخونده`, `${n} unread`) : T('همه رو خوندی', 'All read')}</div></div>${ico('chev', 18, 'chev')}</a>
      <div class="li"><span class="li-ico">${ico('globe', 19)}</span><div class="grow"><div class="li-t">${T('زبان', 'Language')}</div><div class="li-s">${T('فارسی یا English', 'Persian or English')}</div></div>
        <div class="seg lang-seg"><span class="seg-pill"></span>
          <button class="${isFa() ? 'on' : ''}" ${isFa() ? '' : 'data-act="lang"'}>فارسی</button>
          <button class="latin ${isFa() ? '' : 'on'}" ${isFa() ? 'data-act="lang"' : ''}>English</button>
        </div></div>
    </div>

    <p class="foot-note micro" style="margin-top:30px"><span class="latin">Went to Event</span> · ${T('رویدادهای شهرت، یه جا', 'Your city\'s events, in one place')}</p>
  </div>`;
}

on({
  meSaved() { setTab('tickets', 'saved'); },
  meFollow() { xprefs.cat = 'following'; xprefs.q = ''; xprefs.tab = 'events'; },
  editMe() {
    const st = S();
    const s = openSheet({
      title: T('ویرایش اطلاعات', 'Edit profile'),
      body: `
        <div class="field"><label for="me-n">${T('نام', 'Name')}</label><input id="me-n" class="input" value="${esc(st.user.name || userName())}" autocomplete="name"></div>
        <div class="field"><label for="me-p">${T('شماره موبایل', 'Mobile number')}</label><input id="me-p" class="input ltr" inputmode="tel" value="${esc(fmtPhone(st.user.phone))}" style="text-align:start"><span class="err-t" id="me-e" hidden></span></div>
        <p class="small muted">${T('میزبان‌هایی که دنبالشون می‌کنی یا ازشون بلیت می‌گیری، اسم و شماره‌تو تو لیست مخاطب‌هاشون می‌بینن.', 'Hosts you follow or book with see your name and number in their audience list.')}</p>`,
      foot: `<button class="btn btn-primary btn-block" data-save>${T('ذخیره', 'Save')}</button>`,
    });
    s.el.addEventListener('click', (ev) => {
      if (!ev.target.closest('[data-save]')) return;
      const name = s.$('#me-n').value.trim(), phone = s.$('#me-p').value;
      if (name.length < 2) { s.$('#me-n').classList.add('err'); s.$('#me-n').focus(); return; }
      if (s.closed) return;
      if (!validPhone(phone)) { const e = s.$('#me-e'); e.hidden = false; e.textContent = T('شماره باید با ۰۹ شروع بشه و ۱۱ رقم باشه', 'Enter a mobile number starting with 09 (11 digits)'); s.$('#me-p').focus(); return; }
      commit((x) => { x.user.name = name; x.user.phone = normPhone(phone); });
      s.close(); toast(T('ذخیره شد', 'Saved'), 'check');
    });
  },
});
