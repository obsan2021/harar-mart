import React from 'react'
import { Link } from 'react-router-dom'
import { Star, Shield, MapPin, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export interface ProductCardData {
  id: string
  title: string
  image?: string
  priceMin: number
  priceMax: number
  moq: number
  supplierName: string
  supplierYears?: number
  supplierCountry?: string
  rating?: number
  reviewCount?: number
  isVerified?: boolean
}

interface ProductCardProps {
  product: ProductCardData
  loading?: boolean
}

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-muted animate-skeleton-pulse" />
      <CardContent className="p-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/products/${product.id}`} className="block group">
      <Card className="overflow-hidden product-card border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-200">
        {/* Image Container */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="product-card-overlay absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-foreground px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
              <Search className="h-4 w-4" />
              Find Similar
            </span>
          </div>

          {/* MOQ Badge */}
          <Badge variant="secondary" className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-xs font-medium">
            MOQ: {product.moq}+
          </Badge>

          {/* Verified Badge */}
          {product.isVerified && (
            <div className="absolute top-2 right-2">
              <div className="bg-green-500 text-white p-1 rounded-full shadow-sm">
                <Shield className="h-3 w-3" />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-3 space-y-1.5">
          {/* Title */}
          <h3 className="text-sm font-medium line-clamp-2 leading-snug min-h-[2.5rem]">
            {product.title}
          </h3>

          {/* Price Range */}
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-primary price-amount">
              ${(product.priceMin ?? 0).toFixed(2)}
            </span>
            {product.priceMax > product.priceMin && (
              <>
                <span className="text-muted-foreground"> - </span>
                <span className="text-base font-bold text-primary price-amount">
                  ${(product.priceMax ?? 0).toFixed(2)}
                </span>
              </>
            )}
            <span className="text-xs text-muted-foreground">/ piece</span>
          </div>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{product.rating}</span>
              {product.reviewCount && (
                <span className="text-xs text-muted-foreground">
                  ({product.reviewCount.toLocaleString()})
                </span>
              )}
            </div>
          )}

          {/* Supplier Info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border/40">
            <span className="truncate max-w-[120px]">{product.supplierName}</span>
            {product.supplierYears && (
              <span className="shrink-0">{product.supplierYears}yrs</span>
            )}
            {product.supplierCountry && (
              <span className="shrink-0 flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                {product.supplierCountry}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
