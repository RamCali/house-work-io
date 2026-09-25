# 🚀 Quick Deploy to Production (30 Minutes)

## Step 1: Database Setup (5 min)

### Using Neon (Easiest)
```bash
# 1. Go to https://neon.tech
# 2. Sign up / Sign in
# 3. Click "Create Project"
# 4. Name: "muse-connector-prod"
# 5. Copy the connection string shown

# 6. Back in your terminal:
export DATABASE_URL="postgresql://..."  # Paste your connection string

# 7. Run migrations:
npm run db:push
npm run db:seed
```

## Step 2: Generate Secrets (1 min)

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Copy the output - you'll need it next
```

## Step 3: Deploy to Vercel (10 min)

### Option A: GitHub + Vercel (Recommended)
```bash
# 1. Push to GitHub (if you haven't already)
git remote add origin https://github.com/YOUR_USERNAME/muse-connector.git
git push -u origin main

# 2. Go to https://vercel.com
# 3. Click "Add New Project"
# 4. Import your GitHub repository
# 5. Configure environment variables (see below)
# 6. Click "Deploy"
```

### Option B: Vercel CLI
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Add environment variables in Vercel dashboard
# 5. Deploy to production
vercel --prod
```

## Step 4: Environment Variables in Vercel (5 min)

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

### **Required** (Minimum to run)
```
DATABASE_URL          = [Your Neon connection string]
NEXTAUTH_SECRET       = [Output from openssl command]
NEXTAUTH_URL          = [Your Vercel URL, e.g. https://muse-connector.vercel.app]
NEXT_PUBLIC_APP_URL   = [Same as NEXTAUTH_URL]
NODE_ENV              = production
SANDBOX_MODE          = false
```

### **Optional** (Add later for full features)
```
# Payments (for accepting quotes)
STRIPE_SECRET_KEY     = sk_live_... (from stripe.com)
STRIPE_WEBHOOK_SECRET = whsec_... (after setting up webhook)

# Email notifications
RESEND_API_KEY        = re_... (from resend.com)
FROM_EMAIL            = noreply@yourdomain.com

# Contractor integrations
JOBBER_API_KEY        = [from Jobber]
HOUSECALL_PRO_API_KEY = [from Housecall Pro]

# Monitoring (optional)
SENTRY_DSN            = [from sentry.io]
AXIOM_TOKEN           = [from axiom.co]
```

## Step 5: Test Your Deployment (5 min)

```bash
# 1. Visit your Vercel URL
# 2. Click "Homeowner Portal"
# 3. Sign up with a test email
# 4. Create a test RFQ
# 5. Check it appears in dashboard

# If everything works, you're live! 🎉
```

## Step 6: Set Up Stripe Webhooks (5 min)

**Only if you added Stripe keys:**

```bash
# 1. Go to https://dashboard.stripe.com/webhooks
# 2. Click "Add endpoint"
# 3. Endpoint URL: https://your-domain.vercel.app/api/webhooks/stripe
# 4. Select events:
#    - payment_intent.succeeded
#    - payment_intent.payment_failed
#    - checkout.session.completed
# 5. Copy the "Signing secret" (starts with whsec_)
# 6. Add to Vercel env vars as STRIPE_WEBHOOK_SECRET
# 7. Redeploy: vercel --prod
```

## Step 7: Submit to Meta Muse (Optional)

Follow the complete guide in `META_SUBMISSION_CHECKLIST.md`

---

## 🎯 Minimal Launch (Just Required Variables)

You can launch with JUST these 4 variables:
```
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
NEXT_PUBLIC_APP_URL
```

Everything will work except:
- ❌ Payments (need Stripe)
- ❌ Email notifications (need Resend)
- ❌ Real contractor sync (need Jobber/HCP)

But you'll have:
- ✅ Full OAuth authentication
- ✅ RFQ creation and management
- ✅ Sandbox quotes (auto-generated)
- ✅ Homeowner and contractor portals
- ✅ Audit trail
- ✅ Modern UI

**Add other services later as needed!**

---

## 🆘 Troubleshooting

### "Application error" on Vercel
- Check Vercel logs: vercel logs
- Verify DATABASE_URL is correct
- Ensure NEXTAUTH_SECRET is set

### Database connection errors
- Check connection string has `?sslmode=require`
- Verify database is accessible from Vercel
- Try connecting from terminal: `psql $DATABASE_URL`

### OAuth not working
- Verify NEXTAUTH_URL matches your domain
- Check NEXTAUTH_SECRET is set
- Ensure it's exactly your production URL (no trailing slash)

---

## ✅ You're Done!

Your production app is live at your Vercel URL!

**Next steps:**
1. Share with beta users
2. Monitor errors in Vercel logs
3. Add payment/email services when ready
4. Submit to Meta Muse portal
5. Scale as needed

**Cost:** ~$60/month for 1,000 users (see PRODUCTION_READY_SUMMARY.md)
