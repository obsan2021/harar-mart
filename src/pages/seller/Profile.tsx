import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { Product, SellerProfile } from '@/integrations/supabase/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Building2, MapPin, Shield, Package, CheckCircle, Clock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function SellerProfile() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const { sellerProfile, user, isSeller } = useAuth()

  const [formData, setFormData] = useState({
    company_name: '',
    tax_id: '',
    supplier_type: 'manufacturer' as 'manufacturer' | 'trading_company' | 'wholesaler',
    certifications: [] as string[],
    business_license_url: '',
  })

  useEffect(() => {
    if (isSeller && sellerProfile) {
      fetchProducts()
      setFormData({
        company_name: sellerProfile.company_name,
        tax_id: sellerProfile.tax_id || '',
        supplier_type: sellerProfile.supplier_type,
        certifications: sellerProfile.certifications || [],
        business_license_url: sellerProfile.business_license_url || '',
      })
    }
  }, [isSeller, sellerProfile])

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('seller_id', sellerProfile?.id)
      .eq('is_available', true)
      .limit(12)
    
    if (data && !error) {
      setProducts(data)
    }
    setLoading(false)
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!sellerProfile) return

    const { error } = await supabase
      .from('seller_profiles')
      .update(formData)
      .eq('id', sellerProfile.id)

    if (error) {
      alert('Failed to update profile')
    } else {
      setIsEditing(false)
      // Refresh seller profile from auth context
      window.location.reload()
    }
  }

  function toggleCertification(cert: string) {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }))
  }

  const availableCertifications = ['ISO9001', 'ISO14001', 'CE', 'FCC', 'RoHS', 'GMP', 'HACCP', 'FDA']

  if (!isSeller || !sellerProfile) {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">{sellerProfile.company_name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {sellerProfile.is_verified && (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    <Badge variant="outline" className="capitalize">
                      {sellerProfile.supplier_type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {user?.country && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{user.country}</span>
                </div>
              )}
              {sellerProfile.tax_id && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Tax ID: </span>
                  <span>{sellerProfile.tax_id}</span>
                </div>
              )}
              <div className="text-sm">
                <span className="text-muted-foreground">Member Since: </span>
                <span>{new Date(sellerProfile.created_at).toLocaleDateString()}</span>
              </div>

              {sellerProfile.certifications && sellerProfile.certifications.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">Certifications</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sellerProfile.certifications.map((cert) => (
                      <Badge key={cert} variant="secondary">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Form */}
          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Company Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID</Label>
                    <Input
                      id="taxId"
                      value={formData.tax_id}
                      onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplierType">Supplier Type</Label>
                    <Select
                      value={formData.supplier_type}
                      onValueChange={(v: 'manufacturer' | 'trading_company' | 'wholesaler') =>
                        setFormData({ ...formData, supplier_type: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manufacturer">Manufacturer</SelectItem>
                        <SelectItem value="trading_company">Trading Company</SelectItem>
                        <SelectItem value="wholesaler">Wholesaler</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Certifications</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableCertifications.map((cert) => (
                        <div key={cert} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={cert}
                            checked={formData.certifications.includes(cert)}
                            onChange={() => toggleCertification(cert)}
                            className="rounded"
                          />
                          <Label htmlFor={cert} className="text-sm cursor-pointer">
                            {cert}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessLicense">Business License URL</Label>
                    <Input
                      id="businessLicense"
                      value={formData.business_license_url}
                      onChange={(e) => setFormData({ ...formData, business_license_url: e.target.value })}
                      placeholder="https://example.com/license.pdf"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">Save Changes</Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Product Catalog */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Product Catalog</CardTitle>
                <Badge variant="secondary">{products.length} Products</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No products listed yet</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <Card key={product.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Package className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold line-clamp-1 mb-2">{product.name}</h3>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-primary font-semibold">
                            ${product.min_price.toFixed(2)}
                          </span>
                          <span className="text-muted-foreground">MOQ: {product.moq}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{product.lead_time_days} days</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
