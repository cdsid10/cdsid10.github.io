import { Children, isValidElement, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { prefersReducedMotion } from '../lib/utils';

/**
 * [GLOBAL] Managed Video
 * Replaces the raw <video> blocks authored in the Markdown deep dives.
 *
 * 1. LOADING: a video gets no `src` (and `preload="none"`) until it is within ~600px of the visible
 *    area of the page scroller; its small poster loads from ~1500px away. Before this, the markup used `autoplay`, which made every video on the
 *    page download in full as soon as it was inserted.
 * 2. POSTER: a still from the video's own footage is shown while it loads, and the box is reserved at
 *    16:9, so nothing shifts when the video arrives.
 * 3. PLAYBACK: plays only while at least 25% visible, pauses when scrolled away (same as before).
 *    With `prefers-reduced-motion: reduce` it starts paused on its poster and plays only on request.
 * 4. CONTROL: a real <button> over the video toggles play/pause (pointer, Enter and Space) and names the
 *    action after the figure caption. The existing `.vid-overlay` pause glyph is still shown while paused.
 */
const POSTERS: Record<string, string> = {
  '/videos/Katavader/3_in_1_Enemy_Attacks.mp4': '/images/Katavader/Video_Posters/3_in_1_Enemy_Attacks.webp',
  '/videos/Katavader/Enemy_Combat_Mechanics.mp4': '/images/Katavader/Video_Posters/Enemy_Combat_Mechanics.webp',
  '/videos/Katavader/Player_Decision_Making.mp4': '/images/Katavader/Video_Posters/Player_Decision_Making.webp',
  '/videos/Katavader/Enemy_vs_Enemy.mp4': '/images/Katavader/Video_Posters/Enemy_vs_Enemy.webp',
  '/videos/Katavader/Enemy_Early_AI.mp4': '/images/Katavader/Video_Posters/Enemy_Early_AI.webp',
};

const PRELOAD_MARGIN = '600px 0px'; // [GLOBAL] How far ahead of the viewport the video data starts loading
const POSTER_MARGIN = '1500px 0px'; // [GLOBAL] Posters (25-50 KB) load earlier so they are ready before the video data competes for bandwidth
const PLAY_THRESHOLD = 0.25; // [GLOBAL] Fraction of the video that must be visible to play

type Intent = 'auto' | 'paused' | 'playing';

function getSourceUrl(children: ReactNode): string | undefined {
  let found: string | undefined;
  Children.forEach(children, (child) => {
    if (!found && isValidElement<{ src?: string }>(child) && typeof child.props.src === 'string') {
      found = child.props.src;
    }
  });
  return found;
}

export default function ManagedVideo({ children, style, className }: { children?: ReactNode; style?: React.CSSProperties; className?: string }) {
  const src = getSourceUrl(children);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isNear, setIsNear] = useState(false);
  const [isPosterNear, setIsPosterNear] = useState(false);
  const [intent, setIntent] = useState<Intent>(() => (prefersReducedMotion() ? 'paused' : 'auto'));
  const [caption, setCaption] = useState('');

  // Latest values for the observer callbacks, which are created once.
  const isVisibleRef = useRef(false);
  const latest = useRef({ isNear, intent });
  latest.current = { isNear, intent };

  const syncPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const { isNear: near, intent: wanted } = latest.current;
    if (near && isVisibleRef.current && wanted !== 'paused') {
      video.play().catch(() => { /* autoplay can be refused by the browser; the poster stays visible */ });
    } else {
      video.pause();
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setCaption(video.closest('figure')?.querySelector('figcaption')?.textContent?.replace(/\s+/g, ' ').trim() ?? '');

    // The page scrolls inside #scroll-container, so observe relative to it for the margin to apply.
    const root = video.closest('#scroll-container');
    const nearObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setIsNear(true);
        nearObserver.disconnect();
      }
    }, { root, rootMargin: PRELOAD_MARGIN });
    const posterObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setIsPosterNear(true);
        posterObserver.disconnect();
      }
    }, { root, rootMargin: POSTER_MARGIN });
    const viewObserver = new IntersectionObserver((entries) => {
      isVisibleRef.current = entries[entries.length - 1].isIntersecting;
      syncPlayback();
    }, { root, threshold: PLAY_THRESHOLD });

    nearObserver.observe(video);
    posterObserver.observe(video);
    viewObserver.observe(video);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => setIntent(e.matches ? 'paused' : 'auto');
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      nearObserver.disconnect();
      posterObserver.disconnect();
      viewObserver.disconnect();
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, [syncPlayback]);

  useEffect(() => {
    syncPlayback();
  }, [isNear, intent, syncPlayback]);

  // [GLOBAL] The authored overlay (pause glyph) marks the paused state, as it did for click-to-pause before.
  useEffect(() => {
    const overlay = videoRef.current?.parentElement?.querySelector<HTMLElement>('.vid-overlay');
    if (overlay) overlay.style.opacity = intent === 'paused' ? '1' : '0';
  }, [intent]);

  const posterUrl = (isPosterNear || isNear) && src ? POSTERS[src] : undefined;
  const label = `${intent === 'paused' ? 'Play' : 'Pause'} video${caption ? `: ${caption}` : ''}`;

  return (
    <>
      <video
        ref={videoRef}
        src={isNear ? src : undefined}
        poster={posterUrl}
        preload={isNear ? 'metadata' : 'none'}
        loop
        muted
        playsInline
        aria-hidden="true"
        className={className}
        // The poster is also the CSS background: calling play() clears the native poster before the first frame
        // arrives, which would leave a dark box on slow connections. Decoded video frames paint over it.
        style={{
          aspectRatio: '16 / 9',
          backgroundColor: '#0f0f0f',
          backgroundImage: posterUrl ? `url(${posterUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          ...style,
        }}
      />
      <button
        type="button"
        onClick={() => setIntent((current) => (current === 'paused' ? 'playing' : 'paused'))}
        aria-label={label}
        className="absolute inset-0 w-full h-full p-0 border-0 bg-transparent cursor-pointer"
      />
    </>
  );
}
