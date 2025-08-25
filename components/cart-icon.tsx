"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useCart } from "@/context/cart-context" // Import du hook useCart

export default function CartIcon() {
  const { cartItems } = useCart() // Utilisation du hook useCart
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  return (
    <Link href="/cart" passHref>
      <Button variant="ghost" size="icon" className="relative">
        <ShoppingCart className="h-6 w-6" />
        {itemCount > 0 && (
          <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
            {itemCount}
          </Badge>
        )}
        <span className="sr-only">Panier</span>
      </Button>
    </Link>
  )
}
