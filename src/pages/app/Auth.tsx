import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Building2, Package, Globe, ArrowRight, Shield, TrendingUp } from 'lucide-react'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer')
  const [showSellerForm, setShowSellerForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Seller registration fields
  const [companyName, setCompanyName] = useState('')
  const [taxId, setTaxId] = useState('')
  const [supplierType, setSupplierType] = useState<'manufacturer' | 'trading_company' | 'wholesaler'>('manufacturer')
  const [country, setCountry] = useState('')
  const [certifications, setCertifications] = useState<string[]>([])
  const [businessLicense, setBusinessLicense] = useState('')
  
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam === 'buyer' || roleParam === 'seller') {
      setRole(roleParam)
      setIsLogin(false)
    }
  }, [searchParams])

  const availableCertifications = ['ISO9001', 'ISO14001', 'CE', 'FCC', 'RoHS', 'GMP', 'HACCP', 'FDA']

  function toggleCertification(cert: string) {
    setCertifications(prev =>
      prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await signIn(email, password)
        navigate(from, { replace: true })
      } else {
        await signUp(email, password, fullName, role)
        
        if (role === 'seller' && showSellerForm) {
          const { data: userData } = await supabase.auth.getUser()
          if (userData.user) {
            await supabase.from('seller_profiles').insert({
              user_id: userData.user.id,
              company_name: companyName,
              tax_id: taxId || null,
              supplier_type: supplierType,
              certifications: certifications,
              business_license_url: businessLicense || null,
              is_verified: false,
            })
          }
        }
        
        navigate(from, { replace: true })
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Visual Panel - Left Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDQwTDQwIDBIMjBMMCAyMHpNMjAgNDBMMTQwIDBIMjBMMCAyMHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4">Harar Mart</h1>
            <p className="text-xl opacity-90">Your Global B2B Marketplace</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Connect Worldwide</h3>
                <p className="opacity-80">Source from verified suppliers across the globe</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Verified Suppliers</h3>
                <p className="opacity-80">Only trusted and certified businesses</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Bulk Pricing</h3>
                <p className="opacity-80">Get the best prices with MOQ-based ordering</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-sm opacity-70">Join thousands of businesses already sourcing on Harar Mart</p>
          </div>
        </div>
      </div>

      {/* Form Panel - Right Side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-muted-foreground">
              {isLogin
                ? 'Sign in to access your account'
                : 'Join as a buyer or seller to start sourcing or selling'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label>I want to:</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={role === 'buyer' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => { setRole('buyer'); setShowSellerForm(false) }}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Buy Products
                  </Button>
                  <Button
                    type="button"
                    variant={role === 'seller' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => { setRole('seller'); setShowSellerForm(true) }}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Sell Products
                  </Button>
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Seller Registration Form */}
            {!isLogin && role === 'seller' && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Company Information</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    placeholder="Global Trading Co Ltd"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required={role === 'seller'}
                  />
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

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    placeholder="China"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required={role === 'seller'}
                  />
                </div>

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
              </div>
            )}

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setShowSellerForm(false)
              }}
              className="text-primary hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
