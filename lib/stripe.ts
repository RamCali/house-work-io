import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
})

/**
 * Create a Stripe Connect account for a contractor
 */
export async function createContractorAccount(data: {
  email: string
  businessName: string
  country?: string
}) {
  try {
    const account = await stripe.accounts.create({
      type: "express",
      country: data.country || "US",
      email: data.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "company",
      company: {
        name: data.businessName,
      },
    })

    return { success: true, accountId: account.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Create an account link for contractor onboarding
 */
export async function createAccountLink(accountId: string, returnUrl: string, refreshUrl: string) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    })

    return { success: true, url: accountLink.url }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Create a payment intent for accepting a quote
 * Uses Stripe Connect to split payment between platform and contractor
 */
export async function createQuotePayment(data: {
  amount: number // in cents
  contractorAccountId: string
  customerId?: string
  quoteId: string
  platformFeePercent?: number // default 10%
}) {
  try {
    const platformFee = Math.round(data.amount * (data.platformFeePercent || 0.1))
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: data.amount,
      currency: "usd",
      customer: data.customerId,
      application_fee_amount: platformFee,
      transfer_data: {
        destination: data.contractorAccountId,
      },
      metadata: {
        quoteId: data.quoteId,
        platformFee: platformFee.toString(),
      },
    })

    return { 
      success: true, 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id 
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Create or retrieve a Stripe customer
 */
export async function createOrGetCustomer(data: {
  email: string
  name?: string
  userId: string
}) {
  try {
    // Search for existing customer
    const customers = await stripe.customers.list({
      email: data.email,
      limit: 1,
    })

    if (customers.data.length > 0) {
      return { success: true, customerId: customers.data[0].id }
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email: data.email,
      name: data.name,
      metadata: {
        userId: data.userId,
      },
    })

    return { success: true, customerId: customer.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Create a Checkout Session for quote payment
 */
export async function createCheckoutSession(data: {
  amount: number
  contractorAccountId: string
  quoteId: string
  successUrl: string
  cancelUrl: string
  customerEmail: string
}) {
  try {
    const platformFee = Math.round(data.amount * 0.1) // 10% platform fee

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: data.customerEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Home Service Quote",
              description: `Payment for quote #${data.quoteId}`,
            },
            unit_amount: data.amount,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: data.contractorAccountId,
        },
        metadata: {
          quoteId: data.quoteId,
        },
      },
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      metadata: {
        quoteId: data.quoteId,
      },
    })

    return { success: true, sessionId: session.id, url: session.url }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Refund a payment
 */
export async function refundPayment(paymentIntentId: string, reason?: string) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: reason as any,
    })

    return { success: true, refundId: refund.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Get account balance
 */
export async function getAccountBalance(accountId: string) {
  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: accountId,
    })

    return { success: true, balance }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
