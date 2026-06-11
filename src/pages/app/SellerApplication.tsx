import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, ArrowLeft, CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react'
import { handleError, handleSuccess } from '@/lib/errors'

type ApplicationStatus = 'pending' | 'approved' | 'rejected' | null

interface Application {
  id: string
  status: ApplicationStatus
  admin_note: string | null
  created_at: string
}

export default function SellerApplication() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [application, setApplication] = useState<Application | null>(null)
  const [loadingApp, setLoadingApp] = useState(true)

  // Form fields
  const [companyName, setCompanyName] = useState('')
  const [supplierType, setSupplierType] = useState<'manufacturer' | 'trading_company' | 'wholesaler'>('manufacturer')
  const [taxId, setTaxId] = useState('')
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [country, setCountry] = useState('')
  const [phone, setPhone] = useState('')
  const [businessLicense, setBusinessLicense] = useState('')
  const [certifications, setCertifications] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const availableCertifications = ['ISO9001', 'ISO14001', 'CE', 'FCC', 'RoHS', 'GMP', 'HACCP', 'FDA']

  // Check if user already has an application (using the RPC)
  useEffect(() => {
    async function checkApplication() {
      if (!user) return
      const { data, error } = await supabase
        .rpc('get_my_seller_application')
        .single<Application>()

      if (!error && data) {
        setApplication(data)
      }
      setLoadingApp(false)
    }
    checkApplication()
  }, [user])

  function toggleCertification(cert: string) {
    setCertifications(prev =>
      prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)

    try {
      const { error } = await supabase.from('seller_applications').insert({
        user_id: user.id,
        company_name: companyName,
        supplier_type: supplierType,
        tax_id: taxId || null,
        description,
        website: website || null,
        country,
        phone,
        business_license_url: businessLicense || null,
        certifications,
      })

      if (error) throw error

      handleSuccess('Application submitted! We\'ll review it within 2 business days.')
      // Refresh to show the pending state
      const { data } = await supabase
        .rpc('get_my_seller_application')
        .single<Application>()

      if (data) setApplication(data)
    } catch (err) {
      handleError(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingApp) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show application status if already submitted
  if (application) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {application.status === 'pending' && (
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              )}
              {application.status === 'approved' && (
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              )}
              {application.status === 'rejected' && (
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl">
              {application.status === 'pending' && 'Application Under Review'}
              {application.status === 'approved' && 'Application Approved'}
              {application.status === 'rejected' && 'Application Not Approved'}
            </CardTitle>
            <CardDescription>
              {application.status === 'pending' && 'We\'ll review your application within 2 business days. You\'ll be notified once a decision is made.'}
              {application.status === 'approved' && 'Congratulations! You can now access the seller dashboard and start listing products.'}
              {application.status === 'rejected' && 'Your application was not approved at this time. You can submit a new application with updated information.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {application.admin_note && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium">Admin Note:</p>
                <p className="text-sm text-muted-foreground mt-1">{application.admin_note}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground text-center">
              Submitted on {new Date(application.created_at).toLocaleDateString()}
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => navigate('/')}>
                Back to Home
              </Button>
              {application.status === 'approved' && (
                <Button onClick={() => navigate('/seller/products')}>
                  Go to Seller Dashboard
                </Button>
              )}
              {application.status === 'rejected' && (
                <Button onClick={() => setApplication(null)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reapply
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show the application form
  return (
    <div className="max-w-2xl mx-auto p-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Become a Seller</h1>
        </div>
        <p className="text-muted-foreground">
          Submit your application to become a verified seller on Harar Mart.
          Our team will review your information and get back to you within 2 business days.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                placeholder="Global Trading Co Ltd"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplierType">Supplier Type *</Label>
                <Select value={supplierType} onValueChange={(v: any) => setSupplierType(v)}>
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
                <Label htmlFor="taxId">Tax ID (Optional)</Label>
                <Input
                  id="taxId"
                  placeholder="CN123456789"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Business Description *</Label>
              <Textarea
                id="description"
                placeholder="Tell buyers about your business, your products, and what makes you unique..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  placeholder="China"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+86 123 4567 890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://your-company.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Certifications & Licenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Certifications (Optional)</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableCertifications.map((cert) => (
                  <div key={cert} className="flex items-center space-x-2">
                    <Checkbox
                      id={cert}
                      checked={certifications.includes(cert)}
                      onCheckedChange={() => toggleCertification(cert)}
                    />
                    <Label htmlFor={cert} className="text-sm cursor-pointer">
                      {cert}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessLicense">Business License URL (Optional)</Label>
              <Input
                id="businessLicense"
                placeholder="https://example.com/license.pdf"
                value={businessLicense}
                onChange={(e) => setBusinessLicense(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </form>
    </div>
  )
}
