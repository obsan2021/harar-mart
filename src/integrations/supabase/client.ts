import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: any
        Insert: any
        Update: any
      }
      products: {
        Row: any
        Insert: any
        Update: any
      }
      categories: {
        Row: any
        Insert: any
        Update: any
      }
      orders: {
        Row: any
        Insert: any
        Update: any
      }
      order_items: {
        Row: any
        Insert: any
        Update: any
      }
      cart_items: {
        Row: any
        Insert: any
        Update: any
      }
      delivery_agents: {
        Row: any
        Insert: any
        Update: any
      }
    }
  }
}
