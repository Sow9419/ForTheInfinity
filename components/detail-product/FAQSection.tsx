import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQSectionProps {
  faqs: { q: string, a: string }[];
}

export function FAQSection({ faqs }: FAQSectionProps) {
  return (
    <div className="flex flex-col gap-0 mt-4 md:mt-0">
      <h2 className="md:hidden text-[17px] font-bold text-center text-gray-900 mb-5">
        Questions fréquentes
      </h2>
      <Accordion className="w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border-gray-100 md:border-[#EEE]">
            <AccordionTrigger className="py-[16px] md:py-[12px] text-[13.5px] md:text-[13px] font-semibold text-[#333] hover:no-underline hover:bg-gray-50 transition-colors px-2 text-left">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-gray-500 text-[13px] px-2 pb-4">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
