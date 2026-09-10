import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: '#f8f8f6',
          canvas: '#f8f8f6',
          card: '#ffffff',
          'card-muted': '#efeeeb',
          border: '#e5e4de',
          'border-subtle': '#eae8e1',
          hover: '#f2f1ed',
        },
        ink: {
          DEFAULT: '#121212',
          primary: '#121212',
          secondary: '#373734',
          muted: '#7b7974',
          subtle: '#9c9a92',
          faint: '#d4d2cc',
        },
        clay: {
          DEFAULT: '#d97757',
          hover: '#c86646',
          subtle: '#fbf2ef',
          tint: '#fdf7f5',
          border: '#f2c8bc',
        },
        obsidian: '#000000',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Source Serif 4', 'Lora', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        sm: '8px',
        DEFAULT: '8px',
        md: '8px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
        pill: '9999px',
      },
      boxShadow: {
        none: 'none',
        soft: '0 4px 20px rgba(0, 0, 0, 0.04)',
        'soft-hover': '0 8px 30px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 12px 36px rgba(0, 0, 0, 0.08)',
        'soft-lift': '0 6px 24px rgba(0, 0, 0, 0.05)',
      },
      maxWidth: {
        catalog: '1200px',
      },
    },
  },
  plugins: [],
};

export default config;
