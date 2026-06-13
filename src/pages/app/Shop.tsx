import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import type { Product, Category } from '@/integrations/supabase/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { CheckCircle, Building2, Search, Filter } from 'lucide-react'
import { getCountryFlag } from '@/lib/utils'
import { ShopSkeleton } from '@/components/app/AppSkeletons'

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  
  // B2B Filters
  const [minMOQ, setMinMOQ] = useState(0)
  const [maxMOQ, setMaxMOQ] = useState(10000)
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([])
  const [selectedSupplierTypes, setSelectedSupplierTypes] = useState<string[]>([])
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*, seller: seller_profiles(*, users(*)), category:categories(*)')
      .eq('is_available', true)
    
    if (data && !error) {
      setProducts(data)
    }
    setLoading(false)
  }

  async function fetchCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
    
    if (data && !error) {
      setCategories(data)
    }
  }

  const allCertifications = Array.from(
    new Set(products.flatMap(p => p.certifications || []))
  ).sort()

  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesMOQ = product.moq >= minMOQ && product.moq <= maxMOQ
    const matchesCertifications = selectedCertifications.length === 0 ||
      selectedCertifications.some(cert => product.certifications?.includes(cert))
    const matchesSupplierType = selectedSupplierTypes.length === 0 ||
      selectedSupplierTypes.includes(product.seller?.supplier_type || '')
    const matchesVerified = !verifiedOnly || product.seller?.is_verified

    return matchesCategory && matchesSearch && matchesMOQ && 
           matchesCertifications && matchesSupplierType && matchesVerified
  })

  const toggleCertification = (cert: string) => {
    setSelectedCertifications(prev =>
      prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]
    )
  }

  const toggleSupplierType = (type: string) => {
    setSelectedSupplierTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  if (loading) {
    return <ShopSkeleton />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Source Products</h1>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products, suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className={`md:w-64 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="space-y-6 sticky top-4">
            {/* Category Filter */}
            <div>
              <h3 className="font-semibold mb-3">Category</h3>
              <div className="space-y-2">
                <Button
                  variant={selectedCategory === null ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(null)}
                >
                  All Categories
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* MOQ Filter */}
            <div>
              <h3 className="font-semibold mb-3">MOQ Range</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Min: {minMOQ}</span>
                  <span>Max: {maxMOQ}</span>
                </div>
                <Slider
                  value={[minMOQ, maxMOQ]}
                  onValueChange={(value) => {
                    setMinMOQ(value[0])
                    setMaxMOQ(value[1])
                  }}
                  min={0}
                  max={10000}
                  step={100}
                  className="w-full"
                />
              </div>
            </div>

            {/* Certifications Filter */}
            {allCertifications.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Certifications</h3>
                <div className="space-y-2">
                  {allCertifications.map((cert) => (
                    <div key={cert} className="flex items-center space-x-2">
                      <Checkbox
                        id={cert}
                        checked={selectedCertifications.includes(cert)}
                        onCheckedChange={() => toggleCertification(cert)}
                      />
                      <Label htmlFor={cert} className="text-sm cursor-pointer">
                        {cert}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supplier Type Filter */}
            <div>
              <h3 className="font-semibold mb-3">Supplier Type</h3>
              <div className="space-y-2">
                {['manufacturer', 'trading_company', 'wholesaler'].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={selectedSupplierTypes.includes(type)}
                      onCheckedChange={() => toggleSupplierType(type)}
                    />
                    <Label htmlFor={type} className="text-sm cursor-pointer capitalize">
                      {type.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Only Filter */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={verifiedOnly}
                onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
              />
              <Label htmlFor="verified" className="text-sm cursor-pointer">
                Verified Suppliers Only
              </Label>
            </div>

            {/* Clear Filters */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSelectedCategory(null)
                setMinMOQ(0)
                setMaxMOQ(10000)
                setSelectedCertifications([])
                setSelectedSupplierTypes([])
                setVerifiedOnly(false)
              }}
            >
              Clear All Filters
            </Button>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} products found
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found matching your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-4 overflow-hidden">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold line-clamp-2 mb-2">{product.name}</h3>
                    
                    {/* Price Range */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-primary">
                        ${product.min_price.toFixed(2)}
                      </span>
                      {product.max_price > product.min_price && (
                        <span className="text-sm text-muted-foreground">
                          - ${product.max_price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* MOQ Badge */}
                    <Badge variant="secondary" className="mb-3">
                      MOQ: {product.moq} units
                    </Badge>

                    {/* Seller Info */}
                    <div className="flex items-center gap-2 mb-3 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground truncate">
                        {product.seller?.company_name}
                      </span>
                      {product.seller?.is_verified && (
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    {/* Country */}
                    {product.seller?.user?.country && (
                      <div className="flex items-center gap-2 mb-3 text-sm">
                        <span className="text-muted-foreground">
                          {getCountryFlag(product.seller.user.country)} {product.seller.user.country}
                        </span>
                      </div>
                    )}

                    {/* Certifications */}
                    {product.certifications && product.certifications.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.certifications.slice(0, 2).map((cert) => (
                          <Badge key={cert} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                        {product.certifications.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{product.certifications.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    <Link to={`/products/${product.id}`}>
                      <Button className="w-full">
                        Contact Supplier
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
