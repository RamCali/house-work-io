# Muse Connector

> **Agent-friendly home services quote platform for Meta Muse**

Muse Connector connects homeowners with verified home service contractors through Meta's Muse personal agent platform. Built with consent-first architecture, granular OAuth scopes, and complete audit logging.

## 🚀 **Quick Deploy to Production**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FRamCali%2FHouse-Work&env=DATABASE_URL,NEXTAUTH_SECRET,NEXTAUTH_URL,NEXT_PUBLIC_APP_URL&envDescription=Required%20environment%20variables&project-name=house-work&repository-name=house-work)

**Production ready in 30 minutes!** See **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** for step-by-step guide.

## 🚀 Features

- **OAuth 2.0 Provider** with PKCE for secure agent linking
- **Consent-First Architecture** - preview data before every share
- **Granular Scopes** - separate read/write permissions for RFQs and quotes
- **Audit Logging** - immutable log of all sharing and acceptance events
- **Sandbox Mode** - test contractors auto-generate realistic quotes
- **Contractor Integrations** - abstracted layer with Jobber and Housecall Pro adapters (stubbed)
- **OpenAPI 3.1 Spec** - agent-friendly API documentation
- **MCP Server Ready** - tools for seamless Muse integration

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** database (Neon recommended)
- **Git**

## 🛠️ Local Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd muse-connector
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your database credentials. The Neon Postgres connection string is already configured for this project.

### 3. Database Setup

```bash
# Run migrations
npm run db:migrate

# Seed with sandbox data
npm run db:seed
```

This creates:
- 3 sandbox contractors (HVAC, roofing trades)
- Demo homeowner account: `demo@example.com` / `demo123`
- Demo admin account: `admin@example.com` / `admin123`

### 4. Start Development Server

```bash
npm run dev
```

App runs at: **http://localhost:43123**

### 5. Test Sandbox Flow

The sandbox is pre-configured with test contractors that auto-generate quotes.

**Demo credentials:**
- Homeowner: `demo@example.com` / `demo123`
- Admin: `admin@example.com` / `admin123`

## 🧪 End-to-End Test Script

Follow this to verify the complete flow:

### Via OAuth (Agent Integration)

1. **Link Account**
   ```
   GET http://localhost:43123/oauth/authorize?
       client_id=muse-agent&
       redirect_uri=https://muse.ai/callback&
       scope=rfq:read rfq:write quotes:read quotes:accept profile:read&
       state=random-state&
       code_challenge=YOUR_CODE_CHALLENGE&
       code_challenge_method=S256&
       response_type=code
   ```

2. **Exchange Code for Token**
   ```bash
   curl -X POST http://localhost:43123/api/oauth/token \
     -d "grant_type=authorization_code" \
     -d "code=YOUR_CODE" \
     -d "redirect_uri=https://muse.ai/callback" \
     -d "client_id=muse-agent" \
     -d "code_verifier=YOUR_CODE_VERIFIER"
   ```

3. **Create RFQ**
   ```bash
   curl -X POST http://localhost:43123/api/v1/rfqs \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "trade": "HVAC",
       "zipCode": "94102",
       "description": "AC not cooling, need urgent repair",
       "urgency": "ASAP",
       "budgetBand": "1K_5K"
     }'
   ```

4. **Preview Sharing**
   ```bash
   curl http://localhost:43123/api/v1/rfqs/{rfq_id}/preview \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

5. **Submit with Consent**
   ```bash
   curl -X POST http://localhost:43123/api/v1/rfqs/{rfq_id}/submit \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "contractorIds": ["contractor_id_1", "contractor_id_2"],
       "consent": true
     }'
   ```

6. **Wait for Quotes** (sandbox auto-generates after 2 seconds)

7. **List Quotes**
   ```bash
   curl http://localhost:43123/api/v1/rfqs/{rfq_id} \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

8. **Accept Quote**
   ```bash
   curl -X POST http://localhost:43123/api/v1/quotes/{quote_id}/accept \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

9. **View Audit Trail**
   ```bash
   curl http://localhost:43123/api/v1/consent/history \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

10. **Revoke Access**
    ```bash
    curl -X POST http://localhost:43123/api/v1/user/revoke \
      -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
    ```

## 🏗️ Architecture

### Stack
- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL via Neon (Prisma ORM)
- **Auth:** NextAuth.js + custom OAuth provider
- **Payments:** Stripe (placeholder, behind feature flag)

