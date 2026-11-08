/* Host sign-in. One clear job: get a host into their panel. Visitors are told plainly they don't need an account. */
import { S, commit } from '../store.js';
import { T } from '../i18n.js';
import { ico } from '../icons.js';
import { uid, validPhone, normPhone } from '../util.js';
import { on, toast, openSheet } from '../ui.js';
import { markSvg } from '../brand.js';
import { signIn, takeNext, authed } from '../auth.js';
import { navigate, refreshTop } from '../app.js';

export const title = () => T('ورود میزبان‌ها', 'Host sign-in');

const perks = () => [
  ['page', T('صفحه‌ی اختصاصی خودت', 'Your own public page'), T('معرفی، رویدادها، گالری و نظرات مهمون‌ها', 'Intro, events, gallery and guest reviews')],
  ['ticket', T('فروش بلیت و لیست ورودی', 'Ticketing and the door list'), T('رزرو آنلاین، کد تخفیف و اسکن بلیت دم در', 'Online booking, discount codes, scan at the door')],
  ['users', T('مخاطب‌هات رو بشناس', 'Know your audience'), T('کی اومده، کی برنگشته، و یه پیام برای همه', "Who came, who hasn't been back, and one message to all")],
];

export function render() {
  if (authed()) { setTimeout(() => navigate('/studio', true), 0); return '<div class="wrap"></div>'; }
  return `
  <div class="login">
    <a class="icon-btn glass login-back" href="#/" aria-label="${T('برگشت', 'Back')}">${ico('back', 20, 'dir')}</a>
    <aside class="login-art dark-scope">
      <img src="media/hero-poster.webp" alt="">
      <div class="login-art-in">
        <div class="login-brand">${markSvg('mark')}<b class="latin">Went to Event</b></div>
        <h2 class="display login-claim">${T('رویدادتو بساز،<br><em>ما بقیه‌شو</em> ردیف می‌کنیم.', 'Run the event.<br><em>We handle</em> the rest.')}</h2>
        <ul class="login-perks">${perks().map(([i, t, s]) => `<li><span class="lp-ico">${ico(i, 18)}</span><div><b>${t}</b><span>${s}</span></div></li>`).join('')}</ul>
      </div>
    </aside>

    <section class="login-main">
      <div class="login-card">
        <div class="login-mark">${markSvg('mark')}</div>
        <h1 class="h1">${T('ورود میزبان‌ها', 'Host sign-in')}</h1>
        <p class="muted login-sub">${T('برای مدیریت رویدادها، فروش بلیت و مخاطب‌هات وارد پنلت شو.', 'Sign in to run your events, ticket sales and audience.')}</p>

        <form class="login-form" id="lg-form" novalidate>
          <div class="field"><label for="lg-id">${T('نام کاربری', 'Username')}</label>
            <div class="input-ico">${ico('user', 18)}<input id="lg-id" class="input ltr" autocomplete="username" autocapitalize="off" spellcheck="false" placeholder="${T('مثلاً jaryan', 'e.g. jaryan')}" required></div></div>
          <div class="field"><label for="lg-pw">${T('رمز عبور', 'Password')}</label>
            <div class="input-ico">${ico('lock', 18)}<input id="lg-pw" class="input ltr" type="password" autocomplete="current-password" placeholder="••••••••" required>
              <button type="button" class="pw-eye" data-act="pwEye" aria-label="${T('نمایش رمز', 'Show password')}">${ico('eye', 18)}</button></div></div>
          <p class="err-t login-err" id="lg-err" hidden></p>
          <button class="btn btn-primary btn-block" type="submit" id="lg-go">${T('ورود به پنل', 'Sign in')} ${ico('arrow', 18, 'dir')}</button>
        </form>

        <div class="login-or"><span>${T('فقط می‌خوای رویدادها رو ببینی؟', 'Just browsing?')}</span></div>
        <p class="small muted login-note">${T('برای دیدن رویدادها و رزرو جا، لازم نیست وارد بشی.', "You don't need an account to see events or reserve a spot.")}</p>
        <a class="btn btn-glass btn-block" href="#/">${ico('discover', 18)} ${T('دیدن رویدادها', 'See events')}</a>

        <button class="login-ask" data-act="hostAsk">${T('میزبانی ولی هنوز حساب نداری؟', 'Host without an account?')} <b>${T('درخواست بده', 'Request one')}</b></button>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const f = root.querySelector('#lg-form');
  if (!f) return;
  setTimeout(() => root.querySelector('#lg-id')?.focus({ preventScroll: true }), 350);
  f.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const id = root.querySelector('#lg-id'), pw = root.querySelector('#lg-pw'), err = root.querySelector('#lg-err'), go = root.querySelector('#lg-go');
    err.hidden = true;
    if (!id.value.trim()) { id.classList.add('err'); id.focus(); return; }
    if (!pw.value) { pw.classList.add('err'); pw.focus(); return; }
    const label = go.innerHTML;
    go.innerHTML = '<span class="spin"></span>'; go.classList.add('is-off');
    setTimeout(() => {
      if (signIn(id.value, pw.value)) {
        refreshTop();
        toast(T('خوش اومدی! وارد پنلت شدی', "Welcome back — you're in your panel"), 'check');
        navigate(takeNext(), true);
      } else {
        go.innerHTML = label; go.classList.remove('is-off');
        err.hidden = false; err.textContent = T('نام کاربری یا رمز عبور درست نیست. یه بار دیگه امتحان کن.', "That username or password isn't right. Try again.");
        const card = root.querySelector('.login-card'); card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
        pw.select();
      }
    }, 650);
  });
  root.querySelectorAll('.input').forEach((i) => i.addEventListener('input', () => i.classList.remove('err')));
}

on({
  pwEye(el) {
    const i = document.getElementById('lg-pw'); if (!i) return;
    const show = i.type === 'password'; i.type = show ? 'text' : 'password';
    el.classList.toggle('on', show); el.setAttribute('aria-label', show ? T('پنهان کردن رمز', 'Hide password') : T('نمایش رمز', 'Show password'));
  },
  hostAsk() {
    const s = openSheet({
      title: T('درخواست حساب میزبان', 'Request a host account'),
      body: `
        <p class="small muted" style="margin-bottom:16px">${T('اطلاعاتتو بفرست؛ تیم Went to Event باهات تماس می‌گیره و حسابتو راه می‌ندازه.', "Send your details — the Went to Event team will call you and set up your account.")}</p>
        <div class="field"><label for="ha-n">${T('اسم خودت یا مجموعه‌ت', 'Your name or brand')}</label><input id="ha-n" class="input" autocomplete="organization"></div>
        <div class="field"><label for="ha-p">${T('شماره موبایل', 'Mobile number')}</label><input id="ha-p" class="input ltr" inputmode="tel" placeholder="0912 345 6789" style="text-align:start"><span class="err-t" id="ha-e" hidden></span></div>
        <div class="field" style="margin-bottom:0"><label for="ha-i">${T('پیج اینستاگرام (اختیاری)', 'Instagram (optional)')}</label><input id="ha-i" class="input ltr" placeholder="@" style="text-align:start"></div>`,
      foot: `<button class="btn btn-primary btn-block" data-send>${T('بفرست', 'Send request')}</button>`,
    });
    s.el.addEventListener('click', (ev) => {
      if (!ev.target.closest('[data-send]')) return;
      const n = s.$('#ha-n'), p = s.$('#ha-p');
      if (n.value.trim().length < 2) { n.classList.add('err'); n.focus(); return; }
      if (!validPhone(p.value)) { const e = s.$('#ha-e'); e.hidden = false; e.textContent = T('شماره باید با ۰۹ شروع بشه و ۱۱ رقم باشه', 'Enter a mobile number starting with 09 (11 digits)'); p.focus(); return; }
      commit((x) => { x.hostRequests.push({ id: uid('hr'), name: n.value.trim(), phone: normPhone(p.value), ig: s.$('#ha-i').value.trim(), ts: Date.now() }); }, { silent: true });
      s.close(); toast(T('درخواستت ثبت شد؛ بعد از بررسی خبرت می‌کنیم', "Request saved — we'll get back to you after review"), 'check');
    });
  },
});

