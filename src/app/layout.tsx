import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import Footer from '@/components/layout/Footer';
import './globals.css';
import { ShopProvider } from '@/context/ShopContext';

const playfair = Playfair_Display({
  variable: '--font-serif',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'SECOND JLITCH — Pre-loved fashion for a brighter tomorrow',
  description: 'Thoughtfully curated pre-loved fashion pieces, ready for their next chapter. A second life. A new story.',
  keywords: ['Second JLITCH', 'pre-loved fashion', 'curated vintage', 'sustainable fashion', 'thrift store'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#F6FAFE] text-slate-800 antialiased selection:bg-sky-200 selection:text-slate-900 pb-20 md:pb-0">
        <ShopProvider>
        <Header />
        <main className="flex-grow flex flex-col">{children}</main>
        <Footer />
        <MobileBottomNav />
        </ShopProvider>
      </body>
    </html>
  );
}
