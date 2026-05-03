import { motion } from 'motion/react';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Contact() {
  usePageTitle('Contact');
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
        <h1 className="text-4xl lg:text-6xl tracking-[1px] mb-16">Contact</h1>
        
        <div className="space-y-20">
          <p className="text-xl lg:text-2xl font-light text-ink/80 leading-relaxed max-w-2xl">
            I am always open to discussing new projects, creative opportunities, or simply sharing a digital tea.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            <div>
              <h3 className="text-[10px] tracking-[1px] text-muted uppercase mb-6">Email</h3>
              <a href="mailto:hello@zenportfolio.com" className="text-xl lg:text-2xl font-light hover:opacity-50 transition-opacity">
                hello@zenportfolio.com
              </a>
            </div>
            <div>
              <h3 className="text-[10px] tracking-[1px] text-muted uppercase mb-6">Social</h3>
              <div className="flex flex-col gap-4">
                {['Twitter', 'Instagram', 'LinkedIn', 'GitHub'].map(platform => (
                  <a key={platform} href="#" className="text-sm uppercase tracking-[2px] hover:opacity-50 transition-opacity">
                    {platform}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
