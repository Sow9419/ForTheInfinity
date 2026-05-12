'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProductImageUrl } from '@/lib/supabase';

interface OrderListProps {
  orders: any[];
  expandedOrder: string | null;
  setExpandedOrder: (id: string | null) => void;
}

export function OrderList({ orders, expandedOrder, setExpandedOrder }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[32px]">
        <ShoppingCart size={48} className="mx-auto text-white/5 mb-4" />
        <p className="text-white/20 font-bold uppercase tracking-widest">Aucune commande</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div 
          key={order.id} 
          className={cn(
            "relative group overflow-hidden rounded-[32px] bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl transition-all duration-300",
            expandedOrder === order.id ? "bg-white/[0.06] border-purple-500/30" : "hover:bg-white/[0.05]"
          )}
        >
          <div
            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
            className="p-4 lg:p-6 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer gap-4"
          >
            <div className="flex items-center gap-4 lg:gap-6">
              <div className={cn(
                "w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-white/5 flex items-center justify-center transition-colors shrink-0",
                expandedOrder === order.id ? "text-purple-400 bg-purple-500/10" : "text-white/20 group-hover:text-white/40"
              )}>
                {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-white text-base lg:text-lg truncate">{order.full_name}</h4>
                <p className="text-[10px] text-white/40 uppercase tracking-widest truncate">{order.phone} • {order.city}</p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 md:gap-10 text-right">
              <div className="text-left sm:text-right">
                <p className="text-[9px] text-white/20 uppercase font-bold mb-0.5 lg:mb-1">Total</p>
                <p className="text-base lg:text-lg font-bold text-purple-400 tabular-nums">{Number(order.total).toLocaleString()} <span className="text-[10px] font-normal opacity-50">FCFA</span></p>
              </div>
              <div className={cn(
                "px-3 py-1 lg:px-4 lg:py-1.5 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-tighter border shrink-0",
                {
                  'bg-blue-500/10 text-blue-400 border-blue-500/20': order.status === 'Nouveau',
                  'bg-green-500/10 text-green-400 border-green-500/20': order.status === 'Livré',
                  'bg-orange-500/10 text-orange-400 border-orange-500/20': order.status === 'En cours',
                }
              )}>
                {order.status}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {expandedOrder === order.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden border-t border-white/5 bg-black/20"
              >
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <h5 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 ml-2">Détails de livraison</h5>
                      <div className="p-6 rounded-[24px] bg-white/[0.02] border border-white/5 space-y-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-white/20 uppercase font-bold">Adresse précise</span>
                          <p className="text-sm text-white/80">{order.address || 'Non spécifiée'}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-white/20 uppercase font-bold">Ville / Quartier</span>
                          <p className="text-sm text-white/80">{order.city}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 ml-2">Articles commandés ({order.order_items?.length || 0})</h5>
                      <div className="space-y-3">
                        {order.order_items?.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-4 p-4 rounded-[20px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                            <div className="w-16 h-16 rounded-xl bg-white/5 overflow-hidden border border-white/10 shrink-0">
                              <img 
                                src={getProductImageUrl(item.products?.image)} 
                                alt="" 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white truncate">{item.products?.name}</p>
                              <p className="text-[10px] text-white/40 uppercase font-medium mt-1">
                                Taille: <span className="text-purple-400">{item.size || 'N/A'}</span> • Qté: <span className="text-white/80">{item.quantity}</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-white/90">{Number(item.products?.price * item.quantity).toLocaleString()} <span className="text-[10px] font-normal text-white/40">FCFA</span></p>
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
      ))}
    </div>
  );
}
