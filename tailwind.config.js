/** @type {import('tailwindcss').Config} */
const themed = (variable) => `rgb(var(--${variable}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: themed('base'),
        surface: themed('surface'),
        card: themed('card'),
        ink: themed('ink'),
        muted: themed('muted'),
        line: themed('line'),
        violet: {
          DEFAULT: '#8B5CF6',
          accent: '#B56AFF',
        },
        electric: '#5478FF',
        success: '#35D39A',
        warning: '#F5B94C',
        danger: '#FF647C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
      },
      boxShadow: {
        glow: '0 0 0 1px rgb(139 92 246 / 0.35), 0 12px 40px -12px rgb(139 92 246 / 0.45)',
      },
    },
  },
  plugins: [],
};
