import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import { mobileProjects } from '../data/projects';
import OtherWorkCard from '../components/OtherWorkCard';

/**
 * MobileWorks Page
 * [GLOBAL]
 * A dedicated grid page for mobile releases —
 * showcasing professional commercial works for iOS and Android.
 */
export default function MobileWorks() {

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
  );
}
