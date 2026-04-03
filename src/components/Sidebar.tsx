import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { projects } from '../data/projects';
import { cn } from '../lib/utils';
import { Menu, X } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import ThemeToggle from './ThemeToggle';

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
 * SlotMachineText Component
 * [GLOBAL]
 * Creates a mechanical "rolling" text effect.
 * Used in the header (Mobile) and the top of the sidebar (Desktop).
 */
const SlotMachineText = ({
  isPlaying,
  onComplete,
  className,
  direction = "down"
}: {
  isPlaying: boolean;
  onComplete: () => void;
  className?: string;
  direction?: "up" | "down";
}) => {
  const [currentIndex, setCurrentIndex] = useState(CONFIG.SLOT_WORDS.length - 1);

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
          {CONFIG.SLOT_WORDS[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

export default function Sidebar() {
  // --- STATE & HOOKS ---
  const [isOpen, setIsOpen] = useState(false); // [MOBILE] Toggle for mobile drawer
  const [isPlayingSlot, setIsPlayingSlot] = useState(false); // [GLOBAL] Animation trigger
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null); // [GLOBAL] Tracks highlighted work
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
    if (!isPlayingSlot) setIsPlayingSlot(true);

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
   * [GLOBAL] Navigation Styling Helper
   * Logic to determine if a link should appear "active" based on URL or 
   * custom project-highlighting logic.
   */
  const getNavItemClasses = (isActive: boolean, projectId?: string) => {
    const isHomeActive = location.pathname === '/' && projectId === activeProjectId;
    const shouldHighlight = isActive || isHomeActive;

    return cn(
      "block py-1 text-sm font-display tracking-[1px] lg:transition-all lg:duration-300",
      shouldHighlight ? "text-ink opacity-100" : "text-ink/50 hover:text-ink lg:transition-colors"
    );
  };

  /**
   * [GLOBAL] Nav Group Sub-Component
   * Internal helper to render categorized lists (Featured Works, More, etc).
   */
  const NavGroup = ({ title, items }: { title: string, items: any[] }) => (
    <div className="mb-8">
      <h3 className="text-[12px] tracking-[1.25px] text-muted mb-4 opacity-75 uppercase font-semibold">
        {title}
      </h3>
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
              ) : (location.pathname === '/' || item.isCollection) ? (
                <button
                  onClick={() => {
                    navigate('/', { state: { scrollToProject: item.id } });
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={cn("w-full text-left", getNavItemClasses(location.pathname === '/' && activeProjectId === item.id, item.id))}
                >
                  {item.title}
                </button>
              ) : (
                <NavLink
                  to={`/project/${item.id}`}
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

  return (
    <>
      {/* 
        [MOBILE] Header Bar
        Visible only on screens smaller than 1024px.
        Contains the brand logo (slot machine) and the menu toggle.
      */}
      <header className={cn(
        "lg:hidden fixed top-0 left-0 right-0 h-16 bg-paper z-[60] flex items-center justify-between px-8 border-b border-ink/5 transition-shadow duration-500 lg:transition-all lg:duration-300",
        !isOpen && "shadow-[0_4px_20px_rgba(0,0,0,0.10)]"
      )}>
        <NavLink to="/" onClick={handleHomeClick} className="flex flex-col h-full justify-center relative">
          <motion.div layout className="flex flex-col items-start">
            <SlotMachineText
              isPlaying={isPlayingSlot}
              onComplete={handleSlotComplete}
              className="font-display font-medium tracking-[0.75px] text-[16px] uppercase leading-none"
            />
            {/* [MOBILE] Subtitle visible only when menu is open to balance header layout */}
            <AnimatePresence mode="wait">
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="text-[12px] tracking-[0.75px] text-muted uppercase overflow-hidden"
                >
                  Game Designer
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </NavLink>

        <div className="flex items-center gap-7 h-full">
          <ThemeToggle hideText iconSize={20} />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-ink transition-transform duration-300"
            aria-label="Toggle Menu"
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
        ref={sidebarRef}
        className={cn(
          "fixed top-0 left-0 h-full bg-paper z-[55] transition-transform duration-500",
          "w-[260px] lg:w-[300px] border-r border-ink/5 pt-20 lg:pt-12 px-8 lg:px-10 overflow-y-auto flex flex-col",
          "lg:translate-x-0 lg:transition-colors lg:duration-300 lg:shadow-[4px_0_24px_rgba(0,0,0,0.05)]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex-1">
          {/* [DESKTOP] Brand Logo Section */}
          <div className="mb-8 hidden lg:block">
            <NavLink to="/" onClick={handleHomeClick} className="block mb-2">
              <h1 className="font-display text-xl tracking-[1.25px] leading-none whitespace-nowrap uppercase mb-0">
                <SlotMachineText
                  isPlaying={isPlayingSlot}
                  onComplete={handleSlotComplete}
                />
              </h1>
              <span className="text-[14px] tracking-[1px] text-muted uppercase">Game Designer</span>
            </NavLink>
          </div>

          <nav className="mt-1 lg:mt-10">
            <NavGroup title="Featured Works" items={projects} />
          </nav>
        </div>

        {/* Footer Navigation: Links, Theme, and Copyright */}
        <div className="mt-auto pt-12 pb-6">
          <div className="mb-10 hidden lg:block">
            <ThemeToggle />
          </div>

          <nav>
            <div className="mb-8">
              <ul className="space-y-2 pl-2">
                <li><NavLink to="/other-works" className={({ isActive }) => getNavItemClasses(isActive)}>Archive</NavLink></li>
                {/*<li><NavLink to="/about" className={({ isActive }) => getNavItemClasses(isActive)}>About Me</NavLink></li>*/}
                <li>
                  {/*<NavLink to="/resume" className={({ isActive }) => getNavItemClasses(isActive)}>Resumé</NavLink>*/}
                  <a
                    href="https://drive.google.com/file/d/1fUZGZj15KHAnnprw0oM6lnPwB2GHeqOl/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={getNavItemClasses(false)}
                  >
                    Resumé
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Links Section */}
            <div className="mt-10">
              <h3 className="text-[12px] tracking-[1.25px] text-muted mb-4 opacity-75 uppercase font-semibold">More</h3>
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
            <p className="text-[9px] tracking-[1.5px] text-muted opacity-80 uppercase font-medium">
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
        onClick={() => setIsOpen(false)}
      />
    </>
  );
}