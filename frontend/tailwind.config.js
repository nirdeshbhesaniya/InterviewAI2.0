// tailwind.config.js
import typography from '@tailwindcss/typography';

export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        'display': ['"Cormorant Garamond"', '"EB Garamond"', 'Garamond', '"Times New Roman"', 'serif'],
        'body': ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        'mono': ['"JetBrains Mono"', 'ui-monospace', 'Consolas', 'monospace'],
      },
      colors: {
        // Claude Warm Editorial Theme — Cream + Coral + Dark Navy

        // Automatically map all hardcoded Tailwind colors to our new elegant palette
        blue: { 50: '#f1fafa', 100: '#daf2ef', 200: '#b8e3dc', 300: '#8ccfc4', 400: '#5db8a6', 500: '#4da896', 600: '#3c8577', 700: '#326c61', 800: '#2b574f', 900: '#254943' },
        indigo: { 50: '#f1fafa', 100: '#daf2ef', 200: '#b8e3dc', 300: '#8ccfc4', 400: '#5db8a6', 500: '#4da896', 600: '#3c8577', 700: '#326c61', 800: '#2b574f', 900: '#254943' },
        purple: { 50: '#fdf9f4', 100: '#fbf0e1', 200: '#f5dcbf', 300: '#efc293', 400: '#e8a55a', 500: '#d98b3c', 600: '#b86e28', 700: '#965522', 800: '#7a4622', 900: '#643a1e' },
        violet: { 50: '#fdf9f4', 100: '#fbf0e1', 200: '#f5dcbf', 300: '#efc293', 400: '#e8a55a', 500: '#d98b3c', 600: '#b86e28', 700: '#965522', 800: '#7a4622', 900: '#643a1e' },
        pink: { 50: '#fcf4f2', 100: '#f8e6e1', 200: '#f1ccbf', 300: '#e7a996', 400: '#db826a', 500: '#cc785c', 600: '#a9583e', 700: '#8c442d', 800: '#753926', 900: '#613222' },
        rose: { 50: '#fcf4f2', 100: '#f8e6e1', 200: '#f1ccbf', 300: '#e7a996', 400: '#db826a', 500: '#cc785c', 600: '#a9583e', 700: '#8c442d', 800: '#753926', 900: '#613222' },
        red: { 50: '#fdf3f3', 100: '#fce4e4', 200: '#f8caca', 300: '#f2a5a5', 400: '#e87373', 500: '#c64545', 600: '#a73434', 700: '#8c2929', 800: '#752424', 900: '#632121' },
        orange: { 50: '#fcf4f2', 100: '#f8e6e1', 200: '#f1ccbf', 300: '#e7a996', 400: '#db826a', 500: '#cc785c', 600: '#a9583e', 700: '#8c442d', 800: '#753926', 900: '#613222' },
        yellow: { 50: '#fdf9f4', 100: '#fbf0e1', 200: '#f5dcbf', 300: '#efc293', 400: '#e8a55a', 500: '#d98b3c', 600: '#b86e28', 700: '#965522', 800: '#7a4622', 900: '#643a1e' },
        amber: { 50: '#fdf9f4', 100: '#fbf0e1', 200: '#f5dcbf', 300: '#efc293', 400: '#e8a55a', 500: '#d98b3c', 600: '#b86e28', 700: '#965522', 800: '#7a4622', 900: '#643a1e' },
        green: { 50: '#f4fbf5', 100: '#e3f6e6', 200: '#c5eccb', 300: '#9addb0', 400: '#5db872', 500: '#4da661', 600: '#3c854c', 700: '#326c3f', 800: '#2b5733', 900: '#24482b' },
        emerald: { 50: '#f4fbf5', 100: '#e3f6e6', 200: '#c5eccb', 300: '#9addb0', 400: '#5db872', 500: '#4da661', 600: '#3c854c', 700: '#326c3f', 800: '#2b5733', 900: '#24482b' },
        teal: { 50: '#f1fafa', 100: '#daf2ef', 200: '#b8e3dc', 300: '#8ccfc4', 400: '#5db8a6', 500: '#4da896', 600: '#3c8577', 700: '#326c61', 800: '#2b574f', 900: '#254943' },
        cyan: { 50: '#f1fafa', 100: '#daf2ef', 200: '#b8e3dc', 300: '#8ccfc4', 400: '#5db8a6', 500: '#4da896', 600: '#3c8577', 700: '#326c61', 800: '#2b574f', 900: '#254943' },
        
        // Warm grays (taupe/ink) for any hardcoded gray classes
        gray: { 50: '#faf9f5', 100: '#f5f0e8', 200: '#efe9de', 300: '#e6dfd8', 400: '#d5ccc3', 500: '#8e8b82', 600: '#6c6a64', 700: '#3d3d3a', 800: '#2a2a28', 900: '#141413' },
        slate: { 50: '#faf9f5', 100: '#f5f0e8', 200: '#efe9de', 300: '#e6dfd8', 400: '#d5ccc3', 500: '#8e8b82', 600: '#6c6a64', 700: '#3d3d3a', 800: '#2a2a28', 900: '#141413' },
        zinc: { 50: '#faf9f5', 100: '#f5f0e8', 200: '#efe9de', 300: '#e6dfd8', 400: '#d5ccc3', 500: '#8e8b82', 600: '#6c6a64', 700: '#3d3d3a', 800: '#2a2a28', 900: '#141413' },
        neutral: { 50: '#faf9f5', 100: '#f5f0e8', 200: '#efe9de', 300: '#e6dfd8', 400: '#d5ccc3', 500: '#8e8b82', 600: '#6c6a64', 700: '#3d3d3a', 800: '#2a2a28', 900: '#141413' },
        stone: { 50: '#faf9f5', 100: '#f5f0e8', 200: '#efe9de', 300: '#e6dfd8', 400: '#d5ccc3', 500: '#8e8b82', 600: '#6c6a64', 700: '#3d3d3a', 800: '#2a2a28', 900: '#141413' },

        // Core backgrounds
        'bg-body': '#faf9f5',           // warm cream canvas
        'bg-body-alt': '#f5f0e8',       // surface-soft
        'bg-elevated': '#faf9f5',       // cards blend with canvas
        'bg-elevated-alt': '#efe9de',   // hover / surface-card

        // Legacy aliases (for compatibility)
        'bg-card': '#efe9de',
        'bg-card-alt': '#e8e0d2',

        // Brand & accents — Coral (Anthropic signature)
        'primary': '#cc785c',           // main accent (coral)
        'primary-hover': '#a9583e',     // darker coral for hover/press
        'primary-soft': 'rgba(204, 120, 92, 0.12)',
        'secondary': '#5db8a6',         // secondary accent (teal)
        'secondary-hover': '#4da896',   // darker teal
        'accent-warm': '#e8a55a',       // CTA / highlight (amber)
        'highlight': '#e8a55a',         // alias for accent-warm
        'highlight-soft': 'rgba(232, 165, 90, 0.12)',

        // High-contrast text (warm ink hierarchy)
        'text-primary': '#141413',      // ink — warm dark
        'text-secondary': '#3d3d3a',    // body text
        'text-muted': '#6c6a64',        // muted labels
        'text-disabled': '#8e8b82',     // disabled / muted-soft

        // Borders & dividers — warm hairlines
        'border-subtle': '#ebe6df',
        'border-strong': '#e8e0d2',
        'border': '#e6dfd8',            // alias

        // Status colors
        'success': '#5db872',
        'warning': '#d4a017',
        'danger': '#c64545',

        // Gradient stops
        'gradient-start': '#faf9f5',
        'gradient-end': '#f5f0e8',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #faf9f5 0%, #f5f0e8 100%)',
        'gradient-primary-button': 'linear-gradient(135deg, #cc785c 0%, #a9583e 100%)',
        'gradient-secondary-button': 'linear-gradient(135deg, #5db8a6 0%, #4da896 100%)',
      },
      boxShadow: {
        'button-primary': '0 12px 30px rgba(204, 120, 92, 0.35)',
        'button-hover': '0 15px 40px rgba(204, 120, 92, 0.45)',
        'card': '0 4px 20px rgba(20, 20, 19, 0.08)',
        'card-hover': '0 8px 30px rgba(20, 20, 19, 0.12)',
      },
      backdropBlur: {
        'nav': '16px',
      },
    },
  },
  plugins: [typography],
};
