'use client';

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

/** Carte blanche premium "Chalk & Ink" */
export const Card = ({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    className={cn(
      "relative rounded-[26px] bg-white border border-black/[0.05] p-6",
      "shadow-[0_1px_2px_rgba(20,18,12,0.04),0_20px_50px_-28px_rgba(20,18,12,0.2)]",
      "transition-[box-shadow,border-color] duration-500 hover:border-black/[0.09] hover:shadow-[0_2px_5px_rgba(20,18,12,0.05),0_28px_64px_-28px_rgba(20,18,12,0.28)]",
      className
    )}
  >
    {children}
  </motion.div>
);

export const SectionHeader = ({ title, description, actions }: { title: string, description?: string, actions?: React.ReactNode }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
    <div>
      <div className="flex items-center gap-2.5 mb-2.5">
        <span className="h-px w-8 bg-neutral-900/25" />
        <p className="text-[9.5px] font-black uppercase tracking-[0.28em] text-neutral-400">4TheInfinity — Admin</p>
      </div>
      <h1 className="text-[30px] md:text-[36px] leading-[0.95] font-black tracking-[-0.03em] text-neutral-900">{title}</h1>
      {description && <p className="text-neutral-500 text-[13px] mt-2 font-semibold">{description}</p>}
    </div>
    <div className="flex items-center gap-3">{actions}</div>
  </div>
);

export const PrimaryButton = ({ children, onClick, className }: { children: React.ReactNode, onClick?: () => void, className?: string }) => (
  <button
    onClick={onClick}
    className={cn(
      "group flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white text-[13px] font-bold rounded-full",
      "hover:bg-neutral-800 active:scale-[0.97] transition-all shadow-[0_8px_20px_-8px_rgba(20,18,12,0.5)]",
      className
    )}
  >
    {children}
  </button>
);

/** Contrôleur segmenté — pill active noire, highlight blanc au repos */
export const Segmented = <T extends string>({
  items,
  value,
  onChange,
  layoutId,
}: {
  items: { id: T, label: string, count?: number, icon?: React.ReactNode }[],
  value: T,
  onChange: (id: T) => void,
  layoutId: string,
}) => (
  <div className="inline-flex items-center gap-1 p-1.5 rounded-full bg-white border border-black/[0.05] shadow-[0_1px_2px_rgba(20,18,12,0.05),0_14px_34px_-20px_rgba(20,18,12,0.25)]">
    {items.map((item) => {
      const active = value === item.id;
      return (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={cn(
            "relative flex items-center gap-2 px-4.5 py-2.5 rounded-full text-[12px] font-black tracking-tight transition-colors",
            active ? "text-white" : "text-neutral-500 hover:text-neutral-900"
          )}
        >
          {active && (
            <motion.div
              layoutId={layoutId}
              transition={{ type: 'spring', stiffness: 480, damping: 38 }}
              className="absolute inset-0 bg-neutral-900 rounded-full shadow-[0_10px_24px_-8px_rgba(20,18,12,0.55)]"
            />
          )}
          {item.icon && <span className="relative z-10">{item.icon}</span>}
          <span className="relative z-10">{item.label}</span>
          {item.count != null && (
            <span className={cn(
              "relative z-10 min-w-5 h-5 px-1 flex items-center justify-center rounded-full text-[9.5px] font-black tabular-nums tracking-normal",
              active ? "bg-white/15 text-white" : "bg-neutral-900/[0.06] text-neutral-500"
            )}>
              {item.count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);
