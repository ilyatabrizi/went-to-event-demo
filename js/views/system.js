/* Design system: the one page that shows the whole language — palettes in both themes, type, the three glass
 * materials, controls, shape, elevation and motion — rendered with the live tokens, so it can never drift. */
import { T, isFa } from '../i18n.js';
import { ico } from '../icons.js';
import { on, placePill } from '../ui.js';
import { markSvg } from '../brand.js';

export const title = () => T('سیستم طراحی', 'Design system');

const SWATCHES = [
  ['--bg', 'bg'], ['--surface-2', 'surface'], ['--card', 'card'], ['--fg', 'ink'], ['--muted', 'muted'],
  ['--ember', 'ember'], ['--ember-ink', 'ember-ink'], ['--ok-ink', 'ok'], ['--line-2', 'line'],
];
const palette = (scope, label) => `
  <div class="sys-pal ${scope}">
    <div class="sys-pal-h"><b>${label}</b><span class="micro">${scope === 'dark-scope' ? 'data-theme=dark' : 'data-theme=light'}</span></div>
    <div class="sys-sw">${SWATCHES.map(([v, n]) => `
      <div class="sys-sw-i"><i style="background:var(${v})"></i><span class="micro">${n}</span></div>`).join('')}
    </div>
    <p class="sys-pal-t"><b>${T('عنوان', 'Headline')}</b> <span style="color:var(--muted)">${T('متن کم‌اهمیت‌تر', 'Quieter secondary text')}</span> <span style="color:var(--ember-ink)">${T('تأکید', 'Accent')}</span></p>
  </div>`;

const motion = () => [
  ['--ease', 'ease', 'cubic-bezier(.22,1,.36,1)', T('ورود و تغییر چیدمان', 'Entrances, layout shifts')],
  ['--spring', 'spring', 'cubic-bezier(.34,1.5,.5,1)', T('لمس و لنز', 'Press, lens, toggles')],
  ['--spring-soft', 'spring soft', 'cubic-bezier(.3,1.18,.5,1)', T('کپسول‌ها و ورق‌ها', 'Capsules, sheets')],
];

