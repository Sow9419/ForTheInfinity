'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase, getProductImageUrl } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Megaphone,
  LogOut,
  Plus,
  Search,
  Layers,
  Trash2,
  Edit3,
  Images,
  Tag,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Product, Category, HeroSlide, SizeOption, PromoCode } from '@/types';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

// Modals
import { ProductModal } from '@/components/admin/ProductModal';
import { CategoryModal } from '@/components/admin/CategoryModal';
import { HeroSectionModal } from '@/components/admin/HeroSectionModal';

// Sections
import { KPICards } from '@/components/admin/sections/KPICards';
import { ProductTable } from '@/components/admin/sections/ProductTable';
import { OrderList } from '@/components/admin/sections/OrderList';
import { ChartRadarDots } from '@/components/admin/sections/ChartRadar';
import { PromoManager, SizesManager } from '@/components/admin/sections/PromoAndSizesManager';
import { Card, SectionHeader, PrimaryButton, Segmented } from '@/components/admin/ui';
import { BrandLoader } from '@/components/BrandLoader';

// --- Types ---
type Tab = 'overview' | 'catalog' | 'orders' | 'marketing';
type CatalogView = 'products' | 'categories' | 'sizes';
type MarketingView = 'promos' | 'hero';

interface KPIData {
  ordersCount: number;
  productsCount: number;
  revenue: number;
  visitorCount: number;
}

