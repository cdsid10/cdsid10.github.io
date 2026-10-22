import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { projects } from '../data/projects';
import { cn } from '../lib/utils';
import { Menu, X } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import ThemeToggle from './ThemeToggle';
import { CONTACT } from '../data/contact';
import { isImproved } from '../lib/portfolioVersion';

/**
 * CONFIGURATION CONSTANTS
 * [GLOBAL]
 * Centralized values for easier maintenance of text content and animation timings.
 */
const CONFIG = {
  SLOT_WORDS: [
    // "GAME DESIGNER",
    // "LEVEL DESIGNER",
    // "SYSTEMS ARCHITECT",
    // "STORYTELLER",
    // "WORLD BUILDER",
    "LORE-WEAVER",
    "RESONATOR",
    "PRIMER",
    "ARTIFICER",
    "INQUISITOR",
    "TECHNOMANCER",
    "SIDDHANT RATHOR"
  ],
  SLOT_INTERVAL: 150, // Speed of text rotation in ms
  SIDEBAR_WIDTH_MOBILE: "260px",
  SIDEBAR_WIDTH_DESKTOP: "300px",
  SOCIAL_LINKS: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/siddhant-rathor/', target: '_blank' },
    { label: 'Github', href: 'https://github.com/cdsid10', target: '_blank' },
    { label: 'Itch.io', href: 'https://cdsid10.itch.io/', target: '_blank' },
    { label: 'Twitter', href: 'https://twitter.com/cdsid10', target: '_blank' },
    { label: 'Artstation', href: 'https://www.artstation.com/cdsid10', target: '_blank' },
    { label: 'Behance', href: 'https://www.behance.net/siddhantrathor', target: '_blank' },
  ]
};

/**
 * ScrambledText Component
 * [GLOBAL]
 * Creates a "shuffled characters" effect on hover and resolves character-by-character on click.
 */
/**
 * ScrambledText Component
 * [GLOBAL]
 * Creates a "shuffled characters" effect on hover and resolves character-by-character on click or hover-out.
 */
const HIDDEN_WORDS = ['UNITY', 'UNREAL', 'C#', 'C++', 'AI', 'SCRIPT', 'BUILD', 'DEBUG', 'BYTE', 'INT', 'FLOAT', 'NULL', 'BOOL' ];

/**
 * ScrambledText Component
 * [GLOBAL]
 * Creates a "shuffled characters" effect based on the provided phase.
 * Resolves character-by-character from the current scrambled state.
 */
const ScrambledText = ({
  text,
  phase,
  isSlow = false,
  onComplete
}: {
  text: string;
  phase: 'IDLE' | 'SHUFFLING' | 'RESOLVING';
  isSlow?: boolean;
  onComplete?: () => void;
}) => {
  const [displayText, setDisplayText] = useState(text);
  const lastScrambleRef = useRef(text);
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+?><";

  // Helper to generate a scrambled string with word injection
  const generateScramble = () => {
    let charArray = text.split('').map((char) => {
      if (char === ' ') return ' ';
      return characters[Math.floor(Math.random() * characters.length)];
    });

    // [GLOBAL] Word Injection Logic
    if (Math.random() > 0.3) {
      const shuffledWords = [...HIDDEN_WORDS].sort(() => Math.random() - 0.5);
      const occupied = new Set<number>();
      
      for (const word of shuffledWords) {
        const validStarts: number[] = [];
        for (let s = 0; s <= text.length - word.length; s++) {
          let possible = true;
          for (let i = -1; i <= word.length; i++) {
            if (occupied.has(s + i)) {
              possible = false;
              break;
            }
          }
          if (possible) validStarts.push(s);
        }
        
        if (validStarts.length > 0 && Math.random() > 0.4) {
          const start = validStarts[Math.floor(Math.random() * validStarts.length)];
          for (let i = 0; i < word.length; i++) {
            charArray[start + i] = word[i];
            occupied.add(start + i);
          }
        }
      }
    }
    return charArray.join('');
  };

  // Shuffle Logic
  useEffect(() => {
    if (phase !== 'SHUFFLING') return;

    const interval = setInterval(() => {
      const next = generateScramble();
      setDisplayText(next);
      lastScrambleRef.current = next;
    }, 70);

    return () => clearInterval(interval);
  }, [phase, text]);

  // Resolve Logic
  const resolveSpeedRef = useRef(1 / 2);
  const onCompleteRef = useRef(onComplete);

  // Keep onCompleteRef updated without triggering effects
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (phase !== 'RESOLVING') {
      if (phase === 'IDLE') setDisplayText(text);
      return;
    }

    // [GLOBAL] Capture speed ONLY when resolution starts
    // This prevents the animation from restarting if isSlow changes (e.g. name finishes slotting)
    resolveSpeedRef.current = isSlow ? (1 / 3.2) : (1 / 2);

    // [GLOBAL] Mobile/Direct Click Fix:
    // If we start resolving from IDLE (touch devices) or if it's explicitly a touch device,
    // generate a fresh unique scramble state for this tap.
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch || lastScrambleRef.current === text) {
      lastScrambleRef.current = generateScramble();
    }

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(() =>
        text.split('').map((char, i) => {
          if (i < iteration) return text[i];
          if (char === ' ') return ' ';
          return lastScrambleRef.current[i] || characters[Math.floor(Math.random() * characters.length)];
        }).join('')
      );
      
      iteration += resolveSpeedRef.current;
      
      if (iteration > text.length) {
        clearInterval(interval);
        setDisplayText(text);
        lastScrambleRef.current = text; // Reset ref so next click/tap generates a new scramble
        onCompleteRef.current?.();
      }
    }, 25);

    return () => clearInterval(interval);
  }, [phase, text]); // Removed isSlow and onComplete to prevent mid-animation restarts

  return <>{displayText}</>;
};

