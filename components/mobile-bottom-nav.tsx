"use client"

import { Home, ShoppingCart, Heart, User, LayoutDashboard } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"

export default function MobileBottomNav() {
  const { cartItems } = useCart()
  const pathname = usePathname()
  const { user } = useAuth()

  // Calculer le nombre total d'articles dans le panier
  const totalItems = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0

  // Construire les éléments de navigation
  const baseItems = [
    {
      href: "/",
      icon: Home,
      label: "Accueil",
      active: pathname === "/",
    },
    {
      href: "/cart",
      icon: ShoppingCart,
      label: "Panier",
      active: pathname === "/cart",
      badge: totalItems > 0 ? totalItems : undefined,
    },
    {
      href: "/favorites",
      icon: Heart,
      label: "Favoris",
      active: pathname === "/favorites",
    },
    {
      href: "/profile",
      icon: User,
      label: "Profil",
      active: pathname === "/profile" || pathname === "/login" || pathname === "/register",
    },
  ] as const

  const navItems = user?.isAdmin
    ? [
        baseItems[0],
        baseItems[1],
        {
          href: "/admin",
          icon: LayoutDashboard,
          label: "Dashboard",
          active: pathname === "/admin",
        },
        baseItems[2],
        baseItems[3],
      ]
    : (baseItems as any)

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors relative ${
                item.active ? "text-orange-500 bg-orange-50" : "text-gray-600 hover:text-orange-500 hover:bg-orange-50"
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