/** Avatar + menu profil (déconnexion, boutique, rechargement) */
const UserMenu = ({ initial, email, onSignOut, onRefresh }: { initial: string, email?: string, onSignOut?: () => void, onRefresh?: () => void }) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      title="Mon profil"
      className="mt-2.5 w-11 h-11 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[13px] font-black shadow-[0_14px_30px_-10px_rgba(20,18,12,0.55)] hover:scale-105 active:scale-95 transition-transform outline-none cursor-pointer"
    >
      {initial.slice(0, 1).toUpperCase()}
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      side="right"
      sideOffset={12}
      className="w-64 rounded-[22px] border border-black/[0.06] bg-white p-2 shadow-[0_24px_60px_-20px_rgba(20,18,12,0.35)]"
    >
      <div className="px-3 py-2.5">
        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-neutral-400">Administrateur</p>
        <p className="text-[12.5px] font-bold text-neutral-900 truncate mt-0.5">{email || 'admin@4theinfinity.com'}</p>
      </div>
      <DropdownMenuSeparator className="mx-2 bg-black/[0.06]" />
      <DropdownMenuItem
        onClick={() => window.open('/', '_blank')}
        className="rounded-xl px-3 py-2.5 text-[12.5px] font-bold cursor-pointer"
      >
        <ExternalLink size={15} /> Voir la boutique
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => onRefresh?.()}
        className="rounded-xl px-3 py-2.5 text-[12.5px] font-bold cursor-pointer"
      >
        <RefreshCw size={15} /> Recharger les données
      </DropdownMenuItem>
      <DropdownMenuSeparator className="mx-2 bg-black/[0.06]" />
      <DropdownMenuItem
        variant="destructive"
        onClick={() => onSignOut?.()}
        className="rounded-xl px-3 py-2.5 text-[12.5px] font-bold cursor-pointer"
      >
        <LogOut size={15} /> Déconnexion
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [catalogView, setCatalogView] = useState<CatalogView>('products');
  const [marketingView, setMarketingView] = useState<MarketingView>('promos');
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
  const [heroSections, setHeroSections] = useState<HeroSlide[]>([]);
  const [sizes, setSizes] = useState<SizeOption[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);

  // UI State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [editingHero, setEditingHero] = useState<HeroSlide | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // Products (avec les tailles liées pour le modal d'édition)
      let productsRaw: any[] | null = null;
      const productsJoined = await supabase
        .from('products')
        .select('*, product_sizes(size_id, in_stock, sizes(id, name, position))')
        .order('created_at', { ascending: false });
      if (productsJoined.error) {
        // Fallback si la migration commerce n'est pas encore exécutée
        const productsPlain = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (productsPlain.error) console.error('Products fetch error:', productsPlain.error);
        productsRaw = productsPlain.data;
      } else {
        productsRaw = productsJoined.data;
      }
      if (productsRaw) {
        setProducts(productsRaw.map((record: any) => ({
          ...record,
          inStock: record.in_stock !== false,
          promoPrice: record.promo_price != null ? Number(record.promo_price) : null,
          isLimited: record.is_limited === true,
          isNew: record.is_new === true,
          sizes: (record.product_sizes || [])
            .map((ps: any) => ({ sizeId: ps.size_id, name: ps.sizes?.name || '', position: ps.sizes?.position ?? 99, inStock: ps.in_stock !== false }))
            .sort((a: any, b: any) => a.position - b.position),
        })));
      }

      // Categories
      const { data: categoriesData, error: catErr } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
      if (catErr) console.error('Categories fetch error:', catErr);
      if (categoriesData) setCategories(categoriesData);

      // Hero sections
      const { data: heroData, error: heroErr } = await supabase.from('hero_sections').select('*').order('created_at', { ascending: false });
      if (heroErr) console.error('Hero sections fetch error:', heroErr);
      if (heroData) {
        setHeroSections(heroData.map((record: any) => ({ id: record.id, image: record.image, title: record.title, description: record.description, position: record.position })));
      }

      // Tailles globales (existe après la migration commerce)
      const { data: sizesData, error: sizesErr } = await supabase.from('sizes').select('*').order('position', { ascending: true });
      if (sizesErr) console.warn('Sizes fetch (migration commerce pas encore exécutée ?):', sizesErr.message);
      if (sizesData) setSizes(sizesData.map((s: any) => ({ id: s.id, name: s.name, position: s.position })));

      // Codes promo (existe après la migration commerce)
      const { data: promoData, error: promoErr } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
      if (promoErr) console.warn('Promo codes fetch (migration commerce pas encore exécutée ?):', promoErr.message);
      if (promoData) {
        setPromoCodes(promoData.map((p: any) => ({
          id: p.id,
          code: p.code,
          discountPercent: Number(p.discount_percent),
          active: p.active,
          expiresAt: p.expires_at,
          maxUses: p.max_uses,
          usedCount: p.used_count || 0,
          productIds: p.product_ids || null,
        })));
      }

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
            productsCount: productsRaw?.length || 0,
            revenue: totalRevenue,
            visitorCount: visitorCount || 0
          });
        } catch (e) {
          setKpis({
            ordersCount: ordersData.length,
            productsCount: productsRaw?.length || 0,
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

      if (!session) {
        router.push('/authentification');
        return;
      }

      setUser(session.user);
      await fetchData();
      setLoading(false);
    };

    checkUser();

    // Real-time subscriptions
    const channels = [
      supabase.channel('admin-changes')
        .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'orders' }, () => fetchData())
        .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'products' }, () => fetchData())
        .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'product_sizes' }, () => fetchData())
        .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'sizes' }, () => fetchData())
        .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'promo_codes' }, () => fetchData())
        .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'categories' }, () => fetchData())
        .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'hero_sections' }, () => fetchData())
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

  const handleDeleteHero = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette slide Hero ?')) return;
    setActionLoading(id);
    try {
      const { error } = await supabase.from('hero_sections').delete().eq('id', id);
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
    const isSameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    if (orders.length === 0) {
      return [30, 45, 35, 60, 50, 80, 70].map((v, i) => ({
        label: `J-${6-i}`,
        value: v, // Pour l'échelle du radar (fictif)
        orders: Math.floor(v / 10), // Nombre de commandes fictif
        revenue: v * 1000 // Revenu fictif
      }));
    }

    if (timeRange === 'day') {
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayOrders = orders.filter(o => isSameDay(new Date(o.created_at), d));
        const dayTotal = dayOrders.reduce((sum, o) => sum + Number(o.total), 0);
        return {
          label: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
          orders: dayOrders.length,
          revenue: dayTotal,
          value: dayOrders.length
        };
      });
      return last7Days;
    } else {
      const currentYear = new Date().getFullYear();
      const months = [...Array(12)].map((_, i) => {
        const monthOrders = orders.filter(o => {
          const d = new Date(o.created_at);
          return d.getMonth() === i && d.getFullYear() === currentYear;
        });
        const monthTotal = monthOrders.reduce((sum, o) => sum + Number(o.total), 0);
        return {
          label: ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'][i],
          orders: monthOrders.length,
          revenue: monthTotal,
          value: monthOrders.length
        };
      });
      return months;
    }
  }, [orders, timeRange]);

  if (loading) {
    return (
      <div className="w-full min-h-[100dvh] bg-[#F5F4F0]">
        <BrandLoader className="min-h-[100dvh]" />
      </div>
    );
  }

  const NAV = [
    { id: 'overview', label: 'Aperçu', icon: <LayoutDashboard size={18} /> },
    { id: 'catalog', label: 'Catalogue', icon: <Package size={18} /> },
    { id: 'orders', label: 'Commandes', icon: <ShoppingBag size={18} /> },
    { id: 'marketing', label: 'Marketing', icon: <Megaphone size={18} /> },
  ] as const;

  return (
    <div className="min-h-screen text-neutral-900 flex overflow-hidden font-sans selection:bg-neutral-900/10 bg-[#F6F4EE]">
      {/* Halos d'ambiance */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-[#E4EBD9]/60 blur-[120px]" />
        <div className="absolute top-1/3 right-0 w-[420px] h-[420px] rounded-full bg-[#EDDDC9]/50 blur-[110px]" />
        <div className="absolute bottom-0 left-1/3 w-[480px] h-[380px] rounded-full bg-[#DCE3E0]/40 blur-[110px]" />
      </div>

      {/* ============================================================ */}
      {/* Rail — icônes circulaires (desktop)                          */}
      {/* ============================================================ */}
      <aside className="hidden lg:flex w-[92px] shrink-0 flex-col items-center pt-6 pb-5 z-50 relative">
        {/* Logo */}
        <div className="w-12 h-12 rounded-full bg-white shadow-[0_10px_28px_-12px_rgba(20,18,12,0.35)] flex items-center justify-center border border-black/[0.04] transition-transform hover:scale-105 duration-300">
          <img src="/logo.png" alt="4TheInfinity" className="h-6 w-6 object-contain" />
        </div>

        <div className="w-8 h-px bg-black/[0.07] mt-5 mb-5" />

        <nav className="flex-1 flex flex-col items-center gap-2.5">
          {NAV.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                aria-label={item.label}
                className={cn(
                  "group relative w-[52px] h-[52px] flex items-center justify-center rounded-full transition-all duration-300",
                  active ? "text-white" : "text-neutral-500 hover:text-neutral-900 hover:bg-white/80 hover:shadow-[0_10px_28px_-14px_rgba(20,18,12,0.35)]"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="rail-active"
                    transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                    className="absolute inset-0 bg-neutral-900 rounded-full shadow-[0_14px_30px_-10px_rgba(20,18,12,0.6)]"
                  />
                )}
                <span className="relative z-10">{item.icon}</span>
                {/* Tooltip */}
                <span className={cn(
                  "pointer-events-none absolute left-full ml-3 px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap z-50",
                  "bg-neutral-900 text-white opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200",
                  "shadow-[0_10px_26px_-10px_rgba(20,18,12,0.5)]"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Live */}
        <div className="group/live relative flex items-center justify-center w-[52px] h-[52px] rounded-full bg-white border border-black/[0.05] shadow-[0_10px_28px_-14px_rgba(20,18,12,0.3)] cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className={cn("pointer-events-none absolute left-full ml-3 px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap bg-white border border-black/[0.05]",
            "shadow-[0_10px_26px_-10px_rgba(20,18,12,0.35)] opacity-0 translate-x-1 group-hover/live:opacity-100 group-hover/live:translate-x-0 transition-all duration-200")}>
            {kpis.visitorCount} visiteurs en ligne
          </span>
        </div>

        {/* Avatar + menu */}
        <UserMenu initial={user?.email || 'A'} email={user?.email} onSignOut={handleSignOut} onRefresh={() => fetchData()} />
      </aside>

      {/* ============================================================ */}
      {/* Panneau de contenu principal — elevated panel                */}
      {/* ============================================================ */}
      <div className="flex-1 min-w-0 h-screen relative z-10 p-0 lg:pl-1 lg:py-4 lg:pr-4">
        <div className="h-full flex flex-col rounded-none lg:rounded-[34px] bg-white/85 backdrop-blur-2xl border border-white/70 shadow-[0_2px_6px_rgba(20,18,12,0.04),0_40px_90px_-30px_rgba(20,18,12,0.22)] overflow-hidden">

          {/* Barre supérieure — dans le panneau */}
          <header className="h-[74px] shrink-0 flex items-center justify-between px-6 lg:px-9 border-b border-black/[0.05]">
            <div className="lg:hidden flex items-center gap-2.5">
              <img src="/logo.png" alt="4TheInfinity" className="h-7 w-auto object-contain" />
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-neutral-900/80" />
              <span className="text-[10px] font-black uppercase tracking-[0.26em] text-neutral-400">
                {NAV.find(n => n.id === activeTab)?.label}
              </span>
            </div>

            <div className="flex-1 max-w-md hidden md:block mx-auto">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" />
                <input
                  placeholder="Rechercher un produit, une commande..."
                  className="w-full bg-white/70 border border-black/[0.06] rounded-full py-2.5 pl-11 pr-4 text-[13px] font-semibold focus:outline-none focus:border-neutral-900/25 focus:bg-white focus:ring-4 focus:ring-neutral-900/[0.05] transition-all shadow-[0_1px_2px_rgba(20,18,12,0.05)]"
                />
              </div>
            </div>

            {/* Profil — l'ancien bouton "notification" est remplacé par ce menu */}
            <div className="lg:hidden">
              <UserMenu initial={user?.email || 'A'} email={user?.email} onSignOut={handleSignOut} onRefresh={() => fetchData()} />
            </div>
            <div className="hidden lg:block">
              <UserMenu initial={user?.email || 'A'} email={user?.email} onSignOut={handleSignOut} onRefresh={() => fetchData()} />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-6 lg:px-9 py-7 lg:py-9 pb-32 lg:pb-9 custom-scrollbar">
            <AnimatePresence mode="wait">
            {/* ======================================================== */}
            {/* APERÇU                                                    */}
            {/* ======================================================== */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="space-y-8">
                <SectionHeader
                  title="Aperçu"
                  description="La performance de la boutique en temps réel."
                  actions={
                    <div className="inline-flex p-1.5 rounded-full bg-white border border-black/[0.05] shadow-[0_1px_2px_rgba(20,18,12,0.05),0_14px_34px_-20px_rgba(20,18,12,0.25)]">
                      {(['day', 'month'] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => setTimeRange(r)}
                          className={cn("relative px-5 py-2.5 rounded-full text-xs font-black tracking-tight transition-colors", timeRange === r ? "text-white" : "text-neutral-500 hover:text-neutral-900")}
                        >
                          {timeRange === r && (
                            <motion.div layoutId="range-pill" transition={{ type: 'spring', stiffness: 480, damping: 38 }} className="absolute inset-0 bg-neutral-900 rounded-full shadow-[0_10px_24px_-8px_rgba(20,18,12,0.55)]" />
                          )}
                          <span className="relative z-10">{r === 'day' ? "Aujourd'hui" : 'Ce mois'}</span>
                        </button>
                      ))}
                    </div>
                  }
                />

                <KPICards kpis={filteredKpis} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2">
                    <ChartRadarDots
                      data={revenueEvolution}
                      title={`Revenus — ${timeRange === 'day' ? '7 derniers jours' : 'Année en cours'}`}
                      description="Analyse des commandes enregistrées."
                    />
                  </div>
                  <Card className="flex flex-col" delay={0.5}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-black text-[17px] tracking-tight text-neutral-900">Dernières commandes</h3>
                      <button onClick={() => setActiveTab('orders')} className="text-[11px] font-bold text-neutral-400 hover:text-neutral-900 transition-colors uppercase tracking-wider">Tout voir</button>
                    </div>
                    <div className="flex-1 space-y-2 -mx-2 px-2 overflow-y-auto custom-scrollbar max-h-[340px]">
                      {orders.slice(0, 8).map((order) => (
                        <div key={order.id} className="flex items-center gap-3.5 p-2.5 rounded-2xl hover:bg-neutral-50 transition-colors group cursor-default">
                          <div className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[11px] font-black shrink-0">{order.full_name[0]}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-neutral-900 truncate">{order.full_name}</p>
                            <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">{order.status}</p>
                          </div>
                          <span className="text-[13px] font-black tabular-nums text-neutral-900">{Number(order.total).toLocaleString('fr-FR')}</span>
                        </div>
                      ))}
                      {orders.length === 0 && <p className="text-center text-neutral-300 text-xs py-16 font-bold uppercase tracking-widest">Aucune commande</p>}
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* CATALOGUE                                                 */}
            {/* ======================================================== */}
            {activeTab === 'catalog' && (
              <motion.div key="catalog" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="space-y-8">
                <SectionHeader
                  title="Catalogue"
                  description="Produits, catégories et tailles — tout l'inventaire de la boutique."
                  actions={
                    <div className="flex items-center gap-3">
                      {catalogView === 'products' && (
                        <PrimaryButton onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}><Plus size={16} />Nouveau produit</PrimaryButton>
                      )}
                      {catalogView === 'categories' && (
                        <PrimaryButton onClick={() => { setEditingCategory(null); setIsCategoryModalOpen(true); }}><Plus size={16} />Nouvelle catégorie</PrimaryButton>
                      )}
                    </div>
                  }
                />

                <Segmented
                  layoutId="catalog-seg"
                  value={catalogView}
                  onChange={setCatalogView}
                  items={[
                    { id: 'products', label: 'Produits', count: products.length, icon: <Package size={14} /> },
                    { id: 'categories', label: 'Catégories', count: categories.length, icon: <Layers size={14} /> },
                    { id: 'sizes', label: 'Tailles', count: sizes.length, icon: <Tag size={14} /> },
                  ]}
                />

                {catalogView === 'products' && (
                  <ProductTable
                    products={products}
                    onEdit={(p) => { setEditingProduct(p); setIsProductModalOpen(true); }}
                    onDelete={handleDeleteProduct}
                    actionLoading={actionLoading}
                  />
                )}

                {catalogView === 'categories' && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {categories.map((cat, i) => (
                      <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group relative flex flex-col justify-between p-5 rounded-[24px] bg-white border border-black/[0.06] hover:border-neutral-900/20 hover:shadow-[0_16px_40px_-24px_rgba(20,18,12,0.25)] transition-all duration-300"
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-10 h-10 rounded-xl bg-neutral-900/[0.04] flex items-center justify-center text-neutral-700">
                            <Layers size={17} />
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => { setEditingCategory(cat); setIsCategoryModalOpen(true); }} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-all"><Edit3 size={14} /></button>
                            <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-all"><Trash2 size={14} /></button>
                          </div>
                        </div>
                        <h4 className="mt-5 font-black text-[15px] tracking-tight text-neutral-900 truncate">{cat.name}</h4>
                      </motion.div>
                    ))}
                    {categories.length === 0 && (
                      <div className="col-span-2 lg:col-span-4 py-20 text-center border-2 border-dashed border-black/[0.08] rounded-[26px]">
                        <Layers size={40} className="mx-auto text-neutral-200 mb-4" />
                        <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">Aucune catégorie</p>
                      </div>
                    )}
                  </div>
                )}

                {catalogView === 'sizes' && (
                  <SizesManager sizes={sizes} onChange={fetchData} />
                )}
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* COMMANDES                                                 */}
            {/* ======================================================== */}
            {activeTab === 'orders' && (
              <motion.div key="orders" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="space-y-8">
                <SectionHeader title="Commandes" description="Suivi des ventes, articles commandés et remises." />
                <OrderList
                  orders={orders}
                  expandedOrder={expandedOrder}
                  setExpandedOrder={setExpandedOrder}
                />
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* MARKETING                                                 */}
            {/* ======================================================== */}
            {activeTab === 'marketing' && (
              <motion.div key="marketing" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="space-y-8">
                <SectionHeader
                  title="Marketing"
                  description="Codes promo et slides Hero de la page d'accueil."
                  actions={
                    marketingView === 'hero' ? (
                      <PrimaryButton onClick={() => { setEditingHero(null); setIsHeroModalOpen(true); }}><Plus size={16} />Nouvelle slide</PrimaryButton>
                    ) : undefined
                  }
                />

                <Segmented
                  layoutId="marketing-seg"
                  value={marketingView}
                  onChange={setMarketingView}
                  items={[
                    { id: 'promos', label: 'Codes Promo', count: promoCodes.length, icon: <Tag size={14} /> },
                    { id: 'hero', label: "Slides Hero", count: heroSections.length, icon: <Images size={14} /> },
                  ]}
                />

                {marketingView === 'promos' && (
                  <PromoManager promoCodes={promoCodes} products={products} onChange={fetchData} />
                )}

                {marketingView === 'hero' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {heroSections.map((slide, i) => (
                      <motion.div
                        key={slide.id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group relative flex flex-col overflow-hidden rounded-[24px] bg-white border border-black/[0.06] hover:shadow-[0_16px_40px_-24px_rgba(20,18,12,0.3)] transition-all duration-300"
                      >
                        <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
                          {slide.image ? (
                            <img src={getProductImageUrl(slide.image)} alt={slide.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Images size={28} className="text-neutral-300" /></div>
                          )}
                        </div>
                        <div className="p-4 space-y-0.5 flex-1">
                          <h4 className="text-[14px] font-black tracking-tight text-neutral-900 line-clamp-1">{slide.title || 'Sans titre'}</h4>
                          <p className="text-[11.5px] text-neutral-400 line-clamp-2 leading-relaxed">{slide.description || 'Pas de description'}</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 pb-4">
                          <button onClick={() => { setEditingHero(slide); setIsHeroModalOpen(true); }} className="flex-1 py-2.5 rounded-xl bg-neutral-50 border border-black/[0.05] text-neutral-700 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 text-[11px] font-bold uppercase tracking-wider transition-all">Modifier</button>
                          <button onClick={() => handleDeleteHero(slide.id)} className="p-2.5 rounded-xl bg-neutral-50 border border-black/[0.05] text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-all"><Trash2 size={15} /></button>
                        </div>
                      </motion.div>
                    ))}
                    {heroSections.length === 0 && (
                      <div className="col-span-1 sm:col-span-2 xl:col-span-3 py-20 text-center border-2 border-dashed border-black/[0.08] rounded-[26px]">
                        <Images size={40} className="mx-auto text-neutral-200 mb-4" />
                        <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">Aucune slide Hero</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Bottom Nav — Mobile (pilule flottante) */}
      <nav className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 h-[68px] bg-white/90 backdrop-blur-2xl border border-black/[0.06] rounded-full flex items-center gap-1 px-3 z-50 shadow-[0_20px_50px_-16px_rgba(20,18,12,0.4)]">
        {NAV.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              aria-label={item.label}
              className={cn(
                "relative w-[52px] h-[52px] flex items-center justify-center rounded-full transition-all duration-300",
                active ? "text-white" : "text-neutral-400"
              )}
            >
              {active && (
                <motion.span
                  layoutId="mobile-active"
                  transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                  className="absolute inset-0 bg-neutral-900 rounded-full shadow-[0_10px_24px_-8px_rgba(20,18,12,0.55)]"
                />
              )}
              <span className="relative z-10">{item.icon}</span>
            </button>
          );
        })}
      </nav>

      <ProductModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} onSuccess={fetchData} editingItem={editingProduct} categories={categories} sizesList={sizes} />
      <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} onSuccess={fetchData} editingItem={editingCategory} />
      <HeroSectionModal isOpen={isHeroModalOpen} onClose={() => setIsHeroModalOpen(false)} onSuccess={fetchData} editingItem={editingHero} />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(20,18,12,0.12); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(20,18,12,0.22); }
      `}</style>
    </div>
  );
}
