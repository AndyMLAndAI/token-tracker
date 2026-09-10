export interface Skill {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  whenToUse: string;
  installPath: string;
  installCommand: string;
  tags: string[];
  sourceUrl?: string;
  featured?: boolean;
}

export type SkillCategory = 'All' | 'Agent Directives' | 'Design & Craft' | 'Documents & Office' | 'Engineering & QA';
