'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Loader2, Image as ImageIcon, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingItem?: any | null;
  categories: Category[];
}

export function ProductModal({ isOpen, onClose, onSuccess, editingItem, categories }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingItem) {
      setExistingImages(editingItem.images || (editingItem.image ? [editingItem.image] : []));
    } else {
      setExistingImages([]);
    }
    setImageFiles([]);
    setImagePreviews([]);
  }, [editingItem, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);

      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      });
    }
  };

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData);

      const uploadedPaths: string[] = [];

      // Upload new images
      for (const file of imageFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        uploadedPaths.push(filePath);
      }

      const allImages = [...existingImages, ...uploadedPaths];
      const mainImage = allImages[0] || '';

      const payload = {
        name: data.name as string,
        subtitle: data.subtitle as string || "ForThe Infinity",
        price: Number(data.price),
        category_id: data.category_id || null,
        image: mainImage,
        images: allImages,
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

  const getImageUrl = (path: string) => {
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product/${path}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-3xl bg-[#0A0A0A] border border-white/10 rounded-[40px] p-8 lg:p-10 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
          >
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-3xl font-bold tracking-tight">
                  {editingItem ? 'Modifier' : 'Nouveau'} Produit
                </h3>
                <p className="text-white/40 text-sm mt-1">Gérez les images et les informations du produit.</p>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Multi-Image Gallery Area */}
              <div className="space-y-4">
                <label className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Galerie d'images</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Existing Images */}
                  {existingImages.map((img, i) => (
                    <div key={`existing-${i}`} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group">
                      <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                      {i === 0 && <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-purple-500 text-[10px] font-bold rounded-md uppercase">Principal</span>}
                    </div>
                  ))}

                  {/* New Previews */}
                  {imagePreviews.map((img, i) => (
                    <div key={`new-${i}`} className="relative aspect-square rounded-2xl overflow-hidden border border-purple-500/30 group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                      {existingImages.length === 0 && i === 0 && <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-purple-500 text-[10px] font-bold rounded-md uppercase">Principal</span>}
                    </div>
                  ))}

                  {/* Add Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-2xl border border-dashed border-white/10 hover:border-purple-500/50 hover:bg-white/[0.03] transition-all flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-purple-400 group-hover:bg-purple-500/10 transition-all">
                      <Plus size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-white/20 group-hover:text-white/40 uppercase tracking-widest">Ajouter</span>
                  </button>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" multiple />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Nom du produit</label>
                  <input name="name" defaultValue={editingItem?.name} required className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-purple-500 transition-all font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Sous-titre / Collection</label>
                  <input name="subtitle" defaultValue={editingItem?.subtitle || "ForThe Infinity"} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-purple-500 transition-all font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Prix (FCFA)</label>
                  <input name="price" type="number" defaultValue={editingItem?.price} required className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-purple-500 transition-all font-bold tabular-nums" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Catégorie</label>
                  <select name="category_id" defaultValue={editingItem?.category_id || ''} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-purple-500 transition-all font-medium appearance-none text-white">
                    <option value="" className="bg-[#0A0A0A]">Sélectionner</option>
                    {categories.map(c => <option key={c.id} value={c.id} className="bg-[#0A0A0A]">{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Description courte</label>
                <textarea name="short_description" defaultValue={editingItem?.short_description} rows={2} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-purple-500 transition-all font-medium resize-none" />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Description étendue</label>
                <textarea name="extended_description" defaultValue={editingItem?.extended_description} rows={4} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-purple-500 transition-all font-medium resize-none" />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-white text-black font-bold rounded-[24px] hover:bg-gray-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-lg shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)]"
              >
                {loading ? <Loader2 className="animate-spin" /> : editingItem ? 'Enregistrer les modifications' : 'Publier le produit'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
