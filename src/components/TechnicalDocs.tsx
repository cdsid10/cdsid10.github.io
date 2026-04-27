import { useState, useEffect, useRef } from 'react';
import { ProjectDoc } from '../data/projects';
import DocCard from './DocCard';
import DocModal from './DocModal';

interface TechnicalDocsProps {
  docs: ProjectDoc[];
}

export default function TechnicalDocs({ docs }: TechnicalDocsProps) {
  const [selectedDoc, setSelectedDoc] = useState<ProjectDoc | null>(null);
  const [markdownContents, setMarkdownContents] = useState<Record<string, string>>({});
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  // CONFIGURE DESKTOP LAYOUT HERE:
  // Change this variable to adjust how many cards are shown per row on desktop
  const DESKTOP_COLUMNS = 1;

  useEffect(() => {
    const rawFiles = (import.meta as any).glob('../data/docs/*.md', { query: '?raw', import: 'default', eager: true });
    
    const contents: Record<string, string> = {};
    Object.keys(rawFiles).forEach(key => {
      const filename = key.split('/').pop() || '';
      contents[filename] = rawFiles[key] as string;
    });
    
    setMarkdownContents(contents);
  }, []);

  // Intersection Observer for mobile scroll orbs
  useEffect(() => {
    if (window.innerWidth >= 1024 || !scrollContainerRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          setActiveCardIndex(index);
        }
      });
    }, {
      root: scrollContainerRef.current,
      threshold: 0.6
    });

    const cards = scrollContainerRef.current.querySelectorAll('.doc-card-container');
    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [docs]);

  const handleScrollToCard = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cards = container.querySelectorAll('.doc-card-container');
    
    if (cards[index]) {
      const card = cards[index] as HTMLElement;
      // Calculate target scroll position to center the card on mobile
      const targetLeft = card.offsetLeft - container.clientWidth / 2 + card.clientWidth / 2;
      container.scrollTo({ left: targetLeft, behavior: 'smooth' });
    }
  };

  if (!docs || docs.length === 0) return null;

  const gridColsClass = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4'
  }[DESKTOP_COLUMNS] || 'lg:grid-cols-2';

  return (
    <div className="mb-16 lg:mb-24">
      <div className="flex items-center justify-between mb-10 lg:mb-12">
        <h2 className="text-[1.3rem] lg:text-3xl tracking-[1px] uppercase">Design Documentation</h2>
      </div>

      <div className="relative">
        <div 
          ref={scrollContainerRef}
          className={`flex lg:grid ${gridColsClass} gap-4 lg:gap-8 overflow-x-auto lg:overflow-visible snap-x snap-mandatory hide-scrollbar pb-4 lg:pb-0 -mx-6 px-[7.5vw] lg:mx-0 lg:px-0`}
        >
          {docs.map((doc, index) => {
            const rawContent = markdownContents[doc.file] || '';
            const preview = rawContent.slice(0, 500);

            return (
              <div 
                key={doc.title} 
                className="doc-card-container snap-center flex flex-shrink-0 w-[85vw] lg:w-full"
                data-index={index}
              >
                <DocCard 
                  doc={doc} 
                  previewText={preview}
                  onClick={() => setSelectedDoc(doc)}
                />
              </div>
            );
          })}
        </div>

        {/* Mobile Scroll Indicators */}
        {docs.length > 1 && (
          <div className="flex lg:hidden justify-center items-center gap-2 mt-6">
            {docs.map((_, index) => (
              <button
                key={index}
                onClick={() => handleScrollToCard(index)}
                className="py-2 px-1 -my-2 -mx-1 flex items-center justify-center cursor-pointer"
                aria-label={`Scroll to document ${index + 1}`}
              >
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
                    activeCardIndex === index ? 'w-8 bg-ink' : 'w-1.5 bg-ink/20'
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <DocModal 
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title={selectedDoc?.title || ''}
        content={selectedDoc ? markdownContents[selectedDoc.file] || '' : ''}
      />
    </div>
  );
}
