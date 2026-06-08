import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck, Clock, MapPin } from 'lucide-react'

export default function DeliverySection() {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Fast & Reliable Delivery</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Clock className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Quick Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get your groceries delivered in as little as 30 minutes with our express service.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <MapPin className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Real-Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Track your order in real-time from the store to your doorstep.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Truck className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Professional Team</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our delivery team is trained to handle your groceries with care.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}