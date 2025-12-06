// tailwind.config.js
import typography from '@tailwindcss/typography';

export default {
  darkMode: 'class', // <-- This enables `dark:` class support
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [typography],
};
