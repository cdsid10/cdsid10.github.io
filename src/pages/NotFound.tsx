import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

/**
 * [GLOBAL] Not found
 * Shown for unknown URLs and unknown project ids, inside the normal Layout (sidebar included). The URL is left as
 * typed. The static 404.html (same title, `noindex`) is what the host serves for these URLs with a 404 status.
 * This component owns the page title; pages that render it pass `null` to usePageTitle so only one effect sets it.
 */
export default function NotFound() {
  usePageTitle('Page not found'); // → "Page not found | Siddhant Rathor", the same as 404.html

  return (
    <div className="px-6 lg:px-20 pt-32 pb-16 max-w-4xl mx-auto">
      <h1 className="sr-only">Page not found</h1>
      <span className="eyebrow text-muted">404 · Page not found</span>
      <p className="mt-6 text-lg lg:text-xl font-light text-ink/80">
        This page does not exist.{' '}
        <Link to="/" className="underline underline-offset-4">Return to the home page</Link>
      </p>
    </div>
  );
}
