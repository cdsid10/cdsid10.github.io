import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Project } from '../data/projects';
import { cn } from '../lib/utils';

/**
 * CONFIGURATION CONSTANTS
 * [MOBILE] 
 * Centralized values for easy adjustment of animations and timings.
 */
const CONFIG = {
  BLOOM_NAV_DELAY: 575,    // [MOBILE] Delay for the "premium bloom" transition on touch
  TAP_ZOOM: 1.025,         // [MOBILE] Scale intensity when tapping a card
  TAP_DURATION: 0.5,       // [MOBILE] Duration of the zoom animation
  TRANSITION_MOBILE: 200,  // [MOBILE] Speed of the "bloom" phase transitions

  // ASPECT RATIO TOGGLE: Change this to test different vertical layouts 
  // Good options based on other portfolios: 
  // 'aspect-[3/4]' (Standard Portrait)
  // 'aspect-[4/5]' (Slightly shorter, Instagram Portrait)
  // 'aspect-[9/16]' (Full screen vertical)
  // 'aspect-square'
  ASPECT_RATIO: 'aspect-square',
};

interface MobileProjectCardProps {
  project: Project;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  isHovered: boolean;
  priority?: boolean;
}

export default function MobileProjectCard({ project, onHoverStart, onHoverEnd, isHovered, priority = false }: MobileProjectCardProps) {
  const [isEffectActive, setIsEffectActive] = useState(false);

  const containerRef = useRef<HTMLAnchorElement>(null);
  const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleCardClick = (e: React.MouseEvent) => {
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

    // Prevent default linking for internal routes
    e.preventDefault();
    
    // Trigger visual states
    onHoverStart();
    setIsEffectActive(true);

    navTimeoutRef.current = setTimeout(() => {
      navigate(project.customInternalLink || `/project/${project.id}`);
      navTimeoutRef.current = null;
    }, CONFIG.BLOOM_NAV_DELAY);
  };

  const isExternal = project.isExternalOnly && project.link;

  const linkProps = isExternal
    ? {
      href: project.link,
      target: "_blank",
      rel: "noopener noreferrer"
    }
    : {
      to: project.customInternalLink || `/project/${project.id}`
    };

  const Component = (isExternal ? 'a' : Link) as any;

  return (
    <Component
      ref={containerRef as any}
      {...(linkProps as any)}
      className="group block w-full px-4"
      onClick={handleCardClick}
    >
      <motion.div
        animate={{
          scale: isHovered ? CONFIG.TAP_ZOOM : 1
        }}
        transition={{ duration: CONFIG.TAP_DURATION, ease: [0.16, 1, 0.3, 1] }}
        className="w-full h-full flex flex-col justify-center"
      >
        {/* Visual Container: Taller aspect ratio for mobile screens */}
        <div
          className={cn(
            "relative overflow-hidden bg-[#0a0a0a] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.3),0_0_20px_0_rgba(0,0,0,0.05)]",
            CONFIG.ASPECT_RATIO
          )}
        >
          <motion.img
            src={project.thumbnail_mobile || project.thumbnail_16_9}
            alt={project.title}
            referrerPolicy="no-referrer"
            animate={{
              scale: isEffectActive ? 1.05 : 1
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            loading={priority ? "eager" : "lazy"}
            {...(priority ? { fetchpriority: "high" } : {})}
            className="w-full h-full object-cover pointer-events-none"
          />
        </div>

        {/* Project Metadata Footer - Left Aligned */}
        <div className="mt-4 flex flex-col items-start w-full">

          {/* Title */}
          <h2 className={cn(
            "text-[22px] sm:text-2xl tracking-[1px] mb-1 transition-colors font-bold text-left",
            isEffectActive ? `duration-[${CONFIG.TRANSITION_MOBILE}ms] text-white` : "duration-200 text-ink"
          )}>
            {project.title}
          </h2>

          {/* Metadata (Roles and Year) */}
          <div className={cn(
            "flex flex-col w-full text-[11px] sm:text-[12px] tracking-[1.125px] uppercase",
            isEffectActive ? `duration-[${CONFIG.TRANSITION_MOBILE}ms] text-white/70` : "text-muted"
          )}>
            {/* Roles Row */}
            <div className="flex flex-col sm:flex-row gap-0 sm:gap-2 text-left w-full leading-relaxed">
              {project.roles.map((role, i) => (
                <span key={role} className="flex items-center leading-relaxed">
                  {role}
                  {i < project.roles.length - 1 && <span className="hidden sm:inline ml-2.5">/</span>}
                </span>
              ))}
            </div>

            {/* Year & Accent Line row */}
            <div className="flex justify-between items-center w-full mt-0.5">
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline">•</span>
                <span className="leading-none">{project.year}</span>
              </div>

              {/* Expandable Accent Line */}
              <div className="flex items-center shrink-0 translate-y-[2.5px]">
                <div
                  className="h-[1px] transition-all"
                  style={{
                    backgroundColor: isEffectActive ? '#ffffff' : project.accentColor,
                    width: isEffectActive ? '4.5rem' : '2.5rem',
                    transitionDuration: isEffectActive ? `${CONFIG.TRANSITION_MOBILE}ms` : '200ms'
                  }}
                />
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </Component>
  );
}
