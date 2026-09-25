# Meta Muse Connector Submission Checklist

## Pre-Submission Requirements

### ✅ Technical Implementation

- [x] **OAuth 2.0 Authorization Code + PKCE Flow**
  - Authorization endpoint: `/api/oauth/authorize`
  - Token endpoint: `/api/oauth/token`
  - Revocation endpoint: `/api/v1/user/revoke`
  - PKCE challenge validation implemented
  - Tested in e2e suite

- [x] **OpenAPI 3.1 Specification**
  - File: `openapi.yaml`
  - Validated with Redocly CLI
  - All endpoints documented
  - Authentication flows defined
  - Response schemas complete

- [x] **MCP Server**
  - Location: `mcp-server/index.ts`
  - Exposes all API operations as tools
  - Tested and working
  - Can be started with: `cd mcp-server && npx tsx index.ts`

- [x] **Consent-First Design**
  - Preview endpoint: `/api/v1/rfqs/[id]/preview`
  - Explicit consent required before sharing
  - Consent logged in audit trail
  - User can revoke at any time

- [x] **Audit Trail**
  - Immutable consent history
  - All actions logged
  - Available via: `/api/v1/consent/history`
  - Includes: SHARE, ACCEPT, REVOKE events

### ✅ API Endpoints (All Implemented)

**Authentication:**
- POST `/api/oauth/authorize` - Start OAuth flow
- POST `/api/oauth/token` - Exchange code for token
- POST `/api/v1/user/revoke` - Revoke all tokens

**Service Requests (RFQs):**
- GET `/api/v1/rfqs` - List user's RFQs
- POST `/api/v1/rfqs` - Create new RFQ
- GET `/api/v1/rfqs/[id]` - Get RFQ details
- GET `/api/v1/rfqs/[id]/preview` - Preview before consent
- POST `/api/v1/rfqs/[id]/submit` - Submit with consent

**Quotes:**
- GET `/api/v1/rfqs/[id]/quotes` - List quotes for RFQ
- POST `/api/v1/quotes/[id]/accept` - Accept a quote
- POST `/api/v1/quotes/[id]/decline` - Decline a quote

**Audit:**
- GET `/api/v1/consent/history` - User's consent history

### ✅ Security

- [x] HTTPS required in production
- [x] OAuth 2.0 with PKCE
- [x] Secure token storage
- [x] Rate limiting ready
- [x] CORS configured
- [x] Input validation (Zod schemas)
- [x] SQL injection protection (Prisma ORM)
- [x] XSS protection (Next.js built-in)
- [x] CSRF protection (NextAuth)

### ✅ Testing

- [x] Unit tests: 35 passing
- [x] E2E test: Passing with full OAuth flow
- [x] PKCE validation tested
- [x] Token revocation tested
- [x] Consent flow tested
- [x] All API endpoints tested

### ✅ Documentation

- [x] README.md - Setup and overview
- [x] API.md - API documentation
- [x] MUSE-SUBMISSION.md - Integration guide
- [x] openapi.yaml - Machine-readable API spec
- [x] Privacy Policy page
- [x] Terms of Service page
- [x] Verification policy page

### ✅ User Experience

- [x] Clear consent UI with preview
- [x] User-friendly error messages
- [x] Mobile-responsive design
- [x] Loading states
- [x] Success/error notifications
- [x] Homeowner dashboard
- [x] Contractor portal

## Submission Package

### 📦 Files to Submit

1. **`openapi.yaml`** - Complete API specification
2. **`META_CONNECTOR_INFO.json`** - Connector metadata (create below)
3. **`INTEGRATION_GUIDE.md`** - Copy of MUSE-SUBMISSION.md
4. **Screenshots** (create with walkthrough-artifacts skill):
   - OAuth consent screen
   - RFQ preview screen
   - Dashboard with quotes
   - Audit trail view
5. **Demo Video** (2-3 minutes):
   - Full user flow from auth to accepting quote
   - Emphasize consent and preview steps

### 📄 Connector Metadata (Create This)

Create `META_CONNECTOR_INFO.json`:

```json
{
  "name": "Muse Home Services Connector",
  "version": "1.0.0",
  "description": "Connect homeowners with verified contractors for home repair and improvement services. Get instant quotes with full consent control.",
  "category": "home_services",
  "icon_url": "https://your-domain.com/icon.png",
  "website": "https://your-domain.com",
  "support_email": "support@your-domain.com",
  "privacy_policy": "https://your-domain.com/privacy",
  "terms_of_service": "https://your-domain.com/terms",
  "oauth": {
    "authorization_url": "https://your-domain.com/api/oauth/authorize",
    "token_url": "https://your-domain.com/api/oauth/token",
    "revoke_url": "https://your-domain.com/api/v1/user/revoke",
    "scopes": [
      "rfq:read",
      "rfq:write",
      "quotes:read",
      "quotes:accept",
      "profile:read",
      "consent:read"
    ]
  },
  "api": {
    "base_url": "https://your-domain.com/api/v1",
    "openapi_spec_url": "https://your-domain.com/openapi.yaml",
    "mcp_server_url": "https://your-domain.com/mcp"
  },
  "features": [
    "OAuth 2.0 + PKCE authentication",
    "Consent-first data sharing",
    "Immutable audit trail",
    "Real-time quote updates",
    "Verified contractor network",
    "Multi-trade support (HVAC, Plumbing, Electrical, etc.)"
  ],
  "compliance": {
    "gdpr": true,
    "ccpa": true,
    "data_retention_days": 365,
    "data_export": true,
    "right_to_delete": true
  }
}
```

