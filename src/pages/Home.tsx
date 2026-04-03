import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';

import { projects } from '../data/projects';
import ProjectCard from '../components/ProjectCard';
import DesktopCollectionCard from '../components/DesktopCollectionCard';
import MobileHome from './MobileHome';

/**
 * [GLOBAL]
 * Application-wide configuration thresholds ensuring a single source of truth
 * for logic breakpoints and timeout constraints.
 */
const DESKTOP_BREAKPOINT = 1024;
const SCROLL_LOCK_MS = 600;
const MOBILE_DIM_DELAY_MS = 3000;

/**
 * [GLOBAL]
 * This logic defines a functional component for rendering the vertical scroll dot navigation.
 * It strictly synchronizes with the activeSection to highlight the user's progress.
 */
function ScrollIndicators({
  activeSection,
  isHoveringActiveCard,
  isSidebarOpen,
  isIndicatorDimmed,
  onDotClick
}: {
  activeSection: number;
  isHoveringActiveCard: boolean;
  isSidebarOpen: boolean;
  isIndicatorDimmed: boolean;
  onDotClick: (index: number) => void;
}) {
  return (
    <div
      /* 
        [GLOBAL] Base styling and vertical alignment.
        [DESKTOP] lg:right-8 handles wider spacing layouts.
        [MOBILE] right-4 applies compact padding and utilizes the isIndicatorDimmed logic.
      */
      className={`fixed right-4 lg:right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-0 items-center transition-all duration-700 scroll-indicators ${isSidebarOpen ? 'opacity-0 pointer-events-none' : (isIndicatorDimmed ? 'opacity-[0.45]' : 'opacity-100')
        }`}
    >
      {projects.map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick(index)}
          className="group p-1.25 cursor-pointer flex items-center justify-center transition-all duration-300"
        >
          <div
            /*
              [GLOBAL] 
              Dynamic styling changes color and height drastically based on whether 
              this dot represents the currently viewed section, incorporating bloom hover overrides.
            */
            className={`w-1.5 rounded-full transition-all duration-500 ease-out ${activeSection === index
              ? (isHoveringActiveCard ? 'h-8 bg-white' : 'h-8 bg-ink')
              : (isHoveringActiveCard ? 'h-1.5 bg-white/20 group-hover:bg-white/40' : 'h-1.5 bg-ink/20 group-hover:bg-ink/40 shadow-sm')
              }`}
          />
        </button>
      ))}
    </div>
  );
}

/**
 * [GLOBAL]
 * This function defines the Home page foundation.
 * It handles immersive full-screen scroll behaviors, synchronizes project cards,
 * and tracks the interactive "bloom" aesthetic background states.
 */
