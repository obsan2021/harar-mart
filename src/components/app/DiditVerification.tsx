import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, ExternalLink, CheckCircle2, XCircle, Clock, RefreshCw, Loader2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { createVerificationSession, getVerificationStatus, parseVerificationCallback } from '@/services/didit'
import { handleError, handleSuccess } from '@/lib/errors'
import { useSearchParams } from 'react-router-dom'

interface DiditVerificationProps {
  userId: string
  userEmail: string
  userName: string
  sellerProfileId: string
  currentStatus: 'not_started' | 'pending' | 'approved' | 'declined' | 'expired'
  currentSessionId?: string | null
  onStatusChange?: (status: string, sessionId: string) => void
}

export default function DiditVerification({
  userId,
  userEmail,
  userName,
  sellerProfileId,
  currentStatus,
  currentSessionId,
  onStatusChange,
}: DiditVerificationProps) {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [sessionUrl, setSessionUrl] = useState<string | null>(null)
  const [status, setStatus] = useState(currentStatus)
  const [sessionId, setSessionId] = useState<string | null>(currentSessionId || null)

  // Check for callback from Didit redirect
  useEffect(() => {
    const callback = parseVerificationCallback(searchParams)
    if (callback && callback.session_id) {
      setSessionId(callback.session_id)
      checkSessionStatus(callback.session_id)
      // Clean up URL params
      const url = new URL(window.location.href)
      url.searchParams.delete('session_id')
      url.searchParams.delete('status')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  async function startVerification() {
    setLoading(true)
    try {
      const session = await createVerificationSession(
        userId,
        userEmail,
        userName,
        `${window.location.origin}/seller/profile`
      )

      setSessionId(session.session_id)
      setSessionUrl(session.url)
      setStatus('pending')

      // Save session ID to seller_profiles
      await supabase
        .from('seller_profiles')
        .update({
          didit_session_id: session.session_id,
          didit_verification_status: 'pending',
        })
        .eq('id', sellerProfileId)

      onStatusChange?.('pending', session.session_id)

      // Open Didit verification widget in a new tab
      window.open(session.url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  async function checkSessionStatus(sid?: string) {
    const targetSessionId = sid || sessionId
    if (!targetSessionId) return

    setCheckingStatus(true)
    try {
      const result = await getVerificationStatus(targetSessionId)
      const mappedStatus = (['approved', 'declined', 'pending', 'expired', 'not_started'] as const).includes(result.status as never)
        ? (result.status as typeof status)
        : 'pending'
      setStatus(mappedStatus)

      // Update the database with the latest status
      await supabase
        .from('seller_profiles')
        .update({
          didit_verification_status: result.status,
          didit_session_id: targetSessionId,
        })
        .eq('id', sellerProfileId)

      onStatusChange?.(result.status, targetSessionId)

      if (result.status === 'approved') {
        handleSuccess('Identity verified successfully!')
      } else if (result.status === 'declined') {
        handleError(new Error('Verification was declined. Please try again with a valid ID document.'))
      }
    } catch (err) {
      handleError(err)
    } finally {
      setCheckingStatus(false)
    }
  }

  const statusConfig = {
    not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-600', icon: Shield },
    pending: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-600', icon: Clock },
    approved: { label: 'Verified', color: 'bg-green-100 text-green-600', icon: CheckCircle2 },
    declined: { label: 'Declined', color: 'bg-red-100 text-red-600', icon: XCircle },
    expired: { label: 'Expired', color: 'bg-orange-100 text-orange-600', icon: XCircle },
  }

  const config = statusConfig[status] || statusConfig.not_started
  const StatusIcon = config.icon

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Identity Verification (KYC)</CardTitle>
          </div>
          <Badge variant="outline" className={config.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
        <CardDescription>
          Verify your identity to build trust with buyers. Powered by Didit — supports Ethiopian Kebele ID, Fayda digital ID, and Passport.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Messages */}
        {status === 'approved' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Verification Complete</p>
                <p className="text-sm text-green-600 mt-1">
                  Your identity has been verified. Buyers can trust that you are a legitimate seller.
                </p>
              </div>
            </div>
          </div>
        )}

        {status === 'declined' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Verification Declined</p>
                <p className="text-sm text-red-600 mt-1">
                  We couldn't verify your identity. Please try again with a clear photo of your ID document and a selfie.
                </p>
              </div>
            </div>
          </div>
        )}

        {status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Verification In Progress</p>
                <p className="text-sm text-yellow-600 mt-1">
                  Complete the verification process in the opened tab. If the tab didn't open, click the button below to start.
                </p>
              </div>
            </div>
          </div>
        )}

        {status === 'not_started' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Verify Your Identity</p>
                <p className="text-sm text-blue-600 mt-1">
                  Complete a quick identity verification to increase buyer confidence. You'll need a government-issued ID (passport, Kebele ID, or Fayda digital ID).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {(status === 'not_started' || status === 'declined' || status === 'expired') && (
            <Button onClick={startVerification} disabled={loading} className="gap-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
              {loading ? 'Creating Session...' : 'Start Verification'}
            </Button>
          )}

          {status === 'pending' && sessionUrl && (
            <Button
              variant="outline"
              onClick={() => window.open(sessionUrl!, '_blank', 'noopener,noreferrer')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open Verification Page
            </Button>
          )}

          {(status === 'pending' || status === 'approved' || status === 'declined') && sessionId && (
            <Button
              variant="outline"
              onClick={() => checkSessionStatus()}
              disabled={checkingStatus}
              className="gap-2"
            >
              {checkingStatus ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {checkingStatus ? 'Checking...' : 'Check Status'}
            </Button>
          )}
        </div>

        {/* Info about supported documents */}
        <div className="text-xs text-muted-foreground border-t pt-3">
          <p className="font-medium mb-1">Supported Documents:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>Passport (any country)</li>
            <li>Ethiopian Kebele ID</li>
            <li>Ethiopian Fayda Digital ID</li>
            <li>Driver's License</li>
            <li>National ID Card</li>
          </ul>
          <p className="mt-2">
            Your data is processed securely by Didit. 500 free verifications per month — no credit card required.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
