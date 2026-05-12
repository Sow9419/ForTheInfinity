'use client';

import React from 'react';
import { Package, Edit, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
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

export function ProductTable({ products, onEdit, onDelete, actionLoading }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[32px]">
        <Package size={48} className="mx-auto text-white/5 mb-4" />
        <p className="text-white/20 font-bold uppercase tracking-widest">Aucun produit</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {products.map((product) => (
          <div key={product.id} className="p-4 rounded-[24px] bg-white/[0.03] border border-white/[0.08] flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/5 overflow-hidden border border-white/10 flex items-center justify-center shrink-0">
              {product.image ? (
                <img src={getProductImageUrl(product.image)} alt="" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-6 h-6 text-white/10" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm truncate">{product.name}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">{product.price.toLocaleString()} FCFA</p>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => onEdit(product)} 
                className="p-2 rounded-lg hover:bg-white/5 text-white/20"
                disabled={actionLoading === product.id}
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={() => onDelete(product.id)} 
                className="p-2 rounded-lg hover:bg-red-500/10 text-white/20"
                disabled={actionLoading === product.id}
              >
                {actionLoading === product.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-hidden rounded-[32px] bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-white/5 text-white/30 text-[11px] font-bold uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Produit</th>
                <th className="px-8 py-6">Prix</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {products.map((product) => (
                <tr key={product.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 overflow-hidden border border-white/10 flex items-center justify-center shrink-0">
                        {product.image ? (
                          <img 
                            src={getProductImageUrl(product.image)} 
                            alt="" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-white/10" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white text-base leading-tight">{product.name}</p>
                        <p className="text-[11px] text-white/30 uppercase tracking-widest mt-1">{product.subtitle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-bold text-white tabular-nums">
                    {product.price.toLocaleString()} <span className="text-white/30 font-normal text-xs ml-1">FCFA</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => onEdit(product)} 
                        className="p-3 rounded-xl hover:bg-white/5 text-white/20 hover:text-white transition-all disabled:opacity-50"
                        disabled={actionLoading === product.id}
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(product.id)} 
                        className="p-3 rounded-xl hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all disabled:opacity-50"
                        disabled={actionLoading === product.id}
                      >
                        {actionLoading === product.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
