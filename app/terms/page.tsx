export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full mb-4">
            DRAFT - NOT LEGAL ADVICE
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-slate-600">
            Last updated: September 25, 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Service Description</h2>
            <p className="text-slate-700 leading-relaxed">
              Muse Connector is a platform that connects homeowners with verified home service
              contractors through the Meta Muse agent interface. We facilitate quote requests
              and delivery but do not perform the actual home services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. User Responsibilities</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              By using Muse Connector, you agree to:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>Provide accurate information in service requests</li>
              <li>Respond to contractor quotes in a timely manner</li>
              <li>Honor accepted quotes or communicate cancellations promptly</li>
              <li>Use the platform for legitimate home service needs only</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. Contractor Verification</h2>
            <p className="text-slate-700 leading-relaxed">
              While we verify contractor licenses and insurance before listing, we are not liable
              for the quality, timeliness, or outcome of contractor services. See our{" "}
              <a href="/verification" className="text-blue-600 hover:text-blue-700">
                Contractor Verification Policy
              </a>{" "}
              for details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Payments</h2>
            <p className="text-slate-700 leading-relaxed">
              Optional booking deposits are processed via Stripe Link. Final payment arrangements
              are between you and the contractor. We do not hold, escrow, or guarantee payments.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Limitation of Liability</h2>
            <p className="text-slate-700 leading-relaxed">
              Muse Connector acts as a connection platform only. We are not responsible for:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>Quality or completion of contractor work</li>
              <li>Property damage or personal injury during service</li>
              <li>Disputes between homeowners and contractors</li>
              <li>Contractor insolvency or license revocation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Dispute Resolution</h2>
            <p className="text-slate-700 leading-relaxed">
              For service disputes, contact the contractor directly. For platform issues,
              email support@museconnector.example. We provide audit logs and consent records
              to assist in dispute resolution.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Termination</h2>
            <p className="text-slate-700 leading-relaxed">
              You may revoke OAuth access at any time. We may suspend accounts that violate
              these terms or applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Changes to Terms</h2>
            <p className="text-slate-700 leading-relaxed">
              We will notify you of material changes 30 days before they take effect. Continued
              use constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Contact</h2>
            <p className="text-slate-700 leading-relaxed">
              Questions? Email:{" "}
              <a href="mailto:legal@museconnector.example" className="text-blue-600 hover:text-blue-700">
                legal@museconnector.example
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            This is a draft terms template. Consult with legal counsel before deployment.
          </p>
        </div>
      </div>
    </div>
  )
}
