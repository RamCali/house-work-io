export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full mb-4">
            DRAFT - NOT LEGAL ADVICE
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-600">
            Last updated: September 25, 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Overview</h2>
            <p className="text-slate-700 leading-relaxed">
              Muse Connector connects homeowners with verified home service contractors through
              the Meta Muse personal agent platform. This policy explains how we collect, use,
              and protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Information We Collect</h2>
            <p className="text-slate-700 leading-relaxed mb-4">We collect information you provide when:</p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>Creating service requests (RFQs): property details, service needs, photos</li>
              <li>Linking your account via OAuth: name, email</li>
              <li>Interacting through Muse agent: conversation context shared with consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Your information is used exclusively for:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>Connecting you with verified contractors for your service requests</li>
              <li>Facilitating quote delivery and acceptance</li>
              <li>Maintaining service history for your reference</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mt-4">
              <strong>We never sell or share your data beyond the contractors you explicitly approve.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Consent &amp; Data Sharing</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Before any data is shared with contractors, you will:
            </p>
            <ol className="list-decimal list-inside text-slate-700 space-y-2 ml-4">
              <li>Preview exactly what information will be shared</li>
              <li>See which contractors will receive your request</li>
              <li>Provide explicit consent to share</li>
            </ol>
            <p className="text-slate-700 leading-relaxed mt-4">
              We maintain an immutable audit log of all sharing events for your records.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Data Retention</h2>
            <p className="text-slate-700 leading-relaxed">
              We retain your service requests and quotes for 2 years after completion or cancellation
              for reference and dispute resolution. You may request deletion at any time from your dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Your Rights</h2>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>View all data shared with contractors</li>
              <li>Revoke OAuth access at any time</li>
              <li>Request complete data deletion</li>
              <li>Export your service history</li>
              <li>Access audit logs of all consent events</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Security</h2>
            <p className="text-slate-700 leading-relaxed">
              We use industry-standard encryption (TLS 1.3) for data in transit, encrypt sensitive
              data at rest, implement OAuth 2.0 with PKCE for secure authentication, and log all
              access to personal data for audit purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Third-Party Services</h2>
            <p className="text-slate-700 leading-relaxed">
              Contractors use their own CRM systems (Jobber, Housecall Pro) to manage quotes.
              Once you accept a quote, the contractor's privacy policy applies to their service delivery.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Changes to This Policy</h2>
            <p className="text-slate-700 leading-relaxed">
              We will notify you of material changes via email 30 days before they take effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Contact</h2>
            <p className="text-slate-700 leading-relaxed">
              For privacy questions or to exercise your rights, email:{" "}
              <a href="mailto:privacy@museconnector.example" className="text-blue-600 hover:text-blue-700">
                privacy@museconnector.example
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            This is a draft policy template. Consult with legal counsel before deployment.
          </p>
        </div>
      </div>
    </div>
  )
}
