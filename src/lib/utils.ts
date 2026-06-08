import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const DELIVERY_FEE = 5.00

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'default'
    case 'confirmed': return 'secondary'
    case 'preparing': return 'secondary'
    case 'out_for_delivery': return 'default'
    case 'delivered': return 'default'
    case 'cancelled': return 'destructive'
    default: return 'default'
  }
}

export function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    'China': '🇨🇳',
    'USA': '🇺🇸',
    'Germany': '🇩🇪',
    'Japan': '🇯🇵',
    'India': '🇮🇳',
    'UK': '🇬🇧',
    'France': '🇫🇷',
    'Italy': '🇮🇹',
    'Brazil': '🇧🇷',
    'Russia': '🇷🇺',
    'Canada': '🇨🇦',
    'Australia': '🇦🇺',
    'South Korea': '🇰🇷',
    'Mexico': '🇲🇽',
    'Spain': '🇪🇸',
    'Turkey': '🇹🇷',
    'Vietnam': '🇻🇳',
    'Thailand': '🇹🇭',
    'Indonesia': '🇮🇩',
    'Malaysia': '🇲🇾',
    'Singapore': '🇸🇬',
    'Ethiopia': '🇪🇹',
  }
  return flags[country] || '🌍'
}
