import { useLocation, useOutlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../lib/utils';

/**
 * CONFIGURATION CONSTANTS
 * [GLOBAL]
 * Centralized values for layout dimensions and animation timings.
 */
const CONFIG = {
  SIDEBAR_WIDTH_DESKTOP: '280px', // [DESKTOP] Offset for the main content area
  TRANSITION_DURATION: 0.18,     // [GLOBAL] Speed of the page fade transition (Sharpened for snappier navigation)
  MOBILE_NAV_HEIGHT: 'pt-20',     // [MOBILE] Top padding to prevent content overlap with mobile header
};

export default function Layout() {
  const location = useLocation();
  const currentOutlet = useOutlet();

  /**
   * [GLOBAL] Route Check
   * Determines if the current view is the home page.
   * This drives specific styling logic like snap-scrolling and padding.
   */
  const isHome = location.pathname === '/';

  return (
    /**
     * [GLOBAL] Main Viewport Container
     * Uses '100dvh' (Dynamic Viewport Height) to ensure the layout fills the screen 
     * perfectly on mobile devices, accounting for browser address bars.
     */
    <div className="flex h-[100dvh] overflow-hidden bg-paper">

      {/* [GLOBAL] Navigation Sidebar */}
      <Sidebar />

      {/**
       * [GLOBAL] Content Wrapper
       * [DESKTOP] lg:ml-[280px] - Creates space for the fixed sidebar on large screens.
       */}

      <div className={cn(
        "flex-1 h-full relative overflow-hidden",
        "lg:ml-[280px]"
      )}>

        {/* [GLOBAL] Page Transition Wrapper */}
        <AnimatePresence mode="wait">
          <motion.main
            /**
             * [GLOBAL] Scroll Container
             * id="scroll-container" is referenced by Sidebar.tsx for smooth-scroll resets.
             * key={location.pathname} forces Framer Motion to recognize a route change and trigger animations.
             */
            id="scroll-container"
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: CONFIG.TRANSITION_DURATION, ease: 'easeOut' }}
            className={cn(
              "absolute w-full overflow-y-auto [scrollbar-gutter:stable]",

              /**
               * [MOBILE] Header Offset
               * Shift the physical scroll container below the header (h-16) on mobile
               * to prevent iOS native scrollbars from drawing beneath the fixed header.
               */
              !isHome 
                ? "top-16 h-[calc(100%-4rem)] pt-4 lg:top-0 lg:h-full lg:pt-0" 
                : "inset-0 h-full snap-y snap-mandatory hide-scrollbar"
            )}
          >
            {currentOutlet}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}