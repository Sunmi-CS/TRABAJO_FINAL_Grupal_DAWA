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
          DEFAULT: '#195F6B',
          50: '#e8f4f6',
          100: '#c4e2e8',
          200: '#9ccfda',
          300: '#72bbcb',
          400: '#4fa9bc',
          500: '#2e97ae',
          600: '#1f7f95',
          700: '#195F6B',
          800: '#124a54',
          900: '#0b343c',
        },
        secondary: {
          DEFAULT: '#6BAC6B',
          50: '#f0f7f0',
          100: '#d6ebd6',
          200: '#b9dcb9',
          300: '#99cc99',
          400: '#7fbe7f',
          500: '#6BAC6B',
          600: '#559455',
          700: '#3f7a3f',
          800: '#2c602c',
          900: '#1b451b',
        },
        accent: {
          DEFAULT: '#FDC161',
          50: '#fff8eb',
          100: '#feecc5',
          200: '#fddc98',
          300: '#fdc161',
          400: '#fcaa33',
          500: '#f99307',
          600: '#dd7302',
          700: '#b75506',
          800: '#93400c',
          900: '#79360e',
        },
        dark: {
          DEFAULT: '#112025',
          50: '#e8eced',
          100: '#c3ced1',
          200: '#9aafb3',
          300: '#6f9095',
          400: '#4f7880',
          500: '#2f606a',
          600: '#235059',
          700: '#173c45',
          800: '#112025',  
          900: '#0a1519',
        },
        background: '#EFF0F4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 4px 24px rgba(17, 32, 37, 0.08)',
        'card-hover': '0 8px 40px rgba(17, 32, 37, 0.14)',
        glow: '0 0 20px rgba(25, 95, 107, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
