import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import ImageGallery from './ImageGallery';

type Props = {
  images: string[];
  caption?: string;
  cols?: number;
  rows?: number;
};

export default function ImageGrid({ images, caption, cols = 3, rows }: Props) {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const openGallery = (index: number) => {
    setActiveImageIndex(index);
    setIsGalleryOpen(true);
  };

  return (
    <>
      <figure>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: windowWidth < 1024 ? '1fr' : `repeat(${cols}, 1fr)`,
            gap: "12px",
          }}
        >
          {images.map((src, i) => (
            <motion.img
              key={i}
              src={src}
              whileTap={{ scale: 0.98 }}
              alt={caption || ''}
              onClick={() => openGallery(i)}
              loading="lazy"
              decoding="async"
              className="cursor-pointer transition-opacity duration-300 hover:opacity-75"
              style={{
                width: "100%",
                height: rows ? `calc(100% / ${rows})` : "auto",
                aspectRatio: "16 / 9",
                objectFit: "cover",
                borderRadius: "0px",
                display: "block",
                backgroundColor: "#0f0f0f"
              }}
            />
          ))}
        </div>

        {caption && (
          <figcaption className="caption">
            {caption}
          </figcaption>
        )}
      </figure>

      <ImageGallery 
        images={images} 
        alt={caption}
        modalOnly={true} 
        isOpen={isGalleryOpen} 
        startIndex={activeImageIndex} 
        onClose={() => setIsGalleryOpen(false)} 
      />
    </>
  );
}