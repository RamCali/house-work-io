import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@muse-connector.com"

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions) {
  if (!resend) {
    console.warn("Resend not configured, email not sent:", options.subject)
    return { success: false, error: "Email service not configured" }
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    return { success: true, id: result.data?.id }
  } catch (error: any) {
    console.error("Failed to send email:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Email Templates
 */

export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail({
    to,
    subject: "Welcome to Muse Connector",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to Muse Connector, ${name}!</h1>
        <p>Thank you for joining our platform. You can now get quotes from verified contractors for your home service needs.</p>
        <h2>Getting Started:</h2>
        <ol>
          <li>Connect through your Muse agent</li>
          <li>Describe your project</li>
          <li>Review and approve contractor sharing</li>
          <li>Receive competitive quotes</li>
          <li>Choose the best contractor for you</li>
        </ol>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p style="margin-top: 40px; color: #64748b; font-size: 14px;">
          Best regards,<br>
          The Muse Connector Team
        </p>
      </div>
    `,
  })
}

export async function sendQuoteReceivedEmail(data: {
  to: string
  name: string
  contractorName: string
  amount: number
  rfqDescription: string
  quoteId: string
}) {
  return sendEmail({
    to: data.to,
    subject: `New Quote Received from ${data.contractorName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">New Quote Received!</h1>
        <p>Hi ${data.name},</p>
        <p>You've received a new quote for your service request:</p>
        
        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Project:</strong> ${data.rfqDescription}</p>
          <p style="margin: 10px 0;"><strong>Contractor:</strong> ${data.contractorName}</p>
          <p style="margin: 10px 0;"><strong>Quote Amount:</strong> $${(data.amount / 100).toLocaleString()}</p>
        </div>

        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
            View Quote
          </a>
        </p>

        <p style="margin-top: 40px; color: #64748b; font-size: 14px;">
          You can review and accept quotes anytime through your dashboard.
        </p>
      </div>
    `,
  })
}

export async function sendQuoteAcceptedContractorEmail(data: {
  to: string
  contractorName: string
  homeownerName: string
  amount: number
  rfqDescription: string
}) {
  return sendEmail({
    to: data.to,
    subject: "Your Quote Was Accepted!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">Congratulations! Your Quote Was Accepted</h1>
        <p>Hi ${data.contractorName},</p>
        <p>Great news! Your quote has been accepted by ${data.homeownerName}.</p>
        
        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Project:</strong> ${data.rfqDescription}</p>
          <p style="margin: 10px 0;"><strong>Amount:</strong> $${(data.amount / 100).toLocaleString()}</p>
        </div>

        <p><strong>Next Steps:</strong></p>
        <ol>
          <li>Contact the homeowner to schedule</li>
          <li>Complete the work as quoted</li>
          <li>Payment will be processed after completion</li>
        </ol>

        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/contractor" 
             style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
            View Details
          </a>
        </p>
      </div>
    `,
  })
}

export async function sendRFQSubmittedEmail(data: {
  to: string
  name: string
  trade: string
  description: string
  rfqId: string
}) {
  return sendEmail({
    to: data.to,
    subject: "Your Service Request Has Been Submitted",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Request Submitted Successfully</h1>
        <p>Hi ${data.name},</p>
        <p>Your service request has been shared with verified contractors in your area.</p>
        
        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Service:</strong> ${data.trade}</p>
          <p style="margin: 10px 0;"><strong>Description:</strong> ${data.description}</p>
        </div>

        <p>You should start receiving quotes within 24-48 hours. We'll notify you as soon as contractors respond.</p>

        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
            View Request
          </a>
        </p>

        <p style="margin-top: 40px; color: #64748b; font-size: 14px;">
          Remember: You can revoke contractor access at any time from your dashboard.
        </p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(to: string, resetToken: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`

  return sendEmail({
    to,
    subject: "Reset Your Password",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Reset Your Password</h1>
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        
        <p>
          <a href="${resetUrl}" 
             style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Reset Password
          </a>
        </p>

        <p style="color: #64748b; font-size: 14px;">
          This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
        </p>

        <p style="color: #64748b; font-size: 12px; margin-top: 40px;">
          If the button doesn't work, copy and paste this URL into your browser:<br>
          ${resetUrl}
        </p>
      </div>
    `,
  })
}
