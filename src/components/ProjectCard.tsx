import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Project } from '../data/projects';
import { cn } from '../lib/utils';

/**
 * CONFIGURATION CONSTANTS
 * [GLOBAL] 
 * Centralized values for easy adjustment of animations and timings 
 * without hunting through the component logic.
 */
const CONFIG = {
  HOVER_DELAY: 50,        // [DESKTOP] Delay before zoom/parallax activates (Optimized for responsiveness)
  PARALLAX_RANGE: 15,      // [DESKTOP] Maximum pixel offset for the parallax effect
  BLOOM_NAV_DELAY: 575,    // [MOBILE] Delay for the "premium bloom" transition on touch (Optimized for speed)
  MOBILE_BREAKPOINT: 1024, // [GLOBAL] Screen width threshold for device-specific logic
  TAP_ZOOM: 1.025,          // [MOBILE] Scale intensity when tapping a card
  TAP_DURATION: 0.5,       // [MOBILE] Duration of the zoom animation (Sharpened for feedback)
  TRANSITION_DESKTOP: 200, // [DESKTOP] Speed of text color transitions
  TRANSITION_MOBILE: 200,  // [MOBILE] Speed of the "bloom" phase transitions
  SPRING_CONFIG: { damping: 20, stiffness: 100 },
  STRENGTH_CONFIG: { damping: 25, stiffness: 60 }
};

interface ProjectCardProps {
  project: Project;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  isHovered: boolean;
}

