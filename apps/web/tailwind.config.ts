import type { Config } from 'tailwindcss';

function withOpacity(variable: string) {
  return ({ opacityValue }: { opacityValue?: string }) =>
    opacityValue === undefined ? `rgb(var(${variable}))` : `rgb(var(${variable}) / ${opacityValue})`;
}

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: withOpacity('--color-primary-rgb'),
        'primary-contrast': withOpacity('--color-primary-contrast-rgb'),
        accent: withOpacity('--color-accent-rgb'),
        background: withOpacity('--color-background-rgb'),
        surface: withOpacity('--color-surface-rgb'),
        'text-primary': withOpacity('--color-text-primary-rgb'),
        'text-secondary': withOpacity('--color-text-secondary-rgb'),
        'text-muted': withOpacity('--color-text-muted-rgb'),
        border: withOpacity('--color-border-rgb'),
        danger: withOpacity('--color-danger-rgb'),
        success: withOpacity('--color-success-rgb'),
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
      },
      keyframes: {
        'skeleton-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'skeleton-pulse': 'skeleton-pulse 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
