import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { CATEGORIES } from '../data/roadmapsData';

const FilterBar = ({ activeCategory, onCategoryChange }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {CATEGORIES.map((category) => {
        const IconComp = Icons[category.icon] || Icons.Grid;
        const isActive = activeCategory === category.id;
        return (
          <motion.button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border ${
              isActive
                ? 'bg-[rgb(var(--accent))] text-white border-[rgb(var(--accent))] shadow-lg shadow-[rgb(var(--accent))]/30'
                : 'bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-secondary))] border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/40 hover:text-[rgb(var(--accent))]'
            }`}
          >
            <IconComp className="w-3.5 h-3.5" />
            <span>{category.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default FilterBar;
