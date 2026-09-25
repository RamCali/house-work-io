export default function VerificationPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Contractor Verification Policy
        </h1>
        <p className="text-slate-600 mb-8">
          Last updated: September 25, 2026
        </p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Verification Requirements</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              All contractors must meet these requirements before listing:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li><strong>Active License:</strong> Valid state/local contractor license for their trade</li>
              <li><strong>General Liability Insurance:</strong> Minimum $1M coverage, verified annually</li>
              <li><strong>Workers' Compensation:</strong> If required by state law</li>
              <li><strong>Background Check:</strong> Criminal background screening (where permitted)</li>
              <li><strong>Business Verification:</strong> Registered business entity with tax ID</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Verification Process</h2>
            <ol className="list-decimal list-inside text-slate-700 space-y-3 ml-4">
              <li>
                <strong>Application:</strong> Contractor submits license, insurance, and business documents
              </li>
              <li>
                <strong>Document Review:</strong> Our team verifies authenticity with issuing authorities
              </li>
              <li>
                <strong>Reference Checks:</strong> Minimum 3 recent customer references
              </li>
              <li>
                <strong>Approval:</strong> Contractor receives "Verified" status and can receive RFQs
              </li>
            </ol>
            <p className="text-slate-700 leading-relaxed mt-4">
              Typical verification takes 3-5 business days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Ongoing Monitoring</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We continuously monitor contractor status:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>Annual license and insurance renewal verification</li>
              <li>Review of customer feedback and complaints</li>
              <li>Monitoring of state licensing board actions</li>
              <li>Suspension for unresolved disputes or expired credentials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">What Verification Does NOT Cover</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Important limitations:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>We do not guarantee quality of work or customer satisfaction</li>
              <li>We do not inspect contractor facilities or equipment</li>
              <li>We do not verify pricing competitiveness</li>
              <li>We do not guarantee contractor availability or response times</li>
              <li>We do not act as an escrow or payment processor</li>
            </ul>
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900">
                <strong>⚠️ Important:</strong> Verification confirms credentials only. Homeowners should
                still review quotes carefully, verify contractor identity on-site, and use standard
                contracting best practices (written agreements, payment schedules, etc.).
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Reporting Issues</h2>
            <p className="text-slate-700 leading-relaxed">
              If you encounter problems with a verified contractor, report them immediately to{" "}
              <a href="mailto:verify@museconnector.example" className="text-blue-600 hover:text-blue-700">
                verify@museconnector.example
              </a>
              . Include your RFQ ID and details of the issue.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
