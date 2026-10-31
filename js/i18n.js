/* Language: Persian (default, RTL) and English (LTR).
   Strings live next to the markup that uses them: T('فارسی', 'English').
   Host-authored content ships as { fa, en } pairs and is read with L(). */
import { S, commit } from './store.js';

export const lang = () => S().lang;
export const isFa = () => S().lang === 'fa';
export const T = (fa, en) => (S().lang === 'fa' ? fa : en);

/* pick from a { fa, en } pair — or pass a plain string through */
export const L = (v) => {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  return v[S().lang] ?? v.fa ?? v.en ?? '';
};
export const LL = (v) => {                  // lists
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return v[S().lang] ?? v.fa ?? v.en ?? [];
};

export function applyLang() {
  const fa = isFa();
  const d = document.documentElement;
  d.lang = fa ? 'fa' : 'en';
  d.dir = fa ? 'rtl' : 'ltr';
}
export function setLang(l) {
  commit((s) => { s.lang = l; }, { silent: true });
  applyLang();
}
