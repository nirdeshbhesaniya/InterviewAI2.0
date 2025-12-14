import React from 'react';

const PrepCard = ({ card }) => {
  return (
    <div className="bg-[rgb(var(--bg-elevated-alt))] p-5 rounded-2xl shadow border border-[rgb(var(--border))] transition hover:shadow-md hover:scale-[1.01] duration-300">
      <div className="flex items-center justify-between mb-3">
        {/* Avatar initials */}
        <div className="w-10 h-10 rounded-full bg-[rgb(var(--bg-card))] border text-sm font-bold text-[rgb(var(--text-primary))] flex items-center justify-center">
          {card.initials}
        </div>
        {/* Tags */}
        <div className="text-xs text-[rgb(var(--text-muted))] text-right max-w-[65%] text-ellipsis overflow-hidden whitespace-nowrap">
          {card.tag}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] leading-snug">
        {card.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">{card.desc}</p>

      {/* Meta info */}
      <div className="flex justify-between text-xs text-[rgb(var(--text-muted))] mt-4 border-t pt-3">
        <span>Experience: {card.experience}</span>
        <span>{card.qna} Q&A</span>
        <span>Last Updated: {card.updated}</span>
      </div>
    </div>
  );
};

export default PrepCard;
