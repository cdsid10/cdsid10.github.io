import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

import { projects, techDefinitions } from '../data/projects';
import ImageGallery from '../components/ImageGallery';
import ImageGrid from "../components/ImageGrid";

/**
 * [GLOBAL]
 * This logic handles the global definition of animation configuration for parallax effects.
 * Ensuring consistency across uses and preventing unnecessary object re-creations during renders.
 */
const SPRING_CONFIG = { damping: 20, stiffness: 100 };
const PARALLAX_RANGE = 15;

/**
 * [GLOBAL]
 * This logic specifies the desktop screen size breakpoint used across the component
 * to differentiate between mobile touch events and desktop hover interactions.
 */
const DESKTOP_BREAKPOINT = 1024;

/**
 * [GLOBAL]
 * This logic provides custom styled rendering components for the ReactMarkdown parser.
 * By hoisting this out of the render function, we prevent unnecessary object recreation on every render.
 * The styling incorporates [DESKTOP] specific sizing (e.g., lg:text-5xl) across headings and paragraphs.
 */
function MarkdownImage(props: any) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <img
        {...props}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          setIsOpen(true);
          if (props.onClick) props.onClick(e);
        }}
        style={{ ...props.style, cursor: 'pointer' }}
      />
      <ImageGallery
        images={[props.src].filter(Boolean)}
        modalOnly={true}
        isOpen={isOpen}
        startIndex={0}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}



const markdownComponents: any = {
  h1: ({ children }: any) => <h1 className="text-3xl lg:text-5xl tracking-[1px] mb-12 mt-20 first:mt-0">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-xl lg:text-2xl tracking-[1px] mb-8 mt-16">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-lg lg:text-xl tracking-[1px] mb-6 mt-12">{children}</h3>,
  p: ({ children }: any) => <div className="text-lg lg:text-xl font-light text-ink/80 mb-8 leading-relaxed">{children}</div>,
  ul: ({ children }: any) => <ul className="space-y-4 mb-10 list-disc pl-6 text-ink/70">{children}</ul>,
  li: ({ children }: any) => <li className="text-lg font-light">{children}</li>,

  imagegrid: ({ node, ...props }: any) => {
    const images = JSON.parse(props.images);

    return (
      <ImageGrid
        images={images}
        caption={props.caption}
        cols={props.cols ? parseInt(props.cols) : undefined}
        rows={props.rows ? parseInt(props.rows) : undefined}
      />
    );
  },
  img: ({ node, ...props }: any) => <MarkdownImage {...props} />,
};

/**
 * [GLOBAL]
 * This function returns the matching SVG icon depending on the store type.
 * It abstracts out the massive inline SVGs to keep the JSX exceptionally clean.
 */