### Data Models

- **User** - homeowner accounts
- **RFQ** (Request for Quote) - service requests with status tracking
- **Contractor** - verified service providers with integration config
- **Quote** - contractor proposals with pricing and timeline
- **RFQShare** - tracking which contractors received which RFQs
- **ConsentLog** - immutable audit trail of all consequential actions
- **OAuthToken** - access tokens for API authentication

### Consent Gates

Every consequential action requires explicit user approval:

1. **Preview** → shows exact data to be shared
2. **Consent** → user explicitly approves sharing with specific contractors
3. **Submit** → data is shared, consent logged
4. **Accept** → quote acceptance logged
5. **Payment** → (future) payment authorization logged

## 📚 API Documentation

- **OpenAPI Spec:** `/openapi.yaml`
- **Interactive Docs:** (future) `/api/docs`

### Key Endpoints

| Endpoint | Scope | Description |
|----------|-------|-------------|
| `GET /api/v1/rfqs` | `rfq:read` | List user's RFQs |
| `POST /api/v1/rfqs` | `rfq:write` | Create draft RFQ |
| `GET /api/v1/rfqs/{id}/preview` | `rfq:read` | Preview data sharing |
| `POST /api/v1/rfqs/{id}/submit` | `rfq:write` | Submit with consent ⚠️ |
| `POST /api/v1/quotes/{id}/accept` | `quotes:accept` | Accept quote ⚠️ |
| `GET /api/v1/consent/history` | `profile:read` | View audit trail |
| `POST /api/v1/user/revoke` | `profile:read` | Revoke OAuth access |
| `DELETE /api/v1/user/data` | `profile:read` | Delete all data ⚠️ |

⚠️ = Consequential action requiring explicit user approval

## 🔒 Security

- **TLS 1.3** for all connections (production)
- **OAuth 2.0 with PKCE** prevents authorization code interception
- **Granular scopes** minimize data exposure
- **Consent logging** with immutable audit trail
- **No PII selling** - data shared only with approved contractors

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm test:watch

# Type check
npm run type-check
```

Tests cover:
- ✅ RFQ lifecycle (draft → preview → submit → quote → accept)
- ✅ Consent gating (prevents sharing without explicit approval)
- ✅ Audit logging (all events recorded)

## 🚢 Deployment

### Environment Variables

Ensure these are set in production:

- `DATABASE_URL` - production Postgres connection
- `NEXTAUTH_SECRET` - strong random secret
- `NEXTAUTH_URL` - production domain
- `STRIPE_SECRET_KEY` - (if payments enabled)

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Database Migration

```bash
npx prisma migrate deploy
```

## 📖 Additional Documentation

- **[Privacy Policy](/privacy)** - draft policy for agent-mediated data sharing
- **[Terms of Service](/terms)** - draft terms covering platform liability
- **[Verification Policy](/verification)** - contractor vetting requirements
- **[Muse Submission Guide](./docs/muse-submission.md)** - step-by-step for Meta review

## 🎯 Roadmap

### Phase 0 (Current - Concierge MVP)
- ✅ OAuth provider with PKCE
- ✅ REST API for RFQs and quotes
- ✅ Sandbox mode with auto-quotes
- ✅ Consent gates and audit logging
- ✅ Operator admin panel
- ✅ Stubbed contractor integrations

### Phase 1 (Supply Onboarding)
- [ ] Contractor portal
- [ ] Live Jobber API integration
- [ ] Live Housecall Pro integration
- [ ] Real contractor onboarding flow
- [ ] Expand to 3+ trades (plumbing, electrical, roofing)

### Phase 2 (Scale)
- [ ] Multi-metro support
- [ ] Real-time quote notifications
- [ ] Stripe Connect for escrow payments
- [ ] Contractor review system
- [ ] Photo upload with CDN

### Phase 3 (Meta Submission)
- [ ] Meta connector manifest
- [ ] End-to-end Muse integration tests
- [ ] Security audit
- [ ] Legal review of policies
- [ ] Submit to Muse Connector Platform

## 🛟 Support

- **Issues:** Open a GitHub issue
- **Security:** email security@museconnector.example
- **Privacy:** email privacy@museconnector.example

## 📄 License

Proprietary - All rights reserved

---

Built for the Meta Muse Connector Platform • September 2026
