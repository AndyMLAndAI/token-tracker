'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skill } from '@/types/skill';
import { SearchInput } from './SearchInput';
import { FilterChip } from './FilterChip';
import { SkillCard } from './SkillCard';
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
      // Category check
      const matchesCategory =
        selectedCategory === 'All' || skill.category === selectedCategory;

      if (!matchesCategory) return false;
      if (!query) return true;

      // Text search in name, description, tags, category, installCommand
      const inName = skill.name.toLowerCase().includes(query);
      const inDesc = skill.description.toLowerCase().includes(query);
      const inCmd = skill.installCommand.toLowerCase().includes(query);
      const inTags = skill.tags.some((t) => t.toLowerCase().includes(query));

      return inName || inDesc || inCmd || inTags;
    });
  }, [skills, searchQuery, selectedCategory]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
  };

  return (
    <section id="catalog" className="w-full max-w-catalog mx-auto px-6 sm:px-8 py-6">
      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-5 mb-8">
        {/* Search input */}
        <div className="w-full max-w-xl">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search skills, commands, tags (#LCP, #MCP)..."
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
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

        {/* Filter results summary line */}
        <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted border-b border-parchment-border/60 pb-3 pt-1">
          <div className="flex items-center gap-2">
            <span>
              Showing {filteredSkills.length} of {skills.length} skills
            </span>
            {(searchQuery || selectedCategory !== 'All') && (
              <button
                type="button"
                onClick={handleReset}
                className="text-ink-primary hover:underline font-sans cursor-pointer"
              >
                (Reset filter)
              </button>
            )}
          </div>
          <span className="hidden sm:inline text-ink-subtle">
            Tip: Press <kbd className="px-1 py-0.5 bg-parchment-card border border-parchment-border rounded-sm text-[10px]">/</kbd> anywhere to search
          </span>
        </div>
      </div>

      {/* Grid of Skill Cards */}
      <AnimatePresence mode="popLayout">
        {filteredSkills.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredSkills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onTagClick={handleTagClick}
              />
            ))}
          </motion.div>
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
