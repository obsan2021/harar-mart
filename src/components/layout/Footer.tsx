import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import logoSrc from '@/assets/sta hararmart g1.png'

const footerLinks = {
  product: [
    { label: 'Browse Products', to: '/shop' },
    { label: 'Categories', to: '/categories' },
    { label: 'Verified Suppliers', to: '/suppliers' },
    { label: 'Request Quotes', to: '/quotes' },
    { label: 'Order Samples', to: '/samples' },
  ],
  company: [
    { label: 'About Us', to: '/about' },
    { label: 'Careers', to: '/careers' },
    { label: 'Press', to: '/press' },
    { label: 'Partners', to: '/partners' },
    { label: 'Contact Us', to: '/contact' },
  ],
  resources: [
    { label: 'Blog', to: '/blog' },
    { label: 'Buying Guides', to: '/guides' },
    { label: 'Help Center', to: '/help' },
    { label: 'API Documentation', to: '/api' },
    { label: 'Community', to: '/community' },
  ],
  legal: [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Cookie Policy', to: '/cookies' },
    { label: 'Disclaimer', to: '/disclaimer' },
    { label: 'Compliance', to: '/compliance' },
  ],
}

const paymentMethods = [
  { name: 'Visa', icon: '💳' },
  { name: 'Mastercard', icon: '💳' },
  { name: 'PayPal', icon: '🅿️' },
  { name: 'Bank Transfer', icon: '🏦' },
  { name: 'Mobile Money', icon: '📱' },
]

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: '#' },
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'Instagram', icon: Instagram, href: '#' },
  { name: 'LinkedIn', icon: Linkedin, href: '#' },
  { name: 'YouTube', icon: Youtube, href: '#' },
]

export default function Footer() {
  return (
    <footer className="bg-muted border-t border-border">
      {/* Newsletter Section */}
      <div className="border-b border-border">
        <div className="container-alibaba py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">Stay Updated</h3>
              <p className="text-sm text-muted-foreground">Get the latest deals and product updates</p>
            </div>
            <div className="flex w-full max-w-md gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-background"
              />
              <Button type="submit">
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-alibaba py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Logo and Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <img src={logoSrc} alt="Harar Mart" className="h-10 w-10 rounded-lg object-cover" />
              <span className="text-xl font-bold">Harar Mart</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your trusted global B2B marketplace connecting buyers with verified suppliers worldwide.
            </p>
            
            {/* Social Media */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-9 h-9 bg-background rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* App Download Badges */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-medium text-muted-foreground">Download our app</p>
              <div className="flex gap-2">
                <div className="bg-background border border-border rounded-lg px-4 py-2 flex items-center gap-2 text-xs hover:border-primary/30 transition-colors cursor-pointer">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Download on the</div>
                    <div className="text-xs font-medium">App Store</div>
                  </div>
                </div>
                <div className="bg-background border border-border rounded-lg px-4 py-2 flex items-center gap-2 text-xs hover:border-primary/30 transition-colors cursor-pointer">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 010 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                  </svg>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Get it on</div>
                    <div className="text-xs font-medium">Google Play</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Product</h3>
            <ul className="space-y-2.5">
              {footerLinks.product.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Company</h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Resources</h3>
            <ul className="space-y-2.5">
              {footerLinks.resources.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Legal</h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-10 pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground font-medium">Accepted Payments:</span>
              <div className="flex gap-2">
                {paymentMethods.map((method) => (
                  <div
                    key={method.name}
                    className="bg-background border border-border rounded-md px-3 py-1.5 text-xs text-muted-foreground flex items-center gap-1.5"
                    title={method.name}
                  >
                    <span>{method.icon}</span>
                    <span>{method.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Email Us</p>
                <p className="text-sm text-muted-foreground">support@hararmart.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Call Us</p>
                <p className="text-sm text-muted-foreground">+251919054807</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Visit Us</p>
                <p className="text-sm text-muted-foreground">Harar, Ethiopia</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-border text-center md:text-left">
          <p className="text-sm text-muted-foreground">
            &copy; 2026 Harar Mart. All rights reserved. Built with ❤️ for global trade. | Developed by{' '}
            <a href="https://officialcloverdigital.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Clover Digital
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
