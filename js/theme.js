/* Light / dark. Dark is the brand's own (Ember Nightfall); light is its day side.
   The inline script in <head> sets data-theme before first paint, so there is never a flash.
   Switching reveals the new theme in a circle growing from the button where the browser
   supports View Transitions, and cross-fades where it does not. */
const KEY = 'wte.theme';
const root = document.documentElement;
const COLOR = { dark: '#0E0B10', light: '#F4F0E9' };

export const theme = () => (root.dataset.theme === 'light' ? 'light' : 'dark');

function apply(t) {
  root.dataset.theme = t;
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', COLOR[t]);
  document.querySelector('meta[name=color-scheme]')?.setAttribute('content', t);
  try { localStorage.setItem(KEY, t); } catch (_) { /* private mode — the choice just lasts this visit */ }
  syncButtons();
}
export function syncButtons() {
  const light = theme() === 'light';
  document.querySelectorAll('.theme-btn').forEach((b) => {
    b.setAttribute('aria-pressed', String(light));
    b.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
  });
}

export function setTheme(t, origin) {
  if (t === theme()) return;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (document.startViewTransition && !reduce) {
    const x = origin?.x ?? innerWidth / 2, y = origin?.y ?? 0;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.classList.add('vt');
    const vt = document.startViewTransition(() => apply(t));
    vt.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 700, easing: 'cubic-bezier(.22,1,.36,1)', pseudoElement: '::view-transition-new(root)' },
      );
    }).catch(() => {});
    vt.finished.finally(() => root.classList.remove('vt'));
  } else {
    root.classList.add('theming');
    apply(t);
    setTimeout(() => root.classList.remove('theming'), 480);
  }
}
export const toggleTheme = (origin) => setTheme(theme() === 'dark' ? 'light' : 'dark', origin);
export const initTheme = () => apply(theme());
