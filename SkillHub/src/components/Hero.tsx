'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="pt-16 pb-12 sm:pt-20 sm:pb-16 text-center max-w-3xl mx-auto px-6">
      {/* Editorial Headline settling into place */}
      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="font-serif text-3xl sm:text-5xl lg:text-[54px] leading-[1.12] tracking-tight text-ink-primary font-normal mb-5 text-balance"
      >
        Want a skill? Don&apos;t search.{' '}
        <span className="italic font-normal text-ink-primary">Come here, copy, done.</span>
      </motion.h1>

      {/* Ashen Subline */}
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.12,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="font-sans text-sm sm:text-base text-ink-muted leading-relaxed max-w-xl mx-auto mb-6 text-balance"
      >
        A curated, high-craft catalog of verified agent skills, CLI workflows, and engineering primitives for builders who value precision over boilerplate.
      </motion.p>

      {/* Editorial Catalog Metadata Stamp */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.24,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono text-ink-muted bg-parchment-card border border-parchment-border/70 shadow-soft"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-clay" />
        <span>12 verified skills</span>
        <span className="text-ink-subtle">·</span>
        <span>Zero hallucinated flags</span>
        <span className="text-ink-subtle">·</span>
        <span>1-click install</span>
      </motion.div>
    </section>
  );
}
