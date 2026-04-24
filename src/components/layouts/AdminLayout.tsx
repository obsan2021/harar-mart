import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LayoutDashboard, Package, Users, Truck, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import NavLink from '@/components/ui/NavLink'

export default function AdminLayout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/orders', label: 'Orders', icon: Truck },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/delivery-agents', label: 'Delivery Agents', icon: Truck },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className="p-6 border-b">
          <Link to="/admin" className="text-xl font-bold text-primary">
            Harar Mart Admin
          </Link>
        </div>
        <nav className="p-4 space-y-2">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-2 rounded-md hover:bg-accent ${
                location.pathname === link.to ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
              }`}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <span>Back to Store</span>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="border-b bg-background p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4 ml-auto">
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}