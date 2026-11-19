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
        niebla: '#F4F2ED',
        arena: '#EAE6DF',
        'arena-profunda': '#DFDBD2',
        tinta: '#181816',
        'tinta-diluida': '#6E6A63',
        polder: '#181816',
        champagne: '#C6B28A',
        bronce: '#7D6B4A',
        linea: 'rgba(24, 24, 22, 0.08)',
      },
      fontFamily: {
        display: ['var(--font-sofia)', 'sans-serif'],
        sans: ['var(--font-instrument)', 'sans-serif'],
      },
      maxWidth: {
        gallery: '1380px',
        prose: '62ch',
      },
      transitionTimingFunction: {
        gallery: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      borderRadius: {
        none: '0px',
        sm: '6px',
        DEFAULT: '10px',
        md: '12px',
        lg: '14px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
        full: '9999px',
      },
    },
  },
  plugins: [],
};

export default config;
