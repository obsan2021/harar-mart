import React, { createContext, useContext, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import type { User, SellerProfile } from '@/integrations/supabase/types'

interface AuthContextType {
  user: User | null
  sellerProfile: SellerProfile | null
  loading: boolean
  profileFetchError: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  isAdmin: boolean
  isSeller: boolean
  isBuyer: boolean
  isVerified: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// TEMP: Bypass auth while Google OAuth is being fixed.
// Set to true to skip authentication and use mock users.
const BYPASS_AUTH = true

const MOCK_ADMIN_USER: User = {
  id: 'mock-admin-id',
  email: 'admin@hararmart.com',
  full_name: 'Admin User',
  phone: null,
  address: null,
  role: 'admin',
  is_verified: true,
  country: 'Ethiopia',
  created_at: new Date().toISOString(),
}

const MOCK_SELLER_USER: User = {
  id: 'mock-seller-id',
  email: 'seller@hararmart.com',
  full_name: 'Seller User',
  phone: null,
  address: null,
  role: 'seller',
  is_verified: true,
  country: 'Ethiopia',
  created_at: new Date().toISOString(),
}

const MOCK_BUYER_USER: User = {
  id: 'mock-buyer-id',
  email: 'buyer@hararmart.com',
  full_name: 'Buyer User',
  phone: null,
  address: null,
  role: 'buyer',
  is_verified: true,
  country: 'Ethiopia',
  created_at: new Date().toISOString(),
}

const MOCK_SELLER_PROFILE: SellerProfile = {
  id: 'mock-seller-profile-id',
  user_id: 'mock-seller-id',
  company_name: 'Mock Trading Co',
  tax_id: 'TX123456',
  business_license_url: null,
  certifications: ['ISO9001'],
  supplier_type: 'manufacturer',
  is_verified: true,
  created_at: new Date().toISOString(),
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileFetchError, setProfileFetchError] = useState<string | null>(null)
  const location = useLocation()

  // TEMP: Re-evaluate mock user whenever the route changes
  useEffect(() => {
    if (BYPASS_AUTH) {
      const path = location.pathname
      if (path.startsWith('/admin')) {
        setUser(MOCK_ADMIN_USER)
        setSellerProfile(null)
      } else if (path.startsWith('/seller')) {
        setUser(MOCK_SELLER_USER)
        setSellerProfile(MOCK_SELLER_PROFILE)
      } else {
        setUser(MOCK_BUYER_USER)
        setSellerProfile(null)
      }
      setLoading(false)
      return
    }
  }, [location.pathname])

  useEffect(() => {
    if (BYPASS_AUTH) return

    // Normal auth flow below
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setSellerProfile(null)
        setProfileFetchError(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await fetchUserProfile(session.user.id)
    }
    setLoading(false)
  }

  async function fetchUserProfile(userId: string) {
    try {
      setProfileFetchError(null)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching user profile:', error)
        setProfileFetchError('Unable to load user profile. Please try again.')
        setLoading(false)
        return
      }

      // If no user row exists yet (e.g. trigger hasn't fired, or user
      // was created before the handle_new_user trigger existed), create it.
      if (!data) {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const fullName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || ''
          const { error: upsertError } = await supabase.from('users').upsert({
            id: userId,
            email: authUser.email!,
            full_name: fullName,
            role: 'buyer',
            is_verified: false,
          }, { onConflict: 'id' })
          if (upsertError) {
            console.error('Failed to create user profile row:', upsertError)
            setProfileFetchError('Unable to create user profile. Please contact support.')
            // Set a minimal user object so the app doesn't break
            setUser({
              id: userId,
              email: authUser.email!,
              full_name: fullName,
              phone: null,
              address: null,
              role: 'buyer',
              is_verified: false,
              country: null,
              created_at: new Date().toISOString(),
            })
          } else {
            // Fetch the newly created row
            const { data: newUser } = await supabase
              .from('users')
              .select('*')
              .eq('id', userId)
              .single()
            if (newUser) setUser(newUser)
          }
        }
        setLoading(false)
        return
      }

      if (data) {
        setUser(data)

        if (data.role === 'seller') {
          const { data: sellerData, error: sellerError } = await supabase
            .from('seller_profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle()
          if (sellerError) {
            console.error('Error fetching seller profile:', sellerError)
            // Don't block sign-in if seller profile fetch fails
            setSellerProfile(null)
          } else if (sellerData) {
            setSellerProfile(sellerData)
          }
        }
      }
      setLoading(false)
    } catch (e) {
      console.error('Error in fetchUserProfile:', e)
      setProfileFetchError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  async function signIn(email: string, password: string) {
    // Clear any previous profile fetch errors
    setProfileFetchError(null)
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      // Provide more specific error messages
      if (error.message === 'Invalid login credentials') {
        throw new Error('Invalid email or password')
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('Please confirm your email address before signing in')
      } else {
        throw error
      }
    }
    // After successful sign-in, onAuthStateChange will fire and fetchUserProfile
    // will be called. The Auth page's useEffect will detect the user and redirect.
  }

  async function signUp(email: string, password: string, fullName: string) {
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

  async function signInWithGoogle() {
    setProfileFetchError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth',
      },
    })
    if (error) throw error
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
    profileFetchError,
    signIn,
    signUp,
    signInWithGoogle,
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