## Pre-Submission Testing

### 1. Test OAuth Flow with Meta's Validator

```bash
# Meta will provide a testing tool
# Test these scenarios:
1. Successful authorization
2. User denies consent
3. Invalid PKCE verifier (should fail)
4. Token refresh
5. Token revocation
```

### 2. Verify OpenAPI Spec

```bash
npm install -g @redocly/cli
redocly lint openapi.yaml
```

### 3. Test MCP Server

```bash
cd mcp-server
npx tsx index.ts
# Should output: "Muse Connector MCP server running on stdio"
# Test each tool listed in the server
```

### 4. Security Scan

```bash
# Run security audit
npm audit --production

# Should show minimal vulnerabilities
# Document any that remain and why they're acceptable
```

### 5. Load Testing

```bash
# Install k6 or Apache Bench
# Test key endpoints:
- POST /api/v1/rfqs (100 req/s)
- GET /api/v1/rfqs (500 req/s)
- POST /api/oauth/token (50 req/s)

# Ensure rate limiting works
# Ensure no errors under load
```

## Submission Process

### Step 1: Register Developer Account
1. Visit Meta for Developers portal
2. Create developer account
3. Verify email and phone
4. Complete business verification

### Step 2: Create Connector App
1. Go to Muse Connectors section
2. Click "Create New Connector"
3. Fill in basic information
4. Upload connector icon (512x512 PNG)

### Step 3: Submit Technical Details
1. Upload `META_CONNECTOR_INFO.json`
2. Provide production API URLs
3. Submit OpenAPI specification
4. Configure OAuth callback URLs
5. Set webhook endpoints (if needed)

### Step 4: Submit Media Assets
1. Screenshots (5-10 images)
   - OAuth consent screen
   - Main features
   - Mobile views
2. Demo video (2-3 minutes)
   - Full user journey
   - Highlight consent mechanism
3. Connector icon (512x512)
4. Banner image (1200x630)

### Step 5: Provide Documentation
1. Upload integration guide
2. Link to API documentation
3. Link to privacy policy
4. Link to terms of service
5. Verification policy

### Step 6: Testing & Review
1. Meta will test OAuth flow
2. Meta will test API endpoints
3. May request changes/fixes
4. Address feedback promptly
5. Resubmit if needed

### Step 7: Approval & Launch
1. Receive approval notification
2. Connector goes live in Muse app
3. Monitor for issues
4. Respond to user feedback

## Post-Launch

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Monitor API usage and performance
- [ ] Track conversion rates (OAuth → RFQ → Quote)
- [ ] Set up alerting for failures

### Support
- [ ] Create support email/system
- [ ] Document common issues
- [ ] Prepare FAQs
- [ ] Plan response time SLA

### Marketing
- [ ] Announce launch
- [ ] Create user guides
- [ ] Produce tutorial videos
- [ ] Engage with early users

### Iteration
- [ ] Collect user feedback
- [ ] Monitor analytics
- [ ] Plan feature updates
- [ ] Submit updates to Meta for review

## Common Rejection Reasons (Avoid These)

❌ **OAuth Issues**
- Callback URLs don't match
- PKCE not properly validated
- Token expiration too long/short
- No token revocation endpoint

❌ **API Problems**
- Incomplete OpenAPI spec
- Undocumented endpoints
- Inconsistent error responses
- Missing rate limiting

❌ **Security Concerns**
- No HTTPS
- Weak authentication
- No consent mechanism
- Inadequate data protection

❌ **Documentation Gaps**
- Missing privacy policy
- Unclear terms of service
- Incomplete API docs
- No integration guide

❌ **User Experience**
- Confusing consent flow
- Poor error messages
- Broken mobile experience
- Missing critical features

## Support Resources

- **Meta Muse Docs:** https://developers.facebook.com/docs/muse
- **OAuth 2.0 + PKCE:** https://oauth.net/2/pkce/
- **OpenAPI 3.1:** https://swagger.io/specification/
- **MCP Protocol:** https://modelcontextprotocol.io

## Questions?

Before submitting, ensure:
1. All endpoints return proper HTTP status codes
2. Error messages are user-friendly
3. OAuth flow is smooth and secure
4. Consent mechanism is clear and prominent
5. Documentation is complete and accurate
6. Testing is comprehensive
7. Production deployment is stable

**Ready to submit when all checkboxes above are complete!** ✅
