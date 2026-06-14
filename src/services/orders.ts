import { supabase } from '@/integrations/supabase/client'
import type { Order, OrderItem } from '@/integrations/supabase/types'

export const ordersService = {
  async listForBuyer(buyerId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(*))')
      .eq('user_id', buyerId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as (Order & { items: OrderItem[] })[]
  },

  /**
   * List orders containing products that belong to the given seller.
   *
   * The `orders` table does not have a `seller_id` column.  A seller's orders
   * are those whose `order_items.product.seller_id` matches the seller's
   * `seller_profiles.id`.  We use a nested `or` filter on the `items`
   * relation to find matching orders.
   */
  async listForSeller(sellerId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items!inner(*, product:products!inner(*)), users!user_id(full_name, email)')
      .eq('items.product.seller_id', sellerId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as (Order & { items: OrderItem[] })[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(*))')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Order & { items: OrderItem[] }
  },

  async updateStatus(orderId: string, status: Order['status']) {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
    if (error) throw error
  },
}
