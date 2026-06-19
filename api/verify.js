// Vercel serverless function: create a Didit KYC verification session.
// The API key stays server-side; the client only receives { url, session_id }.

const WORKFLOW_ID = '397e572a-7fed-42c2-aa9a-700925985116'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.DIDIT_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'DIDIT_API_KEY not configured' })
  }

  try {
    const { vendorData } = req.body || {}

    const response = await fetch('https://verification.didit.me/v3/session/', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_id: WORKFLOW_ID,
        vendor_data: vendorData || 'user-id-placeholder',
        callback: `${req.headers.origin || 'https://hararmart.vercel.app'}/seller/profile`,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return res.status(502).json({ error: 'session_create_failed', detail: error })
    }

    const session = await response.json()
    return res.status(200).json({
      url: session.url,
      session_id: session.session_id,
    })
  } catch (error) {
    console.error('Error creating Didit session:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
