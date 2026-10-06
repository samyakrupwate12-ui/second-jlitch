import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Heart,
  MapPin,
  CreditCard,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Camera,
  ArrowRight,
} from 'lucide-react';
import SkyBackground from '@/components/ui/SkyBackground';

export default function AccountPage() {
  const menuSections = [
    {
      icon: Package,
      title: 'My Orders',
      subtitle: 'Track, return or buy again',
      href: '#',
    },
    {
      icon: Heart,
      title: 'Wishlist',
      subtitle: 'Your saved favourites',
      href: '/wishlist',
    },
    {
      icon: MapPin,
      title: 'Addresses',
      subtitle: 'Manage your delivery addresses',
      href: '#',
    },
    {
      icon: CreditCard,
      title: 'Payment Methods',
      subtitle: 'Cards, UPI and more',
      href: '#',
    },
    {
      icon: User,
      title: 'Personal Information',
      subtitle: 'Name, email, phone',
      href: '#',
    },
    {
      icon: Settings,
      title: 'Account Settings',
      subtitle: 'Notifications, privacy and more',
      href: '#',
    },
    {
      icon: LogOut,
      title: 'Logout',
      subtitle: '',
      href: '#',
      isDestructive: true,
    },
  ];

  return (
    <div className="flex-grow flex flex-col pb-12">
      
      {/* Account Sky Header (Matching Reference Screenshot 2) */}
      <div className="relative pt-10 pb-16 px-4 sm:px-6 lg:px-8 sky-hero-gradient border-b border-sky-100 overflow-hidden">
        <SkyBackground />

        <div className="max-w-xl mx-auto flex items-center gap-5 relative z-10">
          
          {/* Avatar circle with camera edit badge */}
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/90 p-1 shadow-md border-2 border-sky-200 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-sky-100 flex items-center justify-center text-sky-400">
                <User className="w-10 h-10 stroke-[1.5]" />
              </div>
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white text-slate-600 shadow-sm border border-slate-200 hover:bg-sky-50 transition-colors"
              aria-label="Edit Profile Picture"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Name & Details */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-slate-900 leading-tight">
              Hi there, <br className="sm:hidden" />
              <span className="font-semibold text-sky-900">Samyak</span>
            </h1>
            <button className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors">
              <span>Edit Profile</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>

      {/* Account Content Section */}
      <div className="max-w-xl mx-auto px-4 sm:px-6 w-full -mt-8 relative z-20 space-y-4">
        
        {/* Order Tracking Card (Matching Reference Screenshot 2) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-sky-100/80 relative overflow-hidden flex items-center justify-between">
          <div className="space-y-2 max-w-[60%]">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-sky-600 font-sans">
              YOUR ORDERS
            </span>
            <h2 className="text-base sm:text-lg font-serif text-slate-900 leading-snug">
              Track your latest order
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              View status, delivery updates and more.
            </p>
            <div className="pt-2">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-sky-500 text-white text-xs font-medium hover:bg-sky-600 transition-colors shadow-xs"
              >
                <span>View Orders</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Sky cloud box graphic preview */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0">
            <Image
              src="/images/hero-bag.jpg"
              alt="Orders Parcel Preview"
              fill
              className="object-cover rounded-2xl shadow-xs"
            />
          </div>
        </div>

        {/* Menu Items List Cards */}
        <div className="space-y-2.5">
          {menuSections.map((item, idx) => {
            const Icon = item.icon;

            return (
              <Link
                key={idx}
                href={item.href}
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:border-sky-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2.5 rounded-xl transition-colors ${
                      item.isDestructive
                        ? 'bg-rose-50 text-rose-500 group-hover:bg-rose-100'
                        : 'bg-sky-50 text-sky-600 group-hover:bg-sky-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[1.6]" />
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-medium font-sans ${
                        item.isDestructive ? 'text-rose-600' : 'text-slate-900 group-hover:text-sky-700'
                      }`}
                    >
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-xs text-slate-400 font-sans">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all" />
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
