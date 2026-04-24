import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface NavLinkProps {
  to: string
  children: React.ReactNode
  className?: string
}

export default function NavLink({ to, children, className }: NavLinkProps) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      className={cn(
        "transition-colors hover:text-primary",
        isActive ? "text-primary font-medium" : "text-muted-foreground",
        className
      )}
    >
      {children}
    </Link>
  )
}