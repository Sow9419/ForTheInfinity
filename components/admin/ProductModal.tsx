'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Image as ImageIcon, Trash2, Plus } from 'lucide-react';
import { supabase, getProductImageUrl } from '@/lib/supabase';
import { describeSupabaseError } from '@/lib/supabase-errors';
import { Category, SizeOption } from '@/types';
import { cn } from '@/lib/utils';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingItem?: any | null;
  categories: Category[];
  sizesList?: SizeOption[];
}

export function ProductModal({ isOpen, onClose, onSuccess, editingItem, categories, sizesList = [] }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Commerce
  const [inStock, setInStock] = useState(true);
  const [promoPrice, setPromoPrice] = useState('');
  // Statuts badges
  const [isLimited, setIsLimited] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [sizesState, setSizesState] = useState<{ sizeId: string, inStock: boolean }[]>([]);

  useEffect(() => {
    if (editingItem) {
      setExistingImages(editingItem.images || (editingItem.image ? [editingItem.image] : []));
    } else {
      setExistingImages([]);
    }
    setImageFiles([]);
    setImagePreviews([]);

    // Commerce : état de stock produit / prix promo / tailles
    const previous = editingItem?.sizes || [];
    let initialSizes = previous.map((s: any) => ({ sizeId: s.sizeId, inStock: s.inStock !== false }));

    // Fallback : anciens variants (noms) -> ids de la table sizes
    if (initialSizes.length === 0 && (editingItem?.variants?.length || 0) > 0 && sizesList.length > 0) {
      const byName = new Map(sizesList.map((s) => [s.name, s.id]));
      initialSizes = (editingItem.variants || [])
        .map((name: string) => byName.get(name))
        .filter((id: string | undefined): id is string => !!id)
        .map((id: string) => ({ sizeId: id, inStock: true }));
    }
    setSizesState(initialSizes);
    setInStock(editingItem?.inStock !== false);
    setPromoPrice(editingItem?.promoPrice != null ? String(editingItem.promoPrice) : '');
    setIsLimited(editingItem?.isLimited === true);
    setIsNew(editingItem?.isNew === true);
  }, [editingItem, isOpen, sizesList]);

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

  const toggleSizeAssignment = (sizeId: string) => {
    setSizesState(prev => (
      prev.find(x => x.sizeId === sizeId)
        ? prev.filter(x => x.sizeId !== sizeId)
        : [...prev, { sizeId, inStock: true }]
    ));
  };

  const toggleSizeStock = (sizeId: string) => {
    setSizesState(prev => prev.map(x => (x.sizeId === sizeId ? { ...x, inStock: !x.inStock } : x)));
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
        rating: Number(data.rating) || 5,
        reviews_count: Number(data.reviews_count) || 0,
        in_stock: inStock,
        promo_price: promoPrice !== '' ? Number(promoPrice) : null,
        is_limited: isLimited,
        is_new: isNew,
      };

      let productId: string;

      if (editingItem) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingItem.id);
        if (error) throw error;
        productId = editingItem.id;
      } else {
        const { data: created, error } = await supabase.from('products').insert([payload]).select('id').single();
        if (error) throw error;
        productId = created.id;
      }

      // Synchronisation des tailles du produit (product_sizes)
      const { error: deleteSizesError } = await supabase.from('product_sizes').delete().eq('product_id', productId);
      if (deleteSizesError) throw deleteSizesError;

      if (sizesState.length > 0) {
        const { error: sizesError } = await supabase.from('product_sizes').insert(
          sizesState.map(s => ({ product_id: productId, size_id: s.sizeId, in_stock: s.inStock }))
        );
        if (sizesError) throw sizesError;
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      alert(describeSupabaseError(error));
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="relative w-full max-w-3xl bg-white border border-black/[0.06] rounded-[32px] p-7 lg:p-9 shadow-[0_40px_80px_-32px_rgba(20,18,12,0.45)] overflow-y-auto max-h-[92vh] custom-scrollbar"
          >
            <div className="flex justify-between items-start mb-9">
              <div>
                <h3 className="text-[24px] font-black tracking-tight text-neutral-900">
                  {editingItem ? 'Modifier' : 'Nouveau'} Produit
                </h3>
                <p className="text-neutral-400 text-[12.5px] font-medium mt-1">Galerie, informations, stock et tailles du produit.</p>
              </div>
              <button onClick={onClose} className="p-2.5 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-neutral-900">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Galerie */}
              <div className="space-y-3">
                <label className={labelClass}>Galerie d'images — la 1ère image est la principale</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                  {existingImages.map((img, i) => (
                    <div key={`existing-${i}`} className="relative aspect-square rounded-2xl overflow-hidden border border-black/[0.07] group">
                      <img src={getProductImageUrl(img)} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="absolute top-2 right-2 p-1.5 bg-white/85 backdrop-blur-md rounded-lg text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <Trash2 size={13} />
                      </button>
                      {i === 0 && <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-neutral-900 text-white text-[8.5px] font-black rounded-md uppercase tracking-widest">Principal</span>}
                    </div>
                  ))}

                  {imagePreviews.map((img, i) => (
                    <div key={`new-${i}`} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-neutral-900/40 group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        className="absolute top-2 right-2 p-1.5 bg-white/85 backdrop-blur-md rounded-lg text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <Trash2 size={13} />
                      </button>
                      {existingImages.length === 0 && i === 0 && <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-neutral-900 text-white text-[8.5px] font-black rounded-md uppercase tracking-widest">Principal</span>}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-2xl border-2 border-dashed border-black/[0.1] hover:border-neutral-900/35 hover:bg-neutral-50 transition-all flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-400 group-hover:text-neutral-900 transition-all">
                      <Plus size={18} />
                    </div>
                    <span className="text-[8.5px] font-black text-neutral-400 group-hover:text-neutral-700 uppercase tracking-[0.2em]">Ajouter</span>
                  </button>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" multiple />
              </div>

              {/* Infos produit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className={labelClass}>Nom du produit</label>
                  <input name="name" defaultValue={editingItem?.name} required placeholder="Ex : Tee Infinity Noir" className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Sous-titre / Collection</label>
                  <input name="subtitle" defaultValue={editingItem?.subtitle || "ForThe Infinity"} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Prix (FCFA)</label>
                  <input name="price" type="number" defaultValue={editingItem?.price} required min="0" className={inputClass + " tabular-nums"} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Catégorie</label>
                  <select
                    name="category_id"
                    defaultValue={editingItem?.category_id || ''}
                    className={inputClass + " appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222.5%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1.25rem_center]"}
                  >
                    <option value="">Sélectionner</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Note (0-5)</label>
                  <input name="rating" type="number" step="0.1" min="0" max="5" defaultValue={editingItem?.rating || 5} className={inputClass + " tabular-nums"} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Nombre d'avis</label>
                  <input name="reviews_count" type="number" defaultValue={editingItem?.reviews_count || 0} min="0" className={inputClass + " tabular-nums"} />
                </div>
              </div>

              {/* DISPONIBILITÉ & PROMO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className={labelClass}>Disponibilité produit</label>
                  <button
                    type="button"
                    onClick={() => setInStock(v => !v)}
                    className={cn(
                      "w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all font-black text-[13px]",
                      inStock
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-red-50 border-red-200 text-red-600'
                    )}
                  >
                    <span>{inStock ? 'En stock' : 'Rupture de stock'}</span>
                    <span className={cn("relative inline-block h-6 w-11 rounded-full transition-colors", inStock ? 'bg-emerald-500' : 'bg-red-400')}>
                      <span className={cn("absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", inStock ? 'translate-x-5' : '')} />
                    </span>
                  </button>
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Prix promotionnel (optionnel)</label>
                  <input
                    value={promoPrice}
                    onChange={(e) => setPromoPrice(e.target.value)}
                    type="number"
                    min="0"
                    placeholder="Laisser vide si pas de promotion"
                    className={inputClass + " tabular-nums placeholder:font-semibold"}
                  />
                </div>
              </div>

              {/* STATUTS BADGES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className={labelClass}>Édition limitée</label>
                  <button
                    type="button"
                    onClick={() => setIsLimited(v => !v)}
                    className={cn(
                      "w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all font-black text-[13px]",
                      isLimited
                        ? 'bg-neutral-900/[0.05] border-neutral-900/20 text-neutral-900'
                        : 'bg-neutral-50 border-black/[0.06] text-neutral-400'
                    )}
                  >
                    <span>{isLimited ? 'Limité — affiché sur la carte' : 'Aucun'}</span>
                    <span className={cn("relative inline-block h-6 w-11 rounded-full transition-colors", isLimited ? 'bg-neutral-900' : 'bg-neutral-300')}>
                      <span className={cn("absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", isLimited ? 'translate-x-5' : '')} />
                    </span>
                  </button>
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Badge Nouveau</label>
                  <button
                    type="button"
                    onClick={() => setIsNew(v => !v)}
                    className={cn(
                      "w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all font-black text-[13px]",
                      isNew
                        ? 'bg-sky-50 border-sky-200 text-sky-700'
                        : 'bg-neutral-50 border-black/[0.06] text-neutral-400'
                    )}
                  >
                    <span>{isNew ? 'Nouveau — affiché sur la carte' : 'Aucun'}</span>
                    <span className={cn("relative inline-block h-6 w-11 rounded-full transition-colors", isNew ? 'bg-sky-500' : 'bg-neutral-300')}>
                      <span className={cn("absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", isNew ? 'translate-x-5' : '')} />
                    </span>
                  </button>
                </div>
              </div>

              {/* TAILLES par produit */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Tailles disponibles</label>
                  <span className="text-[8.5px] font-black text-neutral-300 uppercase tracking-[0.18em]">Clic nom = sélectionner • Clic badge = rupture</span>
                </div>
                {sizesList.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {sizesList.map((s) => {
                      const entry = sizesState.find(x => x.sizeId === s.id);
                      const assigned = !!entry;
                      return (
                        <div
                          key={s.id}
                          className={cn(
                            "flex items-center rounded-xl border overflow-hidden transition-all",
                            assigned ? 'bg-neutral-900 border-neutral-900' : 'bg-white border-black/[0.1] hover:border-neutral-400'
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => toggleSizeAssignment(s.id)}
                            className={cn(
                              "px-4 py-2.5 font-black text-[11px] uppercase tracking-[0.12em] transition-colors",
                              assigned ? 'text-white' : 'text-neutral-400 hover:text-neutral-900'
                            )}
                          >
                            {s.name}
                          </button>
                          {assigned && entry && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); toggleSizeStock(s.id); }}
                              title="Basculer en rupture / disponible"
                              className={cn(
                                "h-full px-3 py-2.5 text-[8.5px] font-black uppercase tracking-[0.14em] border-l transition-colors",
                                entry.inStock ? 'bg-emerald-500 text-white border-emerald-600/60' : 'bg-red-500 text-white border-red-600/60'
                              )}
                            >
                              {entry.inStock ? 'Dispo' : 'Rupture'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-neutral-400 text-[12px] font-semibold ml-1">
                    Aucune taille dans la base — crée-les dans <span className="font-black text-neutral-900">Marketing → ou Catalogue → Tailles</span> (après la migration SQL).
                  </p>
                )}
              </div>

              {/* Descriptions */}
              <div className="space-y-2">
                <label className={labelClass}>Description courte</label>
                <textarea name="short_description" defaultValue={editingItem?.short_description} rows={2} className={cn(inputClass, "resize-none font-medium")} />
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Description étendue</label>
                <textarea name="extended_description" defaultValue={editingItem?.extended_description} rows={4} className={cn(inputClass, "resize-none font-medium")} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-neutral-900 text-white font-bold rounded-2xl hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2 text-[14.5px] shadow-[0_12px_28px_-12px_rgba(20,18,12,0.55)]"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : editingItem ? 'Enregistrer les modifications' : 'Publier le produit'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
