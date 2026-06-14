// Supabase Edge Function: Didit KYC Proxy
//
// This function proxies requests to the Didit API so that the API key
// is never exposed to the browser.  The client calls this function
// instead of calling Didit directly.
//
// Deploy:
//   supabase functions deploy didit-proxy --no-verify-jwt
//
// Environment variables (set in Supabase dashboard):
//   DIDIT_API_KEY  – Your Didit API secret key

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const DIDIT_API_BASE = 'https://api.didit.me/v1'

serve(async (req: Request) => {
  // CORS headers for browser requests
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
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  }

  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/didit-proxy/, '')

  try {
    let diditUrl: string
    let diditBody: BodyInit | undefined
    let diditMethod: string

    if (req.method === 'POST' && path === '/session') {
      // Create a new verification session
      diditUrl = `${DIDIT_API_BASE}/session/`
      diditMethod = 'POST'
      diditBody = await req.text()
    } else if (req.method === 'GET' && path.startsWith('/session/')) {
      // Get session status
      diditUrl = `${DIDIT_API_BASE}${path}`
      diditMethod = 'GET'
    } else {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    }

    const diditRes = await fetch(diditUrl, {
      method: diditMethod,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: diditBody,
    })

    const data = await diditRes.text()

    return new Response(data, {
      status: diditRes.status,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  }
})
