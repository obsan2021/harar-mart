import React, { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { 
  ShoppingCart, User, LogOut, Menu, X, Search, 
  MessageSquare, Globe, ChevronDown, Package, LayoutDashboard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import logoSrc from '@/assets/sta hararmart g1.png'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import NavLink from '@/components/ui/NavLink'
import Footer from '@/components/layout/Footer'
import { MegaMenu } from '@/components/marketplace'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function AppLayout() {
  const { user, signOut, isAdmin } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  // Track scroll for sticky header shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'G'

  return (
    <div className="min-h-screen flex flex-col">
      {/* ===== STICKY HEADER ===== */}
      <div 
        ref={headerRef}
        className={`sticky top-0 z-50 bg-background transition-shadow duration-300 ${
          scrolled ? 'shadow-md' : 'shadow-sm'
        }`}
      >
        {/* Top Bar */}
        <div className="border-b border-border/60">
          <div className="container-alibaba">
            <div className="flex items-center justify-between h-16 gap-4">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 shrink-0">
                <img src={logoSrc} alt="Harar Mart" className="h-10 w-10" />
                <span className="text-xl font-bold text-foreground hidden sm:block">
                  Harar Mart
                </span>
              </Link>

              {/* Search Bar - Center */}
              <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products, suppliers..."
                    className="pl-10 pr-4 h-10 bg-muted/50 border-border/60 focus-visible:bg-background rounded-full text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>

              {/* Right Icons */}
              <div className="flex items-center gap-1 md:gap-2">
                {/* Ship to - Desktop */}
                <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-md hover:bg-muted">
                  <Globe className="h-4 w-4" />
                  <span>Ship to: Ethiopia</span>
                  <ChevronDown className="h-3 w-3" />
                </div>

                {/* Messages */}
                <Link to="/inquiries">
                  <Button variant="ghost" size="icon" className="relative">
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </Link>

                {/* Cart */}
                <Link to="/cart" className="relative">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </Button>
                </Link>

                {/* Account Dropdown */}
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                            {userInitial}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => navigate('/profile')}>
                        <User className="h-4 w-4 mr-2" />
                        My Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/orders')}>
                        <Package className="h-4 w-4 mr-2" />
                        My Orders
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Admin Panel
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={signOut}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link to="/auth">
                    <Button size="sm" className="h-9 px-4 text-sm">
                      <User className="h-4 w-4 mr-1.5" />
                      Sign In
                    </Button>
                  </Link>
                )}

                {/* Mobile Menu Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="border-b border-border/40 hidden md:block">
          <div className="container-alibaba">
            <nav className="flex items-center h-11 gap-1">
              <MegaMenu />
              
              <div className="w-px h-5 bg-border mx-2" />

              <NavLink to="/shop" className="text-sm font-medium px-3 py-1.5 rounded-md hover:bg-muted transition-colors">
                Featured
              </NavLink>
              <NavLink to="/shop?sort=newest" className="text-sm font-medium px-3 py-1.5 rounded-md hover:bg-muted transition-colors">
                New Arrivals
              </NavLink>
              <NavLink to="/shop?sort=best_seller" className="text-sm font-medium px-3 py-1.5 rounded-md hover:bg-muted transition-colors">
                Best Sellers
              </NavLink>
              <NavLink to="/rentals" className="text-sm font-medium px-3 py-1.5 rounded-md hover:bg-muted transition-colors">
                House Rentals
              </NavLink>
              <NavLink to="/support" className="text-sm font-medium px-3 py-1.5 rounded-md hover:bg-muted transition-colors">
                Support
              </NavLink>

              <div className="ml-auto flex items-center gap-2">
                <Link to="/become-a-seller">
                  <Button variant="ghost" size="sm" className="text-xs h-7 px-3 text-primary hover:text-primary">
                    Sell on Harar Mart
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        </div>

        {/* Mobile Search Bar (visible only on mobile) */}
        <div className="md:hidden border-b border-border/40 px-4 py-2">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-9 h-9 bg-muted/50 rounded-full text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-background">
            <nav className="container-alibaba py-4 flex flex-col gap-1">
              <Link to="/shop" className="px-3 py-2.5 text-sm font-medium rounded-md hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                Featured Products
              </Link>
              <Link to="/shop?sort=newest" className="px-3 py-2.5 text-sm font-medium rounded-md hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                New Arrivals
              </Link>
              <Link to="/shop?sort=best_seller" className="px-3 py-2.5 text-sm font-medium rounded-md hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                Best Sellers
              </Link>
              <Link to="/rentals" className="px-3 py-2.5 text-sm font-medium rounded-md hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                House Rentals
              </Link>
              <Link to="/support" className="px-3 py-2.5 text-sm font-medium rounded-md hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                Support
              </Link>
              <div className="border-t border-border my-2 pt-2">
                {isAdmin && (
                  <Link to="/admin/dashboard" className="px-3 py-2.5 text-sm font-medium text-primary rounded-md hover:bg-primary/5 block" onClick={() => setMobileMenuOpen(false)}>
                    Admin Panel
                  </Link>
                )}
                <Link to="/become-a-seller" className="px-3 py-2.5 text-sm font-medium text-primary rounded-md hover:bg-primary/5 block" onClick={() => setMobileMenuOpen(false)}>
                  Sell on Harar Mart
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
