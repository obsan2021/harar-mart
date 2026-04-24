import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck, Clock, Star } from 'lucide-react'

export default function StandardsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Our Standards</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <ShieldCheck className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Freshness Guaranteed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We source only the freshest products from trusted local suppliers.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Clock className="h-12 w-12 text-primary mb-4" />
              <CardTitle>On-Time Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We respect your time and ensure deliveries arrive when promised.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Star className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Customer Satisfaction</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your satisfaction is our priority. We're always here to help.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}