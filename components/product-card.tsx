"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
  badge?: string
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { addToCart } = useCart()
  const { toast } = useToast()

  const handleAddToCart = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulation
    addToCart(product)
    setIsLoading(false)

    toast({
      title: "Produit ajouté !",
      description: `${product.name} a été ajouté à votre panier.`,
      duration: 3000,
    })
  }


  return (
    <Card className="group overflow-hidden border-0 food-shadow hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
      <div className="relative overflow-hidden">
        <Link href={`/products/${product.id}`}>
          <div className="relative h-48 w-full">
            <Image
              src={product.imageUrl || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Link>

        {/* Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-accent-500 text-accent-500" : "text-gray-600"}`} />
          </Button>
        </div>

        {/* Note */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Star className="h-3 w-3 fill-warm-400 text-warm-400" />
          <span className="text-xs font-medium">4.8</span>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="mb-2">
          <Badge variant="outline" className="text-xs border-primary-200 text-primary-700">
            {product.category}
          </Badge>
        </div>

        <Link href={`/products/${product.id}`}>
          <h3 className="font-display font-semibold text-lg mb-2 text-gray-800 hover:text-primary-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl text-primary-600">{product.price.toLocaleString("fr-FR")} F CFA</span>
          </div>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={isLoading}
          className="w-full mt-4 bg-gradient-warm hover:opacity-90 transition-all duration-300 group/btn"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Ajout...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 group-hover/btn:animate-bounce-gentle" />
              Ajouter au panier
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
