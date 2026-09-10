'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CopyButtonProps {
  textToCopy: string;
  className?: string;
  label?: string;
}

export function CopyButton({ textToCopy, className = '', label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <motion.button
        onClick={handleCopy}
        type="button"
        aria-label={copied ? 'Copied to clipboard' : 'Copy command to clipboard'}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        className={`relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-mono font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary focus-visible:ring-offset-1 focus-visible:ring-offset-parchment-canvas ${
          copied
            ? 'bg-parchment-canvas text-ink-primary border border-parchment-border shadow-soft'
            : 'bg-parchment-card hover:bg-parchment-canvas text-ink-secondary hover:text-ink-primary border border-parchment-border hover:border-parchment-border shadow-soft'
        } ${className}`}
      >
        <div className="relative w-3.5 h-3.5 flex items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.svg
                key="check"
                initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6, rotate: 15 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                className="w-3.5 h-3.5 text-clay"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path
                  d="M20 6L9 17L4 12"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                />
              </motion.svg>
            ) : (
              <motion.svg
                key="clipboard"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.15 }}
                className="w-3.5 h-3.5 text-ink-muted group-hover:text-ink-primary transition-colors"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              </motion.svg>
            )}
          </AnimatePresence>
        </div>

        {label && <span className="font-sans text-[11px] select-none">{label}</span>}
      </motion.button>

      {/* Floating micro-pill toast / tooltip */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: -26, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 z-30 whitespace-nowrap px-2 py-0.5 rounded-sm bg-ink-primary text-parchment-canvas text-[10px] font-sans font-medium tracking-tight shadow-soft flex items-center gap-1"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-clay" />
            Copied
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
