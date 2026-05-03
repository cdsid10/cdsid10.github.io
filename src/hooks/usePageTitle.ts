import { useEffect } from 'react';

/**
 * A custom hook to set the page title dynamically.
 * It appends a suffix to the provided title for consistency.
 * 
 * @param title The custom title for the current page.
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    const baseTitle = 'Siddhant Rathor';
    const fullTitle = title === baseTitle ? title : `${title} | ${baseTitle}`;
    
    document.title = fullTitle;
  }, [title]);
}
