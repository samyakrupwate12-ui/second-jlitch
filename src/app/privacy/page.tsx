import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';

export const metadata: Metadata = { title: 'Privacy Policy | SECOND JLITCH', description: 'How SECOND JLITCH handles customer information.' };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" intro="We collect only the information needed to run your account, process your order and support your experience with SECOND JLITCH.">
      <h2>1. Information we collect</h2>
      <ul>
        <li><strong>Account details:</strong> name, email address and password-related account data when you create an account.</li>
        <li><strong>Order details:</strong> items purchased, prices, order status and customer support history.</li>
        <li><strong>Delivery details:</strong> name, mobile number and delivery address that you provide at checkout.</li>
        <li><strong>Technical information:</strong> basic browser, device and website usage information needed to keep the website secure and working.</li>
      </ul>

      <h2>2. How we use information</h2>
      <p>We use information to provide accounts, process payments, deliver orders, answer support requests, prevent fraud, maintain records and improve the website. We do not sell customer information.</p>

      <h2>3. Service providers</h2>
      <p>We use trusted service providers to operate the store. Supabase provides account and database services. Our payment provider processes payment information. Courier or shipping partners receive the delivery details needed to deliver an order. These providers process information under their own terms and privacy practices.</p>

      <h2>4. Payments</h2>
      <p>Payment card, UPI and other payment credentials are entered into the payment provider&apos;s secure checkout. SECOND JLITCH does not store complete card numbers, CVVs or UPI PINs.</p>

      <h2>5. Cookies and local storage</h2>
      <p>The website may use browser storage to remember a guest wishlist or cart and to keep the site working. Signed-in shopping selections are associated with your account. You can clear browser storage, but doing so may remove guest selections from that browser.</p>

      <h2>6. Retention and security</h2>
      <p>We keep information for as long as reasonably needed for account operation, order support, accounting, fraud prevention and legal obligations. We use access controls and service-provider security features, but no online service can guarantee absolute security.</p>

      <h2>7. Your choices</h2>
      <p>You may request access to or correction of your account information, or ask us to close your account where we are not required to retain records. Some information may need to be retained for completed orders, financial records or legal requirements. Contact us using our <a href="/contact">Contact page</a>.</p>

      <h2>8. Children and updates</h2>
      <p>Our store is intended for adults who can enter a purchase contract. We do not knowingly collect personal information from children. We may update this policy as the store changes; the latest version will always be published here.</p>
    </LegalPage>
  );
}
