import Link from 'next/link';

export default function LegalPage({
  eyebrow = 'SECOND JLITCH',
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <article className="flex-grow bg-[#F6FAFE]">
      <div className="relative overflow-hidden border-b border-sky-100 bg-gradient-to-b from-sky-100/80 to-[#F6FAFE] px-4 py-14 sm:px-6 sm:py-20">
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">{eyebrow}</p>
          <h1 className="mt-4 font-serif text-4xl tracking-tight text-slate-900 sm:text-5xl">{title}</h1>
          <p className="mx-auto mt-5 max-w-2xl font-sans text-sm leading-7 text-slate-600 sm:text-base">{intro}</p>
          <p className="mt-5 font-sans text-xs text-slate-500">Last updated: 8 October 2026</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm sm:p-10">
          <div className="prose prose-slate max-w-none font-sans prose-headings:font-serif prose-headings:font-medium prose-headings:text-slate-900 prose-p:text-sm prose-p:leading-7 prose-p:text-slate-600 prose-li:text-sm prose-li:leading-7 prose-li:text-slate-600 prose-a:text-sky-700 prose-a:no-underline hover:prose-a:underline">
            {children}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-slate-500">
          <Link href="/terms" className="hover:text-sky-700">Terms</Link>
          <Link href="/privacy" className="hover:text-sky-700">Privacy</Link>
          <Link href="/refunds" className="hover:text-sky-700">Refunds</Link>
          <Link href="/shipping" className="hover:text-sky-700">Shipping</Link>
          <Link href="/contact" className="hover:text-sky-700">Contact</Link>
        </div>
      </div>
    </article>
  );
}
