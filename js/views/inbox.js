/* Inbox: platform notes, booking confirmations, and whatever hosts broadcast to you. */
import { S, commit } from '../store.js';
import { T, L } from '../i18n.js';
import { ico } from '../icons.js';
import { esc, ago } from '../util.js';
import { getHost } from '../model.js';
import { avatar, empty, on } from '../ui.js';
import { navigate } from '../app.js';
import { markSvg } from '../brand.js';

export const title = () => T('اعلان‌ها', 'Inbox');

const who = (n) => {
  const h = n.host ? getHost(n.host) : null;
  return h ? avatar(h, 42) : `<span class="av wte-av" style="width:42px;height:42px">${markSvg('wte-mark')}</span>`;
};
const name = (n) => (n.host ? L(getHost(n.host)?.name) : 'Went to Event');

export function render() {
  const items = [...S().inbox].sort((a, b) => b.ts - a.ts);
  const unread = items.filter((n) => !n.read).length;
  return `
  <div class="wrap narrow">
    <div class="st-head" style="margin-bottom:18px">
      <div><h1 class="h1">${T('اعلان‌ها', 'Inbox')}</h1>${unread ? `<p class="muted st-sub">${T(`${unread} پیام نخونده`, `${unread} unread`)}</p>` : ''}</div>
      <div class="st-actions">${unread ? `<button class="btn btn-glass btn-sm" data-act="readAll">${ico('check', 15)} ${T('همه رو خوندم', 'Mark all read')}</button>` : ''}</div>
    </div>
    ${items.length ? `<div class="inbox-list">${items.map((n) => `
      <button class="msg ${n.read ? '' : 'unread'}" data-act="openMsg" data-id="${n.id}">
        ${who(n)}
        <div class="grow">
          <div class="msg-top"><b>${esc(L(n.title))}</b><span class="micro">${esc(ago(n.ts))}</span></div>
          <div class="micro" style="margin-bottom:5px">${esc(name(n))}</div>
          <p class="small msg-body">${esc(L(n.body))}</p>
        </div>
        ${n.read ? '' : '<i class="msg-dot"></i>'}
      </button>`).join('')}</div>`
      : empty('bell', T('خبری نیست', 'All quiet'), T('هر وقت میزبانی پیام بده یا رزروت تأیید بشه، اینجا میاد.', 'Host messages and booking confirmations will show up here.'))}
  </div>`;
}

/* read-state changes are silent so the page doesn't jump; the bell and cards are patched in place */
const patch = () => {
  document.querySelectorAll('.msg.unread').forEach((m) => { m.classList.remove('unread'); m.querySelector('.msg-dot')?.remove(); });
  document.querySelectorAll('#topbar .icon-btn .dot').forEach((d) => d.remove());
};
export function mount() {
  const t = setTimeout(() => {
    if (!S().inbox.some((n) => !n.read)) return;
    commit((s) => s.inbox.forEach((n) => { n.read = true; }), { silent: true });
    patch();
    document.querySelector('[data-act="readAll"]')?.remove();
    document.querySelector('.st-sub')?.remove();
  }, 2400);
  return () => clearTimeout(t);
}

on({
  readAll() {
    commit((s) => s.inbox.forEach((n) => { n.read = true; }), { silent: true });
    patch();
    document.querySelector('[data-act="readAll"]')?.remove();
    document.querySelector('.st-sub')?.remove();
  },
  openMsg(el) {
    const n = S().inbox.find((x) => x.id === el.dataset.id); if (!n) return;
    if (!n.read) { commit((s) => { s.inbox.find((x) => x.id === n.id).read = true; }, { silent: true }); patch(); }
    if (n.kind === 'booking') navigate('/tickets');
    else if (n.host) navigate('/h/' + n.host);
  },
});
