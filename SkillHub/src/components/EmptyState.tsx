'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  searchQuery: string;
  selectedCategory: string;
  onReset: () => void;
}

export function EmptyState({ searchQuery, selectedCategory, onReset }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-lg mx-auto my-16 py-12 px-6 text-center border border-dashed border-parchment-border rounded-lg bg-parchment-card/50"
    >
      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-parchment-canvas border border-parchment-border text-clay mb-4">
        <span className="text-sm font-serif">✦</span>
      </div>

      <h3 className="font-serif text-lg font-medium text-ink-primary mb-2">
        No matching skills found
      </h3>

      <p className="font-sans text-xs text-ink-muted leading-relaxed max-w-sm mx-auto mb-6">
        {searchQuery ? (
          <>
            No skills match <span className="font-mono text-ink-primary">"{searchQuery}"</span>
            {selectedCategory !== 'All' && ` in the "${selectedCategory}" category`}.
          </>
        ) : (
          `No skills currently cataloged in the "${selectedCategory}" category.`
        )}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <motion.button
          type="button"
          onClick={onReset}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-sans font-medium text-ink-primary bg-parchment-card border border-ink-primary rounded-sm shadow-soft hover:bg-parchment-canvas transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary select-none"
        >
          Clear filters
        </motion.button>
      </div>
    </motion.div>
  );
}
