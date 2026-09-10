import React from 'react';
import fs from 'fs';
import path from 'path';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { SkillCatalog } from '@/components/SkillCatalog';
import { Footer } from '@/components/Footer';
import { Skill } from '@/types/skill';

function getSkills(): Skill[] {
  try {
    const filePath = path.join(process.cwd(), 'data', 'skills.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents) as Skill[];
  } catch (error) {
    console.error('Error loading skills data:', error);
    return [];
  }
}

export default function HomePage() {
  const skills = getSkills();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-parchment-canvas">
      <div>
        <Header />
        <main>
          <Hero />
          <SkillCatalog skills={skills} />
        </main>
      </div>
      <Footer />
    </div>
  );
}
