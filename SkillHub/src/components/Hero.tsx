'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="pt-16 pb-10 sm:pt-20 sm:pb-14 text-center max-w-4xl mx-auto px-6">
      {/* Editorial Headline with Kinetic Typography */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.55,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="font-serif text-3xl sm:text-5xl lg:text-[56px] leading-[1.12] tracking-tight text-ink-primary font-normal mb-5 text-balance"
      >
        <span>Want a skill? Don&apos;t search. </span>
        <motion.span
          className="kinetic-italic italic font-normal text-ink-primary inline-block cursor-default relative group"
          whileHover={{
            skewX: -6,
            scale: 1.02,
            transition: { type: 'spring', stiffness: 400, damping: 20 },
          }}
        >
          <span className="relative z-10">Come here, copy, done.</span>
          {/* Subtle editorial ink shadow flourish on hover */}
          <span className="absolute inset-0 text-clay/20 -z-10 translate-x-[2px] translate-y-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 select-none">
            Come here, copy, done.
          </span>
        </motion.span>
      </motion.h1>

      {/* Ashen Subline */}
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.55,
          delay: 0.12,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="font-sans text-sm sm:text-base text-ink-muted leading-relaxed max-w-2xl mx-auto mb-6 text-balance"
      >
        A curated catalog of verified agent skills, <code className="font-mono text-xs text-ink-secondary bg-parchment-card px-1.5 py-0.5 rounded-sm border border-parchment-border">SKILL.md</code> instructions, and execution runbooks for Claude and Antigravity.
      </motion.p>

      {/* Editorial Catalog Metadata Stamp */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.22,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-[11px] font-mono text-ink-muted bg-parchment-card/80 border border-parchment-border shadow-soft"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-clay" />
        <span className="text-ink-secondary font-medium">13 Agent Skills</span>
        <span className="text-ink-subtle">·</span>
        <span>Standard ~/.claude/skills format</span>
        <span className="text-ink-subtle">·</span>
        <span>1-click git clone</span>
      </motion.div>
    </section>
  );
}
