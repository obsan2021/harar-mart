import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './AuthContext'
import type { CartItem, Product } from '@/integrations/supabase/types'

interface CartContextType {
  cartItems: CartItem[]
  loading: boolean
  addToCart: (product: Product, quantity: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  cartTotal: number
  cartCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  // Start false — logged-out users have no cart to wait for.
  // fetchCart() sets it to false when done for logged-in users.
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchCart()
    } else {
      setCartItems([])
      setLoading(false)
    }
  }, [user])

  // Fallback: if loading takes too long, set it to false
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Cart loading timeout - setting loading to false')
        setLoading(false)
      }
    }, 3000)
    return () => clearTimeout(timeout)
  }, [loading])

  async function fetchCart() {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, product:products(*)')
        .eq('user_id', user.id)
      
      if (error) {
        console.error('Error fetching cart:', error)
      } else if (data) {
        setCartItems(data)
      }
    } catch (e) {
      console.error('Error in fetchCart:', e)
    }
    setLoading(false)
  }

  async function addToCart(product: Product, quantity: number) {
    if (!user) return

    const existingItem = cartItems.find(item => item.product_id === product.id)

    if (existingItem) {
      await updateQuantity(existingItem.id, existingItem.quantity + quantity)
    } else {
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity,
        })
        .select('*, product:products(*)')
        .single()

      if (data && !error) {
        setCartItems([...cartItems, data])
      }
    }
  }

  async function removeFromCart(itemId: string) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)

    if (!error) {
      setCartItems(cartItems.filter(item => item.id !== itemId))
    }
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      await removeFromCart(itemId)
      return
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)

    if (!error) {
      setCartItems(cartItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ))
    }
  }

  async function clearCart() {
    if (!user) return

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)

    if (!error) {
      setCartItems([])
    }
  }

  const cartTotal = cartItems.reduce(
    (total, item) => total + ((item.product?.min_price ?? 0) * item.quantity),
    0
  )

  const cartCount = cartItems.reduce(
    (count, item) => count + item.quantity,
    0
  )

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
