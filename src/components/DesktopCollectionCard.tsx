import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Project } from '../data/projects';
import { cn } from '../lib/utils';

const CONFIG = {
  HOVER_DELAY: 50,
  PARALLAX_RANGE: 15,
  TRANSITION_DESKTOP: 200,
  SPRING_CONFIG: { damping: 20, stiffness: 100 },
  STRENGTH_CONFIG: { damping: 25, stiffness: 60 },
  DIM_DELAY_MS: 2000
};

interface DesktopCollectionCardProps {
  project: Project;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  isHovered: boolean;
  isActive: boolean;
}

export default function DesktopCollectionCard({ project, onHoverStart, onHoverEnd, isHovered, isActive }: DesktopCollectionCardProps) {
  const [isEffectActive, setIsEffectActive] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isIndicatorDimmed, setIsIndicatorDimmed] = useState(false);

  const items = project.collectionItems || [];
  const activeItem = items[activeItemIndex] || project;

  useEffect(() => {
    if (isHovered) {
      setIsIndicatorDimmed(false);
      resetInactivityTimer();
      hoverTimerRef.current = setTimeout(() => {
        setIsEffectActive(true);
        // Dispatch the active item's color for the global bloom
        window.dispatchEvent(new CustomEvent('collectionItemHovered', {
          detail: { accentColor: items[activeItemIndex]?.accentColor || project.accentColor }
        }));
      }, CONFIG.HOVER_DELAY);
    } else {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      setIsEffectActive(false);
      // Reset color
      window.dispatchEvent(new CustomEvent('collectionItemHovered', {
        detail: { accentColor: null }
      }));
    }
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, [isHovered, activeItemIndex, items, project.accentColor]);

  // React to section activation (scrolled into view)
  useEffect(() => {
    if (isActive) {
      resetInactivityTimer();
    }
  }, [isActive]);

  /**
   * [GLOBAL] Initial Hover Check
   * If the component mounts while the mouse is already positioned over it 
   * (e.g., after navigation), native 'onMouseEnter' will not fire. 
   * This logic manually triggers the hover state to ensure visual consistency.
   */
  useEffect(() => {
    const checkHover = () => {
      if (containerRef.current?.matches(':hover')) {
        onHoverStart();
      }
    };

    // Check immediately and after a short delay for browser synchronization
    checkHover();
    const timer = setTimeout(checkHover, 50);
    return () => clearTimeout(timer);
  }, [onHoverStart]);

  const resetInactivityTimer = () => {
    setIsIndicatorDimmed(false);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      setIsIndicatorDimmed(true);
    }, CONFIG.DIM_DELAY_MS);
  };

  // Handle global home-click reset
  useEffect(() => {
    const handleReset = () => {
      // Delay reset so it happens after the vertical scroll to top completes
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = setTimeout(() => {
        scrollTo(0);
        setActiveItemIndex(0);
        setIsIndicatorDimmed(false);
        resetInactivityTimer();
      }, 1000);
    };

    window.addEventListener('mobileScrollToTop', handleReset);
    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      window.removeEventListener('mobileScrollToTop', handleReset);
    };
  }, []);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, CONFIG.SPRING_CONFIG);
  const springY = useSpring(mouseY, CONFIG.SPRING_CONFIG);
  const effectStrength = useMotionValue(0);
  const effectStrengthSpring = useSpring(effectStrength, CONFIG.STRENGTH_CONFIG);

  useEffect(() => {
    effectStrength.set(isEffectActive ? 1 : 0);
  }, [isEffectActive, effectStrength]);

  const translateX = useTransform(
    [springX, effectStrengthSpring],
    ([x, s]: number[]) => (x - 0.5) * CONFIG.PARALLAX_RANGE * 2 * s
  );
  const translateY = useTransform(
    [springY, effectStrengthSpring],
    ([y, s]: number[]) => (y - 0.5) * CONFIG.PARALLAX_RANGE * 2 * s
  );

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const handleMouseEnter = () => {
    setTimeout(() => {
      if (containerRef.current?.matches(':hover')) {
        onHoverStart();
      }
    }, CONFIG.HOVER_DELAY);
  };

  const handleScroll = () => {
    resetInactivityTimer();
    if (!scrollContainerRef.current) return;
    const scrollLeft = scrollContainerRef.current.scrollLeft;
    const width = scrollContainerRef.current.clientWidth;
    // Calculate which item is mostly in view
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== activeItemIndex && newIndex >= 0 && newIndex < items.length) {
      setActiveItemIndex(newIndex);
    }
  };

  const scrollTo = (index: number) => {
    if (!scrollContainerRef.current) return;
    const width = scrollContainerRef.current.clientWidth;
    scrollContainerRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
  };

  return (
    <div
      ref={containerRef}
      className="group block cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseMove={(e) => {
        resetInactivityTimer();
        handleMouseMove(e);
      }}
      onMouseLeave={() => { onHoverEnd(); handleMouseLeave(); }}
      onClick={() => {
        // Handle desktop link click on the container wrapper
        const link = items[activeItemIndex]?.link;
        if (link) {
          window.open(link, '_blank');
          // Forcefully clear UI state to reset back
          handleMouseLeave();
          onHoverEnd();
        }
      }}
    >
      <motion.div className="w-full h-full">
        {/* Visual Container */}
        <div
          className="relative overflow-hidden aspect-16-9 img-placeholder shadow-[0_60px_100px_-20px_rgba(0,0,0,0.2),0_30px_60px_-30px_rgba(0,0,0,0.3),0_0_20px_0_rgba(0,0,0,0.05)]"
        >
          {/* [GLOBAL] Master Shine - Triggers instantly on activation and repeats every 10s */}
          {(isHovered || isActive) && (
            <div key={`${project.id}-${isActive}`} className="shine-layer" />
          )}

          <motion.div
            style={{ x: translateX, y: translateY }}
            animate={{ scale: isEffectActive ? 1.025 : 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full h-full absolute inset-0"
          >
            {/* Scrollable Carousel Wrapper */}
            <div
              ref={scrollContainerRef}
              className="flex w-full h-full overflow-x-auto snap-x snap-mandatory hide-scrollbar pointer-events-auto"
              onScroll={handleScroll}
            >
              {items.map((item, index) => (
                <div key={item.id} className="w-full h-full shrink-0 snap-center relative">
                  <img
                    src={item.thumbnail_16_9}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  {/* Subtle gradient for indicating it's a card */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Navigation Overlay (Full-height hit zones) */}
          <div className="absolute inset-0 flex justify-between pointer-events-none z-20">
            <button
              className={cn(
                "h-full w-[20%] flex items-center justify-start pl-6 text-white pointer-events-auto transition-all duration-300 group/nav",
                activeItemIndex > 0 
                  ? ((isIndicatorDimmed && !isEffectActive) ? "opacity-25" : "opacity-100") 
                  : "opacity-0 pointer-events-none"
              )}
              onClick={(e) => { e.stopPropagation(); scrollTo(activeItemIndex - 1); }}
            >
              <div className="p-3 rounded-full bg-black/20 backdrop-blur-md group-hover/nav:bg-black/40 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </div>
            </button>
            <button
              className={cn(
                "h-full w-[15%] flex items-center justify-end pr-6 text-white pointer-events-auto transition-all duration-300 group/nav",
                activeItemIndex < items.length - 1 
                  ? ((isIndicatorDimmed && !isEffectActive) ? "opacity-25" : "opacity-100") 
                  : "opacity-0 pointer-events-none"
              )}
              onClick={(e) => { e.stopPropagation(); scrollTo(activeItemIndex + 1); }}
            >
              <div className="p-3 rounded-full bg-black/20 backdrop-blur-md group-hover/nav:bg-black/40 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </button>
          </div>

          {/* Scroll Orbs (Pagination) */}
          <div className={cn(
            "absolute bottom-4 left-0 right-0 flex justify-center gap-2 pointer-events-none transition-opacity duration-500",
            (isIndicatorDimmed && !isEffectActive) ? "opacity-25" : "opacity-100"
          )}>
            {items.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === activeItemIndex ? "bg-white w-6" : "bg-white/40 w-1.5"
                )}
              />
            ))}
          </div>
        </div>

        {/* Project Metadata Footer */}
        <div className="mt-6 sm:mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-1 sm:gap-0">
          <div className="flex flex-col w-full sm:w-auto">
            <h2 className={cn(
              "text-xl sm:text-2xl tracking-[0.5px] mb-1.5 transition-colors font-bold",
              isEffectActive
                ? `duration-[${CONFIG.TRANSITION_DESKTOP}ms] text-white`
                : "text-ink"
            )}>
              {activeItem.title}
            </h2>

            <div className={cn(
              "flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 text-[10px] sm:text-[12px] tracking-[1.25px] uppercase transition-colors",
              isEffectActive
                ? `duration-[${CONFIG.TRANSITION_DESKTOP}ms] text-white/70`
                : "text-muted"
            )}>
              <div className="flex flex-col sm:flex-row sm:gap-2 w-full sm:w-auto overflow-hidden">
                <div className="flex gap-2 whitespace-nowrap">
                  {(activeItem.roles || []).map((role, i, arr) => (
                    <span key={role} className="flex">
                      {role}
                      {i < arr.length - 1 && <span className="ml-2.5">/</span>}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center sm:items-baseline w-full sm:w-auto mt-0.5 sm:mt-0">
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline">•</span>
                  <span className="leading-none">{activeItem.year}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Accent Line / Call to Action */}
          <div className="hidden sm:flex flex-col items-end gap-2 shrink-0 translate-y-[-2.5px]">
            <span className={cn(
              "text-[11px] tracking-[1px] uppercase transition-all block",
              isEffectActive ? 'opacity-80 text-white' : 'opacity-0 text-ink',
              isEffectActive ? `duration-[${CONFIG.TRANSITION_DESKTOP}ms]` : ''
            )}>
              View Project
            </span>
            <div
              className="h-[1px] transition-all"
              style={{
                backgroundColor: isEffectActive ? '#ffffff' : activeItem.accentColor,
                width: isEffectActive ? '6.5rem' : '3.5rem',
                transitionDuration: isEffectActive ? `${CONFIG.TRANSITION_DESKTOP}ms` : '200ms'
              }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
