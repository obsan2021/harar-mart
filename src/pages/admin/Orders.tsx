import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { OrderWithRelations } from '@/integrations/supabase/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils'
import { OrdersSkeleton } from '@/components/admin/AdminSkeletons'

export default function Orders() {
  const [orders, setOrders] = useState<OrderWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*, user:users(*)')
      .order('created_at', { ascending: false })
      .limit(10)

    if (data && !error) {
      setOrders(data)
    }
    setLoading(false)
  }

  if (loading) {
    return <OrdersSkeleton />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Orders</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {order.user?.email || 'Unknown'} • {formatDate(order.created_at ?? '')}
                  </p>
                  <p className="text-sm font-semibold">{formatPrice(order.total)}</p>
                </div>
                <Badge variant={getStatusColor(order.status ?? 'pending') as any}>
                  {(order.status ?? 'pending').replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
