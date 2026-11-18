'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { Mail, LifeBuoy, MapPin } from 'lucide-react';

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          
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
                <Link href="/pre-loved" className="hover:text-white transition-colors">
                  Pre-Loved Collection
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
                <Link href="/shipping" className="hover:text-white transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="hover:text-white transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* POLICIES */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-sky-400 mb-4 font-sans">
              Policies
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="hover:text-white transition-colors">
                  Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors">
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* GET IN TOUCH & SUPPORT */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-sky-400 mb-4 font-sans">
              Get in Touch
            </h3>
            <ul className="space-y-3 text-xs text-slate-400">
              <li>
                <div className="flex items-start gap-2">
                  <LifeBuoy className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                      Support
                    </span>
                    <a
                      href="mailto:support@secondjlitch.in"
                      className="text-slate-300 hover:text-sky-300 transition-colors break-all"
                    >
                      support@secondjlitch.in
                    </a>
                  </div>
                </div>
              </li>
              <li>
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                      Contact
                    </span>
                    <a
                      href="mailto:contact@scondjlitch.in"
                      className="text-slate-300 hover:text-sky-300 transition-colors break-all"
                    >
                      contact@scondjlitch.in
                    </a>
                  </div>
                </div>
              </li>
              <li>
                <div className="flex items-start gap-2 pt-1 text-slate-400">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>Nashik, Maharashtra, India</span>
                </div>
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
