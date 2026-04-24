import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { SellerProfile } from '@/integrations/supabase/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, CheckCircle, XCircle, Shield, MapPin, Calendar } from 'lucide-react'

export default function AdminSellers() {
  const [sellers, setSellers] = useState<SellerProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSellers()
  }, [])

  async function fetchSellers() {
    const { data, error } = await supabase
      .from('seller_profiles')
      .select('*, users(*)')
      .order('created_at', { ascending: false })
    
    if (data && !error) {
      setSellers(data)
    }
    setLoading(false)
  }

  async function handleApprove(sellerId: string) {
    const { error } = await supabase
      .from('seller_profiles')
      .update({ is_verified: true })
      .eq('id', sellerId)

    if (error) {
      alert('Failed to approve seller')
    } else {
      fetchSellers()
    }
  }

  async function handleReject(sellerId: string) {
    if (!confirm('Are you sure you want to reject this seller?')) return

    const { error } = await supabase
      .from('seller_profiles')
      .delete()
      .eq('id', sellerId)

    if (error) {
      alert('Failed to reject seller')
    } else {
      fetchSellers()
    }
  }

  const pendingSellers = sellers.filter(s => !s.is_verified)
  const verifiedSellers = sellers.filter(s => s.is_verified)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Seller Management</h1>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingSellers.length})</TabsTrigger>
          <TabsTrigger value="verified">Verified ({verifiedSellers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <SellerList 
            sellers={pendingSellers} 
            onApprove={handleApprove}
            onReject={handleReject}
            showActions
          />
        </TabsContent>
        <TabsContent value="verified">
          <SellerList sellers={verifiedSellers} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SellerList({ 
  sellers, 
  onApprove, 
  onReject, 
  showActions = false 
}: { 
  sellers: SellerProfile[]
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  showActions?: boolean
}) {
  if (sellers.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No sellers found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {sellers.map((seller) => (
        <Card key={seller.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{seller.company_name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="capitalize">
                      {seller.supplier_type.replace('_', ' ')}
                    </Badge>
                    {seller.is_verified && (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {showActions && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onApprove?.(seller.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onReject?.(seller.id)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Contact:</span>
                <span>{seller.user?.email}</span>
              </div>
              {seller.user?.country && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{seller.user.country}</span>
                </div>
              )}
              {seller.tax_id && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Tax ID:</span>
                  <span className="font-mono">{seller.tax_id}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined: {new Date(seller.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {seller.certifications && seller.certifications.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Certifications</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {seller.certifications.map((cert) => (
                    <Badge key={cert} variant="secondary">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {seller.business_license_url && (
              <div>
                <span className="text-sm text-muted-foreground">Business License: </span>
                <a
                  href={seller.business_license_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline ml-1"
                >
                  View Document
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
