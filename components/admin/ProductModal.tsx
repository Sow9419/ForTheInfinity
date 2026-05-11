'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Product, Category } from '@/types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingItem?: any | null; // Use any to handle potential snake_case from DB
  categories: Category[];
}

export function ProductModal({ isOpen, onClose, onSuccess, editingItem, categories }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(editingItem?.image || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData);

      let imageUrl = editingItem?.image || '';

      // Image Upload
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;
        imageUrl = filePath;
      }

      const payload = {
        name: data.name as string,
        subtitle: data.subtitle as string,
        price: Number(data.price),
        category_id: data.category_id || null,
        image: imageUrl,
        short_description: data.short_description as string,
        extended_description: data.extended_description as string,
      };

      if (editingItem) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([payload]);
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-[40px] p-8 lg:p-10 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
          >
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-3xl font-bold tracking-tight">
                  {editingItem ? 'Modifier' : 'Nouveau'} Produit
                </h3>
                <p className="text-white/40 text-sm mt-1">Configurez les détails et l'image du produit.</p>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Image Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative aspect-video rounded-[32px] bg-white/[0.03] border border-dashed border-white/10 hover:border-purple-500/50 hover:bg-white/[0.05] transition-all cursor-pointer flex flex-col items-center justify-center gap-4 overflow-hidden group"
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview.startsWith('http') || imagePreview.startsWith('data:') ? imagePreview : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product/${imagePreview}`}
                      alt="Preview"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <div className="px-4 py-2 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-widest">Changer l'image</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-white/20">
                      <Upload size={32} />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-white/60">Télécharger une image</p>
                      <p className="text-xs text-white/20 mt-1">PNG, JPG ou WEBP jusqu'à 5MB</p>
                    </div>
                  </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Nom du produit</label>
                  <input
                    name="name"
                    defaultValue={editingItem?.name}
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-purple-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Sous-titre / Collection</label>
                  <input
                    name="subtitle"
                    defaultValue={editingItem?.subtitle}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-purple-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Prix (FCFA)</label>
                  <input
                    name="price"
                    type="number"
                    defaultValue={editingItem?.price}
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-purple-500 transition-all font-bold tabular-nums"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Catégorie</label>
                  <select
                    name="category_id"
                    defaultValue={editingItem?.category_id || ''}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-purple-500 transition-all font-medium appearance-none text-white"
                  >
                    <option value="" className="bg-[#0A0A0A]">Sélectionner</option>
                    {categories.map(c => <option key={c.id} value={c.id} className="bg-[#0A0A0A]">{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Description courte</label>
                <textarea
                  name="short_description"
                  defaultValue={editingItem?.short_description || editingItem?.shortDescription}
                  rows={2}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-purple-500 transition-all font-medium resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Description étendue</label>
                <textarea
                  name="extended_description"
                  defaultValue={editingItem?.extended_description || editingItem?.extendedDescription}
                  rows={4}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-purple-500 transition-all font-medium resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-white text-black font-bold rounded-[24px] hover:bg-gray-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-lg shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)]"
              >
                {loading ? <Loader2 className="animate-spin" /> : editingItem ? 'Mettre à jour' : 'Publier le produit'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
