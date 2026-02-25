import type {Config} from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'sans-serif'],
        heading: ['var(--font-heading)', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#1a658d',
          accent: '#b9292f',
          night: '#0B101B',
          slate: '#0f172a',
          mist: '#f8fafc'
        },
        base: {
          DEFAULT: '#f8f9fb',
          dark: '#0c111d'
        },
        accent: {
          DEFAULT: '#1c7ed6',
          subtle: '#e7f2ff'
        }
      },
      boxShadow: {
        soft: '0 20px 60px -24px rgba(0,0,0,0.25)',
        brand: '0 24px 80px -26px rgba(26,101,141,0.35)',
        brandAccent: '0 24px 80px -26px rgba(168,37,43,0.32)'
      },
      borderRadius: {
        xl2: '1rem'
      }
    }
  },
  plugins: []
};
export default config;
