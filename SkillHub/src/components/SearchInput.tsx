'use client';

import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Filter skills by name, tag, or description...',
  className = '',
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: '/' focuses the search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        if (value) {
          onChange('');
        } else {
          inputRef.current?.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [value, onChange]);

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      {/* Search icon */}
      <div className="absolute left-3.5 flex items-center pointer-events-none text-ink-muted transition-colors">
        <Search className="w-4 h-4" strokeWidth={2} />
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search skills"
        className="w-full pl-10 pr-20 py-2.5 bg-parchment-card text-ink-primary placeholder:text-ink-subtle text-sm font-sans rounded-sm border border-parchment-border shadow-soft transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ink-primary focus:border-ink-primary"
      />

      {/* Action area: Clear button and keyboard shortcut indicator */}
      <div className="absolute right-3 flex items-center gap-1.5">
        <AnimatePresence>
          {value && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.12 }}
              onClick={() => {
                onChange('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="p-1 rounded-sm text-ink-muted hover:text-ink-primary hover:bg-parchment-canvas transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>

        <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono text-ink-muted bg-parchment-canvas border border-parchment-border rounded-sm select-none">
          /
        </kbd>
      </div>
    </div>
  );
}
