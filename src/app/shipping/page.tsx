import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';

export const metadata: Metadata = { title: 'Shipping Policy | SECOND JLITCH', description: 'Shipping and delivery information for SECOND JLITCH.' };

export default function ShippingPage() {
  return (
    <LegalPage title="Shipping Policy" intro="We pack each order from our Nashik, Maharashtra operation and send it through a courier service available for your delivery PIN code.">
      <h2>1. Delivery area</h2>
      <p>We currently ship within India. Courier availability depends on the delivery PIN code. International delivery is not currently offered.</p>

      <h2>2. Dispatch and delivery</h2>
      <p>We normally dispatch a confirmed prepaid order within 2–5 business days. After dispatch, delivery commonly takes 3–7 business days depending on the destination, courier network and serviceability. These are estimates, not guaranteed delivery dates. Weather, public holidays, courier disruptions and incorrect address details can cause delays.</p>

      <h2>3. Shipping charges</h2>
      <p>The applicable shipping charge is shown at checkout before payment. If a free-shipping offer applies, the checkout total will show the offer clearly. We do not add a delivery charge after payment without contacting you.</p>

      <h2>4. Address and contact details</h2>
      <p>Check your name, mobile number, street address, city, state and PIN code before paying. A re-delivery or address-correction charge caused by incorrect information may be payable before we resend an order. Contact us quickly if you notice an error.</p>

      <h2>5. Tracking and delivery attempts</h2>
      <p>When available, we will share the courier tracking information using the contact details on the order. Please make reasonable arrangements to receive the parcel. If a parcel is returned after repeated failed delivery attempts, contact us so we can review the available options.</p>

      <h2>6. Damaged or incorrect parcel</h2>
      <p>If the package appears damaged or you receive the wrong item, photograph the package and item and contact us within 48 hours. Do not discard the packaging until our support team has reviewed the issue. See the <a href="/refunds">Return & Refund Policy</a>.</p>

      <h2>7. Contact</h2>
      <p>For a delivery question, include your order reference and delivery PIN code when contacting us through our <a href="/contact">Contact page</a>.</p>
    </LegalPage>
  );
}
