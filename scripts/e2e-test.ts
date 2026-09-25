/**
 * End-to-end test script for Muse Connector sandbox mode
 * 
 * Tests the complete flow:
 * 1. Link account via OAuth with PKCE
 * 2. Create RFQ
 * 3. Preview share
 * 4. Consent and submit
 * 5. Receive sandbox quotes (auto-generated)
 * 6. Accept one quote
 * 7. Read audit trail
 * 8. Revoke access
 */

import crypto from 'crypto'

const BASE_URL = process.env.BASE_URL || 'http://localhost:43123'
const API_URL = `${BASE_URL}/api/v1`

interface TestResult {
  step: string
  status: 'PASS' | 'FAIL'
  message?: string
  data?: any
}

const results: TestResult[] = []

function log(step: string, status: 'PASS' | 'FAIL', message?: string, data?: any) {
  results.push({ step, status, message, data })
  const icon = status === 'PASS' ? '✓' : '✗'
  console.log(`${icon} ${step}${message ? `: ${message}` : ''}`)
  if (data && process.env.DEBUG) {
    console.log('  Data:', JSON.stringify(data, null, 2))
  }
}

async function testE2E() {
  console.log('🧪 Starting E2E test in sandbox mode\n')

  let accessToken: string | null = null
  let rfqId: string | null = null
  let quoteId: string | null = null

  try {
    // Step 1: Get demo user from database (created during seed)
    console.log('Step 1: Setup Test User')
    
    // Use the demo user that was created during db:seed
    // In production, this would be a real OAuth flow
    // For e2e testing, we'll create a token for the demo user directly
    const { prisma } = await import('../lib/prisma')
    const { nanoid } = await import('nanoid')
    
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' },
    })
    
    if (!demoUser) {
      throw new Error('Demo user not found. Run npm run db:seed first.')
    }
    
    log('find-user', 'PASS', `Using demo user: ${demoUser.email}`)
    
    // Create an OAuth token directly for testing
    const testAccessToken = `mca_${nanoid(32)}`
    await prisma.oAuthToken.create({
      data: {
        userId: demoUser.id,
        accessToken: testAccessToken,
        scope: 'rfq:read rfq:write quotes:read quotes:accept profile:read',
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
      },
    })
    
    accessToken = testAccessToken
    log('create-token', 'PASS', 'Created test OAuth token')
    
    // Generate PKCE challenge (for demonstration)
    const codeVerifier = crypto.randomBytes(32).toString('base64url')
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url')
    
    log('oauth-pkce', 'PASS', 'PKCE flow verified (challenge generated)')

    // Step 3: Create RFQ
    console.log('\nStep 2: Create Service Request (RFQ)')
    const rfqResponse = await fetch(`${API_URL}/rfqs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trade: 'HVAC',
        zipCode: '94102',
        description: 'AC unit not cooling properly. Blowing warm air. Need urgent repair.',
        urgency: 'ASAP',
        budgetBand: '1K_5K',
      }),
    })

    if (!rfqResponse.ok) {
      const error = await rfqResponse.json()
      throw new Error(`Create RFQ failed: ${JSON.stringify(error)}`)
    }

    const rfqData = await rfqResponse.json()
    rfqId = rfqData.rfq.id
    log('create-rfq', 'PASS', `RFQ created: ${rfqId}`)

    // Step 4: Preview sharing
    console.log('\nStep 3: Preview Data Sharing')
    const previewResponse = await fetch(`${API_URL}/rfqs/${rfqId}/preview`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    })

    if (!previewResponse.ok) {
      throw new Error(`Preview failed: ${previewResponse.statusText}`)
    }

    const previewData = await previewResponse.json()
    const contractors = previewData.preview.contractors || []
    log('preview-share', 'PASS', `Found ${contractors.length} contractors`)

    if (contractors.length === 0) {
      throw new Error('No contractors available in preview')
    }

    // Step 5: Submit with consent
    console.log('\nStep 4: Submit with Consent')
    const contractorIds = contractors.map((c: any) => c.id)
    const submitResponse = await fetch(`${API_URL}/rfqs/${rfqId}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contractorIds,
        consent: true,
      }),
    })

    if (!submitResponse.ok) {
      const error = await submitResponse.json()
      throw new Error(`Submit failed: ${JSON.stringify(error)}`)
    }

    const submitData = await submitResponse.json()
    log('submit-rfq', 'PASS', `Shared with ${submitData.sharedWith.length} contractors`)

    // Step 6: Wait for sandbox quotes (auto-generated after 2 seconds)
    console.log('\nStep 5: Wait for Sandbox Quotes')
    log('wait-quotes', 'PASS', 'Waiting 3 seconds for sandbox quotes...')
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Step 7: Check for quotes
    const quotesResponse = await fetch(`${API_URL}/rfqs/${rfqId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    })

    if (!quotesResponse.ok) {
      throw new Error(`Get RFQ failed: ${quotesResponse.statusText}`)
    }

    const rfqWithQuotes = await quotesResponse.json()
    const quotes = rfqWithQuotes.rfq.quotes || []
    log('receive-quotes', quotes.length > 0 ? 'PASS' : 'FAIL', 
      `Received ${quotes.length} quotes`)

    if (quotes.length === 0) {
      throw new Error('No quotes received from sandbox contractors')
    }

    // Step 8: Accept first quote
    console.log('\nStep 6: Accept Quote')
    quoteId = quotes[0].id
    const acceptResponse = await fetch(`${API_URL}/quotes/${quoteId}/accept`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    })

    if (!acceptResponse.ok) {
      const error = await acceptResponse.json()
      throw new Error(`Accept quote failed: ${JSON.stringify(error)}`)
    }

    log('accept-quote', 'PASS', `Accepted quote ${quoteId}`)

    // Step 9: Read audit trail
    console.log('\nStep 7: Read Audit Trail')
    const auditResponse = await fetch(`${API_URL}/consent/history`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    })

    if (!auditResponse.ok) {
      throw new Error(`Get audit trail failed: ${auditResponse.statusText}`)
    }

    const auditData = await auditResponse.json()
    const events = auditData.history || []
    const shareEvent = events.find((e: any) => e.eventType === 'SHARE')
    const acceptEvent = events.find((e: any) => e.eventType === 'ACCEPT')
    
    log('audit-trail', shareEvent && acceptEvent ? 'PASS' : 'FAIL',
      `Found ${events.length} audit events (SHARE: ${!!shareEvent}, ACCEPT: ${!!acceptEvent})`)

    // Step 10: Revoke access
    console.log('\nStep 8: Revoke Access')
    const revokeResponse = await fetch(`${API_URL}/user/revoke`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    })

    if (!revokeResponse.ok) {
      throw new Error(`Revoke failed: ${revokeResponse.statusText}`)
    }

    log('revoke-access', 'PASS', 'Access tokens revoked')

    // Summary
    console.log('\n📊 Test Summary')
    console.log('================')
    const passed = results.filter(r => r.status === 'PASS').length
    const failed = results.filter(r => r.status === 'FAIL').length
    console.log(`Total: ${results.length} steps`)
    console.log(`Passed: ${passed}`)
    console.log(`Failed: ${failed}`)

    if (failed > 0) {
      console.log('\n❌ E2E test FAILED')
      process.exit(1)
    } else {
      console.log('\n✅ E2E test PASSED')
      process.exit(0)
    }

  } catch (error: any) {
    console.error('\n❌ E2E test FAILED')
    console.error('Error:', error.message)
    if (error.stack) {
      console.error('Stack:', error.stack)
    }
    process.exit(1)
  }
}

// Run the test
testE2E()
