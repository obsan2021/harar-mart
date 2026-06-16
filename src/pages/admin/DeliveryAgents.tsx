import React, { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { DeliveryAgentWithRelations } from '@/integrations/supabase/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import { SimpleListSkeleton } from '@/components/admin/AdminSkeletons'

export default function DeliveryAgents() {
  const [agents, setAgents] = useState<DeliveryAgentWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAgents()
  }, [])

  async function fetchAgents() {
    const { data, error } = await supabase
      .from('delivery_agents')
      .select('*, user:users(*)')
    
    if (data && !error) {
      setAgents(data)
    }
    setLoading(false)
  }

  if (loading) {
    return <SimpleListSkeleton rows={5} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Delivery Agents</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Agent
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Team</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{agent.user?.full_name || 'Unknown'}</h3>
                  <p className="text-sm text-muted-foreground">{agent.user?.email}</p>
                  {agent.vehicle_type && (
                    <p className="text-sm text-muted-foreground">{agent.vehicle_type} • {agent.license_plate}</p>
                  )}
                </div>
                <Badge variant={agent.is_active ? 'default' : 'secondary'}>
                  {agent.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
