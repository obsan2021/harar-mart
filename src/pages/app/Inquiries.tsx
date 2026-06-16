import React, { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { InquiryWithRelations } from '@/integrations/supabase/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, Package, Clock, CheckCircle, MessageSquare } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { InquiriesSkeleton } from '@/components/app/AppSkeletons'

export default function Inquiries() {
  const [inquiries, setInquiries] = useState<InquiryWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const { user, isBuyer } = useAuth()

  useEffect(() => {
    if (user && isBuyer) {
      fetchInquiries()
    }
  }, [user, isBuyer])

  async function fetchInquiries() {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*, product:products(*, seller:seller_profiles(*)), quotes(*)')
      .eq('buyer_id', user?.id)
      .order('created_at', { ascending: false })
    
    if (data && !error) {
      setInquiries(data)
    }
    setLoading(false)
  }

  const pendingInquiries = inquiries.filter(i => i.status === 'pending')
  const respondedInquiries = inquiries.filter(i => i.status === 'responded')
  const closedInquiries = inquiries.filter(i => i.status === 'closed')

  if (!isBuyer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Only buyers can view inquiries.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return <InquiriesSkeleton />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Inquiries</h1>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({inquiries.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingInquiries.length})</TabsTrigger>
          <TabsTrigger value="responded">Responded ({respondedInquiries.length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({closedInquiries.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <InquiryList inquiries={inquiries} />
        </TabsContent>
        <TabsContent value="pending">
          <InquiryList inquiries={pendingInquiries} />
        </TabsContent>
        <TabsContent value="responded">
          <InquiryList inquiries={respondedInquiries} />
        </TabsContent>
        <TabsContent value="closed">
          <InquiryList inquiries={closedInquiries} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InquiryList({ inquiries }: { inquiries: InquiryWithRelations[] }) {
  if (inquiries.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No inquiries found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => (
        <Card key={inquiry.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-lg">{inquiry.product?.name}</CardTitle>
                  <Badge variant={
                    inquiry.status === 'pending' ? 'secondary' :
                    inquiry.status === 'responded' ? 'default' : 'outline'
                  }>
                    {inquiry.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    <span>{inquiry.product?.seller?.company_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    <span>Qty: {inquiry.quantity}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(inquiry.created_at ?? '').toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Message:</p>
              <p className="text-sm">{inquiry.message}</p>
            </div>

            {inquiry.destination_port && (
              <div className="text-sm">
                <span className="text-muted-foreground">Destination Port: </span>
                <span>{inquiry.destination_port}</span>
              </div>
            )}

            {inquiry.desired_delivery_date && (
              <div className="text-sm">
                <span className="text-muted-foreground">Desired Delivery: </span>
                <span>{new Date(inquiry.desired_delivery_date).toLocaleDateString()}</span>
              </div>
            )}

            {/* Quotes */}
            {inquiry.quotes && inquiry.quotes.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Quotes ({inquiry.quotes.length})
                </h4>
                <div className="space-y-3">
                  {(inquiry.quotes ?? []).map((quote: any) => (
                    <Card key={quote.id} className="bg-muted">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">${quote.price_per_unit.toFixed(2)}/unit</span>
                            {quote.sample_available && (
                              <Badge variant="secondary">Sample Available</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Lead time: {quote.lead_time_days} days
                          </div>
                        </div>
                        {quote.message && (
                          <p className="text-sm text-muted-foreground">{quote.message}</p>
                        )}
                        {quote.sample_price && (
                          <div className="text-sm mt-2">
                            <span className="text-muted-foreground">Sample Price: </span>
                            <span>${quote.sample_price.toFixed(2)}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {inquiry.status === 'pending' && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Send Follow-up
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