function StorefrontIcon({ type }: { type: string }) {
  switch (type) {
    case 'steam':
      return (
        <svg role="img" width="20" height="20" fill="currentColor" className="shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z" />
        </svg>
      );
    case 'itch':
      return (
        <svg role="img" width="20" height="20" fill="currentColor" className="shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <title>Itch.io</title>
          <path d="M3.13 1.338C2.08 1.96.02 4.328 0 4.95v1.03c0 1.303 1.22 2.45 2.325 2.45 1.33 0 2.436-1.102 2.436-2.41 0 1.308 1.07 2.41 2.4 2.41 1.328 0 2.362-1.102 2.362-2.41 0 1.308 1.137 2.41 2.466 2.41h.024c1.33 0 2.466-1.102 2.466-2.41 0 1.308 1.034 2.41 2.363 2.41 1.33 0 2.4-1.102 2.4-2.41 0 1.308 1.106 2.41 2.435 2.41C22.78 8.43 24 7.282 24 5.98V4.95c-.02-.62-2.082-2.99-3.13-3.612-3.253-.114-5.508-.134-8.87-.133-3.362 0-7.945.053-8.87.133zm6.376 6.477a2.74 2.74 0 0 1-.468.602c-.5.49-1.19.795-1.947.795a2.786 2.786 0 0 1-1.95-.795c-.182-.178-.32-.37-.446-.59-.127.222-.303.412-.486.59a2.788 2.788 0 0 1-1.95.795c-.092 0-.187-.025-.264-.052-.107 1.113-.152 2.176-.168 2.95v.005l-.006 1.167c.02 2.334-.23 7.564 1.03 8.85 1.952.454 5.545.662 9.15.663 3.605 0 7.198-.21 9.15-.664 1.26-1.284 1.01-6.514 1.03-8.848l-.006-1.167v-.004c-.016-.775-.06-1.838-.168-2.95-.077.026-.172.052-.263.052a2.788 2.788 0 0 1-1.95-.795c-.184-.178-.36-.368-.486-.59-.127.22-.265.412-.447.59a2.786 2.786 0 0 1-1.95.794c-.76 0-1.446-.303-1.948-.793a2.74 2.74 0 0 1-.463.602 2.787 2.787 0 0 1-1.95.794h-.16a2.787 2.787 0 0 1-1.95-.793 2.738 2.738 0 0 1-.464-.602zm-2.004 2.59v.002c.795.002 1.5 0 2.373.953.687-.072 1.406-.108 2.125-.107.72 0 1.438.035 2.125.107.873-.953 1.578-.95 2.372-.953.376 0 1.876 0 2.92 2.934l1.123 4.028c.832 2.995-.266 3.068-1.636 3.07-2.03-.075-3.156-1.55-3.156-3.025-1.124.184-2.436.276-3.748.277-1.312 0-2.624-.093-3.748-.277 0 1.475-1.125 2.95-3.156 3.026-1.37-.004-2.468-.077-1.636-3.072l1.122-4.027c1.045-2.934 2.545-2.934 2.92-2.934zM12 12.714c-.002.002-2.14 1.964-2.523 2.662l1.4-.056v1.22c0 .056.56.033 1.123.007.562.026 1.124.05 1.124-.008v-1.22l1.4.055C14.138 14.677 12 12.713 12 12.713z" />
        </svg>
      );
    case 'playstore':
      return (
        <svg role="img" width="20" height="20" fill="currentColor" className="shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.516 11.396L3.93 20.306A1.66 1.66 0 0 0 5.358 24l11.458-6.6a1.65 1.65 0 0 0 .584-1.055L11.516 11.396zM1.6 4.393L10.375 12.014c0 0 .142-.236.142-.236l-8.917-7.385zm14.8 5.61l-5.61 3.234 6.746-6.096A1.652 1.652 0 0 0 16.4 1.706l-4.225 3.012a647.2 647.2 0 0 1-10.575 2.687L16.4 10.003z" />
        </svg>
      );
    default:
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      );
  }
}

/**
 * [GLOBAL]
 * This logic creates a reusable functional component for storefront outbound links.
 * Ensuring a DRY approach and standardizing layout classes (with [MOBILE] vs [DESKTOP] scaling).
 */
function StorefrontButton({ store }: { store: any }) {
  return (
    <a
      href={store.url}
      target="_blank"
      rel="noopener noreferrer"
      /* 
        [GLOBAL] Base styling and tracking aesthetics.
        [MOBILE] Default px-7 py-4.5 padding sizing.
        [DESKTOP] Replaces padding to lg:px-6 lg:py-4 sizing.
      */
      className="flex w-60 lg:inline-flex lg:w-auto items-center justify-center lg:justify-start gap-3 px-6 py-4 border border-transparent bg-ink text-paper text-sm font-display font-medium uppercase tracking-[2px] transition-transform hover:scale-105"
    >
      {store.label || store.type}
      <StorefrontIcon type={store.type} />
    </a>
  );
}

/**
 * [GLOBAL]
 * This logic defines a static metadata tag displaying standard roles or year values.
 */
function StaticTag({ label }: { label: string | number }) {
  return (
    <div className="w-fit text-[10px] px-2 py-1 border border-ink/10 uppercase tracking-[1px]">
      {label}
    </div>
  );
}

