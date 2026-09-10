'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Terminal } from 'lucide-react';
import { Skill } from '@/types/skill';
import { CopyButton } from './CopyButton';

interface SkillCardProps {
  skill: Skill;
  onTagClick?: (tag: string) => void;
}

export function SkillCard({ skill, onTagClick }: SkillCardProps) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        type: 'spring',
        stiffness: 350,
        damping: 25,
      }}
      whileHover={{ y: -3 }}
      className="group relative flex flex-col justify-between p-6 bg-parchment-card rounded-lg border border-parchment-border shadow-soft hover:shadow-soft-hover hover:border-parchment-border/80 transition-shadow duration-200"
    >
      {/* Top row: Category tag & External link */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium text-ink-muted bg-parchment-canvas border border-parchment-border/80">
            <span className="w-1.5 h-1.5 rounded-full bg-clay/70" />
            {skill.category}
          </span>

          {skill.sourceUrl && (
            <a
              href={skill.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View source for ${skill.name}`}
              className="p-1 rounded-sm text-ink-subtle hover:text-ink-primary hover:bg-parchment-canvas transition-colors duration-150"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Skill Name */}
        <h3 className="font-serif text-lg font-semibold text-ink-primary tracking-tight group-hover:text-ink-primary mb-2">
          {skill.name}
        </h3>

        {/* Description */}
        <p className="font-sans text-xs leading-relaxed text-ink-secondary mb-4 line-clamp-3">
          {skill.description}
        </p>

        {/* Tags with Spring Micro-Interactions */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {skill.tags.map((tag) => (
            <motion.button
              key={tag}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              onClick={() => onTagClick?.(tag)}
              className="inline-block px-2 py-0.5 text-[10px] font-mono rounded-sm text-ink-muted bg-parchment-canvas hover:bg-parchment-card-muted hover:text-ink-primary border border-parchment-border/60 hover:border-parchment-border transition-colors duration-150 cursor-pointer select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-ink-primary"
            >
              #{tag}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Monospace Install Command Block */}
      <div className="mt-auto pt-3 border-t border-parchment-border/60">
        <div className="flex items-center justify-between gap-2 p-2 rounded-sm bg-parchment-canvas border border-parchment-border/70 group-hover:border-parchment-border transition-colors">
          <div className="flex items-center gap-2 overflow-hidden min-w-0">
            <Terminal className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
            <code className="font-mono text-xs text-ink-primary truncate select-all">
              {skill.installCommand}
            </code>
          </div>

          <div className="shrink-0">
            <CopyButton textToCopy={skill.installCommand} label="Copy" />
          </div>
        </div>
      </div>
    </motion.article>
  );
}