export function render() {
  return `
  <div class="wrap narrow sys">
    <div class="st-head" style="margin-bottom:8px">
      <div>
        <span class="micro sys-kick">${T('زبان طراحی · نسخه ۲', 'Design language · v2')}</span>
        <h1 class="h1" style="margin-top:8px">${T('سیستم طراحی', 'Design system')}</h1>
        <p class="lede" style="margin-top:10px;max-width:54ch">${T('شیشهٔ مایع روی جوهر گرم و استخوانی. همه‌چیز با توکن ساخته شده و با تم عوض می‌شود.', 'Liquid glass over warm ink and bone. Everything below is drawn from live tokens, so it follows the theme button in the header.')}</p>
      </div>
      <span class="sys-mark">${markSvg('mark')}</span>
    </div>

    <h2 class="h2 sub-h">${T('پالت', 'Palette')}</h2>
    <div class="sys-pals">${palette('dark-scope', T('تاریک', 'Dark'))}${palette('light-scope', T('روشن', 'Light'))}</div>
    <div class="sys-brand">
      <div style="--c:#FF5B3D;--t:#0E0B10"><b>Ember</b><span class="micro">#FF5B3D</span></div>
      <div style="--c:#0E0B10;--t:#F2EEE7"><b>Ink</b><span class="micro">#0E0B10</span></div>
      <div style="--c:#F4F0E9;--t:#16111A"><b>Bone</b><span class="micro">#F4F0E9</span></div>
    </div>

    <h2 class="h2 sub-h">${T('نوشتار', 'Type')}</h2>
    <div class="card sys-type">
      <div class="sys-row"><span class="micro">Display · 800</span><div class="h1" style="margin:0">${T('رویدادهای دیدنی', 'Events worth going to')}</div></div>
      <div class="sys-row"><span class="micro">Title · 800</span><div class="h2" style="margin:0">${T('این هفته در تبریز', 'This week in Tabriz')}</div></div>
      <div class="sys-row"><span class="micro">Headline · 600</span><div class="h3">${T('کارگاه تیرامیسو', 'Tiramisu Workshop')}</div></div>
      <div class="sys-row"><span class="micro">Body · 400</span><p class="lede" style="font-size:15.5px">${T('سه ساعت ماسکارپونه و قهوهٔ تازه؛ دسرت را هم به خانه می‌بری.', 'Three hours with mascarpone and fresh espresso — and you take your own dish home.')}</p></div>
      <div class="sys-row"><span class="micro">Small · 400</span><p class="small muted">${T('جزئیات کم‌اهمیت‌تر و راهنما', 'Supporting detail and hints')}</p></div>
      <div class="sys-row"><span class="micro">Micro · ${isFa() ? 'IRANYekan' : 'JetBrains Mono'}</span><span class="micro" style="letter-spacing:.14em;text-transform:uppercase">${T('برچسب‌های کوچک', 'Small caps labels · 31 Oct')}</span></div>
      <p class="micro" style="margin-top:6px">Outfit + IRANYekan · ${T('ردیابی با اندازه کم‌تر می‌شود', 'tracking tightens as size grows')}</p>
    </div>

    <h2 class="h2 sub-h">${T('مواد شیشه‌ای', 'Glass materials')}</h2>
    <p class="small muted" style="margin:-4px 0 14px;max-width:60ch">${T('نازک، نه مات: تاری سبک، اشباع بالا، و یک نور لبه. هر چه بزرگ‌تر، ضخیم‌تر.', 'Thin, not frosted: light blur, high saturation, a rim of light. The bigger the surface, the thicker the material.')}</p>
    <div class="sys-stage">
      <i class="o1"></i><i class="o2"></i><i class="o3"></i>
      <div class="sys-glass glass-thin"><b>Thin</b><span class="micro">chips · accessories</span></div>
      <div class="sys-glass glass"><b>Regular</b><span class="micro">bars · capsules</span></div>
      <div class="sys-glass glass-thick"><b>Thick</b><span class="micro">sheets · menus</span></div>
    </div>

    <h2 class="h2 sub-h">${T('کنترل‌ها', 'Controls')}</h2>
    <div class="card sys-ctl">
      <div class="sys-line">
        <button class="btn btn-primary btn-sm">${T('رزرو', 'Reserve')}</button>
        <button class="btn btn-bone btn-sm">${T('دنبال کن', 'Follow')}</button>
        <button class="btn btn-glass btn-sm">${T('ذخیره', 'Save')}</button>
        <button class="btn btn-ghost btn-sm">${T('بعداً', 'Later')}</button>
        <button class="btn btn-danger btn-sm">${T('حذف', 'Delete')}</button>
      </div>
      <div class="sys-line">
        <span class="chip on">${T('همه', 'All')} <em>13</em></span><span class="chip">${T('موسیقی', 'Music')}</span><span class="chip">${T('کارگاه', 'Workshops')}</span>
        <span class="pill em">${T('زنده', 'Live')}</span><span class="pill ok">${ico('check', 12)} ${T('تأیید شد', 'Confirmed')}</span><span class="pill off">${T('گذشته', 'Past')}</span>
      </div>
      <div class="sys-line">
        <div class="seg" data-demo="seg"><span class="seg-pill"></span>
          <button class="on" data-act="sysSeg">${T('رویدادها', 'Events')}</button><button data-act="sysSeg">${T('میزبان‌ها', 'Hosts')}</button><button data-act="sysSeg">${T('ذخیره‌ها', 'Saved')}</button>
        </div>
        <button class="switch on" data-act="sysSwitch" aria-label="switch"></button>
        <span class="icon-btn glass-thin" style="pointer-events:none">${ico('bell', 20)}</span>
      </div>
      <div class="field" style="margin:0"><label>${T('نام', 'Name')}</label><input class="input" placeholder="${T('نامت را بنویس', 'Type your name')}"></div>
    </div>

    <h2 class="h2 sub-h">${T('شکل و ارتفاع', 'Shape & elevation')}</h2>
    <div class="sys-shapes">
      ${[['xs', 8], ['sm', 12], ['md', 18], ['lg', 26], ['xl', 34], ['pill', 999]].map(([n, r]) => `<div style="border-radius:${r === 999 ? 28 : r}px"><span class="micro">${n}</span><b>${r === 999 ? '∞' : r}</b></div>`).join('')}
    </div>
    <div class="sys-elev">
      ${[1, 2, 3].map((n) => `<div style="box-shadow:var(--shadow-${n})"><b>shadow-${n}</b><span class="micro">${['rest', 'raised', 'floating'][n - 1]}</span></div>`).join('')}
    </div>

    <h2 class="h2 sub-h">${T('حرکت', 'Motion')}</h2>
    <div class="card sys-motion">
      ${motion().map(([v, n, c, use]) => `
        <div class="sys-m"><div class="sys-m-h"><b>${n}</b><span class="micro">${c}</span></div>
          <div class="sys-track"><i style="transition-timing-function:var(${v})"></i></div>
          <span class="micro">${use}</span></div>`).join('')}
      <button class="btn btn-glass btn-sm" data-act="sysPlay" style="margin-top:6px">${ico('play', 14)} ${T('پخش', 'Play')}</button>
      <p class="micro" style="margin-top:12px">${T('حرکت کاهش‌یافته، شفافیت کاهش‌یافته و کنتراست بالا همه رعایت می‌شوند.', 'Reduced motion, reduced transparency and increased contrast are all honoured.')}</p>
    </div>

    <h2 class="h2 sub-h">${T('ناوبری', 'Navigation')}</h2>
    <div class="card">
      <ul class="sys-rules small">
        <li>${T('نوار تب با خواندن به سمت پایین جمع می‌شود و با بالا رفتن یا لمس باز می‌شود.', 'The tab bar folds as you read down and opens on scroll-up or a tap.')}</li>
        <li>${T('لنز زیر تب فعلی با انگشت کشیده می‌شود.', 'The lens under the current tab can be dragged with a finger.')}</li>
        <li>${T('تب فعلی را دوباره بزنی، به بالا می‌رود.', 'Tap the tab you are on to go back to the top.')}</li>
        <li>${T('هدر هم همراه نوار تب جمع می‌شود: فقط سوئیچ و دکمهٔ تم می‌ماند.', 'The header folds with it — only the switch and the theme button stay.')}</li>
      </ul>
    </div>
    <p class="foot-note micro" style="margin-top:26px">Went to Event · ${T('سیستم طراحی', 'design system')} v2</p>
  </div>`;
}

on({
  sysSeg(el) {
    const seg = el.closest('.seg');
    seg.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === el));
    placePill(seg);
  },
  sysSwitch(el) { el.classList.toggle('on'); },
  sysPlay() {
    const tr = [...document.querySelectorAll('.sys-track')];
    tr.forEach((t) => t.classList.remove('go'));
    document.body.offsetWidth;
    requestAnimationFrame(() => tr.forEach((t) => t.classList.add('go')));
    setTimeout(() => tr.forEach((t) => t.classList.remove('go')), 1600);
  },
});
