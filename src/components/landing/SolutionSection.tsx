import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Smartphone, MapPin, Package } from 'lucide-react'

export default function SolutionSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Our Solution</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Smartphone className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Easy App</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Order from anywhere using our user-friendly mobile app or website.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <MapPin className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Wide Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We partner with multiple local stores to bring you everything in one place.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Package className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Quick Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get your groceries delivered to your doorstep in as little as 30 minutes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}