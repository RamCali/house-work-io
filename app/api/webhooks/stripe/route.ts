import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/monitoring"
import { sendQuoteAcceptedContractorEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    logger.error("Stripe webhook signature verification failed", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
        break

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case "account.updated":
        await handleAccountUpdated(event.data.object as Stripe.Account)
        break

      default:
        logger.info(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    logger.error("Webhook handler error", error, { eventType: event.type })
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const quoteId = paymentIntent.metadata.quoteId

  if (!quoteId) {
    logger.warn("Payment succeeded but no quoteId in metadata", { paymentIntentId: paymentIntent.id })
    return
  }

  // Update quote status to PAID
  const quote = await prisma.quote.update({
    where: { id: quoteId },
    data: { 
      status: "ACCEPTED",
      // You might want to add a paymentStatus field
    },
    include: {
      contractor: true,
      rfq: {
        include: { user: true }
      }
    }
  })

  // Send notification to contractor
  await sendQuoteAcceptedContractorEmail({
    to: quote.contractor.email,
    contractorName: quote.contractor.businessName,
    homeownerName: quote.rfq.user.name || quote.rfq.user.email,
    amount: quote.amount,
    rfqDescription: quote.rfq.description,
  })

  logger.info("Payment succeeded and quote updated", { quoteId, paymentIntentId: paymentIntent.id })
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const quoteId = paymentIntent.metadata.quoteId

  if (!quoteId) {
    return
  }

  // Log payment failure
  logger.error("Payment failed", null, { 
    quoteId, 
    paymentIntentId: paymentIntent.id,
    lastPaymentError: paymentIntent.last_payment_error 
  })

  // You might want to notify the user
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const quoteId = session.metadata?.quoteId

  if (!quoteId) {
    return
  }

  logger.info("Checkout session completed", { quoteId, sessionId: session.id })
}

async function handleAccountUpdated(account: Stripe.Account) {
  // Update contractor's Stripe account status in database
  const contractor = await prisma.contractor.findFirst({
    where: { stripeAccountId: account.id }
  })

  if (contractor) {
    // Update account capabilities or status
    logger.info("Contractor Stripe account updated", { 
      contractorId: contractor.id,
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      detailsSubmitted: account.details_submitted
    })
  }
}
