/**
 * [GLOBAL] Portfolio version switch (URL-driven, no storage).
 *   (no parameter) / ?portfolio=improved   the improved site (default; invalid values fall back to it)
 *   ?portfolio=original                    the original site, without the improvements gated by `isImproved`
 * The version is read once per page load. Client-side navigation drops the query string, so
 * `keepPortfolioParam` re-adds the parameter to the address bar after each route change; a refresh or a copied
 * URL then lands in the same version. Nothing is written to localStorage or sessionStorage.
 */
const KEY = 'portfolio';
const requested = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get(KEY);
const explicit = requested === 'original' || requested === 'improved' ? requested : null;

export const isImproved = explicit !== 'original';

export function keepPortfolioParam() {
  if (!explicit) return;
  const url = new URL(window.location.href);
  if (url.searchParams.get(KEY) === explicit) return;
  url.searchParams.set(KEY, explicit);
  window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
}
