import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand accent (inbio red)
        accent: {
          DEFAULT: '#ff014f',
          dark: '#d11414',
        },
        // Topic accent palette (shared light/dark)
        topic: {
          swift: '#f05a28',
          swiftui: '#7c3aed',
          concurrency: '#0ea5e9',
          architecture: '#10b981',
          oop: '#d946ef',
          networking: '#f59e0b',
          testing: '#ec4899',
          uikit: '#8b5cf6',
          xcode: '#6366f1',
          interview: '#14b8a6',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        secondary: ['var(--font-secondary)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        neu: 'var(--neu-raised)',
        'neu-lg': 'var(--neu-raised-lg)',
        'neu-pressed': 'var(--neu-pressed)',
        'neu-sm': 'var(--neu-sm)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(20px, -20px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        shimmer: 'shimmer 6s linear infinite',
        float: 'float 14s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
