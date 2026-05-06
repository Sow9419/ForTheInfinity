import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export function ProductSkeleton() {
  return (
    <div className="min-h-screen md:h-screen w-full bg-white flex flex-col md:flex-row font-sans relative md:overflow-hidden">
      {/* Mobile Header Skeleton */}
      <header className="md:hidden sticky top-0 z-50 bg-white/70 backdrop-blur-md flex justify-between items-center py-5 px-5 border-b border-gray-100/50">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-4 items-center">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </header>

      {/* Left Column Skeleton */}
      <div className="w-full md:w-1/2 md:h-full relative flex flex-col shrink-0 px-4 md:px-0">
        <div className="relative w-full aspect-4/5 md:aspect-auto md:h-full rounded-[24px] md:rounded-none overflow-hidden bg-gray-100">
          <Skeleton className="w-full h-full rounded-none" />
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-[30px] flex flex-col gap-[15px]">
            <div className="flex gap-3 md:gap-[10px] justify-center md:justify-start">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-14 h-14 md:w-[60px] md:h-[60px] rounded-[8px]" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column Skeleton */}
      <div className="w-full md:w-1/2 flex-1 px-5 py-6 md:p-[40px] flex flex-col gap-6 md:gap-[25px] md:overflow-y-auto">
        {/* Desktop Header Skeleton */}
        <header className="hidden md:flex justify-between items-center mb-[10px]">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-4 items-center">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </header>

        {/* Product Meta Skeleton */}
        <div className="flex flex-col gap-2 md:gap-[8px]">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-3/4 md:h-12" />
          <div className="flex items-center gap-2 mt-1">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-4 w-4 rounded-full" />)}
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Price & Quantity Skeleton */}
        <div className="flex items-center justify-between mt-2">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>

        {/* Specs Skeleton */}
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Description Skeleton */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Video Skeleton */}
        <Skeleton className="w-full aspect-16/10 md:h-[220px] rounded-[16px]" />

        {/* FAQ Skeleton */}
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>

      {/* Floating Footer Skeleton */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:left-[75%] w-[92%] md:w-[40%] max-w-[500px] bg-[#161B22] px-[20px] py-[12px] md:py-[14px] flex justify-between items-center rounded-full z-50">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full bg-gray-700" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-2 w-12 bg-gray-700" />
            <Skeleton className="h-4 w-20 bg-gray-700" />
          </div>
        </div>
        <Skeleton className="h-10 w-32 rounded-[12px] bg-gray-700" />
      </div>
    </div>
  );
}
