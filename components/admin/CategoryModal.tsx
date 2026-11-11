'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Layers } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { describeSupabaseError } from '@/lib/supabase-errors';
import { Category } from '@/types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingItem?: Category | null;
}

export function CategoryModal({ isOpen, onClose, onSuccess, editingItem }: CategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    if (editingItem) setName(editingItem.name);
    else setName('');
  }, [editingItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    try {
      if (editingItem) {
        const { error } = await supabase.from('categories').update({ name }).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert([{ name }]);
        if (error) throw error;
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(describeSupabaseError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-900/25 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="relative w-full max-w-md bg-white border border-black/[0.06] rounded-[32px] p-8 shadow-[0_40px_80px_-32px_rgba(20,18,12,0.4)] overflow-hidden"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-600 ring-1 ring-violet-100 flex items-center justify-center">
                  <Layers size={19} />
                </div>
                <h3 className="text-[20px] font-black tracking-tight text-neutral-900">{editingItem ? 'Modifier' : 'Nouvelle'} Catégorie</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-neutral-900">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9.5px] font-black text-neutral-400 uppercase tracking-[0.22em] ml-1">Nom de la catégorie</label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ex: T-Shirts, Hoodies..."
                  className="w-full bg-neutral-50 border border-black/[0.07] rounded-2xl py-4 px-5 focus:outline-none focus:border-neutral-900/30 focus:bg-white focus:ring-4 focus:ring-neutral-900/[0.05] transition-all font-bold text-[14px] placeholder:text-neutral-300 placeholder:font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full py-4 bg-neutral-900 text-white font-bold rounded-2xl hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2 text-[14.5px] shadow-[0_12px_28px_-12px_rgba(20,18,12,0.55)]"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : editingItem ? 'Sauvegarder' : 'Créer la catégorie'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
