'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, ShoppingBag, User, Menu, X } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { useShop } from '@/context/ShopContext';

export default function Header() {
  const pathname = usePathname();
  const { cartCount } = useShop();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Do not render customer header inside admin section
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-sky-100/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation (Center) */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/products"
              className={`text-sm font-medium transition-colors hover:text-sky-600 ${
                isActive('/products') ? 'text-sky-600 font-semibold' : 'text-slate-700'
              }`}
            >
              Shop
            </Link>
            <Link
              href="/pre-loved"
              className={`text-sm font-medium transition-colors hover:text-sky-600 ${
                isActive('/pre-loved') ? 'text-sky-600 font-semibold' : 'text-slate-700'
              }`}
            >
              Pre-Loved
            </Link>
          </nav>

          {/* Desktop Navigation (Right): Wishlist, Cart, Account */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/wishlist"
              className={`p-2 rounded-full hover:bg-sky-50 transition-colors text-slate-700 hover:text-sky-600 relative ${
                isActive('/wishlist') ? 'text-sky-600 bg-sky-50' : ''
              }`}
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[1.5]" />
            </Link>

            <Link
              href="/cart"
              className={`p-2 rounded-full hover:bg-sky-50 transition-colors text-slate-700 hover:text-sky-600 relative ${
                isActive('/cart') ? 'text-sky-600 bg-sky-50' : ''
              }`}
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-sky-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </Link>

            <Link
              href="/account"
              className={`p-2 rounded-full hover:bg-sky-50 transition-colors text-slate-700 hover:text-sky-600 ${
                isActive('/account') ? 'text-sky-600 bg-sky-50' : ''
              }`}
              aria-label="Account"
            >
              <User className="w-5 h-5 stroke-[1.5]" />
            </Link>
          </div>

          {/* Mobile Header (Right): Cart & Hamburger */}
          <div className="flex md:hidden items-center space-x-3">
            <Link
              href="/cart"
              className="p-2 text-slate-700 hover:text-sky-600 relative"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-sky-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-sky-600 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 stroke-[1.5]" />
              ) : (
                <Menu className="w-6 h-6 stroke-[1.5]" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-b border-sky-100 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2.5 px-3 rounded-lg text-base font-medium transition-colors ${
              isActive('/products') ? 'bg-sky-50 text-sky-600 font-semibold' : 'text-slate-800 hover:bg-slate-50'
            }`}
          >
            Shop All Collections
          </Link>
          <Link
            href="/wishlist"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2.5 px-3 rounded-lg text-base font-medium transition-colors ${
              isActive('/wishlist') ? 'bg-sky-50 text-sky-600 font-semibold' : 'text-slate-800 hover:bg-slate-50'
            }`}
          >
            Wishlist
          </Link>
          <Link
            href="/account"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2.5 px-3 rounded-lg text-base font-medium transition-colors ${
              isActive('/account') ? 'bg-sky-50 text-sky-600 font-semibold' : 'text-slate-800 hover:bg-slate-50'
            }`}
          >
            Account & Profile
          </Link>
        </div>
      )}
    </header>
  );
}
