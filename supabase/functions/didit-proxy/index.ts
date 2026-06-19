// Supabase Edge Function: Didit KYC Proxy (V3 API)
//
// Proxies requests to the Didit V3 verification API so the API key
// stays server-side. The Vercel serverless functions at /api/verify
// and /api/webhooks/didit are the primary integration path.
//
// Deploy:
//   supabase functions deploy didit-proxy --no-verify-jwt
//
// Environment variables (set in Supabase dashboard):
//   DIDIT_API_KEY  – Your Didit API secret key

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const DIDIT_API_BASE = 'https://verification.didit.me/v3'
const WORKFLOW_ID = '397e572a-7fed-42c2-aa9a-700925985116'

serve(async (req: Request) => {
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  })

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers })
  }

  const apiKey = Deno.env.get('DIDIT_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Didit API key not configured' }), {
      status: 500,
      headers: { ...Object.fromEntries(headers), 'Content-Type': 'application/json' },
    })
  }

  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/didit-proxy/, '')

  try {
    if (req.method === 'POST' && path === '/session') {
      const body = await req.json()
      const diditRes = await fetch(`${DIDIT_API_BASE}/session/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          workflow_id: WORKFLOW_ID,
          vendor_data: body.vendor_data || body.customer?.id || 'unknown',
          callback: body.callback_url || body.callback || '',
        }),
      })

      const data = await diditRes.text()
      return new Response(data, {
        status: diditRes.status,
        headers: { ...Object.fromEntries(headers), 'Content-Type': 'application/json' },
      })
    } else if (req.method === 'GET' && path.startsWith('/session/')) {
      const sessionId = path.replace('/session/', '')
      const diditRes = await fetch(`${DIDIT_API_BASE}/session/${sessionId}/decision/`, {
        method: 'GET',
        headers: { 'x-api-key': apiKey },
      })

      const data = await diditRes.text()
      return new Response(data, {
        status: diditRes.status,
        headers: { ...Object.fromEntries(headers), 'Content-Type': 'application/json' },
      })
    } else {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...Object.fromEntries(headers), 'Content-Type': 'application/json' },
      })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...Object.fromEntries(headers), 'Content-Type': 'application/json' },
    })
  }
})
