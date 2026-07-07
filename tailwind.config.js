/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Healthcare blue + green palette
        brand: {
          50:  '#EAF6F7',
          100: '#CFE9EB',
          200: '#9FD3D8',
          300: '#6FBDC4',
          400: '#3FA6AF',
          500: '#1F8F99',
          600: '#0F7A86',
          700: '#0B6470',
          800: '#084E59',
          900: '#053843',
        },
        accent: {
          50:  '#E8FBF3',
          100: '#C6F4DD',
          200: '#8FE9BD',
          300: '#58DD9C',
          400: '#27CD7A',
          500: '#10B981',
          600: '#0B9A6F',
          700: '#087A57',
          800: '#055B40',
          900: '#023C2A',
        },
        danger: {
          500: '#EF4444',
          600: '#DC2626',
        },
        warn: {
          500: '#F59E0B',
          600: '#D97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.05)',
        glow: '0 0 0 4px rgba(31, 143, 153, 0.12)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0, transform: 'translateY(4px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
