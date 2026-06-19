/**
 * Didit KYC Verification Service (V3 API)
 *
 * Sessions are created server-side via the Vercel serverless function
 * at /api/verify. The API key never touches the browser.
 *
 * The webhook at /api/webhooks/didit is the source of truth for
 * verification decisions — do not rely on client-side callbacks.
 *
 * Docs: https://docs.didit.me/
 */

export interface DiditSession {
  session_id: string
  url: string
}

export interface DiditVerificationResult {
  session_id: string
  status: 'approved' | 'declined' | 'pending' | 'expired' | string
  vendor_data?: Record<string, unknown>
}

/**
 * Create a new KYC verification session via the server-side API route.
 * Returns { url, session_id } — open url in a new tab or SDK modal.
 */
export async function createVerificationSession(
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  customerEmail?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  customerName?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  redirectUrl?: string
): Promise<DiditSession> {
  const response = await fetch('/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendorData: userId }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Verification session error (${response.status}): ${errorBody}`)
  }

  const data = await response.json()
  return {
    session_id: data.session_id,
    url: data.url,
  }
}

/**
 * Poll the session status via the Didit V3 API (server-side proxy).
 * Falls back gracefully if the endpoint is not available.
 */
export async function getVerificationStatus(
  sessionId: string
): Promise<DiditVerificationResult> {
  const response = await fetch(`/api/verify?session_id=${sessionId}`, {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error(`Status check failed (${response.status})`)
  }

  const data = await response.json()
  return {
    session_id: data.session_id || sessionId,
    status: data.status || 'pending',
    vendor_data: data.vendor_data,
  }
}

/**
 * Parse the verification result from redirect query params.
 * Note: the webhook is the source of truth, not this callback.
 */
export function parseVerificationCallback(params: URLSearchParams): {
  session_id: string
  status: string
} | null {
  const sessionId = params.get('session_id')
  const status = params.get('status')

  if (sessionId && status) {
    return { session_id: sessionId, status }
  }

  return null
}
