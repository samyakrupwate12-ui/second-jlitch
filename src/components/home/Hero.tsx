import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SkyBackground from '@/components/ui/SkyBackground';

export default function Hero() {
  return (
    <section className="relative flex items-center justify-center pt-10 pb-0 lg:pt-16 lg:pb-0 overflow-hidden">
      {/* Pastel Sky & Soft Cloud Atmosphere */}
      <SkyBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          
          {/* Left Column: Hero Text & CTA */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-6 pt-4 lg:pt-0">
            
            {/* Main Heading (Editorial Serif) */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-slate-900 leading-[1.1] tracking-tight">
              A second life. <br />
              <span className="italic font-normal text-slate-800">A new story.</span>
            </h1>

            {/* Supporting text */}
            <p className="text-base sm:text-lg text-slate-700 font-sans max-w-md mx-auto lg:mx-0 leading-relaxed font-normal">
              Thoughtfully curated pieces, <br className="hidden sm:inline" />
              ready for their next chapter.
            </p>

            {/* Primary CTA (Dark Navy Minimal Button matching Reference Screenshot) */}
            <div className="pt-2 flex justify-center lg:justify-start">
              <Link
                href="/products"
                className="inline-flex items-center gap-3 px-7 py-3.5 bg-[#142338] text-white text-xs font-semibold tracking-[0.2em] uppercase hover:bg-slate-800 transition-all duration-200 group shadow-sm"
              >
                <span>EXPLORE THE EDIT</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end items-end mt-4 lg:mt-0 w-full">

            {/* MOBILE: constrained height + overflow-hidden crops the stone table at bottom.
                object-cover + object-position keeps bag centered, removes excess table platform. */}
            <div
              className="lg:hidden relative w-full max-w-sm overflow-hidden"
              style={{ height: '260px' }}
            >
              <Image
                src="/images/second-jlitch-hero.png"
                alt="Second JLITCH curated shopping bag with flowers and knitwear"
                fill
                priority
                sizes="100vw"
                className="object-cover hover:scale-[1.01] transition-transform duration-500"
                style={{ objectPosition: 'center 18%' }}
              />
            </div>

            {/* DESKTOP (lg+): full native aspect ratio, object-contain shows complete composition */}
            <div className="hidden lg:block relative w-full shrink-0 max-w-2xl aspect-[3/2]">
              <Image
                src="/images/second-jlitch-hero.png"
                alt="Second JLITCH curated shopping bag on stone platform with flowers and knitwear"
                fill
                priority
                sizes="50vw"
                className="object-contain object-center hover:scale-[1.01] transition-transform duration-500"
              />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