/**
 * [GLOBAL]
 * This logic defines an interactive metadata tag that tracks its active state
 * for tooltips, catering to both [MOBILE] (onClick) and [DESKTOP] (hover).
 */
function InteractiveTag({
  label,
  prefix,
  activeTooltip,
  onToggle
}: {
  label: string,
  prefix: string,
  activeTooltip: string | null,
  onToggle: (e: React.MouseEvent, id: string, hasDesc: boolean) => void
}) {
  const description = techDefinitions[label];
  const tooltipId = `${prefix}-${label}`;
  const isActive = activeTooltip === tooltipId;

  return (
    <div
      className="relative group/tooltip w-fit"
      onClick={(e) => onToggle(e, tooltipId, !!description)}
    >
      <span
        /* 
          [GLOBAL] Base rendering and static aesthetic styles. 
          [DESKTOP] Hover classes conditionally applied based on `description` availability.
        */
        className={`block text-[10px] px-2 py-1 border border-ink/10 uppercase tracking-[1px] lg:transition-colors ${description ? 'cursor-help border-ink/30 hover:bg-ink hover:text-paper' : ''
          } ${isActive ? 'bg-ink text-paper' : ''}`}
      >
        {label}
      </span>
      {description && (
        <div
          /* 
            [GLOBAL] Positioning and dimension limits (absolute bottom-full).
            [DESKTOP] Driven by `lg:group-hover/tooltip:...` transitioning visibility on hover.
            [MOBILE] Controlled dynamically via `isActive`, ignoring hover completely.
          */
          className={`absolute bottom-full left-0 mb-2 w-48 p-3 bg-ink text-paper text-[10px] tracking-[1px] uppercase leading-relaxed lg:transition-all lg:duration-300 z-50 pointer-events-none transition-all duration-300 ${isActive
            ? 'opacity-100 visible translate-y-0'
            : `opacity-0 invisible translate-y-2 lg:group-hover/tooltip:opacity-100 lg:group-hover/tooltip:visible lg:group-hover/tooltip:translate-y-0`
            }`}
        >
          {description}
          <div className="absolute top-full left-4 w-2 h-2 bg-ink rotate-45 -translate-y-1" />
        </div>
      )}
    </div>
  );
}

/**
 * [GLOBAL]
 * This function defines the main project overview page component.
 * It queries the local projects data via the URL param, orchestrates interaction states,
 * and modularly structures the resulting layout payload back to the browser.
 */
