/* One consistent stroke icon set (24px grid, 1.7 stroke, round caps).
   `dir` icons mirror in RTL via CSS (.ico.dir). */
const P = {
  discover: '<circle cx="12" cy="12" r="9"/><path d="M15.6 8.4l-2.1 5.1-5.1 2.1 2.1-5.1z"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  ticket: '<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5V10a2 2 0 0 0 0 4v1.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 15.5V14a2 2 0 0 0 0-4z"/><path d="M14.5 6.5v11" stroke-dasharray="1.6 2.4"/>',
  user: '<circle cx="12" cy="8.5" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.4 7-5.4s6.2 1.8 7 5.4"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="2"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="2"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="3"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  users: '<circle cx="9" cy="8.5" r="3.3"/><path d="M3 19.5c.6-3.2 3-4.9 6-4.9s5.4 1.7 6 4.9"/><path d="M16 5.5a3.2 3.2 0 0 1 0 6.1M18 14.8c1.7.6 2.8 2 3.1 4.2"/>',
  megaphone: '<path d="M4 10.5v3a1.5 1.5 0 0 0 1.5 1.5H8l7.5 4V5L8 9H5.5A1.5 1.5 0 0 0 4 10.5z"/><path d="M18.5 9.5a3.4 3.4 0 0 1 0 5"/><path d="M8 15l1 4.5h2.2L10.4 15.6"/>',
  page: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="M4 9.5h16M9.5 9.5V20"/>',
  bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>',
  bookmark: '<path d="M6.5 4.5h11a1 1 0 0 1 1 1V20l-6.5-4.2L5.5 20V5.5a1 1 0 0 1 1-1z"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  chev: '<path d="M9 5l7 7-7 7"/>',
  chevd: '<path d="M5 9l7 7 7-7"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  up: '<path d="M7 17L17 7M8.5 7H17v8.5"/>',
  share: '<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 12v6.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V12"/>',
  pin: '<path d="M12 21s6.5-5.6 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5.4 6.5 11 6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  edit: '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z"/><path d="M14.5 7.5l3 3"/>',
  trash: '<path d="M5 7h14M10 7V5h4v2M7 7l.8 12h8.4L17 7"/><path d="M10 11v5M14 11v5"/>',
  copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5V6.5A2.5 2.5 0 0 0 13 4H6.5A2.5 2.5 0 0 0 4 6.5V13A2.5 2.5 0 0 0 6.5 15.5h2"/>',
  send: '<path d="M20 4L10.5 13.5M20 4l-6 16-3.5-6.5L4 10z"/>',
  scan: '<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M4 12h16"/>',
  filter: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z"/>',
  spark: '<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/><path d="M18.5 16.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  star: '<path d="M12 4.5l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z"/>',
  download: '<path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 19.5h14"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  ig: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.8" cy="7.2" r=".6" fill="currentColor"/>',
  verified: '<path d="M12 2.8l2.3 1.7 2.8-.1 1 2.7 2.3 1.7-.9 2.7.9 2.7-2.3 1.7-1 2.7-2.8-.1L12 21.2l-2.3-1.7-2.8.1-1-2.7-2.3-1.7.9-2.7-.9-2.7 2.3-1.7 1-2.7 2.8.1z" fill="currentColor" stroke="none"/><path d="M8.6 12.2l2.4 2.4 4.4-4.8" stroke="#0E0B10" stroke-width="1.9"/>',
  trend: '<path d="M4 16l5-5 3.5 3.5L20 7"/><path d="M14.5 7H20v5.5"/>',
  wallet: '<path d="M4 8a3 3 0 0 1 3-3h10v3"/><rect x="4" y="8" width="16" height="11.5" rx="3"/><circle cx="16" cy="13.8" r="1.1" fill="currentColor"/>',
  tag: '<path d="M4.5 12.2V5.5a1 1 0 0 1 1-1h6.7l7.3 7.3a1.4 1.4 0 0 1 0 2l-5.7 5.7a1.4 1.4 0 0 1-2 0z"/><circle cx="8.8" cy="8.8" r="1.1" fill="currentColor"/>',
  lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14-4L4 9.5M4 5v4.5h4.5M4 13a8 8 0 0 0 14 4l2-2.5M20 19v-4.5h-4.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8v.2"/>',
  dots: '<circle cx="6" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18" cy="12" r="1.2" fill="currentColor"/>',
  cup: '<path d="M6 8h10v4.5A5 5 0 0 1 11 17.5 5 5 0 0 1 6 12.5zM16 9.5h1.5a2 2 0 0 1 0 4H16M5 20.5h12"/>',
  play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
};
const DIR = new Set(['chev', 'back', 'arrow', 'up', 'send']);

export function ico(name, size = 22, cls = '') {
  const d = P[name];
  if (!d) return '';
  return `<svg class="ico ${DIR.has(name) ? 'dir' : ''} ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
}
