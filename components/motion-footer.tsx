"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Phone, MapPin, Mail } from 'lucide-react';
import { cn } from "@/lib/utils";
import { STORE_PHONE_TEL, STORE_PHONE_DISPLAY, STORE_EMAIL, STORE_EMAIL_MAILTO } from '@/lib/settings';

// -------------------------------------------------------------------------
// MAGNETIC BUTTON PRIMITIVE (Framer Motion)
// -------------------------------------------------------------------------
export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: 'button' | 'a' | 'div';
  };

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as = "button", ...props }, ref) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const h = rect.width / 2;
      const w = rect.height / 2;
      x.set((e.clientX - rect.left - h) * 0.4);
      y.set((e.clientY - rect.top - w) * 0.4);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    const MotionComponent = as === 'a' ? motion.a : as === 'button' ? motion.button : motion.div;

    return (
      <MotionComponent
        ref={ref as any}
        onMouseMove={handleMouseMove as any}
        onMouseLeave={handleMouseLeave}
        style={{ x: springX, y: springY }}
        className={cn("cursor-pointer", className)}
        {...(props as any)}
      >
        {children}
      </MotionComponent>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

// -------------------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------------------
const MarqueeItem = () => (
  <div className="flex items-center space-x-12 px-6">
    <span>Qualité Premium</span> <span className="text-white/60">✦</span>
    <span>Livraison Express</span> <span className="text-gray-400/60">✦</span>
    <span>Style Unique</span> <span className="text-white/60">✦</span>
    <span>Support 24/7</span> <span className="text-gray-400/60">✦</span>
    <span>Design Exclusif</span> <span className="text-white/60">✦</span>
  </div>
);

export function CinematicFooter() {
  const scrollToTop = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    // Scroll fallback for both standard window and custom scroll containers
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
    document.body.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pillClass = "bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-md shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:from-white/10 hover:to-white/5 hover:border-white/20 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.25)] transition-all duration-300 cursor-pointer";

  return (
    <div className="relative w-full z-10 font-sans">
      {/* Full screen dark gradient background */}
      <footer className="relative w-full flex flex-col items-center justify-between overflow-hidden bg-black bg-[radial-gradient(ellipse_at_top,#171717,black)] text-white pt-32 pb-10 min-h-screen">

        {/* Ambient Light & Animated Grid Background */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[80px] pointer-events-none z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,rgba(128,128,128,0.1)_40%,transparent_70%)]"
        />
        {/* Animated seamless grid */}
        <motion.div
          animate={{ backgroundPosition: ["0px 0px", "0px 60px"] }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:linear-gradient(to_bottom,transparent,black_40%,black_80%,transparent)]"
        />

        {/* Giant background text */}
        <motion.div
          initial={{ y: "10vh", scale: 0.8, opacity: 0 }}
          whileInView={{ y: "0vh", scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="absolute -bottom-[5vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none text-[26vw] leading-[0.75] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.05)]"
        >
          Loyalty.
        </motion.div>

        {/* 1. Diagonal Sleek Marquee (Top of footer) */}
        <div className="absolute top-12 left-0 w-full overflow-hidden border-y border-white/5 bg-black/60 backdrop-blur-md py-4 z-10 -rotate-2 scale-110 shadow-2xl">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
            className="flex w-max text-xs md:text-sm font-bold tracking-[0.3em] text-white/50 uppercase"
          >
            <MarqueeItem />
            <MarqueeItem />
            <MarqueeItem />
            <MarqueeItem />
          </motion.div>
        </div>

        {/* 2. Main Center Content */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-20 w-full max-w-5xl mx-auto">
          <motion.h2
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-12 text-center uppercase bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          >
            Loyalty.
          </motion.h2>

          {/* Interactive Magnetic Pills Layout */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-6 w-full"
          >
            {/* Infos Contact */}
            <div className="flex flex-wrap justify-center gap-4 w-full">
              <MagneticButton as="a" href={STORE_PHONE_TEL} className={cn(pillClass, "px-6 md:px-10 py-4 md:py-5 rounded-full text-white font-bold text-xs md:text-sm flex items-center gap-3 group")}>
                <Phone className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                {STORE_PHONE_DISPLAY}
              </MagneticButton>

              <MagneticButton as="a" href={STORE_EMAIL_MAILTO} className={cn(pillClass, "px-6 md:px-10 py-4 md:py-5 rounded-full text-white font-bold text-xs md:text-sm flex items-center gap-3 group")}>
                <Mail className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                {STORE_EMAIL}
              </MagneticButton>

              <MagneticButton as="div" className={cn(pillClass, "px-6 md:px-10 py-4 md:py-5 rounded-full text-white font-bold text-xs md:text-sm flex items-center gap-3 group")}>
                <MapPin className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                Bamako, Mali
              </MagneticButton>
            </div>

            {/* Réseaux Sociaux */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 w-full mt-2">
              {/* TikTok */}
              <MagneticButton as="a" href="https://www.tiktok.com/@4the_infinity?_r=1&_t=ZS-96JM6Yn3uvk" className={cn(pillClass, "w-14 h-14 rounded-full flex items-center justify-center text-white/50 hover:text-white group")}>
                <svg className="w-6 h-6 transform group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z" />
                </svg>
              </MagneticButton>

              {/* Instagram */}
              <MagneticButton as="a" href="https://www.instagram.com/4the_infinity?igsh=NjFpYzdnemE2anUw&utm_source=qr" className={cn(pillClass, "w-14 h-14 rounded-full flex items-center justify-center text-white/50 hover:text-white group")}>
                <svg className="w-6 h-6 transform group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </MagneticButton>

              {/* SnapChat */}
              <MagneticButton as="a" href="https://snapchat.com/t/Bx0g13n3" className={cn(pillClass, "w-14 h-14 rounded-full flex items-center justify-center text-white/50 hover:text-white group")}>
                <svg className="w-6 h-6 transform group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M15.943 11.526c-.111-.303-.323-.465-.564-.599a1 1 0 0 0-.123-.064l-.219-.111c-.752-.399-1.339-.902-1.746-1.498a3.4 3.4 0 0 1-.3-.531c-.034-.1-.032-.156-.008-.207a.3.3 0 0 1 .097-.1c.129-.086.262-.173.352-.231.162-.104.289-.187.371-.245.309-.216.525-.446.66-.702a1.4 1.4 0 0 0 .069-1.16c-.205-.538-.713-.872-1.329-.872a1.8 1.8 0 0 0-.487.065c.006-.368-.002-.757-.035-1.139-.116-1.344-.587-2.048-1.077-2.61a4.3 4.3 0 0 0-1.095-.881C9.764.216 8.92 0 7.999 0s-1.76.216-2.505.641c-.412.232-.782.53-1.097.883-.49.562-.96 1.267-1.077 2.61-.033.382-.04.772-.036 1.138a1.8 1.8 0 0 0-.487-.065c-.615 0-1.124.335-1.328.873a1.4 1.4 0 0 0 .067 1.161c.136.256.352.486.66.701.082.058.21.14-.371.246l.339.221a.4.4 0 0 1 .109.11c.026.053.027.11-.012.217a3.4 3.4 0 0 1-.295.52c-.398.583-.968 1.077-1.696 1.472-.385.204-.786.34-.955.8-.128.348-.044.743.28 1.075q.18.189.409.31a4.4 4.4 0 0 0 1 .4.7.7 0 0 1 .202.09c.118.104.102.26.259.488q.12.178.296.3c.33.229.701.243 1.095.258.355.014.758.03 1.217.18.19.064.389.186.618.328.55.338 1.305.802 2.566.802 1.262 0 2.02-.466 2.576-.806.227-.14.424-.26.609-.321.46-.152.863-.168 1.218-.181.393-.015.764-.03 1.095-.258a1.14 1.14 0 0 0 .336-.368c.114-.192.11-.327.217-.42a.6.6 0 0 1 .19-.087 4.5 4.5 0 0 0 1.014-.404c.16-.087.306-.2.429-.336l.004-.005c.304-.325.38-.709.256-1.047m-1.121.602c-.684.378-1.139.337-1.493.565-.3.193-.122.61-.34.76-.269.186-1.061-.012-2.085.326-.845.279-1.384 1.082-2.903 1.082s-2.045-.801-2.904-1.084c-1.022-.338-1.816-.14-2.084-.325-.218-.15-.041-.568-.341-.761-.354-.228-.809-.187-1.492-.563-.436-.24-.189-.39-.044-.46 2.478-1.199 2.873-3.05 2.89-3.188.022-.166.045-.297-.138-.466-.177-.164-.962-.65-1.18-.802-.36-.252-.52-.503-.402-.812.082-.214.281-.295.49-.295a1 1 0 0 1 .197.022c.396.086.78.285 1.002.338q.04.01.082.011c.118 0 .16-.06.152-.195-.026-.433-.087-1.277-.019-2.066.094-1.084.444-1.622.859-2.097.2-.229 1.137-1.22 2.93-1.22 1.792 0 2.732.987 2.931 1.215.416.475.766 1.013.859 2.098.068.788.009 1.632-.019 2.065-.01.142.034.195.152.195a.4.4 0 0 0 .082-.01c.222-.054.607-.253 1.002-.338a1 1 0 0 1 .197-.023c.21 0 .409.082.49.295.117.309-.04.56-.401.812-.218.152-1.003.638-1.18.802-.184.169-.16.3-.139.466.018.14.413 1.991 2.89 3.189.147.073.394.222-.041.464" />
                </svg>
              </MagneticButton>
            </div>
          </motion.div>
        </div>

        {/* 3. Bottom Bar / Credits */}
        <div className="relative z-20 w-full mt-24 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Copyright */}
          <div className="text-white/40 text-[10px] md:text-xs font-semibold tracking-widest uppercase order-2 md:order-1">
            © 2026 FortheInfinity. All rights reserved.
          </div>

          {/* "Made with Love" Badge */}
          <div className={cn(pillClass, "px-6 py-3 rounded-full flex items-center gap-2 order-1 md:order-2 cursor-default")}>
            <span className="text-white/50 text-[10px] md:text-xs font-bold uppercase tracking-widest">Créé avec</span>
            <motion.span
              animate={{ scale: [1, 1.2, 1], filter: ["drop-shadow(0 0 2px rgba(239,68,68,0.5))", "drop-shadow(0 0 8px rgba(239,68,68,0.8))", "drop-shadow(0 0 2px rgba(239,68,68,0.5))"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="text-sm md:text-base text-red-500 inline-block"
            >
              ❤
            </motion.span>
            <span className="text-white/50 text-[10px] md:text-xs font-bold uppercase tracking-widest">par</span>
            <span className="text-white font-black text-xs md:text-sm tracking-normal ml-1">FortheInfinity</span>
          </div>

          {/* Back to top */}
          <MagneticButton
            as="button"
            onClick={scrollToTop}
            className={cn(pillClass, "w-12 h-12 rounded-full flex items-center justify-center text-white/50 hover:text-white group order-3 z-50")}
            aria-label="Retour en haut"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-y-1.5 transition-transform duration-300 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
            </svg>
          </MagneticButton>

        </div>
      </footer>
    </div>
  );
}