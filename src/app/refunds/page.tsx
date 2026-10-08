import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';

export const metadata: Metadata = { title: 'Returns & Refunds | SECOND JLITCH', description: 'Return and refund policy for SECOND JLITCH orders.' };

export default function RefundsPage() {
  return (
    <LegalPage title="Return & Refund Policy" intro="We want every piece to reach you as described. This policy explains what to do if an order arrives damaged, incorrect or materially different from its listing.">
      <h2>1. Pre-loved pieces</h2>
      <p>Pre-loved garments may have small signs of previous use. We photograph and describe known condition details before sale. Change-of-mind, fit, styling preference or a difference in how a colour appears on your screen is not normally a return reason, so please review the measurements, description and photos before ordering.</p>

      <h2>2. When a return may be accepted</h2>
      <p>Contact us within 48 hours of delivery if you receive the wrong item, the item arrives damaged, or it has a material undisclosed issue. Send your order reference, clear photographs and a short description through the <a href="/contact">Contact page</a>. We will review the issue and tell you the next step.</p>

      <h2>3. Return condition</h2>
      <p>If we approve a return, keep the item unworn, unwashed and in the condition received, with any original tags or packaging. Do not alter, repair, perfume or launder the item before our review. We may refuse a return where the issue was caused after delivery or where the item does not match the approved return request.</p>

      <h2>4. Refunds</h2>
      <p>For an approved return or an order cancelled by SECOND JLITCH before dispatch, we will initiate a refund of the eligible amount to the original payment method after the item is received and checked, where a return is required. The payment provider or bank may take additional time to show the credit. Shipping charges are refundable only where the issue is our error or the item is materially defective.</p>

      <h2>5. Cancellation before dispatch</h2>
      <p>Request a cancellation as soon as possible through our <a href="/contact">Contact page</a>. We can consider a cancellation only before dispatch. Once an order has been handed to the courier, use the return process above if the order qualifies.</p>

      <h2>6. No cash refunds</h2>
      <p>Refunds are processed electronically to the original payment method. Cash refunds and refunds to an unrelated account are not available.</p>

      <h2>7. Policy changes</h2>
      <p>This policy applies to orders placed after the date shown above. We may update it when our products, courier arrangements or applicable requirements change.</p>
    </LegalPage>
  );
}
