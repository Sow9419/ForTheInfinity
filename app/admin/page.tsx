'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, Package, ShoppingCart, Users } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/authentification');
      } else {
        setUser(session.user);
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/authentification');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 p-6 flex flex-col gap-8 bg-black/20 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold">∞</div>
          <span className="font-bold text-lg tracking-tight">Admin</span>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            Tableau de bord
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors">
            <Package className="w-5 h-5" />
            Produits
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors">
            <ShoppingCart className="w-5 h-5" />
            Commandes
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors">
            <Users className="w-5 h-5" />
            Clients
          </button>
        </nav>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors mt-auto"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Bienvenue,</h1>
            <p className="text-white/40">{user?.email}</p>
          </div>
          <div className="flex gap-4">
             <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-sm">
                Session active
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <p className="text-white/40 text-sm uppercase tracking-wider font-medium">Ventes totales</p>
            <p className="text-3xl font-bold">0 FCFA</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <p className="text-white/40 text-sm uppercase tracking-wider font-medium">Commandes</p>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <p className="text-white/40 text-sm uppercase tracking-wider font-medium">Produits</p>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>

        <div className="mt-10 p-10 rounded-[32px] border border-dashed border-white/10 flex flex-col items-center justify-center text-center gap-4">
           <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <Package className="w-8 h-8 text-white/20" />
           </div>
           <div>
              <h3 className="text-lg font-bold">Aucune activité récente</h3>
              <p className="text-white/40 max-w-xs mx-auto">Les nouvelles commandes et mises à jour apparaîtront ici.</p>
           </div>
        </div>
      </main>
    </div>
  );
}
