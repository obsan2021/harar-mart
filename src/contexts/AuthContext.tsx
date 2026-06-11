import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { User, SellerProfile } from '@/integrations/supabase/types'

interface AuthContextType {
  user: User | null
  sellerProfile: SellerProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  isAdmin: boolean
  isSeller: boolean
  isBuyer: boolean
  isVerified: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setSellerProfile(null)
      }
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Fallback: if loading takes too long, set it to false
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout - setting loading to false')
        setLoading(false)
      }
    }, 3000)
    return () => clearTimeout(timeout)
  }, [loading])

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await fetchUserProfile(session.user.id)
    }
    setLoading(false)
  }

  async function fetchUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return
      }

      if (data) {
        setUser(data)

        if (data.role === 'seller') {
          const { data: sellerData, error: sellerError } = await supabase
            .from('seller_profiles')
            .select('*')
            .eq('user_id', userId)
            .single()
          if (sellerError) {
            console.error('Error fetching seller profile:', sellerError)
          } else if (sellerData) {
            setSellerProfile(sellerData)
          }
        }
      }
    } catch (e) {
      console.error('Error in fetchUserProfile:', e)
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email: string, password: string, fullName: string) {
    // Everyone signs up as a buyer — the handle_new_user DB trigger
    // will create the public.users row with role='buyer'.
    // We pass full_name in user_metadata so the trigger can use it.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    if (error) throw error

    // If the DB trigger doesn't fire (e.g. on an existing project where
    // it hasn't been applied yet), fall back to inserting manually.
    if (data.user) {
      // Check if the trigger already created the row
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existing) {
        await supabase.from('users').insert({
          id: data.user.id,
          email,
          full_name: fullName,
          role: 'buyer',
          is_verified: false,
        })
      }
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setSellerProfile(null)
  }

  const value = {
    user,
    sellerProfile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin: user?.role === 'admin',
    isSeller: user?.role === 'seller',
    isBuyer: user?.role === 'buyer',
    isVerified: user?.is_verified || false,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
