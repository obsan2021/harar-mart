import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, Truck, Shield, Clock } from 'lucide-react'

export default function ProblemSection() {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">The Problem</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Clock className="h-12 w-12 text-destructive mb-4" />
              <CardTitle>Time-Consuming</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Traditional grocery shopping takes hours out of your busy day.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Truck className="h-12 w-12 text-destructive mb-4" />
              <CardTitle>Limited Options</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Local stores may not have everything you need in one place.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <ShoppingCart className="h-12 w-12 text-destructive mb-4" />
              <CardTitle>Physical Strain</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Carrying heavy groceries is difficult, especially for elderly or disabled individuals.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}