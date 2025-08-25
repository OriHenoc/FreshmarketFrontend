"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Heart, Share2, Star, Plus, Minus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/hooks/use-toast"
import { getProductById } from "@/lib/data"
import MobileBottomNav from "@/components/mobile-bottom-nav"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { addFavorite as apiAddFavorite, removeFavorite as apiRemoveFavorite, getFavorites as apiGetFavorites } from "@/lib/api"
import { useAuth } from "@/context/auth-context"

interface ProductPageProps {
  params: { id: string }
}

export default function ProductPage({ params }: ProductPageProps) {
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const { addToCart, cartItems } = useCart()
  const { toast } = useToast()

  const [product, setProduct] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const p = await getProductById(params.id)
        if (!cancelled) setProduct(p || null)
        // charger favoris si connecté
        try {
          const favs = await apiGetFavorites()
          if (!cancelled && Array.isArray(favs)) {
            const ids = favs.map((f: any) => f._id || f.id)
            setIsFavorite(ids.includes(params.id))
          }
        } catch {}
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [params.id])

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Chargement...</div>
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Produit introuvable</h2>
          <p className="text-gray-600 mb-6">Le produit demandé n'existe pas ou a été supprimé.</p>
          <Link href="/products">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl px-6">Retour aux produits</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
      })
    }
    toast({
      title: "Ajouté au panier !",
      description: `${quantity} x ${product.name}`,
    })
  }

  const toggleFavorite = async () => {
    try {
      if (!product) return
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

  const handleShare = async () => {
    if (typeof window === 'undefined') return
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Partage annulé")
      }
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API de partage
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Lien copié !",
          description: "Le lien du produit a été copié dans le presse-papiers",
        })
      } catch (error) {
        console.log("Erreur lors de la copie")
      }
    }
  }

  const currentQuantityInCart = cartItems?.find((item) => item.id === product.id)?.quantity || 0

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white px-4 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleFavorite} className="p-2">
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare} className="p-2">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Image du produit (unique) */}
      <div className="bg-white">
        <div className="aspect-square relative">
          <Image src={product.imageUrl || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
        </div>
      </div>

      {/* Informations produit */}
      <div className="px-4 py-6 space-y-6">
        {/* Titre et prix */}
        <Card className="border-0 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-orange-500">{product.price.toLocaleString()} F CFA</span>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="border-0 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </CardContent>
        </Card>

        {/* Sélecteur de quantité */}
        <Card className="border-0 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quantité</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  <Minus className="h-5 w-5 text-gray-600" />
                </button>
                <span className="font-bold text-xl text-gray-900 min-w-[40px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  <Plus className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {currentQuantityInCart > 0 && (
                <div className="text-sm text-gray-600">{currentQuantityInCart} déjà dans le panier</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Boutons d'action fixes */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 px-4 py-6">
        <div className="flex gap-3">
          <Button
            onClick={handleAddToCart}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-4 text-lg font-semibold"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Ajouter • {(product.price * quantity).toLocaleString()} F CFA
          </Button>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  )
}
