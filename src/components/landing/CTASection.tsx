import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function CTASection() {
  return (
    <section className="bg-primary text-primary-foreground py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl mb-8 max-w-xl mx-auto">
          Join thousands of satisfied customers who trust Harar Mart for their grocery needs.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/shop">
            <Button size="lg" variant="secondary">
              Shop Now
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}