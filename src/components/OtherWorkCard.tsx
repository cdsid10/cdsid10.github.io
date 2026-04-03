import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Project } from '../data/projects';

interface OtherWorkCardProps {
  project: Project;
  index: number;
}

export default function OtherWorkCard({ project, index }: OtherWorkCardProps) {
  const { title, year, thumbnail_16_9, accentColor, link, source: github, isExternalOnly, id, roles } = project;
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  // 1. Define the clickable "Main Card" (Image + Info)
  const mainCard = (
    <div
      className="group relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className={`relative aspect-16-9 w-full overflow-hidden bg-[#0a0a0a] transition-shadow duration-700 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2),0_15px_30px_-20px_rgba(0,0,0,0.3),0_0_15px_0_rgba(0,0,0,0.05)] ${isHovered ? 'shadow-[0_60px_100px_-20px_rgba(0,0,0,0.3),0_30px_60px_-30px_rgba(0,0,0,0.4),0_0_20px_0_rgba(0,0,0,0.1)]' : ''}`}>
        <motion.img
          src={thumbnail_16_9}
          alt={title}
          className="w-full h-full object-cover"
          animate={{
            scale: isHovered ? 1.06 : 1,
            filter: (isHovered || isTouchDevice) ? "grayscale(0%)" : "grayscale(0%)"
          }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Info Row */}
      <div className="pt-4 flex flex-col gap-3">
        <div>
          <h3 className="text-sm lg:text-lg font-display tracking-[1.25px] text-ink mb-0 transition-colors duration-300">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-[10px] lg:text-[12px] tracking-[1px] uppercase text-muted font-normal">
            <span>{roles[0]}</span>
            <span className="text-muted/50">•</span>
            <span className="leading-none">{year}</span>
          </div>
        </div>

        {/* Divider with accent color crawl */}
        <div className="relative h-px w-full bg-ink/10 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 origin-left"
            style={{ backgroundColor: accentColor }}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-2"> {/* Wrapper for the whole block */}

      {/* 2. The Project Link (Internal or External) */}
      {isExternalOnly && link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="block">
          {mainCard}
        </a>
      ) : (
        <Link to={`/project/${id}`} className="block">
          {mainCard}
        </Link>
      )}

      {/* 3. Action Links - Placed OUTSIDE the project link */}
      <div className="flex justify-end items-center gap-5 mt-1">
        {github && (
          <a
            href={typeof github === 'string' ? github : github.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[1.25px] font-semibold text-ink/40 hover:text-ink/80 transition-colors duration-200"
          >
            {typeof github === 'object' ? github.label : 'Source'}
            {(typeof github === 'string' ? github : github.url).includes('github.com') ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            )}
          </a>
        )}
      </div>
    </div>
  );
}
