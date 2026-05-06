import React from 'react';
import { Truck } from 'lucide-react';
import { CartIcon } from './Icons';
import { OrderForm } from './OrderForm';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface FooterBarProps {
  product: any;
  quantity: number;
  setQuantity: (q: number) => void;
  isOrderOpen: boolean;
  setIsOrderOpen: (open: boolean) => void;
  isOrdered: boolean;
  setIsOrdered: (ordered: boolean) => void;
  isDesktop: boolean;
}

export function FooterBar({
  product,
  quantity,
  setQuantity,
  isOrderOpen,
  setIsOrderOpen,
  isOrdered,
  setIsOrdered,
  isDesktop
}: FooterBarProps) {
  const totalPrice = (product.price * quantity).toLocaleString('fr-FR');

  const orderTrigger = (
    <button className="bg-[#00D632] text-black border-none py-[10px] md:py-[12px] px-[20px] md:px-[25px] rounded-full font-extrabold text-[12px] md:text-[13px] cursor-pointer flex items-center gap-[8px] hover:bg-[#00e836] transition-colors">
      Ajouter au panier <Truck className="w-4 h-4" strokeWidth={2.5} />
    </button>
  );

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:left-[75%] w-[92%] md:w-[40%] max-w-[500px] bg-[#161B22]/95 backdrop-blur-md px-[20px] md:px-[25px] py-[12px] md:py-[14px] flex justify-between items-center rounded-full box-border z-50 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/5">
      <div className="flex items-center gap-[15px] text-white">
        <CartIcon
          quantity={quantity}
          onClick={() => setIsOrderOpen(true)}
          className="w-6 h-6 text-white"
          badgeClassName="border-[#161B22]"
        />
        <div className="flex flex-col">
          <span className="text-[9px] text-[#888] uppercase tracking-[1px]">
            PANIER
          </span>
          <span className="text-[14px] md:text-[16px] font-bold">
            {totalPrice} {product.currency}
          </span>
        </div>
      </div>

      {isDesktop ? (
        <Sheet open={isOrderOpen} onOpenChange={setIsOrderOpen}>
          <SheetTrigger className="bg-[#00D632] text-black border-none py-[10px] md:py-[12px] px-[20px] md:px-[25px] rounded-full font-extrabold text-[12px] md:text-[13px] cursor-pointer flex items-center gap-[8px] hover:bg-[#00e836] transition-colors">
            Ajouter au panier <Truck className="w-4 h-4" strokeWidth={2.5} />
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{isOrdered ? "Confirmation" : "Finaliser la commande"}</SheetTitle>
              <SheetDescription>
                {isOrdered ? "Votre commande a été reçue." : "Veuillez remplir vos informations pour la livraison."}
              </SheetDescription>
            </SheetHeader>
            <OrderForm quantity={quantity} setQuantity={setQuantity} product={product} success={isOrdered} setSuccess={setIsOrdered} />
          </SheetContent>
        </Sheet>
      ) : (
        <Drawer open={isOrderOpen} onOpenChange={setIsOrderOpen}>
          <DrawerTrigger asChild>
            {orderTrigger}
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>{isOrdered ? "Confirmation" : "Finaliser la commande"}</DrawerTitle>
              <DrawerDescription>
                {isOrdered ? "Votre commande a été reçue." : "Veuillez remplir vos informations pour la livraison."}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
              <OrderForm quantity={quantity} setQuantity={setQuantity} product={product} success={isOrdered} setSuccess={setIsOrdered} />
            </div>
            <DrawerFooter className="pt-2">
              <DrawerClose asChild>
                <button className="w-full py-3 rounded-[12px] font-bold text-gray-600 bg-gray-100">
                  {isOrdered ? "Fermer" : "Annuler"}
                </button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
