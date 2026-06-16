import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils'
import type { OrderWithRelations } from '@/integrations/supabase/types'

interface OrderDetailPanelProps {
  order: OrderWithRelations
  onClose: () => void
}

export default function OrderDetailPanel({ order, onClose }: OrderDetailPanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={getStatusColor(order.status ?? 'pending') as any}>
                {(order.status ?? 'pending').replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-lg font-bold">{formatPrice(order.total)}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Order Date</h4>
            <p className="text-sm text-muted-foreground">{formatDate(order.created_at ?? '')}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Delivery Address</h4>
            <p className="text-sm text-muted-foreground">
              {order.delivery_address || 'N/A'}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Customer Notes</h4>
            <p className="text-sm text-muted-foreground">
              {(order as any).notes || 'No notes provided'}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Order Items</h4>
            <div className="space-y-2">
              {((order.items ?? []))?.map((item, index) => (
                <div key={index} className="flex justify-between text-sm p-2 bg-muted rounded">
                  <div>
                    <p className="font-medium">{(item as any).product?.name || 'Unknown'}</p>
                    <p className="text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
