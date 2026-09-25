# Muse Connector - Submission Guide for Meta Review

> **Draft submission materials for Meta's Muse Connector Platform**

## 📝 Product Description

**What is Muse Connector?**

Muse Connector helps homeowners get quotes from verified home service contractors through their Muse personal agent. Instead of calling multiple contractors or filling out web forms, homeowners describe their service need to Muse, and Muse uses our API to collect quotes from licensed, insured professionals in their area.

**Problem We Solve:**

Getting home service quotes is time-consuming and stressful. Homeowners don't know which contractors are trustworthy, what a fair price is, or how to compare options. Our platform:

1. Vets contractors (license, insurance, references)
2. Collects multiple quotes automatically
3. Presents options with clear pricing and timelines
4. Maintains consent records for transparency

**Initial Launch:**

- **Metro:** San Francisco Bay Area
- **Trade:** HVAC (heating, ventilation, air conditioning)
- **Supply Model:** Concierge (operator-managed during pilot)

## 🔐 Security & Privacy

### Data Handling

- **Consent-First:** Users preview exactly what will be shared before approval
- **Minimal Data:** We collect only what's needed for quotes (service description, ZIP, urgency, photos)
- **No Selling:** User data is never sold or shared beyond approved contractors
- **Audit Trail:** Immutable log of all sharing and acceptance events
- **User Control:** Revoke access or delete data anytime

### OAuth Implementation

- **Standard:** OAuth 2.0 Authorization Code Flow with PKCE (RFC 7636)
- **Scopes:** Granular permissions:
  - `rfq:read` - view service requests
  - `rfq:write` - create/manage requests
  - `quotes:read` - view contractor quotes
  - `quotes:accept` - accept or decline quotes
  - `profile:read` - view profile and consent history
- **Security:** TLS 1.3, secure token storage, refresh tokens

### Consequential Actions

Each action that shares data or commits the user requires:

1. **Preview** - show what will be shared
2. **Explicit Consent** - user must approve
3. **Audit Log** - record the consent event

Actions gated:
- Sharing RFQ with contractors
- Accepting a quote
- Processing payment (future)
- Deleting data

## 🧪 Reviewer Test Script

Use this script to test the complete flow in sandbox mode.

### Setup

1. **Access:** http://localhost:43123 (or deployed URL)
2. **Test Account:** `demo@example.com` / `demo123` (or create your own)
3. **Mode:** Sandbox mode is active by default (test contractors)

### Test Flow (Happy Path)

#### Step 1: Link Account via OAuth

```
Navigate to:
http://localhost:43123/oauth/authorize?
  client_id=muse-agent&
  redirect_uri=https://muse.ai/callback&
  scope=rfq:read rfq:write quotes:read quotes:accept profile:read&
  state=test-state-123&
  code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM&
  code_challenge_method=S256&
  response_type=code
```

**Expected:** Consent screen shows requested permissions with clear descriptions.

**Action:** Click "Allow"

**Expected:** Redirect to `https://muse.ai/callback?code=CODE&state=test-state-123`

#### Step 2: Exchange Code for Token

```bash
curl -X POST http://localhost:43123/api/oauth/token \
  -d "grant_type=authorization_code" \
  -d "code=YOUR_CODE_FROM_STEP_1" \
  -d "redirect_uri=https://muse.ai/callback" \
  -d "client_id=muse-agent" \
  -d "code_verifier=dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
```

**Expected:** Returns `access_token`, `refresh_token`, `expires_in`, `scope`

#### Step 3: Create Service Request

```bash
curl -X POST http://localhost:43123/api/v1/rfqs \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trade": "HVAC",
    "zipCode": "94102",
    "description": "AC unit not cooling properly. Blowing warm air. Outdoor unit seems to be running but indoor temp not dropping.",
    "urgency": "ASAP",
    "budgetBand": "1K_5K"
  }'
```

**Expected:** Returns RFQ object with status `DRAFT`

#### Step 4: Preview Data Sharing

```bash
curl http://localhost:43123/api/v1/rfqs/{RFQ_ID}/preview \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected:** Returns:
- Exact data that will be shared (trade, ZIP, description, urgency, budget)
- List of contractors who will receive it (name, license, insurance status)
- NO personal email or full name shared yet

#### Step 5: Submit with Consent

```bash
curl -X POST http://localhost:43123/api/v1/rfqs/{RFQ_ID}/submit \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contractorIds": ["CONTRACTOR_1_ID", "CONTRACTOR_2_ID"],
    "consent": true
  }'
