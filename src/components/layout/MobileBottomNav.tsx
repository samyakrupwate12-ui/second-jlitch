'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useShop } from '@/context/ShopContext';
import { Home, LayoutGrid, Heart, ShoppingBag, User } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount } = useShop();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Shop', href: '/products', icon: LayoutGrid },
    { label: 'Wishlist', href: '/wishlist', icon: Heart },
    { label: 'Cart', href: '/cart', icon: ShoppingBag, badge: cartCount },
    { label: 'Account', href: '/account', icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-sky-100/90 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] md:hidden px-2 py-2"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 min-w-[60px] ${
                isActive
                  ? 'text-sky-600 font-medium'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div
                className={`p-1.5 rounded-full relative transition-all ${
                  isActive ? 'bg-sky-100/80 text-sky-600 scale-105' : ''
                }`}
              >
                <Icon className="w-5 h-5 stroke-[1.6]" />
                {item.badge ? (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-sky-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold text-sky-600' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
