import React from 'react';

export function Footer() {
  return (
    <footer className="w-full bg-obsidian text-white py-12 mt-24 border-t border-black">
      <div className="max-w-catalog mx-auto px-6 sm:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-neutral-800">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-clay text-xs font-serif">✦</span>
              <span className="font-serif font-medium text-sm text-neutral-100 tracking-tight">
                Skills Hub Catalog
              </span>
            </div>
            <p className="font-sans text-xs text-neutral-400">
              Curated for autonomous workflows and human-in-the-loop pairing.
            </p>
          </div>

          <div className="flex items-center gap-6 font-sans text-xs text-neutral-400">
            <a
              href="#catalog"
              className="hover:text-neutral-200 transition-colors"
            >
              Catalog Index
            </a>
            <a
              href="https://github.com/AndyMLAndAI/token-tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-200 transition-colors"
            >
              GitHub Repository
            </a>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] font-mono text-neutral-500">
          <div>
            Built with Next.js App Router · Styled in Claude Parchment · Micro-interactions by Motion
          </div>
          <div>
            © {new Date().getFullYear()} Skills Hub. Pure Craft. Zero AI Slop.
          </div>
        </div>
      </div>
    </footer>
  );
}
