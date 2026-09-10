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
      layout
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 450, damping: 26 }}
      className={`group relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary focus-visible:ring-offset-2 focus-visible:ring-offset-parchment-canvas select-none ${
        isActive
          ? 'bg-parchment-card text-ink-primary border border-ink-primary shadow-soft'
          : 'bg-parchment-card-muted/70 hover:bg-parchment-card text-ink-muted hover:text-ink-secondary border border-parchment-border/60 hover:border-parchment-border shadow-none'
      }`}
    >
      {/* Sparing Clay accent mark for active indicator */}
      {isActive && (
        <motion.span
          layoutId="active-indicator"
          className="w-1.5 h-1.5 rounded-full bg-clay inline-block shrink-0"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
      
      <span className="select-none tracking-tight">{label}</span>

      {typeof count === 'number' && (
        <span
          className={`text-[10px] font-mono ml-0.5 transition-colors ${
            isActive ? 'text-ink-muted' : 'text-ink-subtle'
          }`}
        >
          {count}
        </span>
      )}
    </motion.button>
  );
}
