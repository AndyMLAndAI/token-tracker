'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Terminal, Sparkles, FolderGit2, Info } from 'lucide-react';
import { Skill } from '@/types/skill';
import { CopyButton } from './CopyButton';

interface FeaturedSkillCardProps {
  skill: Skill;
  onTagClick?: (tag: string) => void;
}

export function FeaturedSkillCard({ skill, onTagClick }: FeaturedSkillCardProps) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ y: -4, rotate: -0.3 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="group relative flex flex-col justify-between p-6 sm:p-8 bg-parchment-card rounded-lg border border-parchment-border shadow-soft hover:shadow-soft-lg hover:border-ink-secondary/30 transition-all duration-200 overflow-hidden"
    >
      {/* Decorative subtle editorial mark */}
      <div className="absolute top-4 right-4 text-parchment-border/80 group-hover:text-clay/30 transition-colors pointer-events-none">
        <Sparkles className="w-8 h-8 stroke-1" />
      </div>

      <div>
        {/* Specimen Header & Category */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider text-clay bg-clay/10 border border-clay/30 font-semibold">
            ✦ Anchor Specimen
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium text-ink-muted bg-parchment-canvas border border-parchment-border">
            {skill.category}
          </span>
        </div>

        {/* Skill Title */}
        <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-ink-primary tracking-tight mb-2">
          {skill.name}
        </h3>

        {/* Tagline */}
        <p className="font-sans text-sm font-medium text-ink-secondary leading-snug mb-3 max-w-xl">
          {skill.tagline}
        </p>

        {/* Description */}
        <p className="font-sans text-xs sm:text-sm text-ink-muted leading-relaxed mb-5 max-w-2xl">
          {skill.description}
        </p>

        {/* When to use Directive Box */}
        <div className="flex items-start gap-2.5 p-3 rounded-sm bg-parchment-canvas border border-parchment-border mb-5 text-xs font-sans">
          <Info className="w-3.5 h-3.5 text-clay shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-ink-primary">When to use: </span>
            <span className="text-ink-secondary">{skill.whenToUse}</span>
          </div>
        </div>
      </div>

      {/* Footer / Install Block */}
      <div className="pt-4 border-t border-parchment-border/70 space-y-3">
        <div className="flex items-center justify-between gap-3 text-xs font-mono text-ink-muted">
          <div className="flex items-center gap-1.5">
            <FolderGit2 className="w-3.5 h-3.5 text-ink-subtle" />
            <span className="hidden sm:inline">Target:</span>
            <code className="text-ink-primary bg-parchment-canvas px-1.5 py-0.5 rounded-sm border border-parchment-border">
              {skill.installPath}
            </code>
          </div>

          {skill.sourceUrl && (
            <a
              href={skill.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View source for ${skill.name}`}
              className="inline-flex items-center gap-1 text-ink-secondary hover:text-ink-primary text-xs hover:underline"
            >
              <span>Repo</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Monospace Install Command Bar */}
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-sm bg-parchment-canvas border border-parchment-border group-hover:border-ink-secondary/30 transition-colors">
          <div className="flex items-center gap-2 overflow-hidden min-w-0">
            <Terminal className="w-4 h-4 text-clay shrink-0" />
            <code className="font-mono text-xs text-ink-primary truncate select-all">
              {skill.installCommand}
            </code>
          </div>
          <div className="shrink-0">
            <CopyButton
              textToCopy={skill.installCommand}
              label="Clone Skill"
              copiedLabel="Cloned"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
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
    </motion.article>
  );
}
