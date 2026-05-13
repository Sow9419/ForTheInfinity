'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Layers } from 'lucide-react';
import { supabase } from '@/lib/supabase';
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
      alert(error.message);
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
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Layers size={20} />
                </div>
                <h3 className="text-2xl font-bold">{editingItem ? 'Modifier' : 'Nouvelle'} Catégorie</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Nom de la catégorie</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ex: T-Shirts, Hoodies..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-purple-500 transition-all font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full py-5 bg-white text-black font-bold rounded-[24px] hover:bg-gray-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
              >
                {loading ? <Loader2 className="animate-spin" /> : editingItem ? 'Sauvegarder' : 'Créer la catégorie'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
