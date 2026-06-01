// src/types/index.ts
// Complete type definitions for Harar Mart

export type UserRole = 'buyer' | 'seller' | 'admin' | 'delivery_agent';

export interface Profile {
  id: string;
  user_id: string;
  full_name?: string;
  phone?: string;
  address?: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface SellerProfile {
  id: string;
  user_id: string;
  business_name?: string;
  business_description?: string;
  phone?: string;
  address?: string;
  verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  category_id?: string;
  seller_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  buyer_id: string;
  seller_id?: string;
  delivery_agent_id?: string;
  status: OrderStatus;
  total_amount: number;
  delivery_address?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

export interface Inquiry {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id?: string;
  subject?: string;
  message: string;
  status?: 'open' | 'replied' | 'closed';
  created_at?: string;
  updated_at?: string;
}

export interface Quote {
  id: string;
  inquiry_id: string;
  seller_id: string;
  amount: number;
  message?: string;
  status?: 'pending' | 'accepted' | 'rejected';
  created_at?: string;
}

export interface DeliveryAgent {
  id: string;
  user_id: string;
  full_name?: string;
  phone?: string;
  vehicle_type?: string;
  is_available?: boolean;
  created_at?: string;
}
