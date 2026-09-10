'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Github, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full border-b border-parchment-border/70 bg-parchment-canvas/90 backdrop-blur-sm sticky top-0 z-40 transition-colors">
      <div className="max-w-catalog mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo Left */}
        <motion.a
          href="/"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary rounded-sm"
        >
          <span className="w-6 h-6 rounded-sm bg-parchment-card border border-parchment-border shadow-soft flex items-center justify-center text-clay group-hover:scale-105 transition-transform duration-150">
            <span className="text-xs font-serif leading-none select-none">✦</span>
          </span>
          <div className="flex flex-col">
            <span className="font-serif font-semibold text-base tracking-tight text-ink-primary leading-tight">
              Skills<span className="text-ink-muted font-normal">Hub</span>
            </span>
            <span className="font-mono text-[9px] text-ink-subtle uppercase tracking-wider">
              Edition 2026.1
            </span>
          </div>
        </motion.a>

        {/* Nav Pill Links (Pill Navigation Button style) */}
        <nav className="flex items-center gap-2">
          <motion.a
            href="#catalog"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium text-ink-secondary hover:text-ink-primary bg-parchment-card/70 hover:bg-parchment-card border border-parchment-border/60 hover:border-parchment-border shadow-soft transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary"
          >
            Catalog
          </motion.a>

          <motion.a
            href="https://github.com/AndyMLAndAI/token-tracker"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-ink-secondary hover:text-ink-primary bg-parchment-card/70 hover:bg-parchment-card border border-parchment-border/60 hover:border-parchment-border shadow-soft transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Source</span>
          </motion.a>
        </nav>
      </div>
    </header>
  );
}
