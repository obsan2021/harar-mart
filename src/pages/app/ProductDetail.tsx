import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import type { ProductWithRelations, SellerProfile } from '@/integrations/supabase/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, Building2, Package, Clock, Shield, Send } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { ProductDetailSkeleton } from '@/components/app/AppSkeletons'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<ProductWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState('')
  const [message, setMessage] = useState('')
  const [destinationPort, setDestinationPort] = useState('')
  const [desiredDate, setDesiredDate] = useState('')
  const [sending, setSending] = useState(false)
  const { user, isBuyer } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id])

  async function fetchProduct() {
    const { data, error } = await supabase
      .from('products')
      .select('*, seller: seller_profiles(*, users(*)), category:categories(*)')
      .eq('id', id)
      .single()
    
    if (data && !error) {
      setProduct(data)
    }
    setLoading(false)
  }

  async function handleInquirySubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !isBuyer || !product) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in as a buyer to send inquiries',
        variant: 'destructive',
      })
      return
    }

    setSending(true)
    try {
      const { error } = await supabase.from('inquiries').insert({
        buyer_id: user.id,
        product_id: product.id,
        quantity: parseInt(quantity),
        message,
        destination_port: destinationPort || null,
        desired_delivery_date: desiredDate || null,
        status: 'pending',
      })

      if (error) throw error

      toast({
        title: 'Inquiry sent successfully',
        description: 'The supplier will respond to your inquiry soon.',
      })
      setQuantity('')
      setMessage('')
      setDestinationPort('')
      setDesiredDate('')
    } catch (error) {
      toast({
        title: 'Failed to send inquiry',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <ProductDetailSkeleton />
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Product Images */}
        <div>
          <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Package className="h-24 w-24" />
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1).map((img, idx) => (
                <div key={idx} className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img src={img} alt={`${product.name} ${idx + 2}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          
          {/* Price Range */}
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                ${(product.min_price ?? 0).toFixed(2)}
              </span>
              {(product.max_price ?? 0) > (product.min_price ?? 0) && (
                <>
                  <span className="text-xl text-muted-foreground">-</span>
                  <span className="text-xl font-bold text-primary">
                    ${(product.max_price ?? 0).toFixed(2)}
                  </span>
                </>
              )}
              <span className="text-muted-foreground">per unit</span>
            </div>
          </div>

          {/* MOQ */}
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-primary" />
              <span className="font-semibold">Minimum Order Quantity</span>
            </div>
            <p className="text-2xl font-bold">{product.moq} units</p>
          </div>

          {/* Lead Time */}
          {product.lead_time_days && (
            <div className="mb-4 flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Production Lead Time: {product.lead_time_days} days</span>
            </div>
          )}

          {/* HS Code */}
          {product.hs_code && (
            <div className="mb-4 text-sm">
              <span className="text-muted-foreground">HS Code: </span>
              <span className="font-mono">{product.hs_code}</span>
            </div>
          )}

          {/* Certifications */}
          {product.certifications && product.certifications.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-semibold">Certifications</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.certifications.map((cert: string) => (
                  <Badge key={cert} variant="outline">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <h2 className="font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
          </div>

          {/* Category */}
          {product.category && (
            <div className="mb-6">
              <span className="text-muted-foreground">Category: </span>
              <Link to={`/shop?category=${product.category.id}`} className="text-primary hover:underline">
                {product.category.name}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Seller Info Card */}
      {product.seller && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{product.seller.company_name}</h3>
                  <p className="text-muted-foreground capitalize">
                    {product.seller?.supplier_type?.replace('_', ' ') ?? ''}
                  </p>
                  {product.seller.user?.country && (
                    <p className="text-sm text-muted-foreground">{product.seller.user.country}</p>
                  )}
                </div>
              </div>
              {product.seller.is_verified && (
                <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Verified Supplier</span>
                </div>
              )}
            </div>

            {product.seller.certifications && product.seller.certifications.length > 0 && (
              <div className="mb-4">
                <span className="text-sm text-muted-foreground">Certifications: </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.seller.certifications.map((cert: string) => (
                    <Badge key={cert} variant="secondary">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Link to={`/suppliers/${product.seller.id}`}>
              <Button variant="outline">View Seller Profile</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Inquiry Form */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Send Inquiry to Supplier</h2>
          
          {!user ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Please sign in to send inquiries</p>
              <Link to="/auth?role=buyer">
                <Button>Sign In as Buyer</Button>
              </Link>
            </div>
          ) : !isBuyer ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Only buyers can send inquiries</p>
              <Link to="/auth?role=buyer">
                <Button>Switch to Buyer Account</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={product.moq ?? 1}
                  placeholder={`Minimum: ${product.moq} units`}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">MOQ: {product.moq} units</p>
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your requirements, specifications, or any questions..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="destinationPort">Destination Port (Optional)</Label>
                <Input
                  id="destinationPort"
                  placeholder="e.g., Port of Shanghai, Port of Los Angeles"
                  value={destinationPort}
                  onChange={(e) => setDestinationPort(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="desiredDate">Desired Delivery Date (Optional)</Label>
                <Input
                  id="desiredDate"
                  type="date"
                  value={desiredDate}
                  onChange={(e) => setDesiredDate(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={sending}>
                <Send className="h-4 w-4 mr-2" />
                {sending ? 'Sending...' : 'Send Inquiry'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