function DesktopHome() {
  const location = useLocation();

  // --- STATE ---

  /**
   * [GLOBAL] 
   * Tracks which project index is physically centered in the browser viewport.
   */
  const [activeSection, setActiveSection] = useState(0);

  /**
   * [GLOBAL] 
   * Dictates whether the current active card is being engaged with, 
   * which triggers the global background color bleed (bloom) effect.
   */
  const [isHoveringActiveCard, setIsHoveringActiveCard] = useState(false);

  /**
   * [GLOBAL]
   * Overrides the bloom color if a specific item inside a collection is hovered.
   */
  const [activeCollectionColor, setActiveCollectionColor] = useState<string | null>(null);

  /**
   * [GLOBAL] 
   * True while a programmatic 'smooth' scroll is resolving. 
   * Suppresses stray interactions during the transition phase.
   */
  const [isScrolling, setIsScrolling] = useState(false);

  /**
   * [GLOBAL] 
   * Tracks exact browser width locally for immediate evaluation inside dynamic inline-styles 
   * safely bypassing external CSS media queries when hardware access is needed.
   */
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  /**
   * [MOBILE] 
   * Mirrors the sidebar's external body-class state to instantly mute overlaying components
   * (like scroll dots) when the mobile hamburger menu dominates the view.
   */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /**
   * [MOBILE] 
   * Handles automatically fading out interactive components (like scroll indicators) 
   * on small screens when the user goes inert to prioritize clean minimal aesthetics.
   */
  const [isIndicatorDimmed, setIsIndicatorDimmed] = useState(false);

  /**
   * [IPAD]
   * Detect touch capabilities to apply iPad-specific layout shifts since iPad passes 
   * desktop width checks but requires different vertical optical centering.
   */
  const [isTouchDevice, setIsTouchDevice] = useState(
    typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)').matches : false
  );

  // --- REFS ---

  const homeRef = useRef<HTMLDivElement>(null);

  // Duplicates activeSection internally ensuring event-listeners avoid stale closure loops
  const activeSectionRef = useRef(0);

  // Tracks active scroll overrides independently preventing dual-inputs stacking breaking the timeline
  const isScrollLocked = useRef(false);

  // Caches timeout loops allowing them to be forcefully flushed upon rapid user adjustments
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Identifies if cursor still physically intersects UI coordinates natively
  const isMousePhysicallyOverCard = useRef(false);

  // Timeout hook clearing inactivity bounds
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- EFFECTS ---

  /**
   * [GLOBAL]
   * This logic forcefully flushes interaction data preventing ghost visual bugs 
   * whenever native URL structures mutate unexpectedly out of scope.
   */
  useEffect(() => {
    setIsHoveringActiveCard(false);
    setIsScrolling(false);
  }, [location.pathname]);

  // [GLOBAL] Handle routing anchor links to specific projects
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

  /**
   * [GLOBAL]
   * This logic initializes DOM bindings synchronizing window sizes and tracking root layer 
   * 'sidebar-open' mutations independently linking external structural changes into local react contexts.
   */
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    // [IPAD] Re-check pointer capability on resize
    const mq = window.matchMedia('(pointer: coarse)');
    const handlePointerChange = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches);
    mq.addEventListener('change', handlePointerChange);

    const observer = new MutationObserver(() => {
      setIsSidebarOpen(document.body.classList.contains('sidebar-open'));
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => {
      window.removeEventListener('resize', handleResize);
      mq.removeEventListener('change', handlePointerChange);
      observer.disconnect();
    };
  }, []);

  /**
   * [MOBILE]
   * This logic handles the dimming of the vertical scroll indicators.
   * To prevent screen burn-in and visual clutter on constrained screens, 
   * the dots fade out after exactly 3s of inactivity natively.
   */
  useEffect(() => {
    if (windowWidth >= DESKTOP_BREAKPOINT) {
      setIsIndicatorDimmed(false);
      return;
    }

    const resetInactivityTimer = () => {
      setIsIndicatorDimmed(false);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(() => {
        setIsIndicatorDimmed(true);
      }, MOBILE_DIM_DELAY_MS);
    };

    const scrollContainer = homeRef.current?.closest('#scroll-container');
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
  }, [windowWidth]);

  /**
   * [GLOBAL]
   * This logic wires IntersectionObserver protocols natively detecting exactly which project block 
   * penetrates the central screen threshold actively. Subsequently blasts a CustomEvent synchronizing
   * the disconnected persistent Sidebar layout effortlessly.
   */
  useEffect(() => {
    const scrollContainer = homeRef.current?.closest('#scroll-container');
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

    const sections = document.querySelectorAll('.project-section');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  /**
   * [GLOBAL]
   * This logic strictly overrides hover triggers breaking visual cohesion during 
   * snap-scrolling transitions, forcibly scrubbing active states upon new section mounts limitlessly.
   */
  useEffect(() => {
    setIsHoveringActiveCard(false);
    setActiveCollectionColor(null);
  }, [activeSection]);

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


  // --- HANDLERS ---

  /**
   * [GLOBAL]
   * This logic performs the programmatic scroll pushing the viewport to the exact selected section.
   * Constrains mathematical vectors inside arrays avoiding bounding overflow crashes automatically.
   */
  const scrollToSection = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, projects.length - 1));
    const projectSections = document.querySelectorAll('.project-section');
    projectSections[clampedIndex]?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * [GLOBAL]
   * This logic forcibly hijacks crude OS-level mouse wheezing / raw tracking events seamlessly mapping
   * inputs back towards consistent managed programmatic scrolls avoiding harsh native snap jank completely.
   */
  useEffect(() => {
    const mainEl = homeRef.current?.closest('#scroll-container');
    if (!mainEl) return;

    let touchStartY = 0;

    const beginScroll = () => {
      setIsScrolling(true);
      setIsHoveringActiveCard(false);

      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);

      scrollEndTimerRef.current = setTimeout(() => {
        setIsScrolling(false);
        // Restores active hover if cursor physically remained over target layout safely
        if (isMousePhysicallyOverCard.current) {
          setIsHoveringActiveCard(true);
        }
      }, SCROLL_LOCK_MS);
    };

    const handleWheel = (e: WheelEvent) => {
      if (isScrollLocked.current) {
        e.preventDefault();
        return;
      }

      const deltaDir = e.deltaY > 0 ? 1 : -1;
      const targetSection = activeSectionRef.current + deltaDir;

      // Permit native OS boundary-bouncing physics if user attempts exceeding max dimensions actively
      if (targetSection < 0 || targetSection >= projects.length) return;

      e.preventDefault();
      isScrollLocked.current = true;
      beginScroll();
      scrollToSection(targetSection);
      setTimeout(() => { isScrollLocked.current = false; }, SCROLL_LOCK_MS);
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrollLocked.current) return;
      const delta = touchStartY - e.changedTouches[0].clientY;

      // Ignore phantom micro-drifts suppressing false positives seamlessly
      if (Math.abs(delta) < 30) return;

      const targetSection = activeSectionRef.current + (delta > 0 ? 1 : -1);

      if (targetSection < 0 || targetSection >= projects.length) return;

      isScrollLocked.current = true;
      beginScroll();
      scrollToSection(targetSection);
      setTimeout(() => { isScrollLocked.current = false; }, SCROLL_LOCK_MS);
    };

    mainEl.addEventListener('wheel', handleWheel, { passive: false });
    mainEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    mainEl.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      mainEl.removeEventListener('wheel', handleWheel);
      mainEl.removeEventListener('touchstart', handleTouchStart);
      mainEl.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div ref={homeRef} className="relative">

      {/* 
        [GLOBAL]
        This logic renders the fullscreen conceptual 'bloom' background layer spanning the whole site.
        [DESKTOP] transitions generic CSS parameters naturally processing fluid bleeds efficiently natively.
        [MOBILE] forcefully injects harsher darkness mixing metrics (98.5%) prioritizing base contrast levels exclusively.
      */}
      <div
        className="fixed inset-0 lg:left-[300px] pointer-events-none z-0 lg:transition-colors"
        style={{
          backgroundColor: isHoveringActiveCard && projects[activeSection]
            ? `color-mix(in srgb, ${activeCollectionColor || projects[activeSection].accentColor} ${windowWidth < DESKTOP_BREAKPOINT ? '98.5%' : '85%'}, black)`
            : 'transparent',
          transitionProperty: 'background-color',
          transitionDuration: isHoveringActiveCard && windowWidth < DESKTOP_BREAKPOINT ? '600ms' : '1250ms',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      />

      {/* Sections rendering logic mapping dynamically against primary database datasets. */}
      {projects.map((project, index) => {
        const isActiveComponent = isHoveringActiveCard && index === activeSection;

        return (
          <section
            key={project.id}
            data-index={index}
            /* 
              [GLOBAL] Structural container alignments mapping snap behaviors identically. 
              [DESKTOP] lg:px-20 adds necessary wide padding layout.
            */
            className="project-section h-screen snap-start flex items-center justify-center px-6 lg:px-20 relative z-10"
          >
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.35 }}
              /* 
                [GLOBAL] Inner layout restrictions scaling dynamically safely.
                [DESKTOP] lg:w-[80vw] lg:top-0 resolves offsets scaling width completely horizontally.
                [IPAD] Applies a specific negative top margin to optically center the hero section.
              */
              className={`w-full lg:w-[80vw] max-w-[1560px] px-6 lg:px-12 relative mx-auto ${isTouchDevice ? '-top-12 lg:-top-14' : '-top-6 lg:top-0'}`}
            >
              <div className="mb-8 lg:mb-12 flex items-center" style={{ gap: 'var(--eyebrow-gap)' }}>
                {/* 
                  [GLOBAL] Metadata indicators mapping typography cleanly.
                  Uses shared .eyebrow + .eyebrow-dot tokens from index.css for a single source of truth.
                  [DESKTOP] transitions text-white/text-muted via lg:transition-colors naturally relying on bloom overlays.
                */}
                <span className={`eyebrow lg:transition-colors lg:duration-350 ${isActiveComponent ? 'text-white' : 'text-muted'
                  }`}>
                  Featured Work
                </span>
                <span className={`eyebrow-dot lg:transition-colors lg:duration-350 ${isActiveComponent ? 'text-white' : 'text-muted'
                  }`} />
                <span className={`eyebrow lg:transition-colors lg:duration-350 ${isActiveComponent ? 'text-white' : 'text-muted'
                  }`}>
                  0{index + 1}
                </span>
              </div>

              {/* Central Project Card linking logic bindings seamlessly towards independent components */}
              {project.isCollection ? (
                <DesktopCollectionCard
                  project={project}
                  onHoverStart={() => {
                    isMousePhysicallyOverCard.current = true;
                    if (!isScrolling && index === activeSection) {
                      setIsHoveringActiveCard(true);
                    }
                  }}
                  onHoverEnd={() => {
                    isMousePhysicallyOverCard.current = false;
                    setIsHoveringActiveCard(false);
                    setActiveCollectionColor(null);
                  }}
                  isHovered={isActiveComponent}
                  isActive={index === activeSection}
                />
              ) : (
                <ProjectCard
                  project={project}
                  onHoverStart={() => {
                    isMousePhysicallyOverCard.current = true;
                    if (!isScrolling && index === activeSection) {
                      setIsHoveringActiveCard(true);
                    }
                  }}
                  onHoverEnd={() => {
                    isMousePhysicallyOverCard.current = false;
                    setIsHoveringActiveCard(false);
                  }}
                  isHovered={isActiveComponent}
                />
              )}
            </motion.div>
          </section>
        );
      })}

      <ScrollIndicators
        activeSection={activeSection}
        isHoveringActiveCard={isHoveringActiveCard}
        isSidebarOpen={isSidebarOpen}
        isIndicatorDimmed={isIndicatorDimmed}
        onDotClick={scrollToSection}
      />
    </div>
  );
}

/**
 * [GLOBAL]
 * The main Home routing component. Conditionally mounts MobileHome or DesktopHome
 * depending on screen size to ensure zero interference between device logic.
 */
export default function Home() {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (windowWidth < DESKTOP_BREAKPOINT) {
    return <MobileHome />;
  }

  return <DesktopHome />;
}
