export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  installCommand: string;
  tags: string[];
  sourceUrl?: string;
}

export type SkillCategory = 'All' | 'Agent Skills' | 'Design & UI' | 'Performance' | 'Testing & QA' | 'Workflow' | 'DevOps';
