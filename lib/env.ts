import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url(),
    NEXTAUTH_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    ENABLE_STRIPE_PAYMENTS: z.string().default("false"),
    SANDBOX_MODE: z.string().default("true"),
    DEFAULT_METRO: z.string().default("San Francisco Bay Area"),
    DEFAULT_TRADE: z.string().default("HVAC"),
  },
  client: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    ENABLE_STRIPE_PAYMENTS: process.env.ENABLE_STRIPE_PAYMENTS,
    SANDBOX_MODE: process.env.SANDBOX_MODE,
    DEFAULT_METRO: process.env.DEFAULT_METRO,
    DEFAULT_TRADE: process.env.DEFAULT_TRADE,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
})
