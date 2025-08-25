"use client"

import { useState } from "react"
import { Heart, ShoppingCart, Star, Plus, Minus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/hooks/use-toast"
import { addFavorite as apiAddFavorite, removeFavorite as apiRemoveFavorite } from "@/lib/api"
import { useAuth } from "@/context/auth-context"
import Link from "next/link"
import Image from "next/image"

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
}

interface MobileProductCardProps {
  product: Product
}

export default function MobileProductCard({ product }: MobileProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const { addToCart, updateQuantity, cartItems } = useCart()
  const { toast } = useToast()
  const { user } = useAuth()

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
    })
    toast({
      title: "Ajouté au panier !",
      description: product.name,
    })
  }

  const handleDecreaseQuantity = () => {
    const currentQuantity = getItemQuantity()
    if (currentQuantity > 1) {
      updateQuantity(product.id, currentQuantity - 1)
      toast({
        title: "Quantité mise à jour",
        description: `${product.name} : ${currentQuantity - 1}`,
      })
    } else {
      updateQuantity(product.id, 0) // Supprime l'article du panier
      toast({
        title: "Produit retiré",
        description: `${product.name} a été retiré du panier`,
      })
    }
  }

  const toggleFavorite = async () => {
    try {
      if (!user) {
        toast({ title: "Connexion requise", description: "Connectez-vous pour gérer vos favoris" })
        return
      }
      if (isFavorite) {
        await apiRemoveFavorite(product.id)
        setIsFavorite(false)
        toast({ title: "Retiré des favoris", description: product.name })
      } else {
        await apiAddFavorite(product.id)
        setIsFavorite(true)
        toast({ title: "Ajouté aux favoris", description: product.name })
      }
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.response?.data?.message || "Action impossible", variant: "destructive" })
    }
  }

  const getItemQuantity = () => {
    const item = cartItems?.find((item) => item.id === product.id)
    return item?.quantity || 0
  }

  const quantity = getItemQuantity()

  return (
    <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          <Link href={`/products/${product.id}`}>
            <Image
              src={product.imageUrl || "/placeholder.svg"}
              alt={product.name}
              width={200}
              height={150}
              className="w-full h-32 object-cover"
            />
          </Link>
          <button onClick={toggleFavorite} className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-sm">
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
          </button>
        </div>

        <div className="p-3">
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{product.name}</h3>
          </Link>

          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-3 w-3 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
              ))}
            </div>
            <span className="text-xs text-gray-600">(4.8)</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-orange-500">{product.price.toLocaleString()} F CFA</span>
            </div>

            {quantity > 0 ? (
              <div className="flex items-center gap-2 bg-orange-50 rounded-xl p-1">
                <button onClick={handleDecreaseQuantity} className="p-1 hover:bg-orange-100 rounded-lg transition-colors">
                  <Minus className="h-3 w-3 text-orange-500" />
                </button>
                <span className="text-sm font-medium text-orange-500 min-w-[20px] text-center">{quantity}</span>
                <button onClick={handleAddToCart} className="p-1 hover:bg-orange-100 rounded-lg transition-colors">
                  <Plus className="h-3 w-3 text-orange-500" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
