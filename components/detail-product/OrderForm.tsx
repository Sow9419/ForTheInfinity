import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface OrderFormProps {
  items?: any[];
  totalPrice?: number;
  product?: any; // Pour compatibilité directe
  quantity?: number;
  success: boolean;
  setSuccess: (s: boolean) => void;
  onClearCart?: () => void;
}

export function OrderForm({ items, totalPrice, product, quantity, success, setSuccess, onClearCart }: OrderFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");

  const finalItems = items || (product ? [{ ...product, quantity }] : []);
  const finalTotal = totalPrice || (product ? product.price * (quantity || 1) : 0);

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
        price: item.price,
        quantity: item.quantity,
        image: item.image || item.images?.[0]
      })),
      total: finalTotal
    };

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
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-6">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black uppercase tracking-tight">Commande reçue !</h3>
          <p className="text-gray-500 text-sm max-w-[280px]">Merci pour votre confiance. Nous vous contacterons par téléphone pour confirmer la livraison.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Résumé de commande */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Résumé de la commande</h4>
        <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
          {finalItems.map((item, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-gray-600 font-medium">
                {item.quantity}x {item.name || item.title}
              </span>
              <span className="font-bold">{(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
          <span className="font-black text-xs uppercase">Total à payer</span>
          <span className="font-black text-lg text-[#00C38A]">{finalTotal.toLocaleString('fr-FR')} FCFA</span>
        </div>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium">{error}</div>}
        
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="text-[11px] font-bold uppercase tracking-wider text-gray-500 ml-1">Nom complet</Label>
            <Input id="name" name="name" required placeholder="Ex: Jean Dupont" className="h-12 rounded-xl border-gray-200 focus:ring-[#00D632] transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone" className="text-[11px] font-bold uppercase tracking-wider text-gray-500 ml-1">N° de téléphone <span className="text-red-500">*</span></Label>
            <div className="phone-input-container">
              <PhoneInput
                defaultCountry="ml"
                value={phone}
                onChange={(phone) => setPhone(phone)}
                inputClassName="w-full !h-12 !border-gray-200 !rounded-r-xl !text-[14px] !bg-white focus:!ring-2 focus:!ring-[#00D632] !transition-all"
                countrySelectorStyleProps={{
                  buttonClassName: "!h-12 !bg-gray-50 !border-gray-200 !rounded-l-xl hover:!bg-zinc-100 !px-3",
                  dropdownArrowClassName: "opacity-50"
                } as any}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address" className="text-[11px] font-bold uppercase tracking-wider text-gray-500 ml-1">Adresse de livraison</Label>
            <Input id="address" name="address" required placeholder="Ex: Bamako, ACI 2000, Rue 123" className="h-12 rounded-xl border-gray-200 focus:ring-[#00D632] transition-all" />
          </div>
        </div>

        <button 
          disabled={isLoading} 
          type="submit" 
          className="mt-6 w-full h-14 bg-[#00D632] text-black rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#00e836] shadow-lg shadow-emerald-500/10 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isLoading ? "Traitement..." : "Confirmer la commande"}
        </button>
      </form>
    </div>
  )
}
