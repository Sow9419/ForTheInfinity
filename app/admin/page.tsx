'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase, getProductImageUrl } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Layers,
  LogOut,
  TrendingUp,
  Users,
  Plus,
  Search,
  Bell,
  Settings,
  MoreVertical,
  TrendingDown,
  Clock,
  Filter,
  Download,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Product, Category } from '@/types';
import { ProductModal } from '@/components/admin/ProductModal';
import { CategoryModal } from '@/components/admin/CategoryModal';

// --- Types ---
type Tab = 'dashboard' | 'products' | 'orders' | 'categories';

interface KPIData {
  ordersCount: number;
  productsCount: number;
  revenue: number;
  visitorCount: number;
}

// --- Components ---

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
      const { data: productsData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (productsData) setProducts(productsData as any);

      const { data: categoriesData } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
      if (categoriesData) setCategories(categoriesData);

      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersData) {
        setOrders(ordersData);
        const totalRevenue = ordersData.reduce((acc, order) => acc + (Number(order.total) || 0), 0);
        const { count: visitorCount } = await supabase.from('visitor_stats').select('*', { count: 'exact', head: true });

        setKpis(prev => ({
          ...prev,
          ordersCount: ordersData.length,
          productsCount: productsData?.length || 0,
          revenue: totalRevenue,
          visitorCount: visitorCount || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/authentification');
      } else {
        setUser(session.user);
        await fetchData();
        setLoading(false);
      }
    };

    checkUser();

    const subscriptions = [
      supabase.channel('orders-realtime').on('postgres_changes', { event: '*', table: 'orders' }, () => fetchData()).subscribe(),
      supabase.channel('products-realtime').on('postgres_changes', { event: '*', table: 'products' }, () => fetchData()).subscribe(),
      supabase.channel('categories-realtime').on('postgres_changes', { event: '*', table: 'categories' }, () => fetchData()).subscribe(),
      supabase.channel('visitors-realtime').on('postgres_changes', { event: '*', table: 'visitor_stats' }, () => fetchData()).subscribe(),
    ];

    return () => {
      subscriptions.forEach(sub => supabase.removeChannel(sub));
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
      alert(error.message);
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
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const revenueEvolution = useMemo(() => {
    if (orders.length === 0) return [10, 20, 15, 40, 30, 60, 50];
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
  }, [orders]);

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
            { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard /> },
            { id: 'products', label: 'Produits', icon: <Package /> },
            { id: 'orders', label: 'Commandes', icon: <ShoppingCart /> },
            { id: 'categories', label: 'Catégories', icon: <Layers /> },
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
                {React.cloneElement(item.icon as React.ReactElement, { size: 20 })}
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
            <div className="flex items-center gap-3 pl-2"><div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-zinc-700 to-black border border-white/10 flex items-center justify-center text-white/80 font-bold overflow-hidden"><img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.email || 'Admin'}&backgroundColor=transparent`} alt="avatar" /></div></div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 pb-32 lg:pb-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <SectionHeader title="Tableau de bord" description="Aperçu global de la performance en temps réel." actions={<button onClick={fetchData} className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-white/40 hover:text-white transition-colors"><Clock size={18} /></button>} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Commandes', value: kpis.ordersCount, trend: 12.5, icon: <ShoppingCart />, color: 'blue' },
                    { label: 'Produits', value: kpis.productsCount, trend: 2.1, icon: <Package />, color: 'purple' },
                    { label: 'Visiteurs', value: kpis.visitorCount, trend: 18.3, icon: <Users />, color: 'orange' },
                    { label: 'Revenu', value: `${(kpis.revenue).toLocaleString()} FCFA`, trend: 8.4, icon: <TrendingUp />, color: 'green' },
                  ].map((kpi, i) => (
                    <GlassCard key={i} delay={i * 0.1}>
                      <div className="flex justify-between items-start mb-4">
                        <div className={cn("p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]", { 'text-blue-400': kpi.color === 'blue', 'text-purple-400': kpi.color === 'purple', 'text-orange-400': kpi.color === 'orange', 'text-green-400': kpi.color === 'green' })}>{kpi.icon}</div>
                        <div className={cn("flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full", kpi.trend > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>{kpi.trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{Math.abs(kpi.trend)}%</div>
                      </div>
                      <div><p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-1">{kpi.label}</p><h3 className="text-2xl font-bold text-white tabular-nums">{kpi.value}</h3></div>
                    </GlassCard>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <GlassCard className="lg:col-span-2 h-[400px] flex flex-col" delay={0.4}>
                    <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold">Flux de Revenu (7j)</h3></div>
                    <div className="flex-1 flex items-end gap-3 pb-2 px-2">
                       {revenueEvolution.map((h, i) => (
                         <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                           <motion.div
                            initial={{ height: 0 }} animate={{ height: `${Math.max(h, 5)}%` }} transition={{ duration: 1, delay: 0.6 + (i * 0.1) }}
                            className="w-full bg-gradient-to-t from-purple-600/20 to-purple-500 rounded-t-xl group-hover:from-purple-500 group-hover:to-purple-400 transition-all shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                           />
                           <span className="text-[9px] text-white/20 font-bold uppercase">J-{6-i}</span>
                         </div>
                       ))}
                    </div>
                  </GlassCard>
                  <GlassCard className="h-[400px] overflow-hidden flex flex-col" delay={0.5}>
                    <h3 className="text-lg font-bold mb-6">Commandes Récentes</h3>
                    <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                      {orders.slice(0, 8).map((order) => (
                        <div key={order.id} className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[10px] font-bold text-purple-400">{order.full_name[0]}</div>
                          <div className="flex-1"><p className="text-sm font-bold text-white/90 leading-none mb-1">{order.full_name}</p><p className="text-xs text-white/40">{order.status} <span className="text-purple-400 font-bold ml-1">{Number(order.total).toLocaleString()} FCFA</span></p></div>
                        </div>
                      ))}
                      {orders.length === 0 && <p className="text-center text-white/20 mt-20">Aucune commande</p>}
                    </div>
                  </GlassCard>
                </div>
              </motion.div>
            )}

            {activeTab === 'products' && (
              <motion.div key="products" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <SectionHeader title="Produits" description={`${products.length} articles en inventaire.`} actions={<button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-500 transition-all shadow-lg active:scale-95"><Plus size={18} />Nouveau Produit</button>} />
                <GlassCard className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="text-left border-b border-white/5 text-white/30 text-[11px] font-bold uppercase tracking-[0.2em]"><th className="px-6 py-5">Produit</th><th className="px-6 py-5">Prix</th><th className="px-6 py-5 text-right">Actions</th></tr></thead>
                      <tbody className="divide-y divide-white/[0.03]">
                        {products.map((product) => (
                          <tr key={product.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden border border-white/10 flex items-center justify-center">
                                  {product.image ? <img src={getProductImageUrl(product.image)} className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-white/20" />}
                                </div>
                                <div>
                                  <p className="font-bold text-white/90">{product.name}</p>
                                  <p className="text-[11px] text-white/40 uppercase tracking-tighter">{product.subtitle}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-white">{product.price.toLocaleString()} FCFA</td>
                            <td className="px-6 py-4"><div className="flex items-center justify-end gap-2">
                              <button onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }} className="p-2 rounded-xl hover:bg-white/5 text-white/20 hover:text-white transition-all disabled:opacity-50" disabled={actionLoading === product.id}><Edit size={16} /></button>
                              <button onClick={() => handleDeleteProduct(product.id)} className="p-2 rounded-xl hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all disabled:opacity-50" disabled={actionLoading === product.id}>
                                {actionLoading === product.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                              </button></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {activeTab === 'categories' && (
              <motion.div key="categories" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="space-y-8">
                <SectionHeader
                  title="Catégories"
                  description="Gérez les collections et l'organisation des produits."
                  actions={<button onClick={() => { setEditingCategory(null); setIsCategoryModalOpen(true); }} className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-95"><Plus size={18} />Nouvelle Catégorie</button>}
                />
                <div className="grid grid-cols-1 gap-4">
                  {categories.map((cat, i) => (
                    <motion.div key={cat.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="group relative flex items-center justify-between p-6 rounded-[24px] bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-purple-500/30 transition-all duration-300">
                      <div className="flex items-center gap-6"><div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform"><Layers size={24} /></div><div><h4 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">{cat.name}</h4><p className="text-white/20 text-xs font-medium uppercase mt-1">ID: #{cat.id.slice(0, 8)}</p></div></div>
                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => { setEditingCategory(cat); setIsCategoryModalOpen(true); }} className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all disabled:opacity-50" disabled={actionLoading === cat.id}><Edit size={18} /></button>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400/40 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all disabled:opacity-50" disabled={actionLoading === cat.id}>
                          {actionLoading === cat.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div key="orders" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                <SectionHeader title="Commandes" description="Suivi des ventes et détails des articles commandés." />
                <div className="space-y-4">
                  {orders.map((order) => (
                    <GlassCard key={order.id} className="p-0 overflow-visible">
                       <div
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        className="p-6 flex items-center justify-between cursor-pointer group"
                       >
                          <div className="flex items-center gap-6">
                             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-purple-400 transition-colors">
                                {expandedOrder === order.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                             </div>
                             <div>
                                <h4 className="font-bold text-white text-lg">{order.full_name}</h4>
                                <p className="text-xs text-white/40 uppercase tracking-widest">{order.phone} • {order.city}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-10 text-right">
                             <div className="hidden sm:block">
                                <p className="text-[10px] text-white/20 uppercase font-bold mb-1">Date</p>
                                <p className="text-sm font-medium">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                             </div>
                             <div>
                                <p className="text-[10px] text-white/20 uppercase font-bold mb-1">Total</p>
                                <p className="text-lg font-bold text-purple-400">{Number(order.total).toLocaleString()} FCFA</p>
                             </div>
                             <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border", {
                                'bg-blue-500/10 text-blue-400 border-blue-500/20': order.status === 'Nouveau',
                                'bg-green-500/10 text-green-400 border-green-500/20': order.status === 'Livré',
                                'bg-orange-500/10 text-orange-400 border-orange-500/20': order.status === 'En cours',
                             })}>
                                {order.status}
                             </div>
                          </div>
                       </div>

                       <AnimatePresence>
                          {expandedOrder === order.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden border-t border-white/5 bg-white/[0.01]"
                            >
                               <div className="p-8 space-y-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                     <div className="space-y-4">
                                        <h5 className="text-xs font-black uppercase tracking-[0.2em] text-white/20">Détails de livraison</h5>
                                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                                           <p className="text-sm"><span className="text-white/40">Adresse:</span> {order.address || 'Non spécifiée'}</p>
                                           <p className="text-sm"><span className="text-white/40">Ville:</span> {order.city}</p>
                                        </div>
                                     </div>
                                     <div className="space-y-4">
                                        <h5 className="text-xs font-black uppercase tracking-[0.2em] text-white/20">Articles ({order.order_items?.length || 0})</h5>
                                        <div className="space-y-3">
                                           {order.order_items?.map((item: any) => (
                                             <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                                                <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden">
                                                   <img src={getProductImageUrl(item.products?.image)} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                   <p className="text-sm font-bold">{item.products?.name}</p>
                                                   <p className="text-[10px] text-white/40 uppercase">Taille: {item.size || 'N/A'} • Qté: {item.quantity}</p>
                                                </div>
                                                <p className="text-sm font-bold text-white/60">{Number(item.products?.price * item.quantity).toLocaleString()} FCFA</p>
                                             </div>
                                           ))}
                                        </div>
                                     </div>
                                  </div>
                               </div>
                            </motion.div>
                          )}
                       </AnimatePresence>
                    </GlassCard>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-4 z-50">
          {[ { id: 'dashboard', icon: <LayoutDashboard /> }, { id: 'products', icon: <Package /> }, { id: 'orders', icon: <ShoppingCart /> }, { id: 'categories', icon: <Layers /> }, ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as Tab)} className={cn("p-3 rounded-2xl transition-all duration-300", activeTab === item.id ? "bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]" : "text-white/40")}>{React.cloneElement(item.icon as React.ReactElement, { size: 24 })}</button>
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
