import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import { AddressInput } from './AddressInput';
import { MessageCircle } from 'lucide-react';
import { STORE_WHATSAPP } from '@/lib/settings';
import { getEffectivePrice } from '@/store/useCartStore';
import { supabase } from '@/lib/supabase';

interface OrderFormProps {
  items?: any[];
  totalPrice?: number;
  product?: any; // Pour compatibilité directe
  quantity?: number;
  success: boolean;
  setSuccess: (s: boolean) => void;
  onClearCart?: () => void;
  closeCheckout?: () => void;
  showFooter?: boolean;
  idForm?: string;
  onLoadingChange?: (loading: boolean) => void;
  /** Reçoit le total final (hors remise promo) pour affichage externe */
  onTotalChange?: (total: number) => void;
}

export function OrderForm({ items, totalPrice, product, quantity, success, setSuccess, onClearCart, closeCheckout, showFooter = true, idForm, onLoadingChange, onTotalChange }: OrderFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number, lon: number } | null>(null);
  const [orderSummaryData, setOrderSummaryData] = useState<any>(null);

  // Code promo
  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountPercent: number;
    discountAmount: number;
    productLimited?: boolean;
    appliesToCount?: number | null;
  } | null>(null);

  // L'input CODE PROMO n'est visible que s'il existe au moins un code
  // actif, non expiré et avec des usages restants.
  const [hasActivePromo, setHasActivePromo] = useState(false);

  const subtotal = totalPrice || (product ? getEffectivePrice(product) * (quantity || 1) : 0);
  const discount = appliedPromo?.discountAmount || 0;
  const finalTotal = Math.max(0, subtotal - discount);

  // Sync internal loading state to parent
  React.useEffect(() => {
    if (onLoadingChange) onLoadingChange(isLoading);
  }, [isLoading, onLoadingChange]);

  // Sync final total to parent (footer fixe du tunnel, etc.)
  React.useEffect(() => {
    if (onTotalChange) onTotalChange(finalTotal);
  }, [finalTotal, onTotalChange]);

  // Détection des codes promos applicables (rafraîchi toutes les 60 s)
  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const now = Date.now();
        const { data } = await supabase
          .from('promo_codes')
          .select('expires_at, max_uses, used_count')
          .eq('active', true);
        if (cancelled) return;
        const ok = (data || []).some((p: any) =>
          (!p.expires_at || new Date(p.expires_at).getTime() >= now) &&
          (p.max_uses == null || (p.used_count ?? 0) < p.max_uses)
        );
        setHasActivePromo(ok);
      } catch {
        if (!cancelled) setHasActivePromo(false);
      }
    };
    load();
    const id = setInterval(load, 60000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const finalItems = items || (product ? [{ ...product, quantity }] : []);

  // Appliquer le code promo (validation serveur, avec les lignes du panier
  // pour que la remise ne porte que sur les produits ciblés par le code)
  const handleApplyPromo = async () => {
    if (!promoInput.trim() || promoLoading) return;
    setPromoLoading(true);
    setPromoError("");
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoInput.trim(),
          subtotal,
          items: finalItems.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: getEffectivePrice(item),
          })),
        })
      });
      const result = await res.json();
      if (result.valid) {
        setAppliedPromo({
          code: result.code,
          discountPercent: result.discountPercent,
          discountAmount: result.discountAmount,
          productLimited: result.productLimited,
          appliesToCount: result.appliesToCount,
        });
      } else {
        setAppliedPromo(null);
        setPromoError(result.message || "Code promo invalide");
      }
    } catch {
      setPromoError("Impossible de vérifier le code, réessayez");
    } finally {
      setPromoLoading(false);
    }
  };

  // Si le panier change, il faut revalider le code (montant potentiellement obsolète)
  React.useEffect(() => {
    if (appliedPromo) {
      setAppliedPromo(null);
      setPromoError("");
      setPromoInput("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(finalItems.map(i => `${i.id}:${i.quantity}`))]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    if (!phone || phone.length < 5) {
      setError("Le numéro de téléphone est obligatoire");
      setIsLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      phone: phone,
      address: formData.get("address"),
      items: finalItems.map(item => ({
        id: item.id,
        name: item.name || item.title,
        price: Number(getEffectivePrice(item)),
        originalPrice: (item.effectivePrice != null && Number(item.effectivePrice) < Number(item.price)) ? Number(item.price) : null,
        quantity: item.quantity,
        selectedSizes: item.selectedSizes || [],
        image: item.image || item.images?.[0]
      })),
      total: finalTotal,
      promo_code: appliedPromo?.code || null,
      discount: discount,
      promo_percent: appliedPromo?.discountPercent ?? null,
      coordinates: coordinates
    };

    setOrderSummaryData(data);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (result.success) {
        setSuccess(true);
        if (onClearCart) onClearCart();
      } else {
        setError(result.message || "Une erreur est survenue");
      }
    } catch (err) {
      // Pour le prototype, on simule un succès si l'API n'existe pas
      setSuccess(true);
      if (onClearCart) onClearCart();
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    const generateWhatsAppLink = () => {
      if (!orderSummaryData) return "#";

      let text = `Bonjour, je souhaite valider ma commande.\n\n*🛒 Produits :*\n`;
      orderSummaryData.items.forEach((item: any) => {
        const sizes = item.selectedSizes?.length > 0 ? ` (${item.selectedSizes.join(', ')})` : '';
        // Prix promotionnel : afficher l'ancien prix → le prix promo
        const priceText = item.originalPrice != null && item.originalPrice > item.price
          ? `~${item.originalPrice.toLocaleString('fr-FR')} FCFA~ ➜ *${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA*`
          : `${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA`;
        text += `- ${item.quantity}x ${item.name}${sizes} : ${priceText}\n`;
      });

      // Code promo appliqué
      if (orderSummaryData.promo_code && orderSummaryData.discount) {
        const percent = orderSummaryData.promo_percent ? ` (−${orderSummaryData.promo_percent}%)` : '';
        text += `\n*🎟️ Code promo :* ${orderSummaryData.promo_code}${percent}\n*Remise :* −${orderSummaryData.discount.toLocaleString('fr-FR')} FCFA\n`;
      }

      text += `\n*👤 Informations :*\n`;
      text += `- Nom : ${orderSummaryData.name}\n`;
      text += `- Téléphone : ${orderSummaryData.phone}\n`;
      text += `- Adresse : ${orderSummaryData.address}\n`;

      if (orderSummaryData.coordinates) {
        text += `📍 Lien de livraison : https://www.google.com/maps?q=${orderSummaryData.coordinates.lat},${orderSummaryData.coordinates.lon}\n`;
      }

      text += `\n*💰 Total : ${orderSummaryData.total.toLocaleString('fr-FR')} FCFA*`;

      // Numéro cible provisoire (à configurer par le client)
      const targetPhone = STORE_WHATSAPP;
      return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
    };

    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-6">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black uppercase tracking-tight">Commande reçue !</h3>
          <p className="text-gray-500 text-sm max-w-[280px]">Merci pour votre confiance. Cliquez ci-dessous pour nous envoyer les détails de livraison sur WhatsApp.</p>
        </div>

        <a
          href={generateWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full mt-4 h-14 bg-[#25D366] text-white rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-[#1ebd59] shadow-lg shadow-[#25D366]/20 active:scale-[0.98] transition-all"
        >
          <MessageCircle className="w-5 h-5" />
          Continuer sur WhatsApp
        </a>

        <button
          onClick={() => {
            if (closeCheckout) closeCheckout();
            router.push('/');
            setTimeout(() => setSuccess(false), 500);
          }}
          className="w-full h-12 text-gray-500 font-bold uppercase tracking-widest text-[10px] hover:text-black transition-all"
        >
          Continuer d'explorer
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Résumé de commande */}
      <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 ">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-100 mb-3">Résumé de la commande</h4>
        <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
          {finalItems.map((item, i) => (
            <div key={i} className="flex flex-col gap-1 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300 font-medium">
                  {item.quantity}x {item.name || item.title}
                </span>
                <span className="font-bold text-gray-100">{(getEffectivePrice(item) * item.quantity).toLocaleString('fr-FR')} FCFA</span>
              </div>
              {item.selectedSizes && item.selectedSizes.length > 0 && (
                <div className="flex gap-1">
                  {item.selectedSizes.map((size: string) => (
                    <span key={size} className="text-[8px] font-bold bg-white/20 text-gray-100 px-1.5 py-0.5 rounded-sm">
                      {size}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Code promo — visible uniquement s'il existe un code actif applicable,
            même dans le tunnel du panier (showFooter=false) */}
        <div className="mt-3 pt-3 border-t border-dashed border-gray-200 flex flex-col gap-2">
          {hasActivePromo && (
            <>
              {/* Code promo */}
              <div className="flex gap-2">
                <input
                  value={promoInput}
                  onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); if (promoError) setPromoError(""); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApplyPromo(); } }}
                  placeholder="CODE PROMO"
                  className="flex-1 h-10 rounded-xl border border-white/10 bg-white/10 px-3 text-[11px] font-black uppercase tracking-widest text-gray-100 placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#00D632] transition-all"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={promoLoading || !promoInput}
                  className="h-10 px-4 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest disabled:opacity-40 flex items-center"
                >
                  {promoLoading ? <div className="w-3.5 h-3.5 border-2 border-black/60 border-t-transparent rounded-full animate-spin" /> : (appliedPromo ? '✓' : 'OK')}
                </button>
              </div>
              {(appliedPromo || promoError) && (
                <div className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-wider ${appliedPromo ? 'text-[#00C38A]' : 'text-red-500 bg-red-50/90 rounded-lg px-3 py-2'}`}>
                  {appliedPromo ? (
                    <>
                      <span>
                        ✓ {appliedPromo.code} — -{appliedPromo.discountPercent}%
                        {appliedPromo.productLimited && (
                          <span className="normal-case tracking-normal font-semibold text-white/60">
                            {' '}(s'applique à {appliedPromo.appliesToCount ?? 0} article{appliedPromo.appliesToCount !== 1 ? 's' : ''})
                          </span>
                        )}
                      </span>
                      <button type="button" onClick={() => { setAppliedPromo(null); setPromoInput(""); }} className="underline hover:no-underline">retirer</button>
                    </>
                  ) : promoError}
                </div>
              )}
              {appliedPromo && (
                <div className="flex justify-between text-[11px] font-bold uppercase text-gray-100">
                  <span>Remise ({appliedPromo.code})</span>
                  <span className="text-[#00C38A]">−{(discount).toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}
            </>
          )}
          {showFooter && (
            <div className="flex justify-between items-center pt-1">
              <span className="font-black text-xs uppercase">Total à payer</span>
              <span className="font-black text-lg text-[#00C38A]">{finalTotal.toLocaleString('fr-FR')} FCFA</span>
            </div>
          )}
        </div>
      </div>

      <form id={idForm} className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium">{error}</div>}

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idForm}-name`} className="text-[11px] font-bold uppercase tracking-wider text-gray-100 ml-1">Nom complet</Label>
            <Input id={`${idForm}-name`} name="name" required placeholder="Ex: Jean Dupont" className="h-12 rounded-xl border-white/10 border-2 bg-white/10 focus:ring-2 focus:ring-[#00D632] focus:ring-offset-0 transition-all text-gray-100" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idForm}-phone`} className="text-[11px] font-bold uppercase tracking-wider text-gray-100 ml-1">N° de téléphone <span className="text-red-500">*</span></Label>
            <div className="phone-input-container">
              <PhoneInput
                defaultCountry="ml"
                value={phone}
                onChange={(phone) => setPhone(phone)}
                inputProps={{
                  id: `${idForm}-phone`,
                  required: true,
                }}
                inputClassName="w-full !h-12 !border-2 !border-white/10 !rounded-r-xl !text-[14px] !bg-white/10 !text-white focus:!ring-2 focus:!ring-[#00D632] !transition-all"
                countrySelectorStyleProps={{
                  buttonClassName: "!h-12 !bg-white/10 !border-2 !border-white/10 !rounded-l-xl hover:!bg-white/20 !px-3",
                  dropdownArrowClassName: "opacity-50 !text-white"
                } as any}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 overflow-visible">
            <Label htmlFor={`${idForm}-address`} className="text-[11px] font-bold uppercase tracking-wider text-gray-100 ml-1">Adresse de livraison (Optionnel)</Label>
            <AddressInput
              id={`${idForm}-address`}
              name="address"
              value={address}
              onChange={setAddress}
              onCoordinatesChange={setCoordinates}
            />
          </div>
        </div>

        {showFooter && (
          <button
            disabled={isLoading}
            type="submit"
            className="mt-6 w-full h-14 bg-[#00D632] text-black rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#00e836] shadow-lg shadow-emerald-500/10 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? "Traitement..." : "Confirmer la commande"}
          </button>
        )}
      </form>
    </div>
  )
}
