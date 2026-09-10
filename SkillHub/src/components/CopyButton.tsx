'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CopyButtonProps {
  textToCopy: string;
  className?: string;
  label?: string;
  copiedLabel?: string;
}

export function CopyButton({
  textToCopy,
  className = '',
  label = 'Copy',
  copiedLabel = 'Copied',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <motion.button
        onClick={handleCopy}
        type="button"
        aria-label={copied ? 'Copied to clipboard' : `Copy ${textToCopy}`}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono font-medium transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary focus-visible:ring-offset-1 focus-visible:ring-offset-parchment-canvas ${
          copied
            ? 'bg-clay/10 text-clay border border-clay/40 shadow-soft'
            : 'bg-parchment-card hover:bg-parchment-canvas text-ink-secondary hover:text-ink-primary border border-parchment-border hover:border-ink-secondary/30 shadow-soft'
        } ${className}`}
      >
        <div className="relative w-3.5 h-3.5 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.svg
                key="check-icon"
                initial={{ opacity: 0, scale: 0.4, rotate: 45 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.4, rotate: -30 }}
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
                key="clipboard-icon"
                initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.4, rotate: -45 }}
                transition={{ duration: 0.16 }}
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

        <span className="font-sans text-[11px] tracking-tight">
          {copied ? copiedLabel : label}
        </span>
      </motion.button>

      {/* Floating micro-pill toast with Clay pulse dot */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: -30, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 26 }}
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 z-50 whitespace-nowrap px-2.5 py-1 rounded-sm bg-ink-primary text-parchment-canvas text-[10px] font-sans font-medium tracking-tight shadow-soft-lg flex items-center gap-1.5"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-clay animate-pulse" />
            <span>Copied to clipboard</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
