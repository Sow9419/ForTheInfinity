'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Trash2 } from 'lucide-react';
import { supabase, getProductImageUrl } from '@/lib/supabase';
import { HeroSlide } from '@/types';
import { cn } from '@/lib/utils';

interface HeroSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingItem?: HeroSlide | null;
}

export function HeroSectionModal({ isOpen, onClose, onSuccess, editingItem }: HeroSectionModalProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [position, setPosition] = useState<string>('50% 50%');
  const existingImageRef = useRef<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const existing = editingItem?.image || '';
    existingImageRef.current = existing;
    setImagePreview(existing ? getProductImageUrl(existing) : '');
    setImageFile(null);
    setPosition(editingItem?.position || '50% 50%');
  }, [editingItem, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    existingImageRef.current = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData);

      let imagePath = existingImageRef.current || '';

      // Upload de la nouvelle image (bucket public existant 'product')
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `hero/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;
        imagePath = filePath;
      }

      const payload = {
        image: imagePath,
        title: data.title as string,
        description: data.description as string,
        position,
      };

      if (editingItem) {
        const { error } = await supabase.from('hero_sections').update(payload).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('hero_sections').insert([payload]);
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

  const labelClass = "text-[9.5px] font-black text-neutral-400 uppercase tracking-[0.22em] ml-1";
  const inputClass = "w-full bg-neutral-50 border border-black/[0.07] rounded-2xl py-4 px-5 focus:outline-none focus:border-neutral-900/30 focus:bg-white focus:ring-4 focus:ring-neutral-900/[0.05] transition-all font-bold text-[13.5px] placeholder:text-neutral-300 placeholder:font-semibold";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
            className="relative w-full max-w-2xl bg-white border border-black/[0.06] rounded-[32px] p-7 lg:p-9 shadow-[0_40px_80px_-32px_rgba(20,18,12,0.45)] overflow-y-auto max-h-[90vh] custom-scrollbar"
          >
            <div className="flex justify-between items-start mb-9">
              <div>
                <h3 className="text-[24px] font-black tracking-tight text-neutral-900">
                  {editingItem ? 'Modifier' : 'Nouvelle'} Slide Hero
                </h3>
                <p className="text-neutral-400 text-[12.5px] font-medium mt-1">Image plein écran affichée en rotation sur la page d'accueil.</p>
              </div>
              <button onClick={onClose} className="p-2.5 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-neutral-900">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Zone image */}
              <div className="space-y-3">
                <label className={labelClass}>Image</label>
                {imagePreview ? (
                  <div className="relative aspect-video rounded-[22px] overflow-hidden border border-black/[0.07] group">
                    <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-3.5 right-3.5 p-2 bg-white/85 backdrop-blur-md rounded-xl text-red-600 hover:bg-white transition-all shadow-sm"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-video rounded-[22px] border-2 border-dashed border-black/[0.1] hover:border-neutral-900/30 hover:bg-neutral-50 transition-all flex flex-col items-center justify-center gap-2 group"
                  >
                    <span className="text-3xl font-light text-neutral-300 group-hover:text-neutral-900 transition-colors">+</span>
                    <span className="text-[9.5px] font-black text-neutral-400 group-hover:text-neutral-700 uppercase tracking-[0.2em]">Choisir une image</span>
                  </button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
              </div>

              {/* Point focal */}
              <div className="space-y-3">
                <label className={labelClass}>Point focal — zone de l'image conservée sur mobile</label>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-28 shrink-0 items-center justify-center rounded-xl border border-black/[0.07] bg-gradient-to-br from-neutral-100 to-neutral-200/60 overflow-hidden relative">
                    <motion.div
                      animate={{ x: `${(parseFloat(position.split(' ')[0]) - 50) * 0.34}px`, y: `${(parseFloat(position.split(' ')[1]) - 50) * 0.22}px` }}
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                      className="h-3 w-3 rounded-full bg-neutral-900 shadow-[0_2px_8px_rgba(20,18,12,0.4)]"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['0%', '50%', '100%'].flatMap((y) =>
                      ['0%', '50%', '100%'].map((x) => (
                        <button
                          key={`${x}-${y}`}
                          type="button"
                          onClick={() => setPosition(`${x} ${y}`)}
                          className={cn(
                            "h-5 w-5 rounded-md border transition-all duration-200",
                            position === `${x} ${y}`
                              ? "border-neutral-900 bg-neutral-900"
                              : "border-black/[0.1] bg-white hover:border-neutral-900/40"
                          )}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Titre</label>
                <input name="title" defaultValue={editingItem?.title} required placeholder="Ex : BONNET MIDNIGHT" className={inputClass} />
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Description</label>
                <textarea name="description" defaultValue={editingItem?.description} rows={3} placeholder="Texte affiché sous le titre" className={cn(inputClass, "resize-none font-medium")} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-neutral-900 text-white font-bold rounded-2xl hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2 text-[14.5px] shadow-[0_12px_28px_-12px_rgba(20,18,12,0.55)]"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : editingItem ? 'Enregistrer les modifications' : 'Publier la slide'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
