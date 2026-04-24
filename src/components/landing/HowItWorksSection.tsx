import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, ShoppingCart, Package, CheckCircle } from 'lucide-react'

export default function HowItWorksSection() {
  const steps = [
    {
      icon: Search,
      title: 'Browse Products',
      description: 'Explore our wide selection of groceries from local stores.',
    },
    {
      icon: ShoppingCart,
      title: 'Add to Cart',
      description: 'Select your items and add them to your shopping cart.',
    },
    {
      icon: Package,
      title: 'Place Order',
      description: 'Checkout and provide your delivery details.',
    },
    {
      icon: CheckCircle,
      title: 'Get Delivered',
      description: 'Sit back and relax while we deliver your groceries.',
    },
  ]

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index}>
              <CardContent className="pt-6 text-center">
                <div className="relative inline-block mb-4">
                  <step.icon className="h-12 w-12 text-primary" />
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}