import Link from 'next/link';

interface LogoProps {
  className?: string;
  isLight?: boolean;
}

export default function Logo({ className = '', isLight = false }: LogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center group transition-opacity hover:opacity-90 ${className}`}
      aria-label="SECOND JLITCH Home"
    >
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1">
          <span className={`font-serif text-xl sm:text-2xl font-bold tracking-tight italic ${isLight ? 'text-white' : 'text-slate-900'}`}>
            Second
          </span>
          <span className="text-sky-500 text-xs sm:text-sm animate-pulse">✦</span>
        </div>
        <span className={`text-[10px] sm:text-xs tracking-[0.25em] font-semibold uppercase font-sans -mt-0.5 ${isLight ? 'text-sky-100' : 'text-slate-600'}`}>
          JLITCH
        </span>
      </div>
    </Link>
  );
}
