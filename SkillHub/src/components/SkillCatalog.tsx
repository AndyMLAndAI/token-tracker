'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skill } from '@/types/skill';
import { SearchInput } from './SearchInput';
import { FilterChip } from './FilterChip';
import { SkillRow } from './SkillRow';
import { FeaturedSkillCard } from './FeaturedSkillCard';
import { EmptyState } from './EmptyState';

interface SkillCatalogProps {
  skills: Skill[];
}

export function SkillCatalog({ skills }: SkillCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Compute available categories with counts
  const categories = useMemo(() => {
    const cats = ['All'];
    skills.forEach((skill) => {
      if (!cats.includes(skill.category)) {
        cats.push(skill.category);
      }
    });
    return cats;
  }, [skills]);

  // Category counts based on unfiltered dataset
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: skills.length };
    skills.forEach((skill) => {
      counts[skill.category] = (counts[skill.category] || 0) + 1;
    });
    return counts;
  }, [skills]);

  // Filter skills by search query and category
  const filteredSkills = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return skills.filter((skill) => {
      const matchesCategory =
        selectedCategory === 'All' || skill.category === selectedCategory;

      if (!matchesCategory) return false;
      if (!query) return true;

      const inName = skill.name.toLowerCase().includes(query);
      const inTagline = skill.tagline.toLowerCase().includes(query);
      const inDesc = skill.description.toLowerCase().includes(query);
      const inWhen = skill.whenToUse.toLowerCase().includes(query);
      const inCmd = skill.installCommand.toLowerCase().includes(query);
      const inTags = skill.tags.some((t) => t.toLowerCase().includes(query));

      return inName || inTagline || inDesc || inWhen || inCmd || inTags;
    });
  }, [skills, searchQuery, selectedCategory]);

  // Separate featured skills from general catalog skills
  const featuredSkills = useMemo(() => {
    return filteredSkills.filter((s) => s.featured);
  }, [filteredSkills]);

  const regularSkills = useMemo(() => {
    return filteredSkills.filter((s) => !s.featured);
  }, [filteredSkills]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
  };

  return (
    <section id="catalog" className="w-full max-w-catalog mx-auto px-6 sm:px-8 py-4">
      {/* Search & Filter Controls Bar */}
      <div className="flex flex-col gap-5 mb-10">
        {/* Search input with Carbon Ink focus */}
        <div className="w-full max-w-xl">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search playbooks, directives, or tags (#Taste, #Review)..."
          />
        </div>

        {/* Category Filter Bar with Pen-Stroke Ink Underline */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 border-b border-parchment-border/70 pb-2">
          {categories.map((category) => (
            <FilterChip
              key={category}
              label={category}
              count={categoryCounts[category]}
              isActive={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            />
          ))}
        </div>

        {/* Status Line */}
        <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted">
          <div className="flex items-center gap-2">
            <span>
              Catalog index: {filteredSkills.length} of {skills.length} skills active
            </span>
            {(searchQuery || selectedCategory !== 'All') && (
              <button
                type="button"
                onClick={handleReset}
                className="text-clay hover:underline font-sans cursor-pointer select-none"
              >
                (Clear filter)
              </button>
            )}
          </div>

          <span className="hidden sm:inline text-ink-subtle">
            Tip: Press <kbd className="px-1.5 py-0.5 bg-parchment-card border border-parchment-border rounded-sm text-[10px] text-ink-primary">/</kbd> to search · Click rows to expand
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {filteredSkills.length > 0 ? (
          <div className="space-y-12">
            {/* Asymmetric Anchor Specimen Cards (when present in filtered set) */}
            {featuredSkills.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-clay text-xs font-serif">✦</span>
                  <span className="font-mono text-xs text-ink-muted uppercase tracking-wider">
                    Editorial Specimens
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {featuredSkills.map((skill) => (
                    <FeaturedSkillCard
                      key={skill.id}
                      skill={skill}
                      onTagClick={handleTagClick}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Expandable Editorial Ledger List */}
            {regularSkills.length > 0 && (
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-ink-secondary text-xs font-serif">§</span>
                    <span className="font-mono text-xs text-ink-muted uppercase tracking-wider">
                      The Ledger Index ({regularSkills.length})
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-ink-subtle">
                    Click row to inspect SKILL.md directives
                  </span>
                </div>

                <div className="space-y-3">
                  {regularSkills.map((skill, idx) => (
                    <SkillRow
                      key={skill.id}
                      skill={skill}
                      index={idx}
                      onTagClick={handleTagClick}
                      defaultExpanded={regularSkills.length <= 2}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onReset={handleReset}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
