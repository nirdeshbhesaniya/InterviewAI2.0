// tailwind.config.js
import typography from '@tailwindcss/typography';

export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // AI Tech Dark Gradient Theme - High Contrast System
        
        // Core backgrounds
        'bg-body': '#0B0F1A',           // main app background
        'bg-body-alt': '#111827',       // secondary background
        'bg-elevated': '#111827',       // cards, headers, dropdowns
        'bg-elevated-alt': '#1F2933',   // hover / higher elevation
        
        // Legacy aliases (for compatibility)
        'bg-card': '#111827',
        'bg-card-alt': '#1F2933',
        
        // Brand & accents
        'primary': '#6366F1',           // main accent (indigo)
        'primary-hover': '#818CF8',     // lighter primary for hover
        'primary-soft': 'rgba(99, 102, 241, 0.12)',
        'secondary': '#22D3EE',         // secondary accent (cyan)
        'secondary-hover': '#67E8F9',   // lighter secondary
        'accent-warm': '#F97316',       // CTA / highlight (orange)
        'highlight': '#F97316',         // alias for accent-warm
        'highlight-soft': 'rgba(249, 115, 22, 0.12)',
        
        // High-contrast text (WCAG AA compliant)
        'text-primary': '#F9FAFB',      // main headings, important labels
        'text-secondary': '#E5E7EB',    // normal body text
        'text-muted': '#9CA3AF',        // subtle labels, helper text
        'text-disabled': '#6B7280',     // disabled text
        
        // Borders & dividers
        'border-subtle': '#1F2937',
        'border-strong': '#374151',
        'border': '#1F2937',            // alias
        
        // Status colors
        'success': '#22C55E',
        'warning': '#FACC15',
        'danger': '#EF4444',
        
        // Gradient stops
        'gradient-start': '#0B0F1A',
        'gradient-end': '#1E293B',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #0B0F1A 0%, #1E293B 100%)',
        'gradient-primary-button': 'linear-gradient(135deg, #F97316 0%, #FB7185 100%)',
        'gradient-secondary-button': 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
      },
      boxShadow: {
        'button-primary': '0 12px 30px rgba(249, 115, 22, 0.35)',
        'button-hover': '0 15px 40px rgba(249, 115, 22, 0.45)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.25)',
      },
      backdropBlur: {
        'nav': '16px',
      },
    },
  },
  plugins: [typography],
};
