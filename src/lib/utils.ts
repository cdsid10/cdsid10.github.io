import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * [GLOBAL] Motion preference
 * True when the visitor has asked the OS/browser to reduce motion.
 */
export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * [GLOBAL] Safe parser for the <imagegrid images='[...]'> Markdown tag.
 * A typo in authored content returns an empty list (and logs) instead of throwing during render,
 * which would otherwise unmount the whole app.
 */
export function parseImageList(raw: unknown): string[] {
  try {
    const parsed = JSON.parse(String(raw));
    return Array.isArray(parsed) ? parsed.filter((src): src is string => typeof src === 'string') : [];
  } catch (error) {
    console.error('Invalid <imagegrid> images attribute:', error);
    return [];
  }
}