```

**Expected:**
- Returns updated RFQ with status `SUBMITTED`
- Response includes list of contractors it was shared with
- In sandbox mode, quotes generate automatically after ~2 seconds

#### Step 6: Wait for Quotes

Wait 3-5 seconds in sandbox mode.

#### Step 7: View Quotes

```bash
curl http://localhost:43123/api/v1/rfqs/{RFQ_ID} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected:** RFQ now includes 2-3 quotes with:
- Contractor name and license
- Price (e.g., $3,200 - $4,500)
- Scope description
- Estimated start date and duration
- Valid until date

#### Step 8: Accept a Quote

```bash
curl -X POST http://localhost:43123/api/v1/quotes/{QUOTE_ID}/accept \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected:**
- Quote status changes to `ACCEPTED`
- Other quotes for same RFQ auto-decline
- RFQ status changes to `ACCEPTED`

#### Step 9: View Audit Trail

```bash
curl http://localhost:43123/api/v1/consent/history \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected:** List of consent events including:
- `SHARE` event with timestamp, contractors, data shared
- `ACCEPT` event with timestamp, contractor, quote amount

#### Step 10: Revoke Access

```bash
curl -X POST http://localhost:43123/api/v1/user/revoke \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected:** Success response, token is invalidated

### Edge Cases to Test

1. **Missing Scopes:** Try creating RFQ with only `rfq:read` scope → should fail with 403
2. **No Consent:** Try submitting RFQ without calling submit endpoint → quotes should not arrive
3. **Invalid ZIP:** Try creating RFQ with ZIP outside service area → should return error or empty contractor list
4. **Expired Token:** Use expired access token → should return 401

## 📋 Submission Checklist

Before submitting to Meta:

### Technical
- [ ] OAuth 2.0 with PKCE fully implemented
- [ ] All API endpoints documented in OpenAPI spec
- [ ] End-to-end test script passes
- [ ] Security review completed
- [ ] Rate limiting implemented
- [ ] Error handling for all edge cases
- [ ] Logging and monitoring configured

### Legal & Compliance
- [ ] Privacy policy reviewed by counsel
- [ ] Terms of service finalized
- [ ] Contractor verification policy documented
- [ ] Data retention policy defined
- [ ] GDPR/CCPA compliance verified (if applicable)

### Operational
- [ ] At least 10 verified contractors in launch metro
- [ ] Operator team trained on admin panel
- [ ] Customer support process defined
- [ ] Incident response plan documented
- [ ] Uptime monitoring configured

### User Experience
- [ ] Consent screens are clear and specific
- [ ] Error messages are helpful, not technical
- [ ] Response times < 500ms for API calls
- [ ] Mobile-responsive UI
- [ ] Accessibility (WCAG 2.1 AA) verified

## 🚀 Meta Submission Steps

1. **Account Setup**
   - Create Meta developer account
   - Access Muse Connector Platform portal

2. **Submit Application**
   - Product name: "Muse Connector"
   - Category: Home Services
   - Description: (see Product Description above)
   - Website: (production URL)
   - Support email: support@museconnector.example

3. **Technical Integration**
   - OAuth configuration:
     - Authorization URL: `https://api.museconnector.example/oauth/authorize`
     - Token URL: `https://api.museconnector.example/oauth/token`
     - Scopes: `rfq:read rfq:write quotes:read quotes:accept profile:read`
   - Webhook URL: `https://api.museconnector.example/webhooks/muse` (future)

4. **Upload Documentation**
   - OpenAPI spec (`openapi.yaml`)
   - Test script (this document)
   - Privacy policy
   - Terms of service

5. **Provide Test Credentials**
   - Sandbox API base URL
   - Test account credentials
   - Test contractor data

6. **Meta Testing Phase**
   - Meta runs automated tests
   - Manual review of consent flows
   - Security audit
   - Policy compliance check

7. **Approval & Launch**
   - Address any feedback from Meta
   - Receive approval
   - Connector goes live on Muse platform

## 📞 Support During Review

- **Technical Questions:** eng@museconnector.example
- **Business Questions:** partnerships@museconnector.example
- **Security Concerns:** security@museconnector.example

---

**Status:** Draft - awaiting Phase 1 contractor onboarding completion

**Last Updated:** September 25, 2026
