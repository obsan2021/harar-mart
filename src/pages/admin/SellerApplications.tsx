import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CheckCircle2, XCircle, Building2, ExternalLink, Clock } from 'lucide-react'
import { handleError, handleSuccess } from '@/lib/errors'

interface Application {
  id: string
  user_id: string
  company_name: string
  supplier_type: string
  tax_id: string | null
  description: string
  website: string | null
  country: string
  phone: string
  business_license_url: string | null
  certifications: string[]
  status: 'pending' | 'approved' | 'rejected'
  admin_note: string | null
  created_at: string
  users: {
    email: string
    full_name: string | null
  }
}

export default function SellerApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  async function fetchApplications() {
    setLoading(true)
    const { data, error } = await supabase
      .from('seller_applications')
      .select('*, users(email, full_name)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching applications:', error)
    } else if (data) {
      setApplications(data as unknown as Application[])
    }
    setLoading(false)
  }

  async function handleApprove(app: Application) {
    setProcessing(true)
    try {
      const { error } = await supabase.rpc('approve_seller_application', {
        p_application_id: app.id,
      })
      if (error) throw error
      handleSuccess(`${app.company_name} approved as seller!`)
      setSelectedApp(null)
      fetchApplications()
    } catch (err) {
      handleError(err)
    } finally {
      setProcessing(false)
    }
  }

  async function handleReject() {
    if (!selectedApp || !rejectReason.trim()) return
    setProcessing(true)
    try {
      const { error } = await supabase.rpc('reject_seller_application', {
        p_application_id: selectedApp.id,
        p_reason: rejectReason.trim(),
      })
      if (error) throw error
      handleSuccess('Application rejected')
      setSelectedApp(null)
      setShowRejectDialog(false)
      setRejectReason('')
      fetchApplications()
    } catch (err) {
      handleError(err)
    } finally {
      setProcessing(false)
    }
  }

  const pendingApps = applications.filter(a => a.status === 'pending')
  const reviewedApps = applications.filter(a => a.status !== 'pending')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Seller Applications</h1>
        <p className="text-muted-foreground mt-1">
          Review and manage seller applications
        </p>
      </div>

      {/* Pending Applications */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-yellow-500" />
          Pending Review
          <Badge variant="secondary" className="ml-2">{pendingApps.length}</Badge>
        </h2>

        {pendingApps.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No pending applications
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingApps.map((app) => (
              <Card key={app.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedApp(app)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        {app.company_name}
                      </CardTitle>
                      <CardDescription>
                        {app.users.full_name || app.users.email} · {app.country}
                      </CardDescription>
                    </div>
                    <Badge>{app.supplier_type.replace('_', ' ')}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{app.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Submitted {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Reviewed Applications */}
      {reviewedApps.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Reviewed</h2>
          <div className="grid gap-3">
            {reviewedApps.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {app.company_name}
                        {app.status === 'approved' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </CardTitle>
                      <CardDescription>
                        {app.users.full_name || app.users.email}
                      </CardDescription>
                    </div>
                    <Badge variant={app.status === 'approved' ? 'default' : 'destructive'}>
                      {app.status}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedApp && !showRejectDialog} onOpenChange={(open) => { if (!open) setSelectedApp(null) }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedApp && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  {selectedApp.company_name}
                </DialogTitle>
                <DialogDescription>
                  Application from {selectedApp.users.full_name || selectedApp.users.email}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Supplier Type</Label>
                    <p className="font-medium capitalize">{selectedApp.supplier_type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Country</Label>
                    <p className="font-medium">{selectedApp.country}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <p className="font-medium">{selectedApp.phone}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Tax ID</Label>
                    <p className="font-medium">{selectedApp.tax_id || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Business Description</Label>
                  <p className="text-sm mt-1">{selectedApp.description}</p>
                </div>

                {selectedApp.website && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Website</Label>
                    <div className="flex items-center gap-1 mt-1">
                      <ExternalLink className="h-3 w-3" />
                      <a href={selectedApp.website} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline">
                        {selectedApp.website}
                      </a>
                    </div>
                  </div>
                )}

                {selectedApp.business_license_url && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Business License</Label>
                    <div className="flex items-center gap-1 mt-1">
                      <ExternalLink className="h-3 w-3" />
                      <a href={selectedApp.business_license_url} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline">
                        View License
                      </a>
                    </div>
                  </div>
                )}

                {selectedApp.certifications.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Certifications</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedApp.certifications.map((cert) => (
                        <Badge key={cert} variant="outline">{cert}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-xs text-muted-foreground">Contact Email</Label>
                  <p className="font-medium">{selectedApp.users.email}</p>
                </div>
              </div>

              {selectedApp.status === 'pending' && (
                <DialogFooter className="gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => setShowRejectDialog(true)}
                    disabled={processing}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedApp)}
                    disabled={processing}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {processing ? 'Processing...' : 'Approve'}
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this application. The seller will see this note.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="rejectReason">Reason *</Label>
            <Textarea
              id="rejectReason"
              placeholder="e.g., Incomplete documentation, please provide your business license..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setShowRejectDialog(false); setRejectReason('') }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || processing}
            >
              {processing ? 'Rejecting...' : 'Reject Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
