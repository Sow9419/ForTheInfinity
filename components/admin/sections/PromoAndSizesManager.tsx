'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Loader2, Tag, ArrowUp, ArrowDown, Check, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PromoCode, SizeOption, Product } from '@/types';
import { cn } from '@/lib/utils';
// shadcn/ui
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DateTimePicker } from '@/components/ui/date-picker';

/* ============================================================
   CODES PROMO — création, activation, suppression, périmètre produits
   ============================================================ */
interface PromoManagerProps {
  promoCodes: PromoCode[];
  /** Produits du catalogue pour restreindre un code à certains produits */
  products: Product[];
  onChange: () => void;
}

export function PromoManager({ promoCodes, products = [], onChange }: PromoManagerProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [newCode, setNewCode] = useState({ code: '', percent: '', expiresAt: '', maxUses: '' });
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productListOpen, setProductListOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const toggleProduct = (id: string) => {
    setSelectedProductIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleCreatePromo = async () => {
    if (!newCode.code.trim() || !newCode.percent) return;
    setLoading('create-promo');
    try {
      const payload = {
        code: newCode.code.trim().toUpperCase(),
        discount_percent: Number(newCode.percent),
        active: true,
        expires_at: newCode.expiresAt ? new Date(newCode.expiresAt).toISOString() : null,
        max_uses: newCode.maxUses ? Number(newCode.maxUses) : null,
        // Restriction produits : null = valable sur tout le panier
        product_ids: selectedProductIds.length > 0 ? selectedProductIds : null,
      };
      const { error } = await supabase.from('promo_codes').insert([payload]);
      if (error) throw error;
      setNewCode({ code: '', percent: '', expiresAt: '', maxUses: '' });
      setSelectedProductIds([]);
      setProductListOpen(false);
      onChange();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(null);
    }
  };

  const togglePromoActive = async (p: PromoCode) => {
    setLoading(`promo-${p.id}`);
    try {
      const { error } = await supabase.from('promo_codes').update({ active: !p.active }).eq('id', p.id);
      if (error) throw error;
      onChange();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(null);
    }
  };

  const deletePromo = async (p: PromoCode) => {
    if (!confirm(`Supprimer le code promo ${p.code} ?`)) return;
    setLoading(`promo-${p.id}`);
    try {
      const { error } = await supabase.from('promo_codes').delete().eq('id', p.id);
      if (error) throw error;
      onChange();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(null);
    }
  };

  const inputClass = "w-full bg-neutral-50 border border-black/[0.07] rounded-2xl py-3.5 px-4.5 text-[13px] font-bold focus:outline-none focus:border-neutral-900/30 focus:bg-white focus:ring-4 focus:ring-neutral-900/[0.05] transition-all placeholder:text-neutral-300 placeholder:font-semibold";

  const filteredProducts = products.filter(p =>
    !productSearch.trim() || p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Carte création */}
      <div className="rounded-[26px] bg-white border border-black/[0.06] p-6 shadow-[0_1px_2px_rgba(20,18,12,0.04),0_16px_40px_-24px_rgba(20,18,12,0.18)]">
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100 flex items-center justify-center"><Tag size={17} /></div>
          <div>
            <h3 className="font-black text-[15px] tracking-tight text-neutral-900">Nouveau code promo</h3>
            <p className="text-[11px] text-neutral-400 font-medium">Remise en % — expiration et limite d'usages optionnelles.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="promo-code" className="text-[9.5px] font-black text-neutral-400 uppercase tracking-[0.22em] ml-1">Code</Label>
            <Input
              id="promo-code"
              value={newCode.code}
              onChange={e => setNewCode(c => ({ ...c, code: e.target.value.toUpperCase() }))}
              placeholder="Ex : BLACK"
              className={cn(inputClass, "uppercase tracking-wider")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="promo-percent" className="text-[9.5px] font-black text-neutral-400 uppercase tracking-[0.22em] ml-1">Remise (%)</Label>
            <Input
              id="promo-percent"
              value={newCode.percent}
              onChange={e => setNewCode(c => ({ ...c, percent: e.target.value }))}
              type="number" min="1" max="100"
              placeholder="20"
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="promo-exp" className="text-[9.5px] font-black text-neutral-400 uppercase tracking-[0.22em] ml-1">Expiration (opt.)</Label>
            <DateTimePicker
              id="promo-exp"
              value={newCode.expiresAt}
              onChange={(v) => setNewCode(c => ({ ...c, expiresAt: v }))}
              placeholder="Aucune expiration"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="promo-max" className="text-[9.5px] font-black text-neutral-400 uppercase tracking-[0.22em] ml-1">Max usages (opt.)</Label>
            <Input
              id="promo-max"
              value={newCode.maxUses}
              onChange={e => setNewCode(c => ({ ...c, maxUses: e.target.value }))}
              type="number" min="1"
              placeholder="50"
              className={inputClass}
            />
          </div>
        </div>

        {/* Périmètre produits */}
        {products.length > 0 && (
          <div className="mt-4 rounded-2xl border border-black/[0.06] bg-neutral-50/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[9.5px] font-black uppercase tracking-[0.2em] text-neutral-400">S'applique à</p>
                {selectedProductIds.length === 0 ? (
                  <p className="text-[12.5px] font-bold text-neutral-700 mt-1">Tout le panier</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {selectedProductIds.map(id => {
                      const product = products.find(p => p.id === id);
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleProduct(id)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 text-white text-[10px] font-black hover:bg-red-600 transition-colors"
                        >
                          {product?.name || 'Produit'}
                          <span className="text-white/50">✕</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setProductListOpen(v => !v)}
                className="px-4 py-2.5 rounded-xl bg-white border border-black/[0.08] text-[11px] font-black uppercase tracking-wider text-neutral-700 hover:border-neutral-900/30 transition-all shrink-0"
              >
                {selectedProductIds.length === 0 ? 'Limiter à des produits' : `Modifier (${selectedProductIds.length})`}
              </button>
            </div>

            {productListOpen && (
              <div className="mt-3 pt-3 border-t border-black/[0.05]">
                <div className="flex items-center justify-between mb-2.5">
                  <input
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    placeholder="Rechercher un produit..."
                    className="flex-1 bg-white border border-black/[0.07] rounded-xl py-2 px-3.5 text-[12px] font-semibold focus:outline-none focus:border-neutral-900/25 transition-all"
                  />
                  {selectedProductIds.length > 0 && (
                    <button type="button" onClick={() => setSelectedProductIds([])} className="ml-2 text-[10px] font-black uppercase tracking-wider text-neutral-400 hover:text-red-600 transition-colors shrink-0">Tout retirer</button>
                  )}
                </div>
                <div className="max-h-[220px] overflow-y-auto custom-scrollbar grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {filteredProducts.map(product => {
                    const checked = selectedProductIds.includes(product.id);
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => toggleProduct(product.id)}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all",
                          checked ? 'bg-neutral-900 border-neutral-900' : 'bg-white border-black/[0.07] hover:border-neutral-400'
                        )}
                      >
                        <span className={cn(
                          "w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all",
                          checked ? 'bg-white border-white' : 'border-black/[0.15]'
                        )}>
                          {checked && <Check size={11} strokeWidth={3.5} className="text-neutral-900" />}
                        </span>
                        <span className={cn("text-[12px] font-bold truncate flex-1", checked ? 'text-white' : 'text-neutral-700')}>{product.name}</span>
                        <span className={cn("text-[10px] font-bold tabular-nums", checked ? 'text-white/50' : 'text-neutral-400')}>{product.price?.toLocaleString('fr-FR')} F</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-neutral-400 font-semibold mt-2.5 ml-1">
                  {selectedProductIds.length === 0
                    ? "Aucun produit sélectionné → le code s'applique à tout le panier."
                    : `Les ${selectedProductIds.length} produit(s) sélectionné(s) sont les seuls éligibles à la remise.`}
                </p>
              </div>
            )}
          </div>
        )}

        <Button
          onClick={handleCreatePromo}
          disabled={loading === 'create-promo' || !newCode.code || !newCode.percent}
          className="mt-4 h-11 w-full sm:w-auto rounded-full bg-neutral-900 px-7 text-[13px] font-bold text-white shadow-[0_8px_20px_-8px_rgba(20,18,12,0.5)] hover:bg-neutral-800 active:translate-y-px"
        >
          {loading === 'create-promo' ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Créer le code
        </Button>
      </div>

      {/* Liste des codes */}
      <div className="rounded-[26px] bg-white border border-black/[0.06] shadow-[0_1px_2px_rgba(20,18,12,0.04),0_16px_40px_-24px_rgba(20,18,12,0.18)] overflow-hidden">
        <div className="px-6 py-4 border-b border-black/[0.05] flex items-center justify-between bg-neutral-50/60">
          <span className="text-[9.5px] font-black uppercase tracking-[0.22em] text-neutral-400">Codes actifs — {promoCodes.filter(p => p.active).length}/{promoCodes.length}</span>
        </div>
        <div className="divide-y divide-black/[0.04] max-h-[460px] overflow-y-auto custom-scrollbar">
          {promoCodes.map(p => {
            const expired = p.expiresAt && new Date(p.expiresAt) < new Date();
            const scopeLabel = (p.productIds?.length || 0) > 0 ? `${p.productIds!.length} produit${p.productIds!.length > 1 ? 's' : ''}` : 'Tout le panier';
            return (
              <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-50/70 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <p className="font-black text-[14px] tracking-[0.06em] text-neutral-900 truncate">{p.code}</p>
                    <Badge variant="secondary" className="h-5 rounded-full bg-blue-50 px-2 text-[8.5px] font-black uppercase tracking-widest text-blue-600 border border-blue-200/70">
                      {scopeLabel}
                    </Badge>
                    {expired && (
                      <Badge variant="destructive" className="h-5 rounded-full bg-red-50 px-2 text-[8.5px] font-black uppercase tracking-widest text-red-600 border border-red-200/70">
                        Expiré
                      </Badge>
                    )}
                    {!p.active && (
                      <Badge variant="outline" className="h-5 rounded-full bg-neutral-100 px-2 text-[8.5px] font-black uppercase tracking-widest text-neutral-400 border-black/[0.05]">
                        Off
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10.5px] text-neutral-400 uppercase font-bold tracking-wider mt-1">
                    −{p.discountPercent}% • {p.usedCount.toLocaleString('fr-FR')}/{p.maxUses ?? '∞'} usages
                    {p.expiresAt && ` • jusqu'au ${new Date(p.expiresAt).toLocaleDateString('fr-FR')}`}
                  </p>
                </div>
                <button
                  onClick={() => togglePromoActive(p)}
                  title="Activer / Désactiver"
                  className={cn(
                    "relative w-11 h-6.5 rounded-full transition-colors shrink-0",
                    p.active ? 'bg-emerald-500' : 'bg-neutral-300'
                  )}
                >
                  <span className={cn("absolute top-[3px] left-[3px] h-5 w-5 rounded-full bg-white shadow transition-transform", p.active ? 'translate-x-4.5' : '')} />
                </button>
                <button onClick={() => deletePromo(p)} className="p-2.5 rounded-xl hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-all shrink-0">
                  {loading === `promo-${p.id}` ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                </button>
              </div>
            );
          })}
          {promoCodes.length === 0 && (
            <p className="text-center text-neutral-300 text-[11px] py-16 uppercase font-black tracking-[0.2em]">Aucun code promo</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TAILLES — ajout, renommage, réordonnancement, suppression
   ============================================================ */
interface SizesManagerProps {
  sizes: SizeOption[];
  onChange: () => void;
}

export function SizesManager({ sizes, onChange }: SizesManagerProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [newSize, setNewSize] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const addSize = async () => {
    if (!newSize.trim()) return;
    setLoading('add-size');
    try {
      const nextPos = sizes.reduce((acc, s) => Math.max(acc, s.position), 0) + 1;
      const { error } = await supabase.from('sizes').insert([{ name: newSize.trim().toUpperCase(), position: nextPos }]);
      if (error) throw error;
      setNewSize('');
      onChange();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(null);
    }
  };

  const startRename = (s: SizeOption) => {
    if (sizes.length === 0) {
      // Migration pas encore exécutée — message silencieux
      alert("Les tailles apparaîtront après l'exécution de la migration SQL.");
      return;
    }
    setRenamingId(s.id);
    setRenameValue(s.name);
  };

  const commitRename = async (s: SizeOption) => {
    const val = renameValue.trim().toUpperCase();
    setRenamingId(null);
    if (!val || val === s.name) return;
    setLoading(`size-${s.id}`);
    try {
      const { error } = await supabase.from('sizes').update({ name: val }).eq('id', s.id);
      if (error) throw error;
      onChange();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(null);
    }
  };

  const deleteSize = async (s: SizeOption) => {
    if (!confirm(`Supprimer la taille ${s.name} ? Elle sera retirée de tous les produits.`)) return;
    setLoading(`size-${s.id}`);
    try {
      const { error } = await supabase.from('sizes').delete().eq('id', s.id);
      if (error) throw error;
      onChange();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(null);
    }
  };

  const moveSize = async (s: SizeOption, dir: -1 | 1) => {
    const sorted = [...sizes].sort((a, b) => a.position - b.position);
    const idx = sorted.findIndex(x => x.id === s.id);
    const other = sorted[idx + dir];
    if (!other) return;
    setLoading(`size-${s.id}`);
    try {
      const updates = [
        { id: s.id, position: other.position },
        { id: other.id, position: s.position },
      ];
      for (const u of updates) {
        const { error } = await supabase.from('sizes').update({ position: u.position }).eq('id', u.id);
        if (error) throw error;
      }
      onChange();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Ajout */}
      <div className="rounded-[26px] bg-white border border-black/[0.06] p-6 shadow-[0_1px_2px_rgba(20,18,12,0.04),0_16px_40px_-24px_rgba(20,18,12,0.18)]">
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 ring-1 ring-violet-100 flex items-center justify-center"><Tag size={17} /></div>
          <div>
            <h3 className="font-black text-[15px] tracking-tight text-neutral-900">Ajouter une taille</h3>
            <p className="text-[11px] text-neutral-400 font-medium">Les tailles sont partagées par tous les produits (dispo / rupture par taille).</p>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            value={newSize}
            onChange={e => setNewSize(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addSize(); }}
            placeholder="EX : XS, 3XL..."
            className="flex-1 bg-neutral-50 border border-black/[0.07] rounded-2xl py-3.5 px-4.5 text-[13px] font-bold uppercase tracking-wider focus:outline-none focus:border-neutral-900/30 focus:bg-white focus:ring-4 focus:ring-neutral-900/[0.05] transition-all placeholder:text-neutral-300 placeholder:font-semibold placeholder:normal-case"
          />
          <button
            onClick={addSize}
            disabled={loading === 'add-size' || !newSize}
            className="px-6 py-3 rounded-full bg-neutral-900 text-white font-bold text-[12.5px] flex items-center gap-2 hover:bg-neutral-800 active:scale-[0.97] disabled:opacity-40 transition-all shadow-[0_8px_20px_-8px_rgba(20,18,12,0.5)]"
          >
            {loading === 'add-size' ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Ajouter
          </button>
        </div>
      </div>

      {/* Liste */}
      <div className="rounded-[26px] bg-white border border-black/[0.06] shadow-[0_1px_2px_rgba(20,18,12,0.04),0_16px_40px_-24px_rgba(20,18,12,0.18)] overflow-hidden">
        <div className="px-6 py-4 border-b border-black/[0.05] bg-neutral-50/60 flex items-center justify-between">
          <span className="text-[9.5px] font-black uppercase tracking-[0.22em] text-neutral-400">Ordre d'affichage — {sizes.length} tailles</span>
        </div>
        <div className="divide-y divide-black/[0.04] max-h-[480px] overflow-y-auto custom-scrollbar">
          {[...sizes].sort((a, b) => a.position - b.position).map((s, i, arr) => (
            <div key={s.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-neutral-50/70 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-black/[0.05] flex items-center justify-center text-[10px] font-black text-neutral-400 shrink-0">{i + 1}</div>

              {renamingId === s.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') commitRename(s); if (e.key === 'Escape') setRenamingId(null); }}
                    className="flex-1 max-w-[180px] bg-neutral-50 border border-neutral-900/25 rounded-lg py-1.5 px-3 text-[13px] font-black uppercase tracking-wider focus:outline-none"
                  />
                  <button onClick={() => commitRename(s)} className="p-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"><Check size={14} /></button>
                  <button onClick={() => setRenamingId(null)} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 transition-colors"><Pencil size={14} /></button>
                </div>
              ) : (
                <>
                  <button onClick={() => { setRenamingId(s.id); setRenameValue(s.name); }} className="flex-1 text-left font-black text-[14px] tracking-[0.06em] text-neutral-900 hover:text-violet-600 transition-colors" title="Renommer">{s.name}</button>
                  <button onClick={() => { setRenamingId(s.id); setRenameValue(s.name); }} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-300 hover:text-neutral-900 transition-all" title="Renommer"><Pencil size={13} /></button>
                </>
              )}

              <button onClick={() => moveSize(s, -1)} disabled={i === 0 || loading === `size-${s.id}`} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-300 hover:text-neutral-900 disabled:opacity-30 transition-all"><ArrowUp size={13} /></button>
              <button onClick={() => moveSize(s, 1)} disabled={i === arr.length - 1 || loading === `size-${s.id}`} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-300 hover:text-neutral-900 disabled:opacity-30 transition-all"><ArrowDown size={13} /></button>
              <button onClick={() => deleteSize(s)} className="p-2.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-all" title="Supprimer">
                {loading === `size-${s.id}` ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            </div>
          ))}
          {sizes.length === 0 && (
            <p className="text-center text-neutral-300 text-[11px] py-16 uppercase font-black tracking-[0.2em]">Aucune taille</p>
          )}
        </div>
      </div>
    </div>
  );
}
