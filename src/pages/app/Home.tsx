import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Search, Building2, CheckCircle, ArrowRight, Package, 
  Globe, Shield, Star, DollarSign, Users, Home as HomeIcon,
  Sparkles, Truck, Clock, HeadphonesIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/integrations/supabase/client'
import type { Category, SellerProfile } from '@/integrations/supabase/types'
import {
  WelcomeBanner,
  CategorySidebar,
  HeroCarousel,
  HotQueries,
  TrendingTags,
  ProductCard,
  ProductCardSkeleton,
} from '@/components/marketplace'
import type { ProductCardData } from '@/components/marketplace'
import { HomeSkeleton } from '@/components/app/AppSkeletons'

export default function Home() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [verifiedSellers, setVerifiedSellers] = useState<SellerProfile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [sellersLoading, setSellersLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)

  // Real product data fetched from the database for the recommendation grid
  const [sampleProducts, setSampleProducts] = useState<ProductCardData[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    setFetchError(null)
    fetchCategories()
    fetchVerifiedSellers()
    fetchSampleProducts()

    // Safety timeout: if any query takes > 8 seconds, show error state
    const timeout = setTimeout(() => {
      if (categoriesLoading || sellersLoading || productsLoading) {
        setFetchError('Loading is taking longer than expected. Please check your connection and try again.')
        setCategoriesLoading(false)
        setSellersLoading(false)
        setProductsLoading(false)
      }
    }, 8000)

    return () => clearTimeout(timeout)
  }, [])

  async function fetchCategories() {
    setCategoriesLoading(true)
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
    } finally {
      setCategoriesLoading(false)
    }
  }

  async function fetchVerifiedSellers() {
    setSellersLoading(true)
    try {
      // Fetch seller_profiles without joining to users table to avoid RLS recursion
      const { data, error } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('is_verified', true)
        .limit(6)
      if (data) setVerifiedSellers(data)
      if (error) console.error('Error fetching sellers:', error)
    } catch (e) {
      console.error('Error fetching sellers:', e)
    } finally {
      setSellersLoading(false)
    }
  }

  async function fetchSampleProducts() {
    setProductsLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, seller:seller_profiles(company_name, is_verified)')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(8)

      if (error) {
        console.error('Error fetching sample products:', error)
        return
      }

      if (data) {
        setSampleProducts(data.map((p: any) => ({
          id: p.id,
          title: p.name,
          priceMin: p.min_price,
          priceMax: p.max_price,
          moq: p.moq,
          supplierName: p.seller?.company_name ?? 'Unknown',
          supplierCountry: '',
          isVerified: p.seller?.is_verified ?? false,
        })))
      }
    } catch (e) {
      console.error('Error fetching sample products:', e)
    } finally {
      setProductsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="min-h-screen">
      {/* ===== WELCOME BANNER ===== */}
      <WelcomeBanner />

      {/* ===== HERO SECTION: Category Sidebar + Carousel ===== */}
      <section className="container-alibaba py-6">
        <div className="flex gap-6">
          {/* Category Sidebar - Left */}
          <div className="hidden lg:block w-[260px] shrink-0">
            <div className="sticky top-[7.5rem]">
              <CategorySidebar />
            </div>
          </div>

          {/* Hero Carousel - Right */}
          <div className="flex-1 min-w-0">
            <HeroCarousel />
          </div>
        </div>
      </section>

      {/* ===== HOT QUERIES SCROLLER ===== */}
      <section className="container-alibaba pb-6">
        <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
          <HotQueries />
        </div>
      </section>

      {/* ===== TRENDING TAGS ===== */}
      <section className="container-alibaba pb-8">
        <TrendingTags />
      </section>

      {/* ===== FEATURED PRODUCTS GRID ===== */}
      <section className="container-alibaba pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Recommended for You
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Top-selling products from verified suppliers
            </p>
          </div>
          <Link to="/shop">
            <Button variant="outline" size="sm" className="gap-1">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {fetchError ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{fetchError}</p>
            <Button variant="outline" onClick={() => {
              setFetchError(null)
              setProductsLoading(true)
              fetchSampleProducts()
            }}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {productsLoading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : sampleProducts.length === 0
                ? <p className="col-span-full text-center text-muted-foreground py-12">No products yet</p>
                : sampleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
          </div>
        )}

        {/* Load More */}
        <div className="flex justify-center mt-8">
          <Link to="/shop">
            <Button variant="outline" className="px-10">
              Load More Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ===== CATEGORIES SECTION ===== */}
      <section className="bg-muted/30 border-y border-border/50 py-10">
        <div className="container-alibaba">
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoriesLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6 text-center">
                      <Skeleton className="w-16 h-16 mx-auto mb-4 rounded-full" />
                      <Skeleton className="h-5 w-24 mx-auto mb-2" />
                      <Skeleton className="h-4 w-32 mx-auto" />
                    </CardContent>
                  </Card>
                ))
              : categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/shop?category=${category.id}`}
                    className="group"
                  >
                    <Card className="hover:shadow-lg transition-all duration-200 hover:border-primary/30 hover:-translate-y-0.5 cursor-pointer">
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

      {/* ===== VERIFIED SUPPLIERS SECTION ===== */}
      <section className="py-10">
        <div className="container-alibaba">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Verified Suppliers
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Trusted partners with proven track records
              </p>
            </div>
            <Link to="/suppliers" className="text-primary hover:underline flex items-center gap-1 text-sm">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {sellersLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-12 h-12 rounded-full" />
                          <div>
                            <Skeleton className="h-5 w-32 mb-1" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                        </div>
                        <Skeleton className="h-5 w-5 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-24 mb-3" />
                      <div className="flex gap-1">
                        <Skeleton className="h-5 w-16 rounded" />
                        <Skeleton className="h-5 w-20 rounded" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              : verifiedSellers.map((seller) => (
                  <Card key={seller.id} className="hover:shadow-lg transition-all duration-200 hover:border-primary/30">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{seller.company_name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">
                              {seller.supplier_type?.replace('_', ' ') || 'Supplier'}
                            </p>
                          </div>
                        </div>
                        {seller.is_verified && (
                          <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        <span>{(seller as any).users?.country || 'Global'}</span>
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

      {/* ===== WHY CHOOSE US ===== */}
      <section className="bg-primary/5 border-y border-border/50 py-12">
        <div className="container-alibaba">
          <h2 className="text-2xl font-bold text-center mb-10">Why Source on Harar Mart?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Verified Suppliers</h3>
              <p className="text-sm text-muted-foreground">Every supplier is vetted for quality and reliability</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Global Shipping</h3>
              <p className="text-sm text-muted-foreground">Ship to 150+ countries with tracking</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Best Prices</h3>
              <p className="text-sm text-muted-foreground">Competitive bulk pricing from manufacturers</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeadphonesIcon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">Dedicated support team for every order</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="container-alibaba py-12">
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 md:p-12 text-primary-foreground text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Sourcing?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of businesses already finding quality products on Harar Mart.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/auth?role=buyer">
              <Button size="lg" variant="secondary" className="h-12 px-8 text-base">
                <Package className="mr-2 h-5 w-5" />
                Start Buying
              </Button>
            </Link>
            <Link to="/auth?role=seller">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-white/10">
                <Building2 className="mr-2 h-5 w-5" />
                Become a Seller
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
