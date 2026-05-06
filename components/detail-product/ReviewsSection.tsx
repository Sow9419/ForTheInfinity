import React from 'react';
import { Star } from 'lucide-react';

interface ReviewsSectionProps {
  ratingBreakdown: { stars: number, percent: string }[];
  reviews: { author: string, date: string, text: string, rating: number }[];
}

export function ReviewsSection({ ratingBreakdown, reviews }: ReviewsSectionProps) {
  return (
    <>
      {/* Rating Breakdown Section */}
      <div className="mt-2">
        <h2 className="hidden md:block text-[14px] font-bold text-[#111] mb-3">Répartition des avis</h2>
        <div className="flex flex-col gap-2">
          {ratingBreakdown.map((row, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex gap-0.5 md:w-20">
                {[...Array(5)].map((_, idx) => (
                  <Star
                    key={idx}
                    className={`w-3.5 h-3.5 md:w-3 md:h-3 ${idx < row.stars ? 'fill-[#FBBF24] text-[#FBBF24]' : 'fill-[#E5E7EB] text-[#E5E7EB]'}`}
                  />
                ))}
              </div>
              <div className="flex-1 h-1 md:h-1.5 bg-gray-100 md:bg-[#F0F0F0] rounded-full overflow-hidden">
                <div className="h-full bg-gray-800 md:bg-[#111] rounded-full" style={{ width: row.percent }}></div>
              </div>
              <span className="hidden md:block text-[11px] text-[#666] w-8 text-right">{row.percent}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List Section */}
      <div className="mt-4 md:mt-4 border-t border-gray-100 md:border-[#EEE] pt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm md:text-[14px] font-bold text-gray-900 md:text-[#111]">{reviews.length} Avis clients</h3>
          <span className="text-[11px] text-gray-400 md:text-[#666] font-medium cursor-pointer">Plus pertinents</span>
        </div>

        {reviews.map((review, i) => (
          <div key={i} className="mb-6">
            <div className="flex gap-0.5 md:gap-0.5 mb-2">
              {[...Array(5)].map((_, idx) => (
                <Star
                  key={idx}
                  className={`w-3.5 h-3.5 md:w-3 md:h-3 ${idx < review.rating ? 'fill-[#FBBF24] text-[#FBBF24]' : 'fill-[#E5E7EB] text-[#E5E7EB]'}`}
                />
              ))}
            </div>
            <p className="text-[13px] text-gray-500 md:text-[#666] leading-relaxed mb-2">
              {review.text}
            </p>
            <p className="text-[10px] md:text-[11px] text-gray-400 md:text-[#888]">
              <span className="font-bold text-gray-800 md:text-[#111]">{review.author}</span> • {review.date}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
