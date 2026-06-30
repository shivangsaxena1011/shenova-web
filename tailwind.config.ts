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
        primary: {
          violet: '#7C3AED',
          dark: '#5B21B6',
          lavender: '#E9D5FF',
          blush: '#FCE7F3',
        },
        accent: {
          blue: '#DBEAFE',
          green: '#DCFCE7',
          peach: '#FED7AA',
          amber: '#F59E0B',
        },
        state: {
          success: '#10B981',
          error: '#EF4444',
        },
        text: {
          primary: '#111827',
          secondary: '#4B5563',
        },
        bg: {
          white: '#FFFFFF',
          off: '#FAFAFA',
          surface: '#F9FAFB',
          border: '#E5E7EB',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-poppins)', 'sans-serif'],
        poppins: ['var(--font-poppins)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      spacing: {
        '8xs': '8px',
        'sm': '16px',
        'md': '24px',
        'lg': '32px',
        'xl': '48px',
        '2xl': '64px',
        '3xl': '80px',
      }
    },
  },
  plugins: [],
};
export default config;
