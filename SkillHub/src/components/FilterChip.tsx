'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FilterChipProps {
  label: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
}

export function FilterChip({ label, count, isActive, onClick }: FilterChipProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      className={`group relative inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium transition-colors duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary rounded-sm ${
        isActive
          ? 'text-ink-primary font-semibold'
          : 'text-ink-muted hover:text-ink-primary font-normal'
      }`}
    >
      {/* Sparing Clay dot marker when active */}
      {isActive && (
        <motion.span
          layoutId="active-clay-dot"
          className="w-1.5 h-1.5 rounded-full bg-clay inline-block shrink-0"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}

      <span className="tracking-tight">{label}</span>

      {typeof count === 'number' && (
        <span
          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full transition-colors ${
            isActive
              ? 'bg-parchment-border/80 text-ink-primary'
              : 'bg-parchment-card-muted text-ink-subtle group-hover:text-ink-muted'
          }`}
        >
          {count}
        </span>
      )}

      {/* Editorial Ink Pen Stroke Underline drawing from left on select */}
      {isActive && (
        <motion.span
          layoutId="active-ink-underline"
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-ink-primary origin-left rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        />
      )}
    </motion.button>
  );
}
