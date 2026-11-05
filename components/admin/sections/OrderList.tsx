'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProductImageUrl } from '@/lib/supabase';

interface OrderListProps {
  orders: any[];
  expandedOrder: string | null;
  setExpandedOrder: (id: string | null) => void;
}

const STATUS_STYLES: Record<string, string> = {
  'Nouveau': 'bg-blue-50 text-blue-700 border-blue-200/70',
  'Livré': 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
  'En cours': 'bg-amber-50 text-amber-700 border-amber-200/70',
};

export function OrderList({ orders, expandedOrder, setExpandedOrder }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="py-20 text-center border-2 border-dashed border-black/[0.08] rounded-[26px]">
        <ShoppingBag size={40} className="mx-auto text-neutral-200 mb-4" />
        <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">Aucune commande</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const expanded = expandedOrder === order.id;
        return (
          <div
            key={order.id}
            className={cn(
              "relative overflow-hidden rounded-[24px] bg-white border transition-all duration-300",
              expanded
                ? "border-neutral-900/20 shadow-[0_2px_4px_rgba(20,18,12,0.04),0_24px_48px_-24px_rgba(20,18,12,0.28)]"
                : "border-black/[0.06] shadow-[0_1px_2px_rgba(20,18,12,0.04)] hover:border-neutral-900/15 hover:shadow-[0_8px_24px_-16px_rgba(20,18,12,0.2)]"
            )}
          >
            <div
              onClick={() => setExpandedOrder(expanded ? null : order.id)}
              className="p-4 lg:p-5 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer gap-4"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0",
                  expanded ? "bg-neutral-900 text-white" : "bg-neutral-900/[0.05] text-neutral-400"
                )}>
                  <ChevronDown size={17} className={cn("transition-transform duration-300", expanded && "rotate-180")} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-[14.5px] tracking-tight text-neutral-900 truncate">{order.full_name}</h4>
                  <p className="text-[10.5px] text-neutral-400 uppercase tracking-[0.14em] font-bold truncate">{order.phone} • {order.city}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-5 text-right">
                <div>
                  <p className="text-[8.5px] text-neutral-400 uppercase font-black tracking-[0.2em] mb-0.5">Total</p>
                  <p className="text-[16px] font-black tabular-nums text-neutral-900">{Number(order.total).toLocaleString('fr-FR')} <span className="text-[9.5px] font-bold text-neutral-400">FCFA</span></p>
                  {order.promo_code && (
                    <p className="text-[9px] text-emerald-600 font-black uppercase tracking-wider mt-0.5">
                      {order.promo_code} • −{Number(order.discount || 0).toLocaleString('fr-FR')} F
                    </p>
                  )}
                </div>
                <div className={cn(
                  "px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.12em] border",
                  STATUS_STYLES[order.status] || 'bg-neutral-100 text-neutral-500 border-black/[0.06]'
                )}>
                  {order.status}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden border-t border-black/[0.05] bg-neutral-50/60"
                >
                  <div className="p-6 lg:p-8 space-y-7">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Livraison */}
                      <div className="space-y-3">
                        <h5 className="text-[9.5px] font-black uppercase tracking-[0.22em] text-neutral-400">Détails de livraison</h5>
                        <div className="p-5 rounded-[20px] bg-white border border-black/[0.05] space-y-4">
                          <div>
                            <span className="text-[8.5px] text-neutral-400 uppercase font-black tracking-[0.18em]">Adresse précise</span>
                            <p className="text-[13.5px] text-neutral-800 font-bold mt-1">{order.address || 'Non spécifiée'}</p>
                          </div>
                          <div>
                            <span className="text-[8.5px] text-neutral-400 uppercase font-black tracking-[0.18em]">Ville / Quartier</span>
                            <p className="text-[13.5px] text-neutral-800 font-bold mt-1">{order.city}</p>
                          </div>
                          {order.promo_code && (
                            <div className="flex items-center justify-between pt-3 border-t border-black/[0.05]">
                              <div>
                                <span className="text-[8.5px] text-neutral-400 uppercase font-black tracking-[0.18em]">Code promo</span>
                                <p className="text-[13.5px] text-emerald-600 font-black tracking-wider mt-1">{order.promo_code}</p>
                              </div>
                              <p className="text-[13.5px] font-black text-emerald-600 tabular-nums">−{Number(order.discount || 0).toLocaleString('fr-FR')} <span className="text-[9.5px] font-bold text-neutral-400">FCFA</span></p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Articles */}
                      <div className="space-y-3">
                        <h5 className="text-[9.5px] font-black uppercase tracking-[0.22em] text-neutral-400">Articles commandés ({order.order_items?.length || 0})</h5>
                        <div className="space-y-2.5">
                          {order.order_items?.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-4 p-3.5 rounded-[18px] bg-white border border-black/[0.05] hover:border-neutral-900/12 transition-colors">
                              <div className="w-14 h-14 rounded-xl bg-neutral-100 overflow-hidden shrink-0 border border-black/[0.04]">
                                <img
                                  src={getProductImageUrl(item.products?.image)}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-black text-neutral-900 truncate tracking-tight">{item.products?.name}</p>
                                <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold mt-1">
                                  Taille: <span className="text-neutral-700">{item.size || 'N/A'}</span> • Qté: <span className="text-neutral-700">{item.quantity}</span>
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[13px] font-black text-neutral-900 tabular-nums">{Number((item.price ?? item.products?.price) * item.quantity).toLocaleString('fr-FR')} <span className="text-[9.5px] font-bold text-neutral-400">F</span></p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
