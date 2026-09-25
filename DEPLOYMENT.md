# Deployment Guide

## Prerequisites

- [ ] Vercel account (or Railway/AWS/GCP account)
- [ ] Production PostgreSQL database (Neon, Supabase, or RDS)
- [ ] Domain name (optional but recommended)
- [ ] Stripe account (for payments)
- [ ] Resend account (for emails)
- [ ] Contractor CRM API keys (Jobber, Housecall Pro)

## Quick Deploy to Vercel

### 1. Prepare Database

**Using Neon (Recommended):**
```bash
# Install Neon CLI
npm install -g neonctl

# Create production database
neonctl projects create --name muse-connector-prod

# Get connection string
neonctl connection-string muse-connector-prod

# Run migrations
DATABASE_URL="your-connection-string" npm run db:push
DATABASE_URL="your-connection-string" npm run db:seed
```

**Using Supabase:**
```bash
# Create project at supabase.com
# Copy connection string from Settings > Database
# Run migrations
DATABASE_URL="your-connection-string" npm run db:push
```

### 2. Deploy to Vercel

**Option A: One-Click Deploy**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/muse-connector)

**Option B: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
# ... add all other env vars from .env.example

# Deploy to production
vercel --prod
```

### 3. Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

#### Required Variables
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your production URL (e.g., `https://muse-connector.vercel.app`)

#### Payment Variables
- `STRIPE_SECRET_KEY` - From Stripe Dashboard
- `STRIPE_PUBLISHABLE_KEY` - From Stripe Dashboard
- `STRIPE_WEBHOOK_SECRET` - Configure webhook endpoint first

#### Integration Variables
- `JOBBER_API_KEY` - From Jobber Developer Portal
- `HOUSECALL_PRO_API_KEY` - From Housecall Pro API Settings
- `RESEND_API_KEY` - From Resend Dashboard

#### Application Variables
- `NEXT_PUBLIC_APP_URL` - Your production URL
- `NODE_ENV=production`
- `SANDBOX_MODE=false` - **Important: Disable sandbox in production**

### 4. Set Up Webhooks

#### Stripe Webhooks
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.completed`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

#### Contractor CRM Webhooks (Optional)
Configure webhooks from Jobber/Housecall Pro to receive real-time updates:
- Endpoint: `https://your-domain.com/api/webhooks/jobber`
- Endpoint: `https://your-domain.com/api/webhooks/housecall-pro`

### 5. Configure Custom Domain

1. Add domain in Vercel Dashboard → Project Settings → Domains
2. Update DNS records as instructed
3. Update `NEXTAUTH_URL` to use custom domain
4. Update OAuth callback URLs in Meta Muse developer portal

### 6. Set Up Monitoring

**Vercel Analytics:**
Already enabled by default in Vercel projects.

**Sentry (Error Tracking):**
```bash
npm install @sentry/nextjs

# Follow Sentry setup wizard
npx @sentry/wizard@latest -i nextjs

# Add SENTRY_DSN to environment variables
```

**Uptime Monitoring:**
- Use Vercel's built-in monitoring
- Or set up external monitoring (Pingdom, UptimeRobot, Better Uptime)

### 7. Test Production Deployment

```bash
# Run production build locally first
npm run build
npm start

# Test critical paths:
# - Sign up / Sign in
# - Create RFQ
# - Submit RFQ with consent
# - Receive quotes
# - Accept quote
# - Verify audit trail
# - Revoke access
```

### 8. Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Custom domain configured (if using)
- [ ] SSL certificate active
- [ ] Webhooks configured and tested
- [ ] OAuth callbacks updated in Meta Muse portal
- [ ] Sandbox mode disabled
- [ ] Monitoring enabled
- [ ] Error tracking configured
- [ ] Backup strategy in place
- [ ] Rate limiting tested
- [ ] Test user accounts created
- [ ] Documentation updated with production URLs

## Alternative Deployment Options

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link project
railway login
railway link

# Add environment variables
railway variables set DATABASE_URL="..."

# Deploy
railway up
```

### Docker + AWS ECS

```dockerfile
# See docker-compose.yml for production setup
docker-compose -f docker-compose.prod.yml up -d
```

### Self-Hosted

1. Set up a Linux server (Ubuntu 22.04 recommended)
2. Install Node.js 18+, PostgreSQL, and Nginx
3. Clone repository and install dependencies
4. Configure environment variables
5. Set up PM2 for process management
6. Configure Nginx as reverse proxy
7. Set up SSL with Let's Encrypt

See `docs/SELF_HOSTING.md` for detailed instructions.

## Scaling Considerations

### Database
- Connection pooling (PgBouncer) for high traffic
- Read replicas for read-heavy workloads
- Regular backups (automated)

### Application
- Vercel automatically handles scaling
- For self-hosted: Use load balancer + multiple instances

### Performance
- Enable Next.js image optimization
- Configure CDN for static assets
- Implement Redis caching for frequent queries
- Use database indexes for common queries

## Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables secured
- [ ] Database uses SSL connections
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Content Security Policy headers
- [ ] Secrets rotation schedule
- [ ] Regular security audits
- [ ] DDoS protection (Vercel provides this)

## Monitoring & Maintenance

### Health Checks
- Endpoint: `https://your-domain.com/api/health`
- Check database connectivity
- Check external API availability

### Logs
- Vercel: View logs in dashboard
- Self-hosted: Use Winston + LogDNA/Datadog

### Backups
- Daily automated database backups
- Store in separate region/provider
- Test restore procedure monthly

### Updates
- Monitor npm audit for vulnerabilities
- Update dependencies monthly
- Test in staging before production
- Plan maintenance windows

## Troubleshooting

### Build Failures
```bash
# Check build logs
vercel logs --follow

# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Dependency conflicts
```

### Database Connection Issues
```bash
# Test connection locally
psql $DATABASE_URL

# Check SSL settings
# Ensure connection string includes sslmode=require
```

### OAuth Issues
- Verify callback URLs match production domain
- Check NEXTAUTH_URL is set correctly
- Ensure NEXTAUTH_SECRET is set

## Support

For deployment issues:
- Check logs: `vercel logs --follow`
- Vercel Support: https://vercel.com/support
- Open GitHub issue for app-specific problems
