import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Truck, Shield, Clock } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="bg-primary text-primary-foreground py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Fresh Groceries Delivered to Your Door
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Shop from the best local stores and get your groceries delivered in minutes.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/shop">
            <Button size="lg" variant="secondary">
              Start Shopping
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}