import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface OrderFormProps {
  quantity: number;
  setQuantity: (q: number) => void;
  product: any;
  success: boolean;
  setSuccess: (s: boolean) => void;
}

export function OrderForm({ quantity, setQuantity, product, success, setSuccess }: OrderFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");

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
      quantity: quantity,
      product: {
        id: product.id,
        title: product.title,
        price: product.price,
        currency: product.currency,
        image: product.images[0]
      }
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
        setQuantity(0);
      } else {
        setError(result.message || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold">Commande confirmée !</h3>
        <p className="text-gray-500 text-sm">Nous avons bien reçu votre commande et vous contacterons très bientôt.</p>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-4 py-4" onSubmit={handleSubmit}>
      {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">{error}</div>}
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nom complet</Label>
        <Input id="name" name="name" required placeholder="Jean Dupont" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">N° de téléphone <span className="text-red-500">*</span></Label>
        <div className="phone-input-container">
          <PhoneInput
            defaultCountry="ml"
            value={phone}
            onChange={(phone) => setPhone(phone)}
            inputClassName="w-full !h-[42px] !border-zinc-200 !rounded-r-[10px] !text-[14px] !bg-white dark:!bg-zinc-950 dark:!border-zinc-800 dark:!text-white focus:!ring-2 focus:!ring-[#00D632] !transition-all"
            countrySelectorStyleProps={{
              buttonClassName: "!h-[42px] !bg-zinc-50 dark:!bg-zinc-900 !border-zinc-200 dark:!border-zinc-800 !rounded-l-[10px] hover:!bg-zinc-100 !px-3",
              dropdownArrowClassName: "opacity-50"
            } as any}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="address">Adresse de livraison</Label>
        <Input id="address" name="address" required placeholder="Quartier, Ville, Informations..." />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="quantity">Quantité</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          value={quantity}
          disabled
          readOnly
          className="bg-zinc-50 border-zinc-200 text-zinc-500 opacity-80 cursor-not-allowed"
        />
      </div>
      <button disabled={isLoading} type="submit" className="mt-4 bg-[#00D632] text-black py-3 rounded-[12px] font-extrabold text-[14px] hover:bg-[#00e836] transition-colors disabled:opacity-50">
        {isLoading ? "Envoi en cours..." : "Confirmer la commande"}
      </button>
    </form>
  )
}
