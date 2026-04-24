import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Clock, Truck } from 'lucide-react'

export default function PricingSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Transparent Pricing</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Standard Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">$5.00</div>
              <p className="text-sm text-muted-foreground mb-4">Per order</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Delivery within 2 hours</span>
                </li>
                <li className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>Real-time tracking</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Express Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">$8.00</div>
              <p className="text-sm text-muted-foreground mb-4">Per order</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Delivery within 30 minutes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>Priority handling</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">$3.00</div>
              <p className="text-sm text-muted-foreground mb-4">Per order</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Choose your time slot</span>
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span>Best value option</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}