/**
 * [GLOBAL] Typography mode (hidden comparison switch, no UI).
 * The default is the "previous" system-font look (see the end of index.css). To compare with the self-hosted
 * Inter / Roboto fonts, open any URL with:
 *   ?fontMode=current   selects the self-hosted fonts and remembers the choice for this tab (sessionStorage)
 *   ?fontMode=previous  selects the system-font look explicitly and remembers it
 * Without the parameter the remembered choice is kept, so it survives client-side navigation and reloads; with no
 * choice at all the default applies. The result is written to <html data-font-mode="..."> from main.tsx before the
 * first render, so no text is painted in the wrong fonts.
 */
const KEY = 'fontMode';
type Mode = 'previous' | 'current';

const asMode = (value: string | null): Mode | null => (value === 'previous' || value === 'current' ? value : null);

export function applyFontMode() {
  const requested = asMode(new URLSearchParams(window.location.search).get(KEY));
  let mode: Mode = requested ?? 'previous';

  try {
    if (requested) sessionStorage.setItem(KEY, requested);
    else mode = asMode(sessionStorage.getItem(KEY)) ?? 'previous';
  } catch {
    // Storage blocked: the requested mode then applies to this page load only.
  }

  document.documentElement.dataset.fontMode = mode;
}