export default function ProjectOverview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projects.find((p) => p.id === id);

  // --- STATE ---

  /**
   * [GLOBAL]
   * This logic tracks which interactive tooltip (tech or system) is currently open, 
   * enabling cross-device dismissal behavior.
   */
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  /**
   * [GLOBAL]
   * This logic drives layout breakpoints by maintaining realtime viewport width values, 
   * preventing manual logic conflicts during resizing scenarios.
   */
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  /**
   * [GLOBAL]
   * This logic detects touch capability via pointer media query rather than screen width alone.
   * Critically, this catches iPad Pro at exactly 1024px which passes desktop width checks
   * but is still a touch-only device (pointer: coarse).
   */
  const [isTouchDevice, setIsTouchDevice] = useState(
    typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)').matches : false
  );

  /**
   * [MOBILE]
   * This logic keeps the immediate "bloom" state locally. 
   * This allows instant visual feedback when tapping the banner without delaying the render loop.
   */
  const [isTouching, setIsTouching] = useState(false);

  // --- REFS ---

  /**
   * [DESKTOP]
   * This ref points to the footer banner element so parallax calculations can dynamically 
   * source dimensions directly from the live DOM model.
   */
  const bannerRef = useRef<HTMLDivElement>(null);

  /**
   * [MOBILE]
   * This ref captures arbitrary touch coordinations initially to distinguish tapping intent 
   * from active page scrolling in real-time.
   */
  const touchStartRef = useRef<{ x: number, y: number } | null>(null);

  /**
   * [MOBILE]
   * This ref preserves active navigations timeouts so rapid unintended clicks are rejected
   * guaranteeing consistent 1s animation transition pipelines on lower-end devices.
   */
  const touchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- PARALLAX MOTION VALUES ---

  /**
   * [DESKTOP]
   * This logic maps abstract mathematical X/Y domains for user tracking across 
   * the screen using Framer Motion objects. Output scales seamlessly within PARALLAX_RANGE boundaries.
   */
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springX = useSpring(mouseX, SPRING_CONFIG);
  const springY = useSpring(mouseY, SPRING_CONFIG);

  const contentTranslateX = useTransform(springX, (x: number) => (x - 0.5) * PARALLAX_RANGE);
  const contentTranslateY = useTransform(springY, (y: number) => (y - 0.5) * PARALLAX_RANGE);

  // --- EFFECTS ---

  /**
   * [GLOBAL]
   * This logic binds the window resize events continuously updating the windowWidth states.
   */
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    // [IPAD] Re-check pointer capability on resize (e.g., external keyboard connection)
    const mq = window.matchMedia('(pointer: coarse)');
    const handlePointerChange = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches);
    mq.addEventListener('change', handlePointerChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      mq.removeEventListener('change', handlePointerChange);
    };
  }, []);

  /**
   * [GLOBAL]
   * This logic ensures tooltips immediately collapse if ANY event escapes their active boundary
   * restoring the neutral visual layout cleanly.
   */
  useEffect(() => {
    if (!activeTooltip) return;
    const handleGlobalClick = () => setActiveTooltip(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [activeTooltip]);

  useEffect(() => {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

    const timeout = setTimeout(() => {
      const wraps = document.querySelectorAll('.vid-wrap');

      wraps.forEach((wrap) => {
        const video = wrap.querySelector('video') as HTMLVideoElement | null;
        const overlay = wrap.querySelector('.vid-overlay') as HTMLElement | null;

        if (!video) return;

        // prevent duplicate listeners
        if ((video as any)._initialized) return;
        (video as any)._initialized = true;

        // Desktop autoplay
        if (!isTouchDevice) {
          video.play()
            .then(() => {
              if (overlay) overlay.style.opacity = '0';
            })
            .catch(() => { });
        }

        // Click / Tap toggle
        wrap.addEventListener('click', () => {
          if (video.paused) {
            video.play();
            if (overlay) overlay.style.opacity = '0';
          } else {
            video.pause();
            if (overlay) overlay.style.opacity = '1';
          }
        });
      });
    }, 100); // wait for markdown render

    return () => clearTimeout(timeout);
  }, [project]);

  // --- HANDLERS ---

  /**
   * [MOBILE]
   * This logic locks in original X/Y tap locations on touchStart for drift comparison.
   */
  const handleTouchStart = (e: React.TouchEvent) => {
    // [IPAD FIX] Use pointer detection instead of width — catches iPad Pro at exactly 1024px
    if (!isTouchDevice) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  /**
   * [MOBILE]
   * This logic aborts navigation execution paths explicitly if user drift translates horizontally
   * or vertically greater than 10 pixels total since origin check (indicating a deliberate user scroll).
   */
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartRef.current.y);

    if (dx > 10 || dy > 10) {
      setIsTouching(false);
      touchStartRef.current = null;
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
        touchTimeoutRef.current = null;
      }
    }
  };

  /**
   * [MOBILE]
   * This logic fires core project navigation if user safely releases finger without scrolling.
   * Enforces 1-second timeout loop explicitly protecting the native bloom styling render phase.
   */
  const handleTouchEnd = (e: React.TouchEvent) => {
    // [IPAD FIX] Use pointer detection instead of width — catches iPad Pro at exactly 1024px
    if (!isTouchDevice || !touchStartRef.current) return;

    if (touchTimeoutRef.current) {
      e.preventDefault();
      return;
    }

    setIsTouching(true);

    touchTimeoutRef.current = setTimeout(() => {
      if (nextProject) {
        if (nextProject.customInternalLink) {
          navigate(nextProject.customInternalLink);
        } else if (nextProject.isCollection) {
          navigate('/', { state: { scrollToProject: nextProject.id } });
        } else {
          navigate(`/project/${nextProject.id}`);
        }
      }
      touchTimeoutRef.current = null;
    }, 350);

    e.preventDefault();
    touchStartRef.current = null;
  };

  /**
   * [DESKTOP]
   * This logic captures mouse vectors inside bounding client constraints returning percentages (0-1).
   * Framer Spring tracks it implicitly handling sub-pixel smoothing overhead.
   */
  const handleBannerMouseMove = (e: React.MouseEvent) => {
    if (!bannerRef.current || windowWidth < DESKTOP_BREAKPOINT) return;
    const rect = bannerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  /**
   * [DESKTOP]
   * This logic purges stored abstract positions returning vectors back to 0.5 (perfect center)
   * triggering absolute equilibrium.
   */
  const handleBannerMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  /**
   * [MOBILE]
   * This logic explicitly overrides default event bubbling locally inside tooltips,
   * injecting targeted ID states only strictly if descriptions actually exist matching definition imports.
   */
  const toggleTooltip = (e: React.MouseEvent, tooltipId: string, hasDescription: boolean) => {
    // [IPAD FIX] Use pointer detection instead of width — catches iPad Pro at exactly 1024px
    if (!isTouchDevice) return;
    e.stopPropagation();
    if (hasDescription) {
      setActiveTooltip((prev) => (prev === tooltipId ? null : tooltipId));
    }
  };

  /**
   * [GLOBAL]
   * Intersection Observer for all video elements in the markdown content.
   * This ensures videos only play when they are visible on screen, 
   * covering both Markdown-rendered and raw HTML videos.
   */
  useEffect(() => {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => {
              // Standard browsers block autoplay without interaction
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.1 }
    );

    // Give the DOM a moment to render the markdown content
    const timer = setTimeout(() => {
      const videos = document.querySelectorAll('.markdown-body video');
      videos.forEach((video) => {
        // Force pause initially to prevent rogue autoplay
        (video as HTMLVideoElement).pause();
        videoObserver.observe(video);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      videoObserver.disconnect();
    };
  }, [id, project?.deep_dive_content]);

  if (!project) return <div className="p-20">Project not found</div>;

  const currentIndex = projects.findIndex(p => p.id === id);
  const nextProjectIndex = (currentIndex + 1) % projects.length;
  const nextProject = projects[nextProjectIndex];

  const mobileHero = windowWidth < DESKTOP_BREAKPOINT && project.thumbnail_mobile ? project.thumbnail_mobile : null;
  const displayImages = project.gallery && project.gallery.length > 0
    ? (mobileHero ? [mobileHero, ...project.gallery.slice(1)] : project.gallery)
    : [mobileHero || project.thumbnail_16_9];

  return (
    <div className="min-h-screen">
      {/* 
        [GLOBAL]
        This section handles rendering the top image gallery.
        [DESKTOP] specifically overrides padding for wider screen aspect ratio layout horizontally.
      */}
      <div className="px-6 lg:px-20 pt-8 lg:pt-14 lg:w-[80vw] max-w-[1560px] mx-auto">
        <div className="relative aspect-16-9 w-full overflow-hidden bg-[#0A0A0A] shadow-[0_60px_100px_-20px_rgba(0,0,0,0.2),0_30px_60px_-30px_rgba(0,0,0,0.3),0_0_20px_0_rgba(0,0,0,0.05)]">
          <ImageGallery images={displayImages} />
        </div>
      </div>

      {/* 
        [GLOBAL] styling for spacing. 
        [DESKTOP] specific padding adjustments using lg:pt-13.
      */}
      <div className="px-6 lg:px-20 pt-8 lg:pt-13 pb-0 max-w-5xl mx-auto">
        <div>
          {/* 
            [GLOBAL] Main layout switching handler.
            [DESKTOP] layout alignment via flex-row and items-center.
            [MOBILE] uses default flex-col for stacking project metadata.
          */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 sm:gap-12 mb-16">
            <div className="lg:w-2/3">
              {/* [GLOBAL] Main project title. [DESKTOP] uses responsive typography sizes. */}
              <h1 className="text-3xl lg:text-4xl tracking-[1px] mb-6">{project.title}</h1>
              {/* [GLOBAL] Main project summary. [DESKTOP] uses responsive typography ranges. */}
              <p className="text-lg lg:text-xl font-light text-ink/80 mb-10 leading-relaxed max-w-2xl">
                {project.summary}
              </p>
              <div className="flex flex-wrap items-center gap-4">

                {/* 
                  [GLOBAL]
                  This logic handles rendering the fallback legacy link to a website 
                  only if the storefront array explicitly misses mapping capabilities.
                */}
                {!project.storefronts && project.link !== undefined && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-ink text-paper text-sm font-display font-medium uppercase tracking-[2px] transition-transform hover:scale-105"
                  >
                    Visit Website
                    <StorefrontIcon type="default" />
                  </a>
                )}

                {/* 
                  [GLOBAL]
                  This logic maps over defined modern app/game storefront links injecting 
                  functional wrapper buttons per-store.
                */}
                {project.storefronts && project.storefronts.map((store, idx) => (
                  <StorefrontButton key={idx} store={store} />
                ))}

                {/* 
                  [GLOBAL]
                  This logic conditionally visualizes Github references optionally tracking repository links.
                  [DESKTOP] Explicit hover states integrated.
                */}
                {project.source !== undefined && (
                  <a
                    href={typeof project.source === 'string' ? project.source : project.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-60 lg:inline-flex lg:w-auto items-center justify-center lg:justify-start gap-3 px-6 py-4 border border-ink/20 text-ink text-sm font-display font-medium uppercase tracking-[2px] hover:bg-ink/5 lg:transition-colors"
                  >
                    {typeof project.source === 'object' ? project.source.label : 'Repo on Github'}
                    {(typeof project.source === 'string' ? project.source : project.source.url).includes('github.com') ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                        strokeLinejoin="round">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    )}
                  </a>
                )}
              </div>
            </div>

            {/* 
              [GLOBAL] Metadata layout block
              [DESKTOP] Enforces proportional 1/3 layout space allocating specifically. 
              [MOBILE] Auto 100% width fallback internally stacking arrays vertically.
            */}
            <div className="w-full lg:w-1/3 flex flex-col gap-6 lg:gap-4 pt-2 lg:transition-all">
              <div className="w-full">
                {/* [GLOBAL] Roles array mapping sequence into StaticTags */}
                <h3 className="text-[10px] tracking-[1px] text-muted uppercase mb-1.5">Roles</h3>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
                  {project.roles.map(role => (
                    <StaticTag key={role} label={role} />
                  ))}
                </div>
              </div>

              <div className="w-full">
                {/* [GLOBAL] Year array mapping directly into simplified StaticTags */}
                <h3 className="text-[10px] tracking-[1px] text-muted uppercase mb-1.5">Year</h3>
                <StaticTag label={project.year} />
              </div>

              <div className="w-full">
                {/* 
                  [GLOBAL] Tech block handles iteration over specific software arrays.
                  Calls InteractiveTag for localized definitions.
                */}
                <h3 className="text-[10px] tracking-[1px] text-muted uppercase mb-1.5">Tech</h3>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
                  {project.tech.map(techItem => (
                    <InteractiveTag
                      key={techItem}
                      label={techItem}
                      prefix="tech"
                      activeTooltip={activeTooltip}
                      onToggle={toggleTooltip}
                    />
                  ))}
                </div>
              </div>

              {/* 
                [GLOBAL]
                This logic handles conditional parsing for advanced system metadata exclusively.
                Maps similar structures specifically bound to `systems` namespaces.
              */}
              {project.systems && project.systems.length > 0 && (
                <div className="col-span-2 lg:col-span-1">
                  <h3 className="text-[10px] tracking-[1px] text-muted uppercase mb-1.5">Systems</h3>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
                    {project.systems.map(systemItem => (
                      <InteractiveTag
                        key={systemItem}
                        label={systemItem}
                        prefix="system"
                        activeTooltip={activeTooltip}
                        onToggle={toggleTooltip}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-full border-b border-ink/20 mb-16"></div>

          {/* 
            [GLOBAL]
            This section renders rich deep dive blog styles parsing external markdown datasets safely.
          */}
          <div className="markdown-body prose prose-neutral max-w-none">
            <ReactMarkdown
              rehypePlugins={[rehypeRaw]}
              components={markdownComponents}
            >
              {project.deep_dive_content}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* 
        [GLOBAL]
        This logic wraps the core "Next Project" transition pipeline routing user progression globally.
        [MOBILE] triggers Framer whileTap scaling physically compressing boundaries instantly before redirect.
      */}
      <motion.div
        animate={isTouchDevice && isTouching ? { scale: 1 } : { scale: 1 }}
        transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          onClick={(e) => {
             // Handle programmatic navigation
             e.preventDefault();
             if (nextProject.customInternalLink) {
               navigate(nextProject.customInternalLink);
             } else if (nextProject.isCollection) {
               navigate('/', { state: { scrollToProject: nextProject.id } });
             } else {
               navigate(`/project/${nextProject.id}`);
             }
          }}
          className="group block w-full mt-20 border-t border-ink/10 overflow-hidden text-left"
          style={{ '--hover-bg': nextProject.accentColor } as React.CSSProperties}
          onMouseMove={handleBannerMouseMove}
          onMouseLeave={handleBannerMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={(e) => {
             // Let handleTouchEnd do the visual bloom effect, then we navigate inside it manually.
             // Wait, handleTouchEnd natively calls `navigate('/project/:id')`.
             // We need to update handleTouchEnd!
             handleTouchEnd(e);
          }}
        >
          <div
            ref={bannerRef}
            className="px-6 lg:px-20 py-6 lg:py-10 flex flex-col items-center justify-center text-center transition-colors duration-200 group-hover:bg-[var(--hover-bg)] group-hover:text-white cursor-pointer"
            style={isTouchDevice && isTouching ? {
              backgroundColor: nextProject.accentColor,
              color: 'white',
              transition: 'background-color 0.2s ease-out, color 0.2s ease-out',
            } : undefined}
          >
            <motion.div
              style={{ x: contentTranslateX, y: contentTranslateY }}
              className="flex flex-col items-center justify-center"
            >
              <div
                className={`flex items-center justify-center mb-4 lg:mb-6 transition-colors duration-200 group-hover:duration-300 ${isTouchDevice && isTouching ? 'text-white/80' : 'text-muted group-hover:text-white/80'}`}
                style={{ gap: 'var(--eyebrow-gap)' }}
              >
                <span className="eyebrow">Featured Work</span>
                <span className="eyebrow-dot" />
                <span className="eyebrow">0{nextProjectIndex + 1}</span>
              </div>
              <h2 className="text-2xl lg:text-4xl tracking-[2px] font-display mb-4.5 lg:mb-5 transition-transform duration-200 group-hover:duration-300 ease-out group-hover:scale-105">
                {nextProject.title}
              </h2>
              <div className="inline-flex items-center justify-center p-3.5 lg:p-5 rounded-full border border-ink/20 group-hover:border-white/40 group-hover:bg-white/10 transition-all duration-200 group-hover:duration-300 ease-out transform group-hover:translate-y-1 lg:group-hover:translate-y-1.25">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
              </div>
            </motion.div>
          </div>
        </button>
      </motion.div>
    </div>
  );
}
