import { useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import type { Variants } from 'motion/react';
import { projects, mobileProjects } from '../data/projects';
import OtherWorkCard from '../components/OtherWorkCard';

const SPRING_CONFIG = { damping: 20, stiffness: 100 };
const PARALLAX_RANGE = 15;
const DESKTOP_BREAKPOINT = 1024;

/**
 * MobileWorks Page
 * [GLOBAL]
 * A dedicated grid page for mobile releases —
 * showcasing professional commercial works for iOS and Android.
 */
export default function MobileWorks() {
  const navigate = useNavigate();
  const bannerRef = useRef<HTMLDivElement>(null);
  
  // [GLOBAL] Touch & Parallax State Logic
  const [isTouching, setIsTouching] = useState(false);
  const touchStartRef = useRef<{ x: number, y: number } | null>(null);
  const touchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, SPRING_CONFIG);
  const springY = useSpring(mouseY, SPRING_CONFIG);
  const contentTranslateX = useTransform(springX, [-100, 100], [-PARALLAX_RANGE, PARALLAX_RANGE]);
  const contentTranslateY = useTransform(springY, [-100, 100], [-PARALLAX_RANGE, PARALLAX_RANGE]);

  // [GLOBAL] Featured Flow Logic
  // Identifies if the mobile_releases project is currently in the featured-works category.
  const featuredProjects = projects.filter(p => p.category === 'featured-works');
  const currentProjectIndex = featuredProjects.findIndex(p => p.id === 'mobile_releases');
  const isFeatured = currentProjectIndex !== -1;
  
  const nextProjectIndex = (currentProjectIndex + 1) % featuredProjects.length;
  const nextProject = featuredProjects[nextProjectIndex];

  const handleBannerMouseMove = (e: React.MouseEvent) => {
    if (window.innerWidth < DESKTOP_BREAKPOINT || !bannerRef.current) return;
    const rect = bannerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 200;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 200;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleBannerMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartRef.current.y);

    if (dx > 10 || dy > 10) {
      setIsTouching(false);
      touchStartRef.current = null;
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
        touchTimeoutRef.current = null;
      }
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    if (touchTimeoutRef.current) {
      e.preventDefault();
      return;
    }

    setIsTouching(true);

    touchTimeoutRef.current = setTimeout(() => {
      if (nextProject) {
        if (nextProject.customInternalLink) {
          navigate(nextProject.customInternalLink);
        } else if (nextProject.isCollection) {
          navigate('/', { state: { scrollToProject: nextProject.id } });
        } else {
          navigate(`/project/${nextProject.id}`);
        }
      }
      setIsTouching(false);
      touchTimeoutRef.current = null;
    }, 350);

    e.preventDefault();
    touchStartRef.current = null;
  };

  // [GLOBAL] Stagger animation container
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  };

  // [GLOBAL] Individual item fade-up
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: 'easeOut' },
    },
  };

  return (
    <>
      <div className="min-h-screen px-6 lg:px-20 pt-6 lg:pt-19 pb-14 max-w-[1560px] mx-auto">

      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mb-13 lg:mb-13 border-b border-ink/10 pb-9 lg:pb-11"
      >
        {/* Eyebrow label */}
        <div className="flex items-center mb-5" style={{ gap: 'var(--eyebrow-gap)' }}>
          <span className="eyebrow text-muted">Mobile Releases</span>
          <span className="eyebrow-dot text-muted" />
          <span className="eyebrow text-muted">{mobileProjects.length} Projects</span>
        </div>

        {/* Main title
        <h1 className="text-3xl lg:text-5xl tracking-[1px] font-display mb-6">
          Mobile Releases
        </h1> */}

        {/* Sub-descriptor */}
        <p className="text-[17px] lg:text-xl text-ink/55 font-light max-w-auto leading-relaxed">
          A dedicated showcase of professional mobile titles and experimental works published across iOS and Android platforms.
        </p>
      </motion.header>

      {/* ── PROJECT GRID ─────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-y-16 gap-x-8 lg:gap-x-12"
      >
        {mobileProjects.map((project, index) => (
          <motion.div key={project.id} variants={itemVariants}>
            <OtherWorkCard project={project} index={index} />
          </motion.div>
        ))}
      </motion.div>
    </div>

    {/* ── NEXT PROJECT BANNER ────────────────────────────────────────── */}
    {isFeatured && nextProject && (
      <motion.div className="mt-0 lg:mt-0 w-full">
        <button
          onClick={(e) => {
            e.preventDefault();
            if (nextProject.customInternalLink) {
              navigate(nextProject.customInternalLink);
            } else if (nextProject.isCollection) {
              navigate('/', { state: { scrollToProject: nextProject.id } });
            } else {
              navigate(`/project/${nextProject.id}`);
            }
          }}
          className="group block w-full border-t border-ink/10 overflow-hidden text-left"
          style={{ '--hover-bg': nextProject.accentColor } as React.CSSProperties}
          onMouseMove={handleBannerMouseMove}
          onMouseLeave={handleBannerMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            ref={bannerRef}
            className="px-6 lg:px-20 py-6 lg:py-10 flex flex-col items-center justify-center text-center group-hover:bg-[var(--hover-bg)] group-hover:text-white cursor-pointer transition-colors duration-500 ease-out"
            style={isTouching ? {
              backgroundColor: nextProject.accentColor,
              color: 'white',
            } : undefined}
          >
            <motion.div
              style={{ x: contentTranslateX, y: contentTranslateY }}
              className="flex flex-col items-center justify-center pointer-events-none w-full"
            >
              <div className="flex flex-col items-center justify-center group-active:scale-[0.95] transition-transform duration-150 w-full">
                <div
                  className={`flex items-center justify-center mb-4 lg:mb-6 ${isTouching ? 'text-white/80' : 'text-muted group-hover:text-white/80'}`}
                  style={{ gap: 'var(--eyebrow-gap)' }}
                >
                  <span className="eyebrow">Next Featured Work</span>
                  <span className="eyebrow-dot" />
                  <span className="eyebrow">0{nextProjectIndex + 1}</span>
                </div>
                <h2 className="text-2xl lg:text-4xl tracking-[2px] font-display mb-4.5 lg:mb-5 group-hover:scale-105 transition-transform duration-300">
                  {nextProject.title}
                </h2>
                <div className="inline-flex items-center justify-center p-3.5 lg:p-5 rounded-full border border-ink/20 lg:group-hover:border-white/40 lg:group-hover:bg-white/10 lg:group-hover:transition-all lg:group-hover:duration-200 ease-out transform lg:group-hover:translate-y-1.25 lg:group-active:bg-white/20 lg:group-active:border-white/60">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>
        </button>
      </motion.div>
    )}
  </>
  );
}
