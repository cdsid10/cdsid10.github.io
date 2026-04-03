import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';

import { projects } from '../data/projects';
import MobileProjectCard from '../components/MobileProjectCard';
import MobileCollectionCard from '../components/MobileCollectionCard';

/**
 * [MOBILE]
 * Configuration for the Mobile Feed layout and functionality.
 */
const MOBILE_DIM_DELAY_MS = 1500;

// === SCROLL INDICATOR CONFIGURATION ===
// 1. Toggle this to completely enable or disable the scroll arrows.
const SHOW_SCROLL_INDICATOR = true;

// 2. Adjust these values to change the layout, sizes, and spacing.
const INDICATOR_CONFIG = {
  iconSize: 20,              // [PIXELS] Size of the arrows
  strokeWidth: 2.5,          // [PIXELS] Thickness of the arrow lines
  verticalGap: -2,           // [PIXELS] Adjust this for overlap (negative) or spacing (positive)
  bottomOffset: "bottom-[2vh]" // [CSS] Distance from the bottom of the screen
};

function MobileScrollIndicators({
  activeSection,
  isSidebarOpen,
  isIndicatorDimmed,
  isHoveringActiveCard,
  onDotClick
}: {
  activeSection: number;
  isSidebarOpen: boolean;
  isIndicatorDimmed: boolean;
  isHoveringActiveCard: boolean;
  onDotClick: (index: number) => void;
}) {
  const canScrollUp = activeSection > 0;
  const canScrollDown = activeSection < projects.length - 1;

  if (!SHOW_SCROLL_INDICATOR) return null;

  // The distance required to slide an arrow exactly to the dead center of the container
  const shiftAmount = (INDICATOR_CONFIG.iconSize + INDICATOR_CONFIG.verticalGap) / 2;

  return (
    <div
      className={`fixed ${INDICATOR_CONFIG.bottomOffset} left-1/2 -translate-x-1/2 z-50 flex flex-col items-center justify-center transition-opacity duration-300 ${isSidebarOpen ? 'opacity-0 pointer-events-none' : (isIndicatorDimmed ? 'opacity-[0.25]' : 'opacity-40')
        }`}
      style={{
        // Fixed container height to ensure the "middle point" remains stable 
        // even when only one arrow is displayed.
        height: `${(INDICATOR_CONFIG.iconSize * 2) + INDICATOR_CONFIG.verticalGap}px`
      }}
    >
      {/* 
        Up Arrow Container. 
      */}
      <button
        onClick={() => onDotClick(activeSection - 1)}
        className={`p-0 transition-all duration-300 flex items-center justify-center drop-shadow-sm active:scale-90 ${
          canScrollUp ? 'opacity-100 text-ink/80 hover:text-ink/90' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Scroll Up"
        style={{ 
          marginBottom: `${INDICATOR_CONFIG.verticalGap / 2}px`,
          translate: !canScrollDown ? `0 ${shiftAmount}px` : '0 0'
        }}
      >
        <svg
          width={INDICATOR_CONFIG.iconSize}
          height={INDICATOR_CONFIG.iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={INDICATOR_CONFIG.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </button>

      {/* 
        Down Arrow Container. 
      */}
      <button
        onClick={() => onDotClick(activeSection + 1)}
        className={`p-0 transition-all duration-300 flex items-center justify-center drop-shadow-sm active:scale-90 ${
          canScrollDown ? 'opacity-100 text-ink/80 hover:text-ink/90' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Scroll Down"
        style={{ 
          marginTop: `${INDICATOR_CONFIG.verticalGap / 2}px`,
          translate: !canScrollUp ? `0 -${shiftAmount}px` : '0 0' 
        }}
      >
        <svg
          width={INDICATOR_CONFIG.iconSize}
          height={INDICATOR_CONFIG.iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={INDICATOR_CONFIG.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    </div>
  );
}

export default function MobileHome() {
  const location = useLocation();

  // --- STATE ---
  const [activeSection, setActiveSection] = useState(0);
  const [isHoveringActiveCard, setIsHoveringActiveCard] = useState(false);
  const [activeCollectionColor, setActiveCollectionColor] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isIndicatorDimmed, setIsIndicatorDimmed] = useState(false);

  // --- REFS ---
  const homeRef = useRef<HTMLDivElement>(null);
  const activeSectionRef = useRef(0);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- EFFECTS ---

  /**
   * [GLOBAL]
   * Listens for hover events specifically from Collection sub-items to dynamically
   * inject their unique accent colors into the global bloom overlay.
   */
  useEffect(() => {
    const handleCollectionHover = (e: CustomEvent) => {
      setActiveCollectionColor(e.detail.accentColor);
    };
    window.addEventListener('collectionItemHovered', handleCollectionHover as EventListener);
    return () => window.removeEventListener('collectionItemHovered', handleCollectionHover as EventListener);
  }, []);

  // Location reset
  useEffect(() => {
    setIsHoveringActiveCard(false);
    setActiveCollectionColor(null);
  }, [location.pathname]);

  // Sidebar observer
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsSidebarOpen(document.body.classList.contains('sidebar-open'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Indicator dimming logic
  useEffect(() => {
    const resetInactivityTimer = () => {
      setIsIndicatorDimmed(false);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(() => {
        setIsIndicatorDimmed(true);
      }, MOBILE_DIM_DELAY_MS);
    };

    const scrollContainer = homeRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', resetInactivityTimer);
      scrollContainer.addEventListener('touchstart', resetInactivityTimer);
    }

    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', resetInactivityTimer);
        scrollContainer.removeEventListener('touchstart', resetInactivityTimer);
      }
    };
  }, []);

  // Intersection observer for section tracking
  useEffect(() => {
    const scrollContainer = homeRef.current;
    const observerOptions = { root: scrollContainer, threshold: 0.5 };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          activeSectionRef.current = index;
          setActiveSection(index);

          const project = projects[index];
          if (project) {
            window.dispatchEvent(new CustomEvent('activeProjectChanged', {
              detail: { projectId: project.id }
            }));
          }
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('.mobile-project-section');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [projects]);

  useEffect(() => {
    setIsHoveringActiveCard(false);
  }, [activeSection]);

  // --- HANDLERS ---
  const handleHoverStart = useCallback((index: number) => {
    if (index === activeSectionRef.current) {
      setIsHoveringActiveCard(true);
    }
  }, []);

  const handleHoverEnd = useCallback(() => {
    setIsHoveringActiveCard(false);
  }, []);

  const scrollToSection = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, projects.length - 1));
    const projectSections = document.querySelectorAll('.mobile-project-section');
    projectSections[clampedIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // [MOBILE] Handle home-click events from the Sidebar/Header
  useEffect(() => {
    const handleScrollToTop = () => {
      scrollToSection(0);
    };

    window.addEventListener('mobileScrollToTop', handleScrollToTop);
    return () => window.removeEventListener('mobileScrollToTop', handleScrollToTop);
  }, []);

  // [MOBILE] Handle routing anchor links to specific projects
  useEffect(() => {
    if (location.state && location.state.scrollToProject) {
      const targetId = location.state.scrollToProject;
      const index = projects.findIndex((p) => p.id === targetId);
      if (index !== -1) {
        setTimeout(() => {
          scrollToSection(index);
          // Optional: clear the state to prevent scrolling again on refresh
          window.history.replaceState({}, document.title);
        }, 100);
      }
    }
  }, [location.state]);

  return (
    // [MOBILE] Standalone pure vertical scrolling container bypassing global Layout scroller
    <div
      ref={homeRef}
      className="relative flex flex-col overflow-y-auto overflow-x-hidden snap-y snap-mandatory h-[100dvh] w-[100vw] hide-scrollbar"
    >

      {/* Bloom Background Layer */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundColor: isHoveringActiveCard && projects[activeSection]
            ? `color-mix(in srgb, ${activeCollectionColor || projects[activeSection].accentColor} 98.5%, black)`
            : 'transparent',
          transitionProperty: 'background-color',
          transitionDuration: '600ms',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      />

      {projects.map((project, index) => {
        const isActiveComponent = isHoveringActiveCard && index === activeSection;

        return (
          <section
            key={project.id}
            data-index={index}
            className="mobile-project-section w-[100vw] h-full shrink-0 snap-center flex flex-col items-center justify-center relative z-10"
          >
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.35 }}
              className="w-full relative mx-auto flex flex-col justify-center px-2 pt-8"
            >
              <div className="mb-4 flex items-center justify-center gap-1.5">
                <span className={`eyebrow transition-colors duration-300 ${isActiveComponent ? 'text-white' : 'text-muted'}`}>
                  Featured Work
                </span>
                <span className={`eyebrow-dot transition-colors duration-300 ${isActiveComponent ? 'text-white' : 'text-muted'}`} />
                <span className={`eyebrow transition-colors duration-300 ${isActiveComponent ? 'text-white' : 'text-muted'}`}>
                  0{index + 1}
                </span>
              </div>

              {project.isCollection ? (
                <MobileCollectionCard
                  project={project}
                  onHoverStart={() => handleHoverStart(index)}
                  onHoverEnd={handleHoverEnd}
                  isHovered={isActiveComponent}
                  isActive={index === activeSection}
                />
              ) : (
                <MobileProjectCard
                  project={project}
                  onHoverStart={() => handleHoverStart(index)}
                  onHoverEnd={handleHoverEnd}
                  isHovered={isActiveComponent}
                />
              )}
            </motion.div>
          </section>
        );
      })}

      <MobileScrollIndicators
        activeSection={activeSection}
        isSidebarOpen={isSidebarOpen}
        isIndicatorDimmed={isIndicatorDimmed}
        isHoveringActiveCard={isHoveringActiveCard}
        onDotClick={scrollToSection}
      />
    </div>
  );
}
