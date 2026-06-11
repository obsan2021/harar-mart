import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Building2, CheckCircle, ArrowRight, Package, Globe, Shield, Star, DollarSign, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/integrations/supabase/client'
import type { Category, SellerProfile } from '@/integrations/supabase/types'

export default function Home() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [verifiedSellers, setVerifiedSellers] = useState<SellerProfile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    Promise.all([fetchCategories(), fetchVerifiedSellers()])
      .then(() => setLoading(false))
      .catch((err) => {
        console.error('Home: Data fetch error:', err)
        setError('Failed to load data')
        setLoading(false)
      })
  }, [])

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .is('parent_id', null)
        .limit(8)
      if (data) setCategories(data)
      if (error) console.error('Error fetching categories:', error)
    } catch (e) {
      console.error('Error fetching categories:', e)
    }
  }

  async function fetchVerifiedSellers() {
    try {
      const { data, error } = await supabase
        .from('seller_profiles')
        .select('*, user(*)')
        .eq('is_verified', true)
        .limit(6)
      if (data) setVerifiedSellers(data)
      if (error) console.error('Error fetching sellers:', error)
    } catch (e) {
      console.error('Error fetching sellers:', e)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`)
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-muted-foreground">Please check your connection and try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Floating Cards */}
      <section className="relative min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGMwLTItMi00LTItNHMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMtMi0yLTQtMmMwIDAtMi0yLTQtMnMiIGZpbGw9IiMxNDJmNzkiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  <CheckCircle className="h-4 w-4" />
                  <span>Trusted by 10,000+ businesses</span>
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  Source from
                  <span className="text-primary block">Verified Suppliers</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl">
                  Connect with manufacturers, wholesalers, and trading companies worldwide. Get the best prices with MOQ-based bulk ordering.
                </p>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-2xl">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search products, suppliers, or categories..."
                      className="pl-12 h-14 text-lg"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button type="submit" size="lg" className="h-14 px-8">
                    Search
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </form>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link to="/auth?role=buyer">
                  <Button size="lg" variant="default" className="h-12 px-8">
                    <Package className="mr-2 h-5 w-5" />
                    Start Buying
                  </Button>
                </Link>
                <Link to="/auth?role=seller">
                  <Button size="lg" variant="outline" className="h-12 px-8">
                    <Building2 className="mr-2 h-5 w-5" />
                    Become a Seller
                  </Button>
                </Link>
              </div>

              {/* TEMP: Dashboard quick-access buttons while auth is disabled */}
              <div className="flex flex-wrap gap-4 pt-2 border-t border-border/50">
                <Link to="/seller/products">
                  <Button size="lg" variant="secondary" className="h-12 px-8">
                    <Building2 className="mr-2 h-5 w-5" />
                    Seller Dashboard
                  </Button>
                </Link>
                <Link to="/admin/dashboard">
                  <Button size="lg" variant="secondary" className="h-12 px-8">
                    <Package className="mr-2 h-5 w-5" />
                    Admin Dashboard
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-primary">50K+</div>
                  <div className="text-sm text-muted-foreground">Products</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-muted-foreground">Suppliers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">150+</div>
                  <div className="text-sm text-muted-foreground">Countries</div>
                </div>
              </div>
            </div>

            {/* Right Content - Floating Cards */}
            <div className="relative h-[600px] hidden lg:block">
              {/* Card 1 - Top Left */}
              <div className="absolute top-0 left-0 animate-float-1" style={{ animationDelay: '0s' }}>
                <Card className="w-64 shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">Electronics</div>
                        <div className="text-xs text-muted-foreground">12,500+ products</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">4.8</span>
                      <span className="text-muted-foreground">(2.3k reviews)</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card 2 - Top Right */}
              <div className="absolute top-10 right-0 animate-float-2" style={{ animationDelay: '1s' }}>
                <Card className="w-56 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-green-600">Verified</span>
                    </div>
                    <div className="font-semibold mb-1">Global Tech Co.</div>
                    <div className="text-xs text-muted-foreground">Manufacturer • China</div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20"></div>
                        <div className="w-6 h-6 rounded-full bg-primary/30"></div>
                        <div className="w-6 h-6 rounded-full bg-primary/40"></div>
                      </div>
                      <span className="text-xs text-muted-foreground">500+ orders</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card 3 - Center (Main) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float-3" style={{ animationDelay: '0.5s' }}>
                <Card className="w-72 shadow-2xl border-2 border-primary/20">
                  <CardContent className="p-5">
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg mb-4 flex items-center justify-center">
                      <Package className="h-16 w-16 text-primary/50" />
                    </div>
                    <div className="font-semibold text-lg mb-2">Wireless Earbuds</div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl font-bold text-primary">$5.00</span>
                      <span className="text-sm text-muted-foreground">/ unit</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">MOQ: 100</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <span>Ships to 150+ countries</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card 4 - Bottom Left */}
              <div className="absolute bottom-20 left-10 animate-float-4" style={{ animationDelay: '1.5s' }}>
                <Card className="w-60 shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">Bulk Pricing</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">100-499 units</span>
                        <span className="font-medium">$5.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">500-999 units</span>
                        <span className="font-medium">$4.50</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">1000+ units</span>
                        <span className="font-medium">$4.00</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card 5 - Bottom Right */}
              <div className="absolute bottom-0 right-10 animate-float-5" style={{ animationDelay: '2s' }}>
                <Card className="w-56 shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Active Buyers</span>
                    </div>
                    <div className="font-semibold text-2xl mb-1">10,000+</div>
                    <div className="text-xs text-muted-foreground">Businesses sourcing daily</div>
                    <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/shop?category=${category.id}`}
                className="group"
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Building2 className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Verified Suppliers Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Verified Suppliers</h2>
            <Link to="/suppliers" className="text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {verifiedSellers.map((seller) => (
              <Card key={seller.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{seller.company_name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {seller.supplier_type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    {seller.is_verified && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>{seller.user?.country || 'Global'}</span>
                  </div>
                  {seller.certifications && seller.certifications.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {seller.certifications.slice(0, 3).map((cert) => (
                        <span key={cert} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {cert}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
