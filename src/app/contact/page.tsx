import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MapPin, MessageCircle, LifeBuoy } from 'lucide-react';
import LegalPage from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Contact & Support | SECOND JLITCH',
  description: 'Contact SECOND JLITCH customer support for orders, returns, and general inquiries.',
};

export default function ContactPage() {
  return (
    <LegalPage
      eyebrow="WE ARE HERE TO HELP"
      title="Contact & Support"
      intro="Questions about an order, a curated garment, delivery or a return? Reach out through our dedicated support and contact channels below."
    >
      <div className="not-prose grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Support Channel */}
        <a
          href="mailto:support@secondjlitch.in"
          className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 transition-all hover:bg-sky-100 hover:shadow-sm"
        >
          <LifeBuoy className="h-5 w-5 text-sky-700" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-700">Support</p>
          <p className="mt-1 break-all text-sm font-medium text-sky-800">support@secondjlitch.in</p>
          <p className="mt-1 text-[11px] text-slate-500">Orders, delivery & returns</p>
        </a>

        {/* General Contact Channel */}
        <a
          href="mailto:contact@scondjlitch.in"
          className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 transition-all hover:bg-sky-100 hover:shadow-sm"
        >
          <Mail className="h-5 w-5 text-sky-700" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-700">Contact</p>
          <p className="mt-1 break-all text-sm font-medium text-sky-800">contact@scondjlitch.in</p>
          <p className="mt-1 text-[11px] text-slate-500">General & brand inquiries</p>
        </a>

        {/* Location */}
        <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
          <MapPin className="h-5 w-5 text-sky-700" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-700">Location</p>
          <p className="mt-1 text-sm font-medium text-slate-700">Nashik, Maharashtra</p>
          <p className="mt-1 text-[11px] text-slate-500">India</p>
        </div>

        {/* Account Link */}
        <Link
          href="/account"
          className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 transition-all hover:bg-sky-100 hover:shadow-sm"
        >
          <MessageCircle className="h-5 w-5 text-sky-700" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-700">Account</p>
          <p className="mt-1 text-sm font-medium text-sky-800">Open your account</p>
          <p className="mt-1 text-[11px] text-slate-500">Order status & wishlist</p>
        </Link>
      </div>

      <h2>Customer & order support</h2>
      <p>
        For inquiries regarding an active or recent purchase, dispatch timeline, delivery address updates, or return requests, please email us directly at{' '}
        <a href="mailto:support@secondjlitch.in" className="font-semibold text-sky-700 underline">
          support@secondjlitch.in
        </a>
        . Please include your order reference number, full name, and the email address used at checkout. When reporting damage or a wrong garment, kindly attach clear photographs of the packaging and item.
      </p>

      <h2>General inquiries & partnerships</h2>
      <p>
        For brand collaborations, press inquiries, business partnerships, or general store feedback, please write to us at{' '}
        <a href="mailto:contact@scondjlitch.in" className="font-semibold text-sky-700 underline">
          contact@scondjlitch.in
        </a>
        . Our team reviews all incoming messages and typically responds within 1–2 business days.
      </p>

      <h2>Before placing an order</h2>
      <p>
        For questions about sizing, fabric composition, or garment condition, check the product details page or email us. You can also review our{' '}
        <a href="/shipping">Shipping Policy</a>, <a href="/refunds">Return &amp; Refund Policy</a>, and{' '}
        <a href="/terms">Terms &amp; Conditions</a>.
      </p>

      <h2>Store model</h2>
      <p>
        SECOND JLITCH sells its own independently curated inventory. We do not operate as an open marketplace and do not accept third-party listings or unsolicited consignments.
      </p>
    </LegalPage>
  );
}
