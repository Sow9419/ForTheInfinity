'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Layers,
  LogOut,
  Plus,
  Search,
  Bell,
  Clock,
  ChevronRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Product, Category } from '@/types';

// Modals
import { ProductModal } from '@/components/admin/ProductModal';
import { CategoryModal } from '@/components/admin/CategoryModal';

// Sections
import { KPICards } from '@/components/admin/sections/KPICards';
import { ProductTable } from '@/components/admin/sections/ProductTable';
import { OrderList } from '@/components/admin/sections/OrderList';

// --- Types ---
type Tab = 'dashboard' | 'products' | 'orders' | 'categories';

interface KPIData {
  ordersCount: number;
  productsCount: number;
  revenue: number;
  visitorCount: number;
}

// --- Shared Components ---
const GlassCard = ({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={cn(
      "relative group overflow-hidden rounded-[32px] bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl p-6 hover:bg-white/[0.05] transition-all duration-300",
      className
    )}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    {children}
  </motion.div>
);

const SectionHeader = ({ title, description, actions }: { title: string, description?: string, actions?: React.ReactNode }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
    <div>
      <h2 className="text-3xl font-bold tracking-tight text-white">{title}</h2>
      {description && <p className="text-white/40 text-sm mt-1">{description}</p>}
    </div>
    <div className="flex items-center gap-3">
      {actions}
    </div>
  </div>
);

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [timeRange, setTimeRange] = useState<'day' | 'month'>('day');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Data State
  const [kpis, setKpis] = useState<KPIData>({
    ordersCount: 0,
    productsCount: 0,
    revenue: 0,
    visitorCount: 0
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // UI State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // Products
      const { data: productsData, error: prodErr } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (prodErr) console.error('Products fetch error:', prodErr);
      if (productsData) setProducts(productsData as any);

      // Categories
      const { data: categoriesData, error: catErr } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
      if (catErr) console.error('Categories fetch error:', catErr);
      if (categoriesData) setCategories(categoriesData);

      // Orders with joined items
      const { data: ordersData, error: orderErr } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .order('created_at', { ascending: false });

      if (orderErr) console.error('Orders fetch error:', orderErr);
      
      if (ordersData) {
        setOrders(ordersData);
        const totalRevenue = ordersData.reduce((acc, order) => acc + (Number(order.total) || 0), 0);

        try {
          // Fetch real visitors - optional table
          const { count: visitorCount } = await supabase.from('visitor_stats').select('*', { count: 'exact', head: true });
          setKpis({
            ordersCount: ordersData.length,
            productsCount: productsData?.length || 0,
            revenue: totalRevenue,
            visitorCount: visitorCount || 0
          });
        } catch (e) {
          setKpis({
            ordersCount: ordersData.length,
            productsCount: productsData?.length || 0,
            revenue: totalRevenue,
            visitorCount: 0
          });
        }
      }
    } catch (error) {
      console.error('General fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      await fetchData();
      setLoading(false);
    };

    checkUser();

    // Real-time subscriptions
    const channels = [
      supabase.channel('admin-changes')
        .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'orders' }, () => fetchData())
        .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'products' }, () => fetchData())
        .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'categories' }, () => fetchData())
        .subscribe()
    ];

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [router, fetchData]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/authentification');
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    setActionLoading(id);
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (error: any) {
      alert("Erreur lors de la suppression: " + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;
    setActionLoading(id);
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (error: any) {
      alert("Erreur lors de la suppression: " + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredKpis = useMemo(() => {
    const now = new Date();
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      if (timeRange === 'day') {
        return orderDate.toDateString() === now.toDateString();
      } else {
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      }
    });

    const revenue = filteredOrders.reduce((acc, order) => acc + (Number(order.total) || 0), 0);
    
    return {
      ordersCount: filteredOrders.length,
      productsCount: products.length,
      revenue: revenue,
      visitorCount: kpis.visitorCount // Garder le total ou filtrer si possible
    };
  }, [orders, products, timeRange, kpis.visitorCount]);

  const revenueEvolution = useMemo(() => {
    if (orders.length === 0) return [10, 20, 15, 40, 30, 60, 50];
    
    const count = timeRange === 'day' ? 7 : 12; // 7 heures ou 12 mois ? Non, 7 derniers jours ou 12 derniers mois.
    
    if (timeRange === 'day') {
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayStr = d.toLocaleDateString();
        const dayTotal = orders
          .filter(o => new Date(o.created_at).toLocaleDateString() === dayStr)
          .reduce((sum, o) => sum + Number(o.total), 0);
        return dayTotal;
      });
      const max = Math.max(...last7Days, 1);
      return last7Days.map(v => (v / max) * 100);
    } else {
      // Vue par mois sur l'année en cours
      const currentYear = new Date().getFullYear();
      const months = [...Array(12)].map((_, i) => {
        const monthTotal = orders
          .filter(o => {
            const d = new Date(o.created_at);
            return d.getMonth() === i && d.getFullYear() === currentYear;
          })
          .reduce((sum, o) => sum + Number(o.total), 0);
        return monthTotal;
      });
      const max = Math.max(...months, 1);
      return months.map(v => (v / max) * 100);
    }
  }, [orders, timeRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-6xl font-bold text-white/20">∞</motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white flex overflow-hidden font-sans selection:bg-purple-500/30">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 border-r border-white/5 flex-col bg-black/40 backdrop-blur-2xl z-50">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-purple-500/20">∞</div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight leading-none">Infinity</span>
              <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium mt-1">Admin Panel</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-2">
          {[
            { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard size={20} /> },
            { id: 'products', label: 'Produits', icon: <Package size={20} /> },
            { id: 'orders', label: 'Commandes', icon: <ShoppingCart size={20} /> },
            { id: 'categories', label: 'Catégories', icon: <Layers size={20} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={cn(
                "group flex items-center gap-4 px-5 py-4 rounded-[20px] transition-all duration-300 relative overflow-hidden",
                activeTab === item.id
                  ? "text-white bg-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                  : "text-white/40 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              <div className={cn("p-2 rounded-xl transition-colors", activeTab === item.id ? "bg-purple-500/20 text-purple-400" : "text-inherit group-hover:text-white")}>
                {item.icon}
              </div>
              <span className="font-medium">{item.label}</span>
              {activeTab === item.id && (
                <motion.div layoutId="active-nav-indicator" className="absolute right-4 w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <button onClick={handleSignOut} className="flex items-center gap-4 w-full px-5 py-4 rounded-[20px] text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300">
            <div className="p-2 rounded-xl bg-red-500/10"><LogOut size={20} /></div>
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col relative h-screen">
        <header className="h-20 border-b border-white/5 bg-black/20 backdrop-blur-md px-6 lg:px-10 flex items-center justify-between z-40">
          <div className="lg:hidden flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-purple-500 flex items-center justify-center font-bold">∞</div></div>
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-purple-400 transition-colors" />
              <input placeholder="Rechercher..." className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-purple-500/30 focus:bg-white/[0.06] transition-all" />
            </div>
          </div>
          <div className="flex items-center gap-3 lg:gap-5">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] font-bold uppercase tracking-wider">
               <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
               Live: {kpis.visitorCount}
            </div>
            <button className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-white/40 hover:text-white transition-colors relative"><Bell size={20} /><span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#020202]" /></button>
            <div className="h-8 w-px bg-white/5 mx-1" />
            <div className="flex items-center gap-3 pl-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-zinc-700 to-black border border-white/10 flex items-center justify-center text-white/80 font-bold overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.email || 'Admin'}&backgroundColor=transparent`} alt="avatar" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 pb-32 lg:pb-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <SectionHeader 
                  title="Tableau de bord" 
                  description="Aperçu global de la performance en temps réel." 
                  actions={
                    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                      <button 
                        onClick={() => setTimeRange('day')}
                        className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", timeRange === 'day' ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "text-white/40 hover:text-white")}
                      >
                        Jour
                      </button>
                      <button 
                        onClick={() => setTimeRange('month')}
                        className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", timeRange === 'month' ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "text-white/40 hover:text-white")}
                      >
                        Mois
                      </button>
                    </div>
                  } 
                />
                
                <KPICards kpis={filteredKpis} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <GlassCard className="lg:col-span-2 h-[400px] flex flex-col" delay={0.4}>
                    <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold">Flux de Revenu (7j)</h3></div>
                    <div className="flex-1 flex items-end gap-3 pb-2 px-2">
                       {revenueEvolution.map((h, i) => (
                         <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                           <motion.div
                            initial={{ height: 0 }} animate={{ height: `${Math.max(h, 5)}%` }} transition={{ duration: 1, delay: 0.6 + (i * 0.05) }}
                            className="w-full bg-gradient-to-t from-purple-600/20 to-purple-500 rounded-t-lg lg:rounded-t-xl group-hover:from-purple-500 group-hover:to-purple-400 transition-all shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                           />
                           <span className="text-[7px] lg:text-[9px] text-white/20 font-bold uppercase">
                             {timeRange === 'day' ? `J-${6-i}` : ['J','F','M','A','M','J','J','A','S','O','N','D'][i]}
                           </span>
                         </div>
                       ))}
                    </div>
                  </GlassCard>
                  <GlassCard className="h-[400px] overflow-hidden flex flex-col relative" delay={0.5}>
                    <h3 className="text-lg font-bold mb-6 px-2">Commandes Récentes</h3>
                    <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                      {orders.slice(0, 8).map((order) => (
                        <div key={order.id} className="flex items-start gap-4 p-2 rounded-xl hover:bg-white/[0.02] transition-colors group">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">{order.full_name[0]}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white/90 leading-none mb-1 truncate">{order.full_name}</p>
                            <p className="text-[10px] text-white/40 uppercase font-medium">{order.status} • <span className="text-purple-400/80">{Number(order.total).toLocaleString()} FCFA</span></p>
                          </div>
                        </div>
                      ))}
                      {orders.length === 0 && <p className="text-center text-white/20 mt-20">Aucune commande</p>}
                      <div className="h-10" /> {/* Spacer pour le fondu */}
                    </div>
                    {/* Fade effect */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none z-20" />
                  </GlassCard>
                </div>
              </motion.div>
            )}

            {activeTab === 'products' && (
              <motion.div key="products" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <SectionHeader title="Produits" description={`${products.length} articles en inventaire.`} actions={<button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-500 transition-all shadow-lg active:scale-95"><Plus size={18} />Nouveau Produit</button>} />
                <ProductTable 
                  products={products} 
                  onEdit={(p) => { setEditingProduct(p); setIsProductModalOpen(true); }} 
                  onDelete={handleDeleteProduct}
                  actionLoading={actionLoading}
                />
              </motion.div>
            )}

            {activeTab === 'categories' && (
              <motion.div key="categories" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="space-y-8">
                <SectionHeader
                  title="Catégories"
                  description="Gérez les collections et l'organisation des produits."
                  actions={<button onClick={() => { setEditingCategory(null); setIsCategoryModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 lg:px-6 lg:py-3 bg-white text-black font-bold rounded-xl lg:rounded-2xl hover:bg-gray-200 transition-all active:scale-95 text-xs lg:text-base"><Plus size={18} />Nouvelle Catégorie</button>}
                />
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
                  {categories.map((cat, i) => (
                    <motion.div key={cat.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="group relative flex flex-col items-center justify-center p-4 lg:p-6 rounded-[24px] bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-purple-500/30 transition-all duration-300 text-center">
                      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform mb-4">
                        <Layers size={20} />
                      </div>
                      <h4 className="text-sm lg:text-xl font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">{cat.name}</h4>
                      
                      <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => { setEditingCategory(cat); setIsCategoryModalOpen(true); }} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"><Plus size={16} className="rotate-45" /></button>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 text-red-400/40 hover:text-red-400 transition-all"><Plus size={16} className="rotate-45 text-red-400" /></button>
                      </div>
                    </motion.div>
                  ))}
                  {categories.length === 0 && (
                    <div className="col-span-2 lg:col-span-3 py-20 text-center border-2 border-dashed border-white/5 rounded-[32px]">
                       <Layers size={48} className="mx-auto text-white/5 mb-4" />
                       <p className="text-white/20 font-bold uppercase tracking-widest">Aucune catégorie</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div key="orders" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                <SectionHeader title="Commandes" description="Suivi des ventes et détails des articles commandés." />
                <OrderList 
                  orders={orders} 
                  expandedOrder={expandedOrder} 
                  setExpandedOrder={setExpandedOrder} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-4 z-50">
          {[ { id: 'dashboard', icon: <LayoutDashboard size={24} /> }, { id: 'products', icon: <Package size={24} /> }, { id: 'orders', icon: <ShoppingCart size={24} /> }, { id: 'categories', icon: <Layers size={24} /> }, ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as Tab)} className={cn("p-3 rounded-2xl transition-all duration-300", activeTab === item.id ? "bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]" : "text-white/40")}>{item.icon}</button>
          ))}
        </nav>
      </div>

      <ProductModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} onSuccess={fetchData} editingItem={editingProduct} categories={categories} />
      <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} onSuccess={fetchData} editingItem={editingCategory} />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
      `}</style>
    </div>
  );
}
