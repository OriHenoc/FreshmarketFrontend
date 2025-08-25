"use client"

import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
}

interface AddToCartButtonProps {
  product: Product
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart(product)
    console.log(`Added ${product.name} to cart!`)
  }

  return (
    <Button onClick={handleAddToCart} className="w-full md:w-auto">
      Ajouter au panier
    </Button>
  )
}
