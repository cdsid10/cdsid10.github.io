import { motion } from 'motion/react';
import { usePageTitle } from '../hooks/usePageTitle';

export default function About() {
  usePageTitle('About');
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="px-6 lg:px-20 pt-32 pb-16 max-w-4xl mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h1 className="text-4xl lg:text-6xl tracking-[1px] mb-16">About</h1>
        <div className="space-y-12">
          <p className="text-xl lg:text-2xl font-light text-ink/80 leading-relaxed">
            I am a Creative Developer focused on the intersection of art, technology, and human experience. My work aims to create digital spaces that feel intentional, quiet, and meaningful.
          </p>
          <p className="text-lg lg:text-xl font-light text-ink/70 leading-relaxed">
            With a background in both computer science and fine arts, I bridge the gap between technical implementation and aesthetic vision. I believe that the best digital experiences are those that respect the user's attention and provide a sense of calm.
          </p>
        </div>
        
        <div className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-20">
          <div>
            <h3 className="text-[10px] tracking-[1px] text-muted uppercase mb-6">Philosophy</h3>
            <p className="text-sm leading-relaxed text-ink/60">
              Quality over quantity. Every pixel should have a purpose. Every transition should feel like a breath.
            </p>
          </div>
          <div>
            <h3 className="text-[10px] tracking-[1px] text-muted uppercase mb-6">Location</h3>
            <p className="text-sm leading-relaxed text-ink/60">
              Currently based in a quiet studio, working remotely with teams across the globe.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
