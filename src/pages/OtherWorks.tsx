import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import { otherProjects } from '../data/projects';
import OtherWorkCard from '../components/OtherWorkCard';

/**
 * OtherWorks Page
 * [GLOBAL]
 * A premium, density-optimized grid page for secondary works —
 * technical experiments, game jams, and collaborative projects.
 */
export default function OtherWorks() {

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
          <span className="eyebrow text-muted">Archive</span>
          <span className="eyebrow-dot text-muted" />
          <span className="eyebrow text-muted">{otherProjects.length} Projects</span>
        </div>

        {/* Main title */}
        {/* <h1 className="text-3xl lg:text-5xl tracking-[1px] font-display mb-6">
          Other Works
        </h1> */}

        {/* Sub-descriptor */}
        <p className="text-[17px] lg:text-xl text-ink/55 font-light max-w-auto leading-relaxed">
          {/* Prototypes, jam entries, and experiments that live outside the main portfolio. Each one taught me something useful. */}
          {/* Personal Projects, Game Jam Entries and Other Commercial Works, I have worked on over the years. */}
          A curated collection of personal projects, competitive game jam prototypes, and professional commercial releases developed over the years.
        </p>
      </motion.header>

      {/* ── PROJECT GRID ─────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-y-16 gap-x-8 lg:gap-x-12"
      >
        {otherProjects.map((project, index) => (
          <motion.div key={project.id} variants={itemVariants}>
            <OtherWorkCard project={project} index={index} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
