import ProductCard from './ProductCard';
import { Product } from '@/types/product';

interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  footerNote?: string;
  columns?: '3' | '4';
}

export default function ProductGrid({
  products,
  title,
  subtitle,
  footerNote,
  columns = '3',
}: ProductGridProps) {
  const gridColsClass =
    columns === '4'
      ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3';

  return (
    <section className="w-full py-6 sm:py-10">
      {title && (
        <div className="relative text-center mb-8 sm:mb-12">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-200/90" />
          </div>
          <div className="relative inline-block bg-[#F6FAFE] px-8">
            <h2 className="text-xs uppercase tracking-[0.25em] text-slate-600 font-sans font-medium">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="mt-3 text-xs sm:text-sm text-slate-500 font-sans max-w-md mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className={`grid ${gridColsClass} gap-4 sm:gap-8`}>
        {products.map((product, idx) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={idx < 3}
          />
        ))}
      </div>

      {footerNote && (
        <div className="text-center mt-10 pt-6 border-t border-slate-200/60">
          <p className="text-xs sm:text-sm font-serif italic text-slate-500 tracking-wider">
            {footerNote}
          </p>
        </div>
      )}
    </section>
  );
}
