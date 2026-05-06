import type {Metadata} from 'next';
import './globals.css';
import { Inter, Anton, Roboto } from "next/font/google";
import { cn } from "@/lib/utils";
import { ClientLayout } from '@/components/ClientLayout';

const inter = Inter({subsets:['latin'],variable:'--font-sans'});
const anton = Anton({weight: '400', subsets:['latin'],variable:'--font-display'});
const roboto = Roboto({weight: ['300', '400', '500', '700'], subsets:['latin'],variable:'--font-roboto'});

export const metadata: Metadata = {
  title: 'Jokin Mode | E-commerce',
  description: 'Une application e-commerce moderne et performante.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable, anton.variable, roboto.variable)}>
      <body suppressHydrationWarning className="antialiased bg-white text-gray-900 selection:bg-black selection:text-white">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
