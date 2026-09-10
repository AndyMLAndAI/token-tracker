'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ExternalLink, Terminal, FolderGit2, Info } from 'lucide-react';
import { Skill } from '@/types/skill';
import { CopyButton } from './CopyButton';

interface SkillRowProps {
  skill: Skill;
  index: number;
  onTagClick?: (tag: string) => void;
  defaultExpanded?: boolean;
}

export function SkillRow({
  skill,
  index,
  onTagClick,
  defaultExpanded = false,
}: SkillRowProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Format index like an archival ledger folio: 01, 02, etc.
  const folioNumber = String(index + 1).padStart(2, '0');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      whileHover={{ y: -2 }}
      className={`group relative rounded-sm border transition-all duration-200 overflow-hidden ${
        isExpanded
          ? 'bg-parchment-card border-ink-secondary/30 shadow-soft-hover'
          : 'bg-parchment-card/70 hover:bg-parchment-card border-parchment-border hover:border-ink-secondary/20 hover:shadow-soft'
      }`}
    >
      {/* Collapsed Ledger Row Summary */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-5 sm:py-3.5 gap-3 cursor-pointer select-none"
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Folio Index */}
          <span className="font-mono text-xs text-ink-subtle shrink-0 w-6">
            {folioNumber}
          </span>

          {/* Skill Name */}
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 min-w-0">
            <h3 className="font-serif text-base font-semibold text-ink-primary tracking-tight shrink-0 group-hover:text-ink-primary">
              {skill.name}
            </h3>

            {/* Tagline */}
            <p className="font-sans text-xs text-ink-muted truncate max-w-md sm:max-w-xl">
              {skill.tagline}
            </p>
          </div>
        </div>

        {/* Right side controls: Category badge, quick copy, expand chevron */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-parchment-border/40">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium text-ink-muted bg-parchment-canvas border border-parchment-border">
            <span className="w-1.5 h-1.5 rounded-full bg-clay/70" />
            {skill.category}
          </span>

          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2"
          >
            <CopyButton
              textToCopy={skill.installCommand}
              label="Copy git"
              className="hidden sm:inline-flex"
            />

            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="p-1 rounded-sm text-ink-muted group-hover:text-ink-primary"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Inline Expanded Detail Drawer */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-parchment-border/70 bg-parchment-canvas/40"
          >
            <div className="p-5 sm:p-6 space-y-4">
              {/* Detailed Description */}
              <p className="font-sans text-sm text-ink-secondary leading-relaxed max-w-3xl">
                {skill.description}
              </p>

              {/* When To Use Directive Callout */}
              <div className="flex items-start gap-3 p-3.5 rounded-sm bg-parchment-card border border-parchment-border shadow-soft">
                <Info className="w-4 h-4 text-clay shrink-0 mt-0.5" />
                <div className="text-xs font-sans leading-relaxed">
                  <span className="font-semibold text-ink-primary">When to invoke: </span>
                  <span className="text-ink-secondary">{skill.whenToUse}</span>
                </div>
              </div>

              {/* Install Path & Source Link */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-ink-muted pt-1">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-3.5 h-3.5 text-ink-subtle" />
                  <span>Target Path:</span>
                  <code className="text-ink-primary bg-parchment-card px-2 py-0.5 rounded-sm border border-parchment-border select-all">
                    {skill.installPath}
                  </code>
                </div>

                {skill.sourceUrl && (
                  <a
                    href={skill.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-ink-secondary hover:text-ink-primary hover:underline font-sans text-xs"
                  >
                    <span>Inspect SKILL.md</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Install Command Block with Copy Button */}
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-sm bg-parchment-card border border-parchment-border shadow-soft">
                <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                  <Terminal className="w-4 h-4 text-clay shrink-0" />
                  <code className="font-mono text-xs text-ink-primary truncate select-all">
                    {skill.installCommand}
                  </code>
                </div>
                <div className="shrink-0">
                  <CopyButton
                    textToCopy={skill.installCommand}
                    label="Copy Command"
                    copiedLabel="Copied"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-sans text-ink-subtle mr-1">Tags:</span>
                {skill.tags.map((tag) => (
                  <motion.button
                    key={tag}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => onTagClick?.(tag)}
                    className="inline-block px-2 py-0.5 text-[10px] font-mono rounded-sm text-ink-muted bg-parchment-card hover:bg-parchment-canvas hover:text-ink-primary border border-parchment-border transition-colors cursor-pointer select-none"
                  >
                    #{tag}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
