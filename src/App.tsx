import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { Toaster } from './components/ui/toaster'
import AppLayout from './components/layouts/AppLayout'
import AdminLayout from './components/layouts/AdminLayout'
import SellerLayout from './components/layouts/SellerLayout'
import Home from './pages/app/Home'
import Shop from './pages/app/Shop'
import ProductDetail from './pages/app/ProductDetail'
import Cart from './pages/app/Cart'
import Auth from './pages/app/Auth'
import Profile from './pages/app/Profile'
import Orders from './pages/app/Orders'
import OrderDetail from './pages/app/OrderDetail'
import Inquiries from './pages/app/Inquiries'
import Support from './pages/app/Support'
import About from './pages/app/About'
import Careers from './pages/app/Careers'
import Press from './pages/app/Press'
import Partners from './pages/app/Partners'
import Contact from './pages/app/Contact'
import NotFound from './pages/app/NotFound'
import Dashboard from './pages/admin/Dashboard'
import Products from './pages/admin/Products'
import OrdersAdmin from './pages/admin/Orders'
import Users from './pages/admin/Users'
import DeliveryAgents from './pages/admin/DeliveryAgents'
import Sellers from './pages/admin/Sellers'
import SellerProducts from './pages/seller/Products'
import SellerInquiries from './pages/seller/Inquiries'
import SellerProfile from './pages/seller/Profile'
import ProtectedRoute from './components/ui/ProtectedRoute'

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="auth" element={<Auth />} />
              <Route path="support" element={<Support />} />
              <Route path="about" element={<About />} />
              <Route path="careers" element={<Careers />} />
              <Route path="press" element={<Press />} />
              <Route path="partners" element={<Partners />} />
              <Route path="contact" element={<Contact />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="profile" element={<Profile />} />
                <Route path="orders" element={<Orders />} />
                <Route path="orders/:id" element={<OrderDetail />} />
                <Route path="inquiries" element={<Inquiries />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Route>

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
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
