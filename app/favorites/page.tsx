"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/hooks/use-toast"
import { getProducts } from "@/lib/data"
import { getFavorites as apiGetFavorites, removeFavorite as apiRemoveFavorite } from "@/lib/api"
import MobileBottomNav from "@/components/mobile-bottom-nav"
import Link from "next/link"
import Image from "next/image"

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<string[]>([])
  const { addToCart } = useCart()
  const { toast } = useToast()

  const [products, setProducts] = useState<any[]>([])
  useEffect(() => {
    ;(async () => {
      const data = await getProducts()
      setProducts(data)
      try {
        const favs = await apiGetFavorites()
        setFavorites((favs || []).map((p: any) => p._id || p.id))
      } catch {}
    })()
  }, [])
  const favoriteProducts = products.filter((product) => favorites.includes(product.id))

  const toggleFavorite = async (productId: string) => {
    try {
      await apiRemoveFavorite(productId)
      setFavorites((prev) => prev.filter((id) => id !== productId))
      toast({ title: "Retiré des favoris", description: "Le produit a été retiré de vos favoris" })
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.response?.data?.message || "Impossible de retirer", variant: "destructive" })
    }
  }

  const handleAddToCart = (product: any) => {
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Mes Favoris</h1>
          </div>
          <span className="text-sm text-gray-600">
            {favoriteProducts.length} produit{favoriteProducts.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {favoriteProducts.length === 0 ? (
        /* État vide */
        <div className="flex flex-col items-center justify-center px-4 py-20">
          <div className="text-8xl mb-6">❤️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucun favori</h2>
          <p className="text-gray-600 text-center mb-8">
            Ajoutez des produits à vos favoris pour les retrouver facilement
          </p>
          <Link href="/">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl px-8 py-3">
              Découvrir nos produits
            </Button>
          </Link>
        </div>
      ) : (
        /* Grille de produits favoris */
        <div className="px-4 py-6">
          <div className="grid grid-cols-2 gap-4">
            {favoriteProducts.map((product) => (
              <Card key={product.id} className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
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
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-sm"
                    >
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </button>
                  </div>

                  <div className="p-3">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">{product.name}</h3>
                    </Link>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-orange-500">{product.price.toLocaleString()} F CFA</span>
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <MobileBottomNav />
    </div>
  )
}
