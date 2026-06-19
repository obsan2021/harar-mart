import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
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
  const [loading, setLoading] = useState<boolean>(true)
  const [profileFetchError, setProfileFetchError] = useState<string | null>(null)
  const fetchIdRef = useRef(0)

  const fetchUserProfile = useCallback(async (userId: string) => {
    const currentFetchId = ++fetchIdRef.current

    try {
      setProfileFetchError(null)

      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, phone, address, role, created_at, updated_at, is_verified, country')
        .eq('id', userId)
        .maybeSingle()

      if (currentFetchId !== fetchIdRef.current) return

      if (error) {
        console.error('Error fetching user profile:', error)
        const { data: { user: authFallbackUser } } = await supabase.auth.getUser()
        if (currentFetchId !== fetchIdRef.current) return

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
        } else {
          setProfileFetchError('Unable to load user profile. Please try again.')
        }
        setLoading(false)
        return
      }

      if (!data) {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (currentFetchId !== fetchIdRef.current) return

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

          await supabase.from('users').upsert(minimalInsert, {
            onConflict: 'id',
            ignoreDuplicates: true,
          })

          if (currentFetchId !== fetchIdRef.current) return

          const { data: newUser } = await supabase
            .from('users')
            .select('id, email, full_name, phone, address, role, created_at, updated_at, is_verified, country')
            .eq('id', userId)
            .maybeSingle()

          if (currentFetchId !== fetchIdRef.current) return

          if (newUser) {
            setUser({
              ...newUser,
              phone: newUser.phone || null,
              address: newUser.address || null,
              is_verified: newUser.is_verified || false,
              country: newUser.country || null,
              updated_at: newUser.updated_at || new Date().toISOString(),
            })
          } else {
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
          }
          setLoading(false)
          return
        }

        setProfileFetchError('Unable to load user profile. Please try again.')
        setLoading(false)
        return
      }

      const userData: User = {
        ...data,
        phone: data.phone || null,
        address: data.address || null,
        is_verified: data.is_verified || false,
        country: data.country || null,
        updated_at: data.updated_at || new Date().toISOString(),
      }
      setUser(userData)

      if (userData.role === 'seller' || userData.role === 'admin') {
        const { data: sellerData, error: sellerError } = await supabase
          .from('seller_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()

        if (currentFetchId !== fetchIdRef.current) return

        if (!sellerError && sellerData) {
          setSellerProfile(sellerData)
        } else {
          setSellerProfile(null)
        }
      }

      setLoading(false)
    } catch (e) {
      console.error('Error in fetchUserProfile:', e)
      if (currentFetchId !== fetchIdRef.current) return

      const { data: { user: authFallbackUser } } = await supabase.auth.getUser()
      if (currentFetchId !== fetchIdRef.current) return

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
  }, [])

  useEffect(() => {
    let cancelled = false

    const safetyTimer = setTimeout(() => {
      if (!cancelled && loading) setLoading(false)
    }, 10000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (cancelled) return
        clearTimeout(safetyTimer)

        if (event === 'TOKEN_REFRESHED') {
          return
        }

        if (session?.user) {
          fetchUserProfile(session.user.id)
        } else {
          fetchIdRef.current++
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
  }, [fetchUserProfile])

  async function signIn(email: string, password: string) {
    setProfileFetchError(null)
    
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message === 'Invalid login credentials') {
        throw new Error('Invalid email or password')
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('Please confirm your email address before signing in')
      } else {
        throw error
      }
    }
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
    isSeller: user?.role === 'seller' || user?.role === 'admin',
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
