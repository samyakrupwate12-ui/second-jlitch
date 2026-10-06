'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/ui/Logo';

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top brand tagline row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-12 border-b border-slate-800/80 gap-6">
          <div>
            <Logo isLight={true} />
            <p className="mt-3 text-sm text-slate-400 font-serif italic max-w-sm">
              &quot;A second life. A new story.&quot;
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Thoughtfully curated pieces, ready for their next chapter.
            </p>
          </div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-12">
          
          {/* SHOP */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-sky-400 mb-4 font-sans">
              Shop
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-white transition-colors">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  Account
                </Link>
              </li>
            </ul>
          </div>

          {/* CUSTOMER CARE */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-sky-400 mb-4 font-sans">
              Customer Care
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">Shipping Info</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">Returns & Refunds</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">Contact Us</span>
              </li>
            </ul>
          </div>

          {/* POLICIES */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-sky-400 mb-4 font-sans">
              Policies
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <span className="text-slate-500 cursor-default">Terms & Conditions</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">Privacy Policy</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">Return & Refund Policy</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">Shipping Policy</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 border-t border-slate-800/60 text-center md:flex md:justify-between md:items-center">
          <p className="text-xs text-slate-400">
            © 2026 SECOND JLITCH. All rights reserved.
          </p>
          <p className="text-xs text-slate-400 mt-2 md:mt-0 font-serif italic">
            Curated with care for a brighter tomorrow.
          </p>
        </div>

      </div>
    </footer>
  );
}
