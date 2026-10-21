import { useEffect, useRef, type RefObject } from 'react';

/**
 * [GLOBAL] Modal dialog behaviour
 * Shared by the fullscreen image gallery and the document modal so both behave as true modals:
 * 1. Focus moves into the dialog when it opens and returns to the opener when it closes.
 * 2. Tab / Shift+Tab are contained inside the dialog.
 * 3. Escape closes it (only the top-most open modal reacts, so a gallery opened from the
 *    document modal closes first and leaves the document modal open).
 * 4. Everything else on the page is made `inert` (unreachable by keyboard, pointer and
 *    assistive technology) for as long as the dialog is open.
 *
 * `containerRef` must be a direct child of <body> (both modals render through a portal).
 */
const openModals: HTMLElement[] = [];

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Marks every other direct child of <body> inert and returns a function that undoes only what it changed. */
function inertBackground(keep: HTMLElement) {
  const changed: HTMLElement[] = [];
  Array.from(document.body.children).forEach((child) => {
    const el = child as HTMLElement;
    if (el === keep || el.contains(keep) || el.tagName === 'SCRIPT' || el.hasAttribute('inert')) return;
    el.setAttribute('inert', '');
    changed.push(el);
  });
  return () => changed.forEach((el) => el.removeAttribute('inert'));
}

interface ModalOptions {
  isOpen: boolean;
  containerRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
}

export function useModalDialog({ isOpen, containerRef, onClose, initialFocusRef }: ModalOptions) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (!container) return;

    const opener = document.activeElement as HTMLElement | null;
    openModals.push(container);
    const restoreBackground = inertBackground(container);
    const frame = requestAnimationFrame(() => (initialFocusRef?.current ?? container).focus());

    const handleKeyDown = (e: KeyboardEvent) => {
      if (openModals[openModals.length - 1] !== container) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (e.key !== 'Tab') return;
      const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.getClientRects().length > 0
      );
      if (items.length === 0) {
        e.preventDefault();
        container.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!container.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && (active === first || active === container)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', handleKeyDown, true);
      const index = openModals.indexOf(container);
      if (index !== -1) openModals.splice(index, 1);
      restoreBackground();
      if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, [isOpen]);
}
