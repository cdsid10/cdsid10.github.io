import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { motion } from 'motion/react';
import { ProjectDoc } from '../data/projects';

interface DocCardProps {
  doc: ProjectDoc;
  previewText: string;
  onClick: () => void;
}

export default function DocCard({ doc, previewText, onClick }: DocCardProps) {
  // Use a simplified version of modal components for the preview
  const previewComponents: any = {
    p: ({ children }: any) => <div className="text-sm lg:text-base font-light text-ink/70 leading-relaxed mb-4 last:mb-0">{children}</div>,
    h1: ({ children }: any) => <div className="hidden">{children}</div>,
    h2: ({ children }: any) => <div className="hidden">{children}</div>,
    h3: ({ children }: any) => <div className="hidden">{children}</div>,
  };

  const displayPreview = doc.customPreview || previewText;

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group w-full flex flex-col justify-center text-left p-6 lg:p-8 border border-ink/10 bg-transparent hover:bg-ink/[0.03] h-full cursor-pointer transition-[background-color,border-color] duration-200"
    >
      <h3 className="text-xl lg:text-xl font-display font-bold tracking-[1px] mb-2 text-ink group-hover:text-ink/80 transition-none uppercase">
        {doc.title}
      </h3>
      <p className="text-[12px] lg:text-[12px] tracking-[1px] uppercase font-bold text-muted mb-6 border-b border-ink/10 pb-4 w-full">
        {doc.description}
      </p>
      
      <div className="line-clamp-4 lg:line-clamp-5 w-full">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={previewComponents}
        >
          {displayPreview}
        </ReactMarkdown>
      </div>
    </motion.button>
  );
}
