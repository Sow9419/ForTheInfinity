'use client';

import React from 'react';
import { Package, Edit3, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Product } from '@/types';
import { getProductImageUrl } from '@/lib/supabase';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  actionLoading: string | null;
}

const hasPromo = (p: Product) => p.inStock !== false && p.promoPrice != null && p.promoPrice < p.price;

const Badge = ({ tone, children }: { tone: 'stock' | 'out' | 'promo', children: React.ReactNode }) => (
  <span className={cn(
    "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.14em] border",
    tone === 'stock' && "bg-emerald-50 text-emerald-700 border-emerald-200/70",
    tone === 'out' && "bg-red-50 text-red-600 border-red-200/70",
    tone === 'promo' && "bg-amber-50 text-amber-700 border-amber-200/70",
  )}>
    {children}
  </span>
);

export function ProductTable({ products, onEdit, onDelete, actionLoading }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="py-20 text-center border-2 border-dashed border-black/[0.08] rounded-[26px]">
        <Package size={40} className="mx-auto text-neutral-200 mb-4" />
        <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">Aucun produit</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Mobile — cards */}
      <div className="grid grid-cols-1 gap-3 lg:hidden">
        {products.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-[22px] bg-white border border-black/[0.06] shadow-[0_1px_2px_rgba(20,18,12,0.04)] flex items-center gap-4"
          >
            <div className="w-16 h-16 rounded-xl bg-neutral-100 overflow-hidden shrink-0 flex items-center justify-center">
              {product.image ? (
                <img src={getProductImageUrl(product.image)} alt="" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-5 h-5 text-neutral-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-[13.5px] tracking-tight text-neutral-900 truncate">{product.name}</p>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-neutral-500 tabular-nums">{product.price.toLocaleString('fr-FR')} F</span>
                {product.inStock === false && <Badge tone="out">Épuisé</Badge>}
                {product.inStock !== false && <Badge tone="stock">Stock</Badge>}
                {hasPromo(product) && <Badge tone="promo">Promo −{Math.round((1 - Number(product.promoPrice) / product.price) * 100)}%</Badge>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => onEdit(product)} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-all" disabled={actionLoading === product.id}><Edit3 size={15} /></button>
              <button onClick={() => onDelete(product.id)} className="p-2 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-all" disabled={actionLoading === product.id}>
                {actionLoading === product.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop — table */}
      <div className="hidden lg:block rounded-[26px] bg-white border border-black/[0.06] shadow-[0_1px_2px_rgba(20,18,12,0.04),0_16px_40px_-24px_rgba(20,18,12,0.18)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-black/[0.05] text-neutral-400 text-[9.5px] font-black uppercase tracking-[0.2em] bg-neutral-50/60">
              <th className="px-6 py-4">Produit</th>
              <th className="px-6 py-4">Prix</th>
              <th className="px-6 py-4">Disponibilité</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04]">
            {products.map((product) => (
              <tr key={product.id} className="group hover:bg-neutral-50/80 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 overflow-hidden shrink-0 border border-black/[0.04]">
                      {product.image ? (
                        <img src={getProductImageUrl(product.image)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-neutral-300 m-auto mt-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-[14px] tracking-tight text-neutral-900 leading-tight truncate">{product.name}</p>
                      <p className="text-[10.5px] text-neutral-400 uppercase tracking-[0.14em] font-bold mt-0.5 truncate">{product.subtitle}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {hasPromo(product) ? (
                    <div className="flex flex-col leading-tight">
                      <span className="text-[10px] text-neutral-400 line-through tabular-nums">{product.price.toLocaleString('fr-FR')}</span>
                      <span className="font-black text-[13.5px] text-emerald-600 tabular-nums">{Number(product.promoPrice).toLocaleString('fr-FR')} <span className="text-[9.5px] font-bold text-neutral-400">F</span></span>
                    </div>
                  ) : (
                    <span className={cn("font-black text-[13.5px] tabular-nums", product.inStock === false && "text-neutral-300")}>
                      {product.price.toLocaleString('fr-FR')} <span className="text-[9.5px] font-bold text-neutral-400">FCFA</span>
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {product.inStock === false ? <Badge tone="out">Épuisé</Badge> : <Badge tone="stock">En stock</Badge>}
                    {hasPromo(product) && <Badge tone="promo">Promo</Badge>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onEdit(product)}
                      className="p-2.5 rounded-xl hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-all disabled:opacity-40"
                      disabled={actionLoading === product.id}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(product.id)}
                      className="p-2.5 rounded-xl hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-all disabled:opacity-40"
                      disabled={actionLoading === product.id}
                    >
                      {actionLoading === product.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
