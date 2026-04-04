import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Project } from '../data/projects';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const CONFIG = {
  BLOOM_NAV_DELAY: 575,
  TAP_ZOOM: 1.025,
  TAP_DURATION: 0.5,
  TRANSITION_MOBILE: 200,
  ASPECT_RATIO: 'aspect-square',
  MOBILE_DIM_DELAY_MS: 2000,
};

interface MobileCollectionCardProps {
  project: Project;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  isHovered: boolean;
  isActive: boolean;
}

export default function MobileCollectionCard({ project, onHoverStart, onHoverEnd, isHovered, isActive }: MobileCollectionCardProps) {
  const [isEffectActive, setIsEffectActive] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isIndicatorDimmed, setIsIndicatorDimmed] = useState(false);
  const [showShine, setShowShine] = useState(false);

  // Trigger "Shine" animation when project becomes active/hovered
  useEffect(() => {
    if (isHovered) {
      setShowShine(true);
      const timer = setTimeout(() => setShowShine(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isHovered]);

  const items = project.collectionItems || [];
  const activeItem = items[activeItemIndex] || project;

  // React to external active state
  useEffect(() => {
    setIsEffectActive(isHovered);
    if (isHovered) {
      setIsIndicatorDimmed(false);
      resetInactivityTimer();
    }
    if (!isHovered) {
      if (navTimeoutRef.current) {
        clearTimeout(navTimeoutRef.current);
        navTimeoutRef.current = null;
      }
    }
  }, [isHovered]);

  // React to section activation (scrolled into view)
  useEffect(() => {
    if (isActive) {
      resetInactivityTimer();
    }
  }, [isActive]);

  // Dispatch active item color for global bloom
  useEffect(() => {
    if (isEffectActive) {
      window.dispatchEvent(new CustomEvent('collectionItemHovered', {
        detail: { accentColor: items[activeItemIndex]?.accentColor || project.accentColor }
      }));
    }
  }, [isEffectActive, activeItemIndex, items, project.accentColor]);

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
    return () => {
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      window.removeEventListener('mobileScrollToTop', handleReset);
    };
  }, []);

  const resetInactivityTimer = () => {
    setIsIndicatorDimmed(false);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      setIsIndicatorDimmed(true);
    }, CONFIG.MOBILE_DIM_DELAY_MS);
  };

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
    resetInactivityTimer();
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (navTimeoutRef.current) {
        clearTimeout(navTimeoutRef.current);
        navTimeoutRef.current = null;
      }
    };
  }, []);

  const handleScroll = () => {
    resetInactivityTimer();
    if (!scrollContainerRef.current) return;
    const scrollLeft = scrollContainerRef.current.scrollLeft;
    const width = scrollContainerRef.current.clientWidth;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== activeItemIndex && newIndex >= 0 && newIndex < items.length) {
      setActiveItemIndex(newIndex);
      // On mobile, blooming happens strictly based on the main accent 
      // but we can update it immediately if we're technically hovered.
      if (isEffectActive) {
         window.dispatchEvent(new CustomEvent('collectionItemHovered', {
           detail: { accentColor: items[newIndex]?.accentColor || project.accentColor }
         }));
      }
    }
  };

  const scrollTo = (index: number) => {
    if (!scrollContainerRef.current) return;
    const width = scrollContainerRef.current.clientWidth;
    scrollContainerRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (navTimeoutRef.current) {
      e.preventDefault();
      return;
    }

    const link = activeItem.link;
    if (link) {
      // Trigger visual states but DO NOT prevent default, allowing native new tab
      onHoverStart();
      setIsEffectActive(true);

      navTimeoutRef.current = setTimeout(() => {
        setIsEffectActive(false);
        onHoverEnd();
        navTimeoutRef.current = null;
        window.open(link, '_blank');
      }, 700); // Give it a slight delay so visual feedback occurs before jump
      return;
    }
  };

  return (
    <div
      ref={containerRef}
      className="group block w-full px-4"
    >
      <motion.div
        animate={{
          scale: isHovered ? CONFIG.TAP_ZOOM : 1
        }}
        transition={{ duration: CONFIG.TAP_DURATION, ease: [0.16, 1, 0.3, 1] }}
        className="w-full h-full flex flex-col justify-center"
      >
        {/* Visual Container */}
        <div
          className={cn(
            "relative overflow-hidden img-placeholder shadow-[0_30px_60px_-20px_rgba(0,0,0,0.3),0_0_20px_0_rgba(0,0,0,0.05)]",
            CONFIG.ASPECT_RATIO
          )}
        >
          {/* Shine Layer (Interaction/Scroll Trigger) */}
          <div className={cn("shine-layer", showShine && "shine-animate")} />

          {/* Snap Carousel */}
          <div
            ref={scrollContainerRef}
            className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pointer-events-auto"
            onScroll={handleScroll}
            onTouchStart={resetInactivityTimer}
          >
            {items.map((item, index) => (
              <div
                key={item.id}
                onClick={handleCardClick}
                className="relative shrink-0 w-full h-full snap-center bg-black cursor-pointer"
              >
                <img
                  src={item.thumbnail_mobile || item.thumbnail_16_9}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>
            ))}
          </div>

          {/* Navigation Overlay (Full-height hit zones) */}
          <div className="absolute inset-0 flex justify-between pointer-events-none z-20">
            <button
              className={cn(
                "h-full w-[15%] flex items-center justify-start pl-4 text-white pointer-events-auto transition-all duration-300 group/nav",
                activeItemIndex > 0 
                  ? (isIndicatorDimmed ? "opacity-25" : "opacity-100") 
                  : "opacity-0 pointer-events-none"
              )}
              onClick={(e) => { e.stopPropagation(); scrollTo(activeItemIndex - 1); }}
            >
              <div className="p-2 rounded-full bg-black/20 backdrop-blur-md group-active/nav:bg-black/40 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </div>
            </button>
            <button
              className={cn(
                "h-full w-[20%] flex items-center justify-end pr-4 text-white pointer-events-auto transition-all duration-300 group/nav",
                activeItemIndex < items.length - 1 
                  ? (isIndicatorDimmed ? "opacity-25" : "opacity-100") 
                  : "opacity-0 pointer-events-none"
              )}
              onClick={(e) => { e.stopPropagation(); scrollTo(activeItemIndex + 1); }}
            >
              <div className="p-2 rounded-full bg-black/20 backdrop-blur-md group-active/nav:bg-black/40 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </button>
          </div>

          <div className={cn(
            "absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none transition-opacity duration-500",
            isIndicatorDimmed ? "opacity-[0.25]" : "opacity-100"
          )}>
            {items.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300 pointer-events-auto cursor-pointer",
                  index === activeItemIndex ? "bg-white w-5" : "bg-white/40 w-1.5"
                )}
                onClick={(e) => { e.stopPropagation(); scrollTo(index); }}
              />
            ))}
          </div>
        </div>

        {/* Project Metadata Footer - Dynamic */}
        <div className="mt-4 flex flex-col items-start w-full">
          <h2 className={cn(
            "text-[22px] sm:text-2xl tracking-[1px] mb-1 transition-colors font-bold text-left",
            isEffectActive ? `duration-[${CONFIG.TRANSITION_MOBILE}ms] text-white` : "duration-200 text-ink"
          )}>
            {activeItem.title}
          </h2>

          <div className={cn(
            "flex flex-col w-full text-[11px] sm:text-[12px] tracking-[1.125px] uppercase transition-colors",
            isEffectActive ? `duration-[${CONFIG.TRANSITION_MOBILE}ms] text-white/70` : "text-muted"
          )}>
            <div className="flex flex-col sm:flex-row gap-0 sm:gap-2 text-left w-full leading-relaxed overflow-hidden">
               <div className="flex gap-2 whitespace-nowrap">
                   {(activeItem.roles || []).map((role, i, arr) => (
                    <span key={role} className="flex items-center">
                      {role}
                      {i < arr.length - 1 && <span className="ml-2.5">/</span>}
                    </span>
                  ))}
               </div>
            </div>

            <div className="flex justify-between items-center w-full mt-0.5">
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline">•</span>
                <span className="leading-none">{activeItem.year}</span>
              </div>

              <div className="flex items-center shrink-0 translate-y-[2.5px]">
                <div
                  className="h-[1px] transition-all"
                  style={{
                    backgroundColor: isEffectActive ? '#ffffff' : activeItem.accentColor,
                    width: isEffectActive ? '4.5rem' : '2.5rem',
                    transitionDuration: isEffectActive ? `${CONFIG.TRANSITION_MOBILE}ms` : '200ms'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
