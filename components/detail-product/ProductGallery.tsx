import React from 'react';
import { Share } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  title: string;
  activeImage: number;
  setActiveImage: (index: number) => void;
}

export function ProductGallery({ images, title, activeImage, setActiveImage }: ProductGalleryProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'The Architect Chrono',
        url: window.location.href
      }).catch(console.error);
    }
  };

  return (
    <div className="w-full md:w-1/2 md:h-full relative flex flex-col shrink-0 px-2 md:px-0">
      <div className="relative w-full aspect-4/5 md:aspect-auto md:h-full rounded-[24px] md:rounded-none overflow-hidden bg-[#111] shadow-sm md:shadow-none">
        <img
          src={images[activeImage]}
          alt={title.replace('\n', ' ')}
          className="w-full h-full object-cover opacity-90 transition-opacity duration-500 ease-in-out"
        />

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 md:top-8 md:right-8 z-20 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <Share className="w-4 h-4 text-white ml-[-2px]" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-[30px] bg-linear-to-t from-black/80 to-transparent flex flex-col gap-[15px]">
          <div className="flex gap-3 md:gap-[10px] justify-center md:justify-start overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`w-14 h-14 md:w-[60px] md:h-[60px] shrink-0 rounded-[8px] overflow-hidden border-2 transition-all duration-300 ${activeImage === idx ? 'border-white md:border-white' : 'border-transparent md:border-white/30 opacity-70 hover:opacity-100'
                  }`}
              >
                <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
