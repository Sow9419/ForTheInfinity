import React from 'react';
import { WhatsAppIcon, CartIcon } from './Icons';

interface HeaderProps {
  brand: string;
  quantity: number;
  setIsOrderOpen: (open: boolean) => void;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

export function Header({ brand, quantity, setIsOrderOpen, mobileOnly, desktopOnly }: HeaderProps) {
  const content = (
    <>
      <span className={mobileOnly ? "font-bold tracking-widest text-[11px] text-gray-800" : "font-black tracking-[4px] text-[12px] text-[#111]"}>
        {brand}
      </span>
      <div className="flex gap-4 items-center">
        <CartIcon quantity={quantity} onClick={() => setIsOrderOpen(true)} />
        <a href="https://wa.me/22376727121" target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon className="w-5 h-5 text-green-500" />
        </a>
      </div>
    </>
  );

  if (mobileOnly) {
    return (
      <header className="md:hidden sticky top-0 z-50 bg-white/70 backdrop-blur-md flex justify-between items-center py-5 px-5 border-b border-gray-100/50">
        {content}
      </header>
    );
  }

  if (desktopOnly) {
    return (
      <header className="hidden md:flex justify-between items-center mb-[10px]">
        {content}
      </header>
    );
  }

  return null;
}
