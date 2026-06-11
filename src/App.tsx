import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'

import { Toaster } from './components/ui/toaster'
import { ErrorBoundary } from './components/ErrorBoundary'
import AppLayout from './components/layouts/AppLayout'
import AdminLayout from './components/layouts/AdminLayout'
import SellerLayout from './components/layouts/SellerLayout'
import ProtectedRoute from './components/ui/ProtectedRoute'

// Lazy-loaded page components for code splitting
const Home = lazy(() => import('./pages/app/Home'))
const Shop = lazy(() => import('./pages/app/Shop'))
const ProductDetail = lazy(() => import('./pages/app/ProductDetail'))
const Cart = lazy(() => import('./pages/app/Cart'))
const Profile = lazy(() => import('./pages/app/Profile'))
const Orders = lazy(() => import('./pages/app/Orders'))
const OrderDetail = lazy(() => import('./pages/app/OrderDetail'))
const Inquiries = lazy(() => import('./pages/app/Inquiries'))
const Support = lazy(() => import('./pages/app/Support'))
const About = lazy(() => import('./pages/app/About'))
const Careers = lazy(() => import('./pages/app/Careers'))
const Press = lazy(() => import('./pages/app/Press'))
const Partners = lazy(() => import('./pages/app/Partners'))
const Contact = lazy(() => import('./pages/app/Contact'))
const NotFound = lazy(() => import('./pages/app/NotFound'))
const ComingSoon = lazy(() => import('./pages/ComingSoon'))
const SellerApplication = lazy(() => import('./pages/app/SellerApplication'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const Products = lazy(() => import('./pages/admin/Products'))
const OrdersAdmin = lazy(() => import('./pages/admin/Orders'))
const Users = lazy(() => import('./pages/admin/Users'))
const DeliveryAgents = lazy(() => import('./pages/admin/DeliveryAgents'))
const Sellers = lazy(() => import('./pages/admin/Sellers'))
const AdminSellerApplications = lazy(() => import('./pages/admin/SellerApplications'))
const SellerProducts = lazy(() => import('./pages/seller/Products'))
const SellerInquiries = lazy(() => import('./pages/seller/Inquiries'))
const SellerProfile = lazy(() => import('./pages/seller/Profile'))

// Auth pages — keep these eager (tiny + needed immediately)
import Auth from './pages/app/Auth'

function RedirectHandler() {
  const navigate = useNavigate()

  useEffect(() => {
    const redirect = sessionStorage.getItem('redirect')
    if (redirect) {
      sessionStorage.removeItem('redirect')
      navigate(redirect, { replace: true })
    }
  }, [navigate])

  return null
}

// Detect if we're on GitHub Pages (served from subpath) vs Vercel (root)
const isGitHubPages = window.location.hostname.includes('github.io')
const basename = isGitHubPages ? '/harar-mart' : ''

function App() {
  return (
    <Router basename={basename}>
      <RedirectHandler />
      <AuthProvider>
        <CartProvider>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          }>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Home />} />
                <Route path="shop" element={<Shop />} />
                <Route path="products/:id" element={<ProductDetail />} />
                <Route path="cart" element={<Cart />} />
                <Route path="support" element={<Support />} />
                <Route path="about" element={<About />} />
                <Route path="careers" element={<Careers />} />
                <Route path="press" element={<Press />} />
                <Route path="partners" element={<Partners />} />
                <Route path="contact" element={<Contact />} />

                {/* Stub routes for footer links */}
                <Route path="categories" element={<ComingSoon />} />
                <Route path="suppliers" element={<ComingSoon />} />
                <Route path="quotes" element={<ComingSoon />} />
                <Route path="samples" element={<ComingSoon />} />
                <Route path="blog" element={<ComingSoon />} />
                <Route path="guides" element={<ComingSoon />} />
                <Route path="help" element={<ComingSoon />} />
                <Route path="community" element={<ComingSoon />} />
                <Route path="privacy" element={<ComingSoon />} />
                <Route path="terms" element={<ComingSoon />} />
                <Route path="cookies" element={<ComingSoon />} />
                <Route path="disclaimer" element={<ComingSoon />} />
                <Route path="compliance" element={<ComingSoon />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="profile" element={<Profile />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="orders/:id" element={<OrderDetail />} />
                  <Route path="inquiries" element={<Inquiries />} />
                  <Route path="become-a-seller" element={<SellerApplication />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Standalone Auth Route (no nav/footer) */}
              <Route path="auth" element={<Auth />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route element={<ProtectedRoute requireAdmin />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="products" element={<Products />} />
                  <Route path="orders" element={<OrdersAdmin />} />
                  <Route path="users" element={<Users />} />
                  <Route path="sellers" element={<Sellers />} />
                  <Route path="delivery-agents" element={<DeliveryAgents />} />
                  <Route path="applications" element={<AdminSellerApplications />} />
                </Route>
              </Route>

              {/* Seller Routes */}
              <Route path="/seller" element={<SellerLayout />}>
                <Route element={<ProtectedRoute />}>
                  <Route index element={<Navigate to="/seller/products" replace />} />
                  <Route path="products" element={<SellerProducts />} />
                  <Route path="inquiries" element={<SellerInquiries />} />
                  <Route path="profile" element={<SellerProfile />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
