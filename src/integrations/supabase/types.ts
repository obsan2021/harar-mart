export interface User {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  address: string | null
  role: 'buyer' | 'seller' | 'admin'
  is_verified: boolean
  country: string | null
  created_at: string
}

export interface SellerProfile {
  id: string
  user_id: string
  company_name: string
  tax_id: string | null
  business_license_url: string | null
  certifications: string[]
  supplier_type: 'manufacturer' | 'trading_company' | 'wholesaler'
  is_verified: boolean
  created_at: string
  user?: User
}

export interface Product {
  id: string
  seller_id: string
  category_id: string
  name: string
  description: string
  moq: number
  min_price: number
  max_price: number
  images: string[]
  hs_code: string | null
  lead_time_days: number
  is_available: boolean
  certifications: string[]
  created_at: string
  updated_at: string
  seller?: SellerProfile
  category?: Category
}

export interface Category {
  id: string
  name: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  created_at: string
}

export interface Inquiry {
  id: string
  buyer_id: string
  product_id: string
  quantity: number
  message: string
  destination_port: string | null
  desired_delivery_date: string | null
  status: 'pending' | 'responded' | 'closed'
  created_at: string
  buyer?: User
  product?: Product
  quotes?: Quote[]
}

export interface Quote {
  id: string
  inquiry_id: string
  seller_id: string
  price_per_unit: number
  sample_available: boolean
  sample_price: number | null
  lead_time_days: number
  message: string
  expires_at: string | null
  created_at: string
  seller?: SellerProfile
}

export interface CartItem {
  id: string
  product_id: string
  user_id: string
  quantity: number
  product: Product
}

export interface Order {
  id: string
  user_id: string
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
  total: number
  delivery_address: string
  delivery_phone: string
  delivery_notes: string | null
  scheduled_delivery: string | null
  delivery_agent_id: string | null
  created_at: string
  updated_at: string
  user?: User
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  product: Product
}

export interface DeliveryAgent {
  id: string
  user_id: string
  is_active: boolean
  vehicle_type: string | null
  license_plate: string | null
  created_at: string
  user?: User
}
