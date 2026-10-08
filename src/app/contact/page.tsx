import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MapPin, MessageCircle } from 'lucide-react';
import LegalPage from '@/components/legal/LegalPage';

export const metadata: Metadata = { title: 'Contact SECOND JLITCH', description: 'Contact SECOND JLITCH for order and store support.' };

export default function ContactPage() {
  return (
    <LegalPage eyebrow="WE ARE HERE TO HELP" title="Contact us" intro="Questions about an order, a garment, delivery or a return? Send us your order reference and we will review it with care.">
      <div className="not-prose grid gap-4 sm:grid-cols-3">
        <a href="mailto:samyakrupwate12@gmail.com" className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 transition-colors hover:bg-sky-100">
          <Mail className="h-5 w-5 text-sky-700" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-700">Email</p>
          <p className="mt-1 break-all text-sm text-sky-800">samyakrupwate12@gmail.com</p>
        </a>
        <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
          <MapPin className="h-5 w-5 text-sky-700" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-700">Location</p>
          <p className="mt-1 text-sm text-slate-600">Nashik, Maharashtra, India</p>
        </div>
        <Link href="/account" className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 transition-colors hover:bg-sky-100">
          <MessageCircle className="h-5 w-5 text-sky-700" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-700">Account</p>
          <p className="mt-1 text-sm text-sky-800">Open your account</p>
        </Link>
      </div>

      <h2>Order support</h2>
      <p>For the fastest help, include your order reference, the email used at checkout and clear photographs when you are reporting damage, a wrong item or a return request. Please do not send card numbers, CVVs, UPI PINs or passwords by email.</p>

      <h2>Before placing an order</h2>
      <p>For product questions, include the product name or link. Measurements, condition notes and availability are shown on each product page. You can also read our <a href="/terms">Terms</a>, <a href="/shipping">Shipping Policy</a> and <a href="/refunds">Return & Refund Policy</a>.</p>

      <h2>Store model</h2>
      <p>SECOND JLITCH sells its own curated stock. We do not accept seller listings, consignment pieces or marketplace submissions.</p>
    </LegalPage>
  );
}