/**
 * SlotMachineText Component
 * [GLOBAL]
 * Creates a mechanical "rolling" text effect.
 * Used in the header (Mobile) and the top of the sidebar (Desktop).
 */
const SlotMachineText = ({
  isPlaying,
  scramblePhase,
  isLocked,
  onComplete,
  className,
  direction = "down"
}: {
  isPlaying: boolean;
  scramblePhase: 'IDLE' | 'SHUFFLING' | 'RESOLVING';
  isLocked: boolean;
  onComplete: () => void;
  className?: string;
  direction?: "up" | "down";
}) => {
  const [currentIndex, setCurrentIndex] = useState(CONFIG.SLOT_WORDS.length - 1);
  const finalWord = CONFIG.SLOT_WORDS[CONFIG.SLOT_WORDS.length - 1];

  useEffect(() => {
    if (!isPlaying) return;

    let i = 0;
    setCurrentIndex(0);
    const interval = setInterval(() => {
      i++;
      if (i >= CONFIG.SLOT_WORDS.length) {
        clearInterval(interval);
        onComplete();
      } else {
        setCurrentIndex(i);
      }
    }, CONFIG.SLOT_INTERVAL);

    return () => clearInterval(interval);
  }, [isPlaying, onComplete]);

  const isDown = direction === "down";

  return (
    <span className={cn("relative inline-flex overflow-hidden", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={`slot-${currentIndex}`}
          initial={{ y: isDown ? "-100%" : "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: isDown ? "100%" : "-100%", opacity: 0 }}
          transition={
            currentIndex === CONFIG.SLOT_WORDS.length - 1
              ? { type: "spring", stiffness: 1375, damping: 24, mass: 1 } // [GLOBAL] Mechanical "thunk" finish
              : { duration: 0.1, ease: "linear" } // [GLOBAL] Fast blur during rotation
          }
          className="block whitespace-nowrap leading-none"
        >
          {currentIndex === CONFIG.SLOT_WORDS.length - 1 && !isPlaying ? (
            <ScrambledText 
              text={finalWord} 
              phase={(scramblePhase === 'RESOLVING' && isLocked) ? 'IDLE' : scramblePhase} 
              isSlow={false} 
            />
          ) : (
            CONFIG.SLOT_WORDS[currentIndex]
          )}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

/**
 * [GLOBAL] Nav Group Sub-Component
 * Renders categorized lists (Featured Works, etc).
 * Declared at module level (not inside Sidebar) so React keeps the same component type between
 * renders; otherwise the list remounts whenever Sidebar state changes and keyboard focus is lost.
 */
const NavGroup = ({
  title,
  items,
  getNavItemClasses
}: {
  title: string;
  items: any[];
  getNavItemClasses: (isActive: boolean, projectId?: string) => string;
}) => (
  <div className="mb-8">
    <div className="font-display text-[12px] tracking-[1.25px] text-muted mb-4 uppercase font-semibold">
      {title}
    </div>
    <ul className="space-y-2 pl-2">
      {items.map(item => {
        const isExternal = item.isExternalOnly && item.link;
        return (
          <li key={item.id}>
            {isExternal ? (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className={getNavItemClasses(false, item.id)}
              >
                {item.title}
              </a>
            ) : (
              <NavLink
                to={item.customInternalLink || `/project/${item.id}`}
                className={({ isActive }) => getNavItemClasses(isActive, item.id)}
              >
                {item.title}
              </NavLink>
            )}
          </li>
        );
      })}
    </ul>
  </div>
);

export default function Sidebar() {
  // --- STATE & HOOKS ---
  const [isOpen, setIsOpen] = useState(false); // [MOBILE] Toggle for mobile drawer
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [isPlayingSlot, setIsPlayingSlot] = useState(false); // [GLOBAL] Animation trigger
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null); // [GLOBAL] Tracks highlighted work
  const [scramblePhase, setScramblePhase] = useState<'IDLE' | 'SHUFFLING' | 'RESOLVING'>('IDLE');
  const [isLockedAfterClick, setIsLockedAfterClick] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * [GLOBAL] Animation Reset
   * Prevents the slot machine from looping infinitely or restarting unexpectedly.
   */
  const handleSlotComplete = useCallback(() => {
    setIsPlayingSlot(false);
  }, []);

  /**
   * [GLOBAL] Home Navigation Logic
   * Handles scroll-to-top when already home and triggers the brand animation.
   */
  const handleHomeClick = () => {
    if (!isPlayingSlot) {
      setIsPlayingSlot(true);
      setScramblePhase('RESOLVING');
      setIsLockedAfterClick(true);
    }

    // [MOBILE] Ensure menu closes when navigating home
    setIsOpen(false);

    // [GLOBAL] Behavior for users already on the Home route
    if (location.pathname === '/') {
      // [MOBILE] Signal the dedicated MobileHome scroller to reset
      window.dispatchEvent(new CustomEvent('mobileScrollToTop'));

      // [DESKTOP] Reset the global Layout scroller
      document.querySelector('#scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * [GLOBAL] Hover Handlers
   * Adds delays to the scramble effect and resets interaction locks.
   */
  const handleHeaderMouseEnter = () => {
    // [GLOBAL] Disable hover animations on touch devices to prevent "sticky" hover states
    if (window.matchMedia('(pointer: coarse)').matches) return;

    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (scramblePhase !== 'IDLE' || isPlayingSlot || isLockedAfterClick) return;

    hoverTimeoutRef.current = setTimeout(() => {
      setScramblePhase('SHUFFLING');
    }, 0);
  };

  const handleHeaderMouseLeave = () => {
    // [GLOBAL] Disable hover animations on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (scramblePhase === 'SHUFFLING') {
      setScramblePhase('RESOLVING');
    }
    setIsLockedAfterClick(false);
  };

  /**
   * [GLOBAL] Cross-Component Event Listener
   * Listens for 'activeProjectChanged' (usually fired when hovering ProjectCards).
   * This ensures the Sidebar navigation highlights the work the user is currently viewing.
   */
  useEffect(() => {
    const handleActiveProjectChange = (event: any) => {
      setActiveProjectId(event.detail.projectId);
    };

    window.addEventListener('activeProjectChanged', handleActiveProjectChange);
    return () => window.removeEventListener('activeProjectChanged', handleActiveProjectChange);
  }, []);

  /**
   * [GLOBAL] Route Syncing
   * Automatically closes the mobile menu on navigation and defaults highlighting
   * to the first project if on the home page.
   */
  useEffect(() => {
    setIsOpen(false); // [MOBILE] Security: always close menu on route change

    if (location.pathname === '/' && !activeProjectId && projects.length > 0) {
      setActiveProjectId(projects[0].id);
    }
  }, [location.pathname, activeProjectId]);

  /**
   * [MOBILE] Sidebar State Sync
   * 1. Controls body scroll lock via 'sidebar-open' class.
   * 2. Resets the sidebar's internal scroll position after it hides to ensure
   *    a clean start on the next open.
   */
  useEffect(() => {
    document.body.classList.toggle('sidebar-open', isOpen);

    if (!isOpen && window.innerWidth < 1024) {
      const timer = setTimeout(() => {
        if (sidebarRef.current) sidebarRef.current.scrollTop = 0;
      }, 500); // Sync with transition-transform's 500ms duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  /**
   * [MOBILE] Drawer Accessibility
   * While the drawer is open the page behind it (covered by the backdrop) is made inert so keyboard
   * focus stays in the header + drawer, Escape closes the drawer and returns focus to the menu
   * button, and focus moves to the first drawer link on open. Resizing up to the desktop layout
   * closes the drawer so the inert state can never be left behind.
   */
  useEffect(() => {
    if (!isOpen) return;

    const page = document.getElementById('scroll-container');
    page?.setAttribute('inert', '');

    // The drawer is `visibility: hidden` until the browser applies the open state and hidden elements
    // cannot take focus, so retry briefly (max ~0.5s) until focus lands inside the drawer.
    // The desktop brand link inside the drawer is `display: none` on mobile, so pick the first rendered link.
    let attempts = 0;
    let focusTimer: ReturnType<typeof setTimeout>;
    const focusFirstLink = () => {
      Array.from(sidebarRef.current?.querySelectorAll<HTMLElement>('a[href]') ?? [])
        .find((link) => link.getClientRects().length > 0)?.focus();
      if (!sidebarRef.current?.contains(document.activeElement) && attempts++ < 16) {
        focusTimer = setTimeout(focusFirstLink, 30);
      }
    };
    focusTimer = setTimeout(focusFirstLink, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    const handleDesktop = (e: MediaQueryListEvent) => { if (e.matches) setIsOpen(false); };

    window.addEventListener('keydown', handleKeyDown);
    desktopQuery.addEventListener('change', handleDesktop);

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      desktopQuery.removeEventListener('change', handleDesktop);
      document.getElementById('scroll-container')?.removeAttribute('inert');
    };
  }, [isOpen]);

  /**
   * [GLOBAL] Navigation Styling Helper
   * Logic to determine if a link should appear "active" based on URL or 
   * custom project-highlighting logic.
   */
  const getNavItemClasses = (isActive: boolean, projectId?: string) => {
    const isHomeActive = location.pathname === '/' && projectId === activeProjectId;
    const shouldHighlight = isActive || isHomeActive;

    return cn(
      "block py-1 text-sm font-display tracking-[1px]",
      shouldHighlight ? "text-ink" : "text-ink/50 hover:text-ink"
    );
  };

  return (
    <>
      {/* 
        [MOBILE] Header Bar
        Visible only on screens smaller than 1024px.
        Contains the brand logo (slot machine) and the menu toggle.
      */}
      <header className={cn(
        "lg:hidden fixed top-0 left-0 right-0 h-16 bg-paper-elevated z-[60] flex items-center justify-between px-8 border-b border-ink/5",
        !isOpen && "shadow-[0_4px_20px_rgba(0,0,0,0.10)]"
      )}>
        <NavLink
          to="/"
          onClick={handleHomeClick}
          onMouseEnter={handleHeaderMouseEnter}
          onMouseLeave={handleHeaderMouseLeave}
          className="flex flex-col h-full justify-center relative"
        >
          <motion.div layout className="flex flex-col items-start">
            <SlotMachineText
              isPlaying={isPlayingSlot}
              scramblePhase={scramblePhase}
              isLocked={isLockedAfterClick}
              onComplete={handleSlotComplete}
              className="font-display font-medium tracking-[0.75px] text-[16px] uppercase leading-none"
            />
            {/* [MOBILE] Subtitle visible only when menu is open to balance header layout */}
            <AnimatePresence mode="wait">
              {(isOpen || isImproved) && (
                <motion.div
                  initial={isImproved ? false : { opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="text-[12px] tracking-[0.75px] text-muted uppercase overflow-hidden"
                >
                  <ScrambledText
                    text="GAME DESIGNER"
                    phase={scramblePhase}
                    isSlow={isPlayingSlot}
                    onComplete={() => {
                      setScramblePhase('IDLE');
                      setIsLockedAfterClick(false);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </NavLink>

        <div className="flex items-center gap-5 h-full">
          <ThemeToggle hideText iconSize={20} />
          <button
            ref={menuButtonRef}
            onClick={() => setIsOpen(!isOpen)}
            className="text-ink"
            aria-label="Navigation menu"
            aria-expanded={isOpen}
            aria-controls="site-drawer"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* 
        [GLOBAL] Sidebar Container
        Always visible on [DESKTOP], slide-in drawer on [MOBILE].
      */}
      <aside
        id="site-drawer"
        ref={sidebarRef}
        className={cn(
          // [MOBILE] `max-lg:invisible` removes the closed drawer from the tab order and the accessibility
          // tree. Visibility switches at the end of the slide-out and at the start of the slide-in.
          "fixed top-0 left-0 h-full bg-paper-elevated z-[55] transition-[transform,visibility] duration-500",
          "w-[260px] lg:w-[300px] border-r border-ink/5 pt-20 lg:pt-12 px-8 lg:px-10 overflow-y-auto flex flex-col",
          "lg:translate-x-0 lg:shadow-[4px_0_24px_rgba(0,0,0,0.05)]",
          isOpen ? "translate-x-0" : "-translate-x-full max-lg:invisible"
        )}
      >
        <div className="flex-1">
          {/* [DESKTOP] Brand Logo Section */}
          <div className="mb-8 hidden lg:block">
            <NavLink
              to="/"
              onClick={handleHomeClick}
              onMouseEnter={handleHeaderMouseEnter}
              onMouseLeave={handleHeaderMouseLeave}
              className="block mb-2"
            >
              <div className="font-display font-bold text-xl tracking-[1.25px] leading-none whitespace-nowrap uppercase mb-0">
                <SlotMachineText
                  isPlaying={isPlayingSlot}
                  scramblePhase={scramblePhase}
                  isLocked={isLockedAfterClick}
                  onComplete={handleSlotComplete}
                />
              </div>
              <span className="text-[14px] tracking-[1px] text-muted uppercase">
                <ScrambledText
                  text="GAME DESIGNER"
                  phase={scramblePhase}
                  isSlow={isPlayingSlot}
                  onComplete={() => {
                    setScramblePhase('IDLE');
                    setIsLockedAfterClick(false);
                  }}
                />
              </span>
            </NavLink>
          </div>

          <nav aria-label="Featured works" className="mt-1 lg:mt-10">
            <NavGroup title="Featured Works" items={projects} getNavItemClasses={getNavItemClasses} />
          </nav>
        </div>

        {/* Footer Navigation: Links, Theme, and Copyright */}
        <div className="mt-auto pt-12 pb-6">
          <div className="mb-10 hidden lg:flex flex-col gap-4">
            <ThemeToggle />
          </div>

          <nav aria-label="Archive and links">
            <div className="mb-8">
              <ul className="space-y-2 pl-2">
                <li><NavLink to="/other-works" className={({ isActive }) => getNavItemClasses(isActive)}>Archive</NavLink></li>
                {!(isImproved && CONTACT.resumeUrl) && (
                  <li>
                    <a
                      href={CONTACT.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={getNavItemClasses(false)}
                    >
                      Resumé
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* [IMPROVED] Contact section between Archive and More; an unconfigured value renders nothing (see data/contact.ts). */}
            {isImproved && (CONTACT.email || CONTACT.resumeUrl) && (
              <div className="mt-10">
                <div className="font-display text-[12px] tracking-[1.25px] text-muted mb-4 uppercase font-semibold">Contact</div>
                <ul className="space-y-2 pl-2">
                  {CONTACT.email && (
                    <li><a href={`mailto:${CONTACT.email}`} className={getNavItemClasses(false)}>Email</a></li>
                  )}
                  {CONTACT.resumeUrl && (
                    <li>
                      <a href={CONTACT.resumeUrl} target="_blank" rel="noopener noreferrer" className={getNavItemClasses(false)}>Resumé</a>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Social Links Section */}
            <div className="mt-10">
              <div className="font-display text-[12px] tracking-[1.25px] text-muted mb-4 uppercase font-semibold">More</div>
              <ul className="space-y-2 pl-2">
                {CONFIG.SOCIAL_LINKS.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => item.href === '#' && e.preventDefault()}
                      className={getNavItemClasses(false)}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="mt-8 pb--2">
            <p className="text-[9px] tracking-[1.5px] text-muted uppercase font-medium">
              © 2026 Siddhant Rathor<br />
              Game Design Portfolio
            </p>
          </div>
        </div>
      </aside>

      {/* 
        [MOBILE] Backdrop Overlay
        Darkens/blurs the background when the drawer is open. 
        Clicking this area closes the menu.
      */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 bg-ink/5 backdrop-blur-sm z-30 transition-all duration-500",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
        onClick={() => { setIsOpen(false); menuButtonRef.current?.focus(); }}
        aria-hidden="true"
      />
    </>
  );
}