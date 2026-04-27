import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import ImageGrid from './ImageGrid';
import ImageGallery from './ImageGallery';

const DOC_MODAL_WIDTH = "wide"; // "narrow" | "medium" | "wide"

interface DocModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

function MarkdownImage(props: any) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <img
        {...props}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          setIsOpen(true);
          if (props.onClick) props.onClick(e);
        }}
        loading="lazy"
        decoding="async"
        style={{ ...props.style, cursor: 'pointer', backgroundColor: '#0f0f0f' }}
      />
      <ImageGallery
        images={[props.src].filter(Boolean)}
        alt={props.alt}
        modalOnly={true}
        isOpen={isOpen}
        startIndex={0}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

const markdownComponents: any = {
  h1: ({ children }: any) => <h1 className="text-3xl lg:text-5xl font-display font-bold tracking-[1px] mb-12 mt-20 first:mt-0">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-xl lg:text-2xl font-display font-bold tracking-[1px] mb-8 mt-24 border-b border-ink/10 pb-4">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-lg lg:text-xl font-display font-bold tracking-[1px] mb-6 mt-12">{children}</h3>,
  p: ({ children }: any) => <div className="text-lg lg:text-xl font-light text-ink/80 mb-8 leading-relaxed">{children}</div>,
  ul: ({ children }: any) => <ul className="space-y-4 mb-10 list-disc pl-6 text-ink/80">{children}</ul>,
  li: ({ children }: any) => <li className="text-lg font-light leading-relaxed">{children}</li>,
  table: ({ children }: any) => <div className="overflow-x-auto mb-10"><table className="w-full border-collapse">{children}</table></div>,
  thead: ({ children }: any) => <thead className="border-b border-ink/20">{children}</thead>,
  tbody: ({ children }: any) => <tbody className="divide-y divide-ink/10">{children}</tbody>,
  tr: ({ children }: any) => <tr className="hover:bg-ink/[0.02] transition-colors">{children}</tr>,
  th: ({ children, style }: any) => <th style={style} className="p-4 text-left font-display font-bold tracking-[1px] text-xs lg:text-sm uppercase text-ink">{children}</th>,
  td: ({ children, style }: any) => <td style={style} className="p-4 text-left text-sm lg:text-base font-light text-ink/80 leading-relaxed">{children}</td>,
  strong: ({ children }: any) => <strong className="font-bold text-ink">{children}</strong>,
  blockquote: ({ children }: any) => <blockquote className="border-l-2 border-ink/20 pl-6 italic text-ink/70 my-8 text-lg lg:text-xl leading-relaxed">{children}</blockquote>,
  code: ({ children, inline, className }: any) => {
    if (inline || !className) {
      return <code className="bg-ink/5 px-1.5 py-0.5 rounded-sm font-mono text-[0.9em] text-ink">{children}</code>;
    }
    return <code className="block font-mono text-sm leading-relaxed text-ink/80">{children}</code>;
  },
  pre: ({ children }: any) => <pre className="bg-ink/[0.02] border border-ink/10 p-6 rounded-sm overflow-x-auto mb-10 custom-scrollbar">{children}</pre>,

  imagegrid: ({ node, ...props }: any) => {
    const images = JSON.parse(props.images);
    return (
      <ImageGrid
        images={images}
        caption={props.caption}
        cols={props.cols ? parseInt(props.cols) : undefined}
        rows={props.rows ? parseInt(props.rows) : undefined}
      />
    );
  },
  img: ({ node, ...props }: any) => <MarkdownImage {...props} />,
  hr: () => <hr className="border-ink/10 my-8" />,
};

export default function DocModal({ isOpen, onClose, title, content }: DocModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  /**
   * [IPAD FIX] Detect true touch capability to distinguish iPhone (fullscreen modal)
   * from iPad Pro / Desktop (centered panel with visible backdrop).
   */
  const [isTouchDevice, setIsTouchDevice] = useState(
    typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)').matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const handler = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // [GLOBAL] Window width for breakpoint checks
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * [GLOBAL] Modal variant logic:
   * - iPhone (touch + small screen): fullscreen, no margin
   * - iPad / Desktop (wide screen): centered panel with max-height, backdrop visible
   */
  const isSmallTouchScreen = isTouchDevice && windowWidth < 1024;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    if (!isOpen) return;

    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }

    const isTouchDevice = typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)').matches : false;

    // Intersection Observer for videos in the modal
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.1 }
    );

    const timer = setTimeout(() => {
      const videos = document.querySelectorAll('.doc-modal-content video');
      videos.forEach((video) => {
        (video as HTMLVideoElement).pause();
        videoObserver.observe(video);
      });

      const wraps = document.querySelectorAll('.doc-modal-content .vid-wrap');
      wraps.forEach((wrap) => {
        const video = wrap.querySelector('video') as HTMLVideoElement | null;
        const overlay = wrap.querySelector('.vid-overlay') as HTMLElement | null;

        if (!video) return;

        if ((video as any)._initialized) return;
        (video as any)._initialized = true;

        if (!isTouchDevice) {
          video.play()
            .then(() => { if (overlay) overlay.style.opacity = '0'; })
            .catch(() => { });
        }

        wrap.addEventListener('click', () => {
          if (video.paused) {
            video.play();
            if (overlay) overlay.style.opacity = '0';
          } else {
            video.pause();
            if (overlay) overlay.style.opacity = '1';
          }
        });
      });
    }, 100);

    return () => {
      document.body.style.overflow = '';
      clearTimeout(timer);
      videoObserver.disconnect();
    };
  }, [isOpen, content]);

  const widthClass = {
    narrow: 'max-w-full lg:max-w-2xl',
    medium: 'max-w-full lg:max-w-4xl',
    wide: 'max-w-full lg:max-w-[85vw] 2xl:max-w-7xl'
  }[DOC_MODAL_WIDTH];

  /**
   * [GLOBAL] Height class:
   * - iPhone: h-[100dvh] (full screen, no backdrop visible)
   * - iPad Pro / Desktop: h-[90dvh] (panel with backdrop showing around edges)
   */
  const heightClass = isSmallTouchScreen ? 'h-[100dvh]' : 'h-[100dvh]';


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: 'easeInOut' }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/5 backdrop-blur-xl cursor-pointer"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, y: "0.5%", scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: "0.5%", scale: 0.98 }}
            transition={{ 
              duration: 0.1, 
              ease: [0.16, 1, 0.3, 1] // Custom easeOutExpo
            }}
            className={`relative w-full ${heightClass} bg-paper shadow-2xl flex flex-col overflow-hidden cursor-auto ${widthClass}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between h-16 lg:h-auto p-6 lg:px-10 lg:py-8 border-b border-ink/10 flex-shrink-0 bg-paper z-10">
              <h2 className="text-md lg:text-lg font-display font-semibold tracking-[1px] truncate pr-4 uppercase">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-ink/5 rounded-full transition-colors shrink-0 cursor-pointer"
                aria-label="Close document"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Markdown Body */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 lg:px-16 lg:py-12"
            >
              <div className="doc-modal-content markdown-body prose prose-neutral max-w-none pb-20 mx-auto">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={markdownComponents}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