export default function ProjectCard({ project, onHoverStart, onHoverEnd, isHovered }: ProjectCardProps) {
  // [GLOBAL] State for responsiveness and navigation
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isEffectActive, setIsEffectActive] = useState(false);

  // [IPAD FIX] Detect touch capability via pointer media query instead of width alone.
  // iPad Pro 12.9" reports exactly 1024px (the breakpoint) but is a touch device (pointer: coarse).
  const [isTouchDevice, setIsTouchDevice] = useState(
    typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)').matches : false
  );

  // [GLOBAL] Refs for interaction tracking
  const containerRef = useRef<HTMLAnchorElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // [MOBILE] Ref to track touch starting coordinates
  const touchStartRef = useRef<{ x: number, y: number } | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Cancel navigations ONLY when tab/page becomes visible again after being hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && navTimeoutRef.current) {
        clearTimeout(navTimeoutRef.current);
        navTimeoutRef.current = null;
        setIsEffectActive(false);
        onHoverEnd();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [onHoverEnd]);

  // Forceful cleanup ONLY on true component unmount
  useEffect(() => {
    return () => {
      if (navTimeoutRef.current) {
        clearTimeout(navTimeoutRef.current);
        navTimeoutRef.current = null;
      }
    };
  }, []);

  /**
   * [GLOBAL] Resize Listener
   * Keeps the component aware of the current viewport width to toggle 
   * between desktop hover logic and mobile touch logic.
   */
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    // [IPAD] Re-check pointer capability on resize
    const mq = window.matchMedia('(pointer: coarse)');
    const handlePointerChange = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches);
    mq.addEventListener('change', handlePointerChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      mq.removeEventListener('change', handlePointerChange);
    };
  }, []);

  /**
   * [DESKTOP] Hover Timing Logic
   * Adds a subtle delay before the zoom and parallax effects kick in.
   * [MOBILE] Bypasses this delay so that the zoom is instant on tap.
   */
  useEffect(() => {
    if (isHovered) {
      // [IPAD FIX] Use pointer detection: iPad is touch-capable even at 1024px width
      if (isTouchDevice) {
        setIsEffectActive(true);
      } else {
        hoverTimerRef.current = setTimeout(() => setIsEffectActive(true), CONFIG.HOVER_DELAY);
      }
    } else {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      setIsEffectActive(false);
    }
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, [isHovered, isTouchDevice]);

  /**
   * [DESKTOP] Parallax Motion Values
   * Calculates the mouse position relative to the card dimensions.
   * 'effectStrength' acts as a multiplier to fade the parallax effect in/out smoothly.
   */
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, CONFIG.SPRING_CONFIG);
  const springY = useSpring(mouseY, CONFIG.SPRING_CONFIG);
  const effectStrength = useMotionValue(0);
  const effectStrengthSpring = useSpring(effectStrength, CONFIG.STRENGTH_CONFIG);

  useEffect(() => {
    effectStrength.set(isEffectActive ? 1 : 0);
  }, [isEffectActive]);

  const translateX = useTransform(
    [springX, effectStrengthSpring],
    ([x, s]: number[]) => {
      // [TOUCH FIX] Pure center zoom: Ignore offsets so the image doesn't shift on iPad/Mobile
      if (isTouchDevice) return 0;
      // [DESKTOP] Reactive parallax based on mouse entry position
      return (x - 0.5) * CONFIG.PARALLAX_RANGE * 2 * s;
    }
  );
  const translateY = useTransform(
    [springY, effectStrengthSpring],
    ([y, s]: number[]) => {
      // [TOUCH FIX] Pure center zoom: Ignore offsets so the image doesn't shift on iPad/Mobile
      if (isTouchDevice) return 0;
      // [DESKTOP] Reactive parallax based on mouse entry position
      return (y - 0.5) * CONFIG.PARALLAX_RANGE * 2 * s;
    }
  );

  /**
   * [DESKTOP] Mouse Movement Handler
   * Updates the normalized (0 to 1) mouse position based on card boundaries.
   */
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  /**
   * [DESKTOP] Mouse Reset
   * Returns the image to the center when the mouse leaves the card area.
   */
  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  /**
   * [MOBILE] Card Tap Handler
   * Replaces native Link behavior with our timed bloom transition.
   * Using onClick is more robust for edge-taps than manual touch events.
   */
  const handleCardClick = (e: React.MouseEvent) => {
    // [IPAD FIX] Use pointer detection instead of width — catches iPad Pro at exactly 1024px
    if (!isTouchDevice) return;

    if (navTimeoutRef.current) {
      e.preventDefault();
      return;
    }

    if (project.isExternalOnly && project.link) {
      // Trigger visual states but DO NOT prevent default, allowing native new tab
      onHoverStart();
      setIsEffectActive(true);

      navTimeoutRef.current = setTimeout(() => {
        setIsEffectActive(false);
        onHoverEnd();
        navTimeoutRef.current = null;
      }, 1000);
      return;
    }

    // Prevent the default instant Link navigation
    e.preventDefault();

    // Trigger visual states
    onHoverStart();
    setIsEffectActive(true);

    navTimeoutRef.current = setTimeout(() => {
      navigate(project.customInternalLink || `/project/${project.id}`);
      navTimeoutRef.current = null;
    }, CONFIG.BLOOM_NAV_DELAY);
  };

  /**
   * [GLOBAL] Hover Start Handler
   * [DESKTOP] Delays the global bloom background change to sync with the zoom animation.
   * [MOBILE] This handler is ignored to prevent accidental triggers during swipes.
   */
  const handleMouseEnter = () => {
    // [IPAD FIX] Only activate desktop hover logic on non-touch devices
    if (!isTouchDevice) {
      setTimeout(() => {
        if (containerRef.current?.matches(':hover')) {
          onHoverStart();
        }
      }, CONFIG.HOVER_DELAY);
    }
  };

  const isExternal = project.isExternalOnly && project.link;

  const linkProps = isExternal
    ? {
      as: 'a',
      href: project.link,
      target: "_blank",
      rel: "noopener noreferrer"
    }
    : {
      as: Link,
      to: project.customInternalLink || `/project/${project.id}`
    };

  const Component = isExternal ? 'a' : Link;

  return (
    <Component
      ref={containerRef as any}
      {...(linkProps as any)}
      className="group block"
      /* [MOBILE] Using a single click handler ensures perfect hit-detection on edges 
         while still allowing our custom bloom delay to play out. */
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { onHoverEnd(); handleMouseLeave(); }}
    >
      <motion.div
        /* 
           [MOBILE] 
           Scales the entire project panel up slightly when tapped, 
           synergizing with the background bloom effect.
        */
        animate={{
          // [IPAD FIX] Use pointer detection for touch zoom effect
          scale: isHovered && isTouchDevice
            ? CONFIG.TAP_ZOOM
            : 1
        }}
        transition={{ duration: CONFIG.TAP_DURATION, ease: [0.16, 1, 0.3, 1] }}
        className="w-full h-full"
      >
        {/* Visual Container: Aspect ratio and elevation styling */}
        <div
          ref={cardRef}
          /* [GLOBAL] 16:9 on desktop, slightly taller 3:2 or similar on mobile if needed. 
             For now staying with 16:9 but allowing mobile-specific crops in future. */
          className="relative overflow-hidden aspect-16-9 bg-[#0a0a0a] shadow-[0_60px_100px_-20px_rgba(0,0,0,0.2),0_30px_60px_-30px_rgba(0,0,0,0.3),0_0_20px_0_rgba(0,0,0,0.05)]"
        >
          {/* [GLOBAL] Project Thumbnail with Parallax [DESKTOP] and Zoom [GLOBAL] */}
          <motion.img
            src={windowWidth < CONFIG.MOBILE_BREAKPOINT && project.thumbnail_mobile
              ? project.thumbnail_mobile
              : project.thumbnail_16_9
            }
            alt={project.title}
            referrerPolicy="no-referrer"
            animate={{
              scale: isEffectActive ? 1.05 : 1
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              x: translateX,
              y: translateY
            }}
            className="w-full h-full object-cover pointer-events-none"
          />
        </div>

        {/* Project Metadata Footer */}
        <div className="mt-6 sm:mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-1 sm:gap-0">
          <div className="flex flex-col w-full sm:w-auto">
            {/* Project Title: Switches from ink to white on hover */}
            <h2 className={cn(
              "text-xl sm:text-2xl tracking-[0.5px] mb-1.5 transition-colors font-bold",
              isEffectActive
                ? (windowWidth < CONFIG.MOBILE_BREAKPOINT
                  ? `duration-[${CONFIG.TRANSITION_MOBILE}ms]`
                  : `duration-[${CONFIG.TRANSITION_DESKTOP}ms]`) + " text-white"
                : "duration-200 text-ink"
            )}>
              {project.title}
            </h2>

            {/* Role and Year List */}
            <div className={cn(
              "flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 text-[10px] sm:text-[12px] tracking-[1.25px] uppercase transition-colors",
              isEffectActive
                ? (windowWidth < CONFIG.MOBILE_BREAKPOINT
                  ? `duration-[${CONFIG.TRANSITION_MOBILE}ms]`
                  : `duration-[${CONFIG.TRANSITION_DESKTOP}ms]`) + " text-white/70"
                : "text-muted"
            )}>
              <div className="flex flex-col sm:flex-row sm:gap-2 w-full sm:w-auto">
                {project.roles.map((role, i) => (
                  <span key={role} className="leading-relaxed sm:leading-none">
                    {role}
                    {i < project.roles.length - 1 && <span className="hidden sm:inline ml-2.5">/</span>}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center sm:items-baseline w-full sm:w-auto mt-0.5 sm:mt-0">
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline">•</span>
                  <span className="leading-none">{project.year}</span>
                </div>

                {/* [MOBILE] Accent line: Expands when card is active/hovered */}
                <div className="flex sm:hidden items-center shrink-0 translate-y-[2.5px]">
                  <div
                    className="h-[1px] transition-all"
                    style={{
                      backgroundColor: isEffectActive ? '#ffffff' : project.accentColor,
                      width: isEffectActive ? (windowWidth < CONFIG.MOBILE_BREAKPOINT ? '4.5rem' : '6.5rem') : (windowWidth < CONFIG.MOBILE_BREAKPOINT ? '2.5rem' : '3.5rem'),
                      transitionDuration: isEffectActive
                        ? (windowWidth < CONFIG.MOBILE_BREAKPOINT ? `${CONFIG.TRANSITION_MOBILE}ms` : `${CONFIG.TRANSITION_DESKTOP}ms`)
                        : '200ms'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* [DESKTOP & IPAD] Accent Line / Call to Action */}
          <div className="hidden sm:flex flex-col items-end gap-2 shrink-0 translate-y-[-2.5px]">
            <span className={cn(
              "text-[11px] tracking-[1px] uppercase transition-all",
              isTouchDevice ? "hidden" : "block",
              isEffectActive ? 'opacity-80 text-white' : 'opacity-0 text-ink',
              isEffectActive ? `duration-[${CONFIG.TRANSITION_DESKTOP}ms]` : 'duration-200'
            )}>
              View Project
            </span>
            <div
              className="h-[1px] transition-all"
              style={{
                backgroundColor: isEffectActive ? '#ffffff' : project.accentColor,
                width: isEffectActive ? (windowWidth < CONFIG.MOBILE_BREAKPOINT ? '4.5rem' : '6.5rem') : (windowWidth < CONFIG.MOBILE_BREAKPOINT ? '2.5rem' : '3.5rem'),
                transitionDuration: isEffectActive ? `${CONFIG.TRANSITION_DESKTOP}ms` : '200ms'
              }}
            />
          </div>
        </div>
      </motion.div>
    </Component>
  );
}