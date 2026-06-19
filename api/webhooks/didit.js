// Vercel serverless function: Didit webhook handler.
// Verifies X-Signature-V2 HMAC and updates Supabase seller_profiles.

import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

function shortenFloats(v) {
  if (Array.isArray(v)) return v.map(shortenFloats)
  if (v && typeof v === 'object') {
    return Object.fromEntries(
      Object.entries(v).map(([k, x]) => [k, shortenFloats(x)])
    )
  }
  if (typeof v === 'number' && !Number.isInteger(v) && v % 1 === 0) return Math.trunc(v)
  return v
}

function sortKeys(v) {
  if (Array.isArray(v)) return v.map(sortKeys)
  if (v && typeof v === 'object') {
    return Object.keys(v)
      .sort()
      .reduce((acc, k) => {
        acc[k] = sortKeys(v[k])
        return acc
      }, {})
  }
  return v
}

function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const sig = req.headers['x-signature-v2'] || ''
    const ts = Number(req.headers['x-timestamp'])

    // 1. Timestamp freshness (300s window)
    if (!ts || Math.abs(Date.now() / 1000 - ts) > 300) {
      return res.status(401).send('stale')
    }

    // 2. Canonicalise
    const parsed = req.body
    const canonical = JSON.stringify(sortKeys(shortenFloats(parsed)))

    // 3. HMAC-SHA256 verification
    const secret = process.env.DIDIT_WEBHOOK_SECRET
    if (!secret) {
      console.error('DIDIT_WEBHOOK_SECRET not configured')
      return res.status(500).send('misconfigured')
    }

    const expected = crypto
      .createHmac('sha256', secret)
      .update(canonical, 'utf8')
      .digest('hex')

    if (
      sig.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
    ) {
      return res.status(401).send('bad sig')
    }

    // 4. Process — update seller_profiles in Supabase
    const vendorData = parsed.vendor_data
    const status = parsed.status

    console.log('Didit webhook:', { status, vendor_data: vendorData, event_id: parsed.event_id })

    const supabase = getSupabaseAdmin()
    if (supabase && vendorData) {
      let dbStatus = 'pending'
      switch (status) {
        case 'Approved':
          dbStatus = 'approved'
          break
        case 'Declined':
          dbStatus = 'declined'
          break
        case 'In Review':
          dbStatus = 'pending'
          break
        case 'Kyc Expired':
        case 'Expired':
          dbStatus = 'expired'
          break
        default:
          dbStatus = 'pending'
          break
      }

      // vendor_data is the user_id we passed when creating the session
      const { error } = await supabase
        .from('seller_profiles')
        .update({ didit_verification_status: dbStatus })
        .eq('user_id', vendorData)

      if (error) {
        console.error('Supabase update error:', error)
      }

      // If approved, also update the user as verified
      if (status === 'Approved') {
        await supabase
          .from('users')
          .update({ is_verified: true })
          .eq('id', vendorData)
      }
    }

    // 5. Return 2xx within 5 seconds
    return res.status(200).send('ok')
  } catch (error) {
    console.error('Webhook error:', error)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
}
