import React from 'react';

const PrepCard = ({ card }) => {
  return (
    <div className="bg-green-50 p-5 rounded-2xl shadow border border-gray-200 transition hover:shadow-md hover:scale-[1.01] duration-300">
      <div className="flex items-center justify-between mb-3">
        {/* Avatar initials */}
        <div className="w-10 h-10 rounded-full bg-white border text-sm font-bold text-gray-700 flex items-center justify-center">
          {card.initials}
        </div>
        {/* Tags */}
        <div className="text-xs text-gray-500 text-right max-w-[65%] text-ellipsis overflow-hidden whitespace-nowrap">
          {card.tag}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 leading-snug">
        {card.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 mt-1">{card.desc}</p>

      {/* Meta info */}
      <div className="flex justify-between text-xs text-gray-500 mt-4 border-t pt-3">
        <span>Experience: {card.experience}</span>
        <span>{card.qna} Q&A</span>
        <span>Last Updated: {card.updated}</span>
      </div>
    </div>
  );
};

export default PrepCard;
