import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * CONFIGURATION CONSTANTS
 * [GLOBAL]
 * Centralized values for easy adjustment of interaction sensitivities and breakpoints.
 */
const CONFIG = {
  SWIPE_THRESHOLD: 40,      // [MOBILE] Min pixels to trigger a slide change
  TAP_THRESHOLD: 8,         // [MOBILE] Max pixels to consider a touch a "tap"
  MOBILE_BREAKPOINT: 1024,  // [GLOBAL] Screen width for device-specific behavior
  ANIMATION_DURATION: 0.25, // [GLOBAL] Image slide transition speed (Snappier for better focus)
  DIM_DELAY_MS: 1500,       // [GLOBAL] Inactivity delay before UI dims
};

interface ImageGalleryProps {
  images: string[];
  alt?: string;
  modalOnly?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  startIndex?: number;
}

export default function ImageGallery({ 
  images,
  alt,
  modalOnly = false,
  isOpen = false,
  onClose,
  startIndex = 0
}: ImageGalleryProps) {
  // --- STATE ---
  const [currentIndex, setCurrentIndex] = useState(0);
  const [internalIsFullscreen, setInternalIsFullscreen] = useState(false);
  const isFullscreen = modalOnly ? isOpen : internalIsFullscreen;
  const [isIndicatorDimmed, setIsIndicatorDimmed] = useState(false);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (modalOnly && isOpen) {
      setCurrentIndex(startIndex);
      setPage([startIndex, 0]);
    }
  }, [modalOnly, isOpen, startIndex]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // [IPAD FIX] Detect touch capabilities
  const [isTouchDevice, setIsTouchDevice] = useState(
    typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)').matches : false
  );
  
  // Direction tracking for Framer Motion sliding animations
  // [page, direction]: direction 1 is right, -1 is left
  const [[page, direction], setPage] = useState([0, 0]);

  const resetInactivityTimer = () => {
    setIsIndicatorDimmed(false);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      setIsIndicatorDimmed(true);
    }, CONFIG.DIM_DELAY_MS);
  };

  // Initial timer start
  useEffect(() => {
    resetInactivityTimer();
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, []);

  // Reset timer on slide change
  useEffect(() => {
    resetInactivityTimer();
  }, [currentIndex]);

  // --- REFS ---
  // [MOBILE] Tracking touch coordinates for custom swipe logic
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isMultiTouch = useRef(false);

  /**
   * [GLOBAL] Resize Listener
   * Tracks window width to enable/disable specific mobile-only tap features.
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
   * [GLOBAL] Navigation Handler (Universal)
   * Updates the current index and calculates the transition direction.
   */
  const goToIndex = (newIndex: number, directionOverride?: number) => {
    const direction = directionOverride ?? (newIndex > currentIndex ? 1 : -1);
    setPage([newIndex, direction]);
    setCurrentIndex((newIndex + images.length) % images.length);
  };

  const handleNext = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    goToIndex(currentIndex + 1, 1);
  };

  const handlePrev = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    goToIndex(currentIndex - 1, -1);
  };

  /**
   * [GLOBAL] Fullscreen Toggle
   * Controls the visibility of the portal-based overlay.
   */
  const toggleFullscreen = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    if (modalOnly) {
      onClose?.();
    } else {
      setInternalIsFullscreen(!internalIsFullscreen);
    }
  };

  /**
   * [MOBILE] Touch Start Logic
   * Captures the initial touch point and detects if the user is using multiple fingers (pinch-zooming).
   */
  const handleTouchStart = (e: React.TouchEvent) => {
    // Detect if browser is zoomed in (pinch-to-zoom)
    const isZoomed = window.visualViewport ? window.visualViewport.scale > 1.01 : false;
    
    // Abort swipe if zoomed in or multi-touch detected
    if (e.touches.length > 1 || isZoomed) {
      isMultiTouch.current = true;
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }
    
    isMultiTouch.current = false;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  /**
   * [MOBILE] Touch Move Logic
   * Continuously monitors if a single touch turns into a multi-touch gesture to abort swipe navigation.
   */
  const handleTouchMove = (e: React.TouchEvent) => {
    const isZoomed = window.visualViewport ? window.visualViewport.scale > 1.01 : false;
    if (e.touches.length > 1 || isZoomed) {
      isMultiTouch.current = true;
      touchStartX.current = null;
      touchStartY.current = null;
    }
  };

  /**
   * [MOBILE] Touch End Logic
   * 1. Detects horizontal swipes to trigger Prev/Next.
   * 2. Detects static taps to trigger the Fullscreen View (mobile-only behavior).
   */
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isMultiTouch.current || touchStartX.current === null || touchStartY.current === null) {
      isMultiTouch.current = false;
      return;
    }
    
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    
    // Swipe Logic: Check if movement was primarily horizontal and passed threshold
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > CONFIG.SWIPE_THRESHOLD) {
      deltaX > 0 ? handleNext() : handlePrev();
    } 
    // Tap Logic: If touch was static and user is on a touch device, open fullscreen
    else if (Math.abs(deltaX) < CONFIG.TAP_THRESHOLD && Math.abs(deltaY) < CONFIG.TAP_THRESHOLD) {
      if (isTouchDevice && !isFullscreen) {
        toggleFullscreen();
      }
    }
    
    touchStartX.current = null;
    touchStartY.current = null;
  };

  /**
   * [DESKTOP] Keyboard & Scroll Lock
   * 1. Adds Arrow Key and Escape key listeners when in Fullscreen mode.
   * 2. Locks body scrolling to prevent background movement while viewing the portal.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        if (modalOnly) onClose?.();
        else setInternalIsFullscreen(false);
      }
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    if (isFullscreen) {
      document.body.style.overflow = 'hidden'; // Lock Scroll
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = ''; // Release Scroll
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, images.length, currentIndex]);

  /**
   * Internal Content Renderer
   * [GLOBAL]
   * Shared logic for both the standard inline gallery and the fullscreen portal.
   * @param isModal - Adjusts styles for the portal view (contain vs cover)
   */
  const renderContent = (isModal: boolean) => (
    <div 
      className={`relative group w-full h-full overflow-hidden bg-[#0a0a0a] ${isModal ? 'flex items-center justify-center overscroll-none' : ''}`}
      style={{ touchAction: isModal ? 'pan-x pan-y pinch-zoom' : 'pan-y' }} // Allow native pinch-zoom and panning in modal
      onMouseMove={resetInactivityTimer}
      onTouchStart={(e) => { resetInactivityTimer(); handleTouchStart(e); }}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      {/* Image Transition Layer */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          custom={direction}
          decoding="async"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`absolute inset-0 ${isModal ? 'w-[90%] h-[90%] m-auto object-contain' : 'w-full h-full object-cover'}`}
          alt={alt || "Project Gallery Image"}
          referrerPolicy="no-referrer"
          onClick={(e) => {
            if (!isModal) return;
            
            // Mathematically check if click was inside the actual rendered image pixels 
            // vs the empty letterboxed space of the object-contain container
            const img = e.currentTarget as HTMLImageElement;
            const rect = img.getBoundingClientRect();
            
            const imgRatio = img.naturalWidth / img.naturalHeight;
            const boxRatio = rect.width / rect.height;
            
            let renderWidth = rect.width;
            let renderHeight = rect.height;
            
            if (imgRatio > boxRatio) {
              renderHeight = rect.width / imgRatio;
            } else {
              renderWidth = rect.height * imgRatio;
            }
            
            const xOffset = (rect.width - renderWidth) / 2;
            const yOffset = (rect.height - renderHeight) / 2;
            
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            const isInsideImagePixels = 
              clickX >= xOffset && 
              clickX <= rect.width - xOffset &&
              clickY >= yOffset && 
              clickY <= rect.height - yOffset;
              
            if (isInsideImagePixels) {
              e.stopPropagation(); // Only prevent closing if they clicked the literal image
            }
          }}
        />
      </AnimatePresence>

      {/* [DESKTOP] Maximize Toggle (Floating button on the inline gallery) */}
      {!isModal && (
        <motion.button
          onClick={toggleFullscreen}
          whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.5)" }}
          whileTap={{ scale: 0.85 }}
          className={cn(
            "absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-md rounded-full text-white transition-opacity z-20",
            (isIndicatorDimmed) ? "opacity-25" : "opacity-100 group-hover:opacity-100"
          )}
          aria-label="Enter fullscreen"
        >
          <Maximize2 size={20} />
        </motion.button>
      )}

      {/* [GLOBAL] Close Toggle (Floating button for Portal view) */}
      {isModal && (
        <motion.button
          onClick={toggleFullscreen}
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
          whileTap={{ scale: 0.85 }}
          className={cn(
            "absolute top-6 right-10 p-3 bg-white/10 backdrop-blur-md rounded-full text-white z-50 transition-all duration-300",
            isIndicatorDimmed ? "opacity-25" : "opacity-100"
          )}
          aria-label="Close fullscreen"
        >
          <X size={24} />
        </motion.button>
      )}

      {/* Navigation UI: Arrows and Dots */}
      {images.length > 1 && (
        <>
          {/* [DESKTOP/GLOBAL] Arrow Buttons: Hidden by default, shown explicitly on touch devices */}
          <motion.button
            onClick={handlePrev}
            onTouchStart={(e) => { e.stopPropagation(); resetInactivityTimer(); }}
            onTouchEnd={(e) => e.stopPropagation()}
            whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.2)" }}
            whileTap={{ scale: 0.85 }}
            className={cn(
              "absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 p-1.5 lg:p-2 bg-black/10 backdrop-blur-md rounded-full text-white transition-opacity z-20",
              isIndicatorDimmed ? "opacity-25" : "opacity-100 group-hover:opacity-100",
              isModal ? 'md:left-8 md:p-4' : ''
            )}
            aria-label="Previous image"
          >
            <ChevronLeft size={isModal ? (windowWidth < CONFIG.MOBILE_BREAKPOINT ? 24 : 32) : (windowWidth < CONFIG.MOBILE_BREAKPOINT ? 20 : 24)} />
          </motion.button>
          
          <motion.button
            onClick={handleNext}
            onTouchStart={(e) => { e.stopPropagation(); resetInactivityTimer(); }}
            onTouchEnd={(e) => e.stopPropagation()}
            whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.2)" }}
            whileTap={{ scale: 0.85 }}
            className={cn(
              "absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 p-1.5 lg:p-2 bg-black/10 backdrop-blur-md rounded-full text-white transition-opacity z-20",
              isIndicatorDimmed ? "opacity-25" : "opacity-100 group-hover:opacity-100",
              isModal ? 'md:right-8 md:p-4' : ''
            )}
            aria-label="Next image"
          >
            <ChevronRight size={isModal ? (windowWidth < CONFIG.MOBILE_BREAKPOINT ? 24 : 32) : (windowWidth < CONFIG.MOBILE_BREAKPOINT ? 20 : 24)} />
          </motion.button>

          <div className={cn(
            "absolute left-1/2 -translate-x-1/2 flex gap-0 z-20 transition-all duration-300",
            isModal ? 'bottom-6' : 'bottom-4 lg:bottom-6',
            isIndicatorDimmed ? "opacity-25" : "opacity-100 group-hover:opacity-100"
          )}>
            {images.map((_, index) => (
              <motion.button
                key={index}
                onClick={(e) => { e.stopPropagation(); goToIndex(index); }}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.85 }}
                className={`group/dot ${isModal ? 'p-1.5' : 'p-1 lg:p-1.5'} cursor-pointer transition-all duration-300`}
                aria-label={`Go to slide ${index + 1}`}
              >
                <div className={`rounded-full shadow-sm transition-all duration-500 ease-out ${isModal ? 'h-1.5' : 'h-1 lg:h-1.5'} ${
                  index === currentIndex 
                    ? `${isModal ? 'w-8 bg-white' : 'w-5 lg:w-8 bg-white/60 lg:bg-white'}` 
                    : `${isModal ? 'w-1.5 bg-white/40' : 'w-1 lg:w-1.5 bg-white/20 lg:bg-white/40'} group-hover/dot:bg-white/60 shadow-none`
                }`} />
              </motion.button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Standard Inline Display */}
      {!modalOnly && renderContent(false)}
      
      {/* 
          [GLOBAL] Fullscreen Portal 
          Renders the expanded gallery into the body root to bypass parent container clipping.
      */}
      {createPortal(
        <AnimatePresence>
          {isFullscreen && (
            <motion.div
              initial={{ opacity: 0.001 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, pointerEvents: "none" }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl"
              onClick={toggleFullscreen}
            >
              <div 
                className="w-full h-full relative" 
                // Removed stopPropagation here so clicking black space closes modal
              >
                {renderContent(true)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}