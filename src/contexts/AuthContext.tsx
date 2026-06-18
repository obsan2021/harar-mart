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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null)
  // Always start loading=true to ensure proper session restoration
  // onAuthStateChange will set it to false once session is determined
  const [loading, setLoading] = useState<boolean>(true)
  const [profileFetchError, setProfileFetchError] = useState<string | null>(null)
  const location = useLocation()

  useEffect(() => {
    let cancelled = false

    const safetyTimer = setTimeout(() => {
      if (!cancelled) setLoading(false)
    }, 8000)

    // Single source of truth: onAuthStateChange handles EVERYTHING.
    // It fires INITIAL_SESSION on mount with the persisted session (if any),
    // then fires subsequent events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED).
    // We do NOT call getSession() separately — that's what causes the race.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (cancelled) return
        clearTimeout(safetyTimer)

        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
          setSellerProfile(null)
          setProfileFetchError(null)
          setLoading(false)
        }
      }
    )

    return () => {
      cancelled = true
      clearTimeout(safetyTimer)
      subscription.unsubscribe()
    }
  }, [])

  async function fetchUserProfile(userId: string) {
    try {
      setProfileFetchError(null)
      const selectUserRow = async () => {
        return supabase
          .from('users')
          .select('id, email, full_name, phone, address, role, created_at, updated_at, is_verified, country')
          .eq('id', userId)
          .maybeSingle()
      }

      const { data, error } = await selectUserRow()
      if (error) {
        console.error('Error fetching user profile:', error)
        const fallbackSelect = await supabase
          .from('users')
          .select('id, email, full_name, role, created_at')
          .eq('id', userId)
          .maybeSingle()

        if (fallbackSelect.error) {
          console.error('Error fetching fallback user profile:', fallbackSelect.error)
        } else if (fallbackSelect.data) {
          setUser({
            ...fallbackSelect.data,
            phone: null,
            address: null,
            is_verified: false,
            country: null,
            updated_at: new Date().toISOString(),
          })
          setLoading(false)
          return
        }

        const { data: { user: authFallbackUser } } = await supabase.auth.getUser()
        if (authFallbackUser) {
          const role = (authFallbackUser.user_metadata?.role as User['role']) || 'buyer'
          const fullName = authFallbackUser.user_metadata?.full_name || authFallbackUser.email?.split('@')[0] || ''
          setUser({
            id: authFallbackUser.id,
            email: authFallbackUser.email || '',
            full_name: fullName,
            phone: null,
            address: null,
            role,
            is_verified: false,
            country: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          setLoading(false)
          return
        }

        setProfileFetchError('Unable to load user profile. Please try again.')
        setLoading(false)
        return
      }

      if (!data) {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const fullName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || ''
          const role = (authUser.user_metadata?.role as User['role']) || 'buyer'
          const minimalInsert = {
            id: userId,
            email: authUser.email!,
            full_name: fullName,
            role,
            is_verified: false,
            country: null,
          }

          const { error: insertError } = await supabase.from('users').upsert(minimalInsert, {
            onConflict: 'id',
            ignoreDuplicates: true,
          })

          if (insertError) {
            console.error('Failed to create user profile row:', insertError)
            setUser({
              id: userId,
              email: authUser.email!,
              full_name: fullName,
              phone: null,
              address: null,
              role,
              is_verified: false,
              country: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            setLoading(false)
            return
          }

          const { data: newUser } = await selectUserRow()
          if (newUser) {
            setUser({
              ...newUser,
              phone: newUser.phone || null,
              address: newUser.address || null,
              is_verified: newUser.is_verified || false,
              country: newUser.country || null,
              updated_at: newUser.updated_at || new Date().toISOString(),
            })
            setLoading(false)
            return
          }

          setUser({
            id: userId,
            email: authUser.email!,
            full_name: fullName,
            phone: null,
            address: null,
            role,
            is_verified: false,
            country: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          setLoading(false)
          return
        }

        setProfileFetchError('Unable to load user profile. Please try again.')
        setLoading(false)
        return
      }

      setUser({
        ...data,
        phone: data.phone || null,
        address: data.address || null,
        is_verified: data.is_verified || false,
        country: data.country || null,
        updated_at: data.updated_at || new Date().toISOString(),
      })

      if (data.role === 'seller') {
        const { data: sellerData, error: sellerError } = await supabase
          .from('seller_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()
        if (sellerError) {
          console.error('Error fetching seller profile:', sellerError)
          setSellerProfile(null)
        } else if (sellerData) {
          setSellerProfile(sellerData)
        }
      }

      setLoading(false)
    } catch (e) {
      console.error('Error in fetchUserProfile:', e)
      const { data: { user: authFallbackUser } } = await supabase.auth.getUser()
      if (authFallbackUser) {
        const role = (authFallbackUser.user_metadata?.role as User['role']) || 'buyer'
        const fullName = authFallbackUser.user_metadata?.full_name || authFallbackUser.email?.split('@')[0] || ''
        setUser({
          id: authFallbackUser.id,
          email: authFallbackUser.email || '',
          full_name: fullName,
          phone: null,
          address: null,
          role,
          is_verified: false,
          country: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        setProfileFetchError(null)
      } else {
        setProfileFetchError('An unexpected error occurred. Please try again.')
      }
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
