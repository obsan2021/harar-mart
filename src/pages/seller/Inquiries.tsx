import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { InquiryWithRelations, Quote } from '@/integrations/supabase/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Building2, Package, Clock, Send, Reply } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { SellerInquiriesSkeleton } from '@/components/app/AppSkeletons'

export default function SellerInquiries() {
  const [inquiries, setInquiries] = useState<InquiryWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false)
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryWithRelations | null>(null)
  const { sellerProfile, isSeller } = useAuth()

  // Quote form state
  const [quoteForm, setQuoteForm] = useState({
    price_per_unit: 0,
    sample_available: false,
    sample_price: 0,
    lead_time_days: 7,
    message: '',
  })

  useEffect(() => {
    if (isSeller && sellerProfile) {
      fetchInquiries()
    }
  }, [isSeller, sellerProfile])

  async function fetchInquiries() {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*, product:products(*), buyer:users(*), quotes(*)')
      .eq('product.seller_id', sellerProfile?.id)
      .order('created_at', { ascending: false })
    
    if (data && !error) {
      setInquiries(data)
    }
    setLoading(false)
  }

  async function handleSendQuote(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedInquiry || !sellerProfile) return

    const { error } = await supabase.from('quotes').insert({
      inquiry_id: selectedInquiry.id,
      seller_id: sellerProfile.id,
      price_per_unit: quoteForm.price_per_unit,
      sample_available: quoteForm.sample_available,
      sample_price: quoteForm.sample_available ? quoteForm.sample_price : null,
      lead_time_days: quoteForm.lead_time_days,
      message: quoteForm.message,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    })

    if (error) {
      alert('Failed to send quote')
    } else {
      // Update inquiry status
      await supabase
        .from('inquiries')
        .update({ status: 'responded' })
        .eq('id', selectedInquiry.id)
      
      setIsReplyDialogOpen(false)
      fetchInquiries()
      resetQuoteForm()
    }
  }

  function handleReply(inquiry: InquiryWithRelations) {
    setSelectedInquiry(inquiry)
    setIsReplyDialogOpen(true)
  }

  function resetQuoteForm() {
    setQuoteForm({
      price_per_unit: 0,
      sample_available: false,
      sample_price: 0,
      lead_time_days: 7,
      message: '',
    })
    setSelectedInquiry(null)
  }

  const pendingInquiries = inquiries.filter(i => i.status === 'pending')
  const respondedInquiries = inquiries.filter(i => i.status === 'responded')
  const closedInquiries = inquiries.filter(i => i.status === 'closed')

  if (!isSeller) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Only sellers can access this page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return <SellerInquiriesSkeleton />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Inquiry Inbox</h1>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingInquiries.length})</TabsTrigger>
          <TabsTrigger value="responded">Responded ({respondedInquiries.length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({closedInquiries.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <InquiryList 
            inquiries={pendingInquiries} 
            onReply={handleReply}
            showReplyButton
          />
        </TabsContent>
        <TabsContent value="responded">
          <InquiryList inquiries={respondedInquiries} />
        </TabsContent>
        <TabsContent value="closed">
          <InquiryList inquiries={closedInquiries} />
        </TabsContent>
      </Tabs>

      <Dialog open={isReplyDialogOpen} onOpenChange={(open) => {
        setIsReplyDialogOpen(open)
        if (!open) resetQuoteForm()
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Quote</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="font-semibold">{selectedInquiry.product?.name}</p>
                <p className="text-sm text-muted-foreground">Requested Quantity: {selectedInquiry.quantity}</p>
                <p className="text-sm text-muted-foreground">{selectedInquiry.message}</p>
              </div>

              <form onSubmit={handleSendQuote} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price Per Unit ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={quoteForm.price_per_unit}
                    onChange={(e) => setQuoteForm({ ...quoteForm, price_per_unit: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leadTime">Lead Time (days) *</Label>
                  <Input
                    id="leadTime"
                    type="number"
                    min="1"
                    value={quoteForm.lead_time_days}
                    onChange={(e) => setQuoteForm({ ...quoteForm, lead_time_days: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sampleAvailable"
                    checked={quoteForm.sample_available}
                    onCheckedChange={(checked) => setQuoteForm({ ...quoteForm, sample_available: checked as boolean })}
                  />
                  <Label htmlFor="sampleAvailable">Sample Available</Label>
                </div>

                {quoteForm.sample_available && (
                  <div className="space-y-2">
                    <Label htmlFor="samplePrice">Sample Price ($) *</Label>
                    <Input
                      id="samplePrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={quoteForm.sample_price}
                      onChange={(e) => setQuoteForm({ ...quoteForm, sample_price: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="message">Message to Buyer</Label>
                  <Textarea
                    id="message"
                    value={quoteForm.message}
                    onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })}
                    rows={3}
                    placeholder="Include any additional details about your quote..."
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Send className="h-4 w-4 mr-2" />
                    Send Quote
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InquiryList({ 
  inquiries, 
  onReply, 
  showReplyButton = false 
}: { 
  inquiries: InquiryWithRelations[]
  onReply?: (inquiry: InquiryWithRelations) => void
  showReplyButton?: boolean
}) {
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
                    <span>{inquiry.buyer?.full_name || inquiry.buyer?.email}</span>
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
              <p className="text-sm text-muted-foreground mb-1">Buyer Message:</p>
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

            {/* Existing Quotes */}
            {inquiry.quotes && inquiry.quotes.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Your Quotes ({inquiry.quotes.length})</h4>
                <div className="space-y-2">
                  {(inquiry.quotes ?? []).map((quote: any) => (
                    <Card key={quote.id} className="bg-muted">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold">${(quote.price_per_unit ?? 0).toFixed(2)}/unit</span>
                            {quote.sample_available && (
                              <Badge variant="secondary" className="ml-2">Sample Available</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(quote.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        {quote.message && (
                          <p className="text-sm text-muted-foreground mt-1">{quote.message}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {showReplyButton && onReply && (
              <Button onClick={() => onReply(inquiry)}>
                <Reply className="h-4 w-4 mr-2" />
                Send Quote
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
