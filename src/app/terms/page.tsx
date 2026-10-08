import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';

export const metadata: Metadata = { title: 'Terms & Conditions | SECOND JLITCH', description: 'Terms for shopping with SECOND JLITCH.' };

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" intro="These terms explain how you may use the SECOND JLITCH website and purchase our curated clothing. Please read them before placing an order.">
      <h2>1. About SECOND JLITCH</h2>
      <p>SECOND JLITCH is an independent online clothing store based in Nashik, Maharashtra, India. We sell clothing from our own curated inventory. We are not a marketplace and do not accept listings or sales from outside sellers.</p>

      <h2>2. Using the website</h2>
      <p>You agree to provide accurate information when creating an account or placing an order. Keep your account password private and tell us promptly if you believe your account has been used without permission. We may suspend access where necessary to protect the website, our customers, or our inventory.</p>

      <h2>3. Products, condition and availability</h2>
      <p>We describe each piece, including its size, condition, colour and visible characteristics, as accurately as reasonably possible. Pre-loved pieces can show normal signs of previous use. Colours may look different on different screens. Each order is subject to availability, and a product is not reserved until payment is successfully confirmed.</p>

      <h2>4. Prices and payment</h2>
      <p>Prices are shown in Indian rupees and may change before an order is placed. Shipping charges, when applicable, are shown during checkout. We accept prepaid online payments through the payment provider displayed at checkout. Cash on delivery is not available. Payment details are processed by the payment provider; SECOND JLITCH does not receive or store full card details.</p>

      <h2>5. Orders and cancellation</h2>
      <p>Submitting checkout details is a request to purchase. An order is accepted after payment is confirmed and we send an order confirmation. We may cancel an order if an item is unavailable, a price or product description contains a material error, payment cannot be confirmed, or we reasonably suspect fraud. If we cancel a paid order, we will initiate a refund to the original payment method.</p>

      <h2>6. Shipping and returns</h2>
      <p>Dispatch, delivery, cancellations, returns and refunds are explained in our <a href="/shipping">Shipping Policy</a> and <a href="/refunds">Return & Refund Policy</a>. Those pages form part of these terms.</p>

      <h2>7. Website content</h2>
      <p>Text, photographs, logos, layout and other content created for SECOND JLITCH belong to SECOND JLITCH or are used with permission. You may use the website for personal shopping. You may not copy, reproduce, resell or commercially exploit our content without written permission.</p>

      <h2>8. Changes and governing law</h2>
      <p>We may update these terms when our store, products or payment and delivery arrangements change. The version published on this page applies to orders placed after its update. These terms are governed by the laws applicable in India.</p>

      <h2>9. Contact</h2>
      <p>For questions about these terms or an order, contact us through the details on our <a href="/contact">Contact page</a>.</p>
    </LegalPage>
  );
}
