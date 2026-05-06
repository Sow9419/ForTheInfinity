import React, { useState } from 'react';

interface ProductDescriptionProps {
  shortDescription: string;
  extendedDescription?: string;
}

export function ProductDescription({ shortDescription, extendedDescription }: ProductDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <p className="text-gray-500 md:text-[#666] text-[13.5px] md:text-[14px] leading-[1.6] max-w-[400px] m-0">
      {shortDescription}
      {isExpanded && extendedDescription && (
        <span> {extendedDescription}</span>
      )}
      {' '}
      {extendedDescription && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[#3B82F6] md:text-[#111] font-semibold md:underline"
        >
          {isExpanded ? "Voir moins" : "Voir plus"}
        </button>
      )}
    </p>
  );
}
