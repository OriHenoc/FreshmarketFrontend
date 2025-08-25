"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Bell, Star, Heart, ShoppingCart, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { getProducts } from "@/lib/data"
import { getFavorites as apiGetFavorites, addFavorite as apiAddFavorite, removeFavorite as apiRemoveFavorite, fetchCategories, fetchPromotions, getGlobalSetting } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import MobileBottomNav from "@/components/mobile-bottom-nav"
import Link from "next/link"
import Image from "next/image"

// Categories et promos seront chargées dynamiquement depuis l'API

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPromo, setCurrentPromo] = useState(0)
  const [favorites, setFavorites] = useState<string[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [promos, setPromos] = useState<any[]>([])
  const [autoScrollInterval, setAutoScrollInterval] = useState(4000)
  const { addToCart, updateQuantity: updateCartQuantity, cartItems } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()

  const [products, setProducts] = useState<any[]>([])
  useEffect(() => {
    ;(async () => {
      try {
        const [data, cats, promosData, scrollInterval] = await Promise.all([
          getProducts(),
          fetchCategories(),
          fetchPromotions(),
          getGlobalSetting('promo_auto_scroll_interval').catch(() => ({ value: 4000 }))
        ])
        setProducts(data)
        setCategories(cats)
        setPromos(promosData)
        setAutoScrollInterval(scrollInterval.value || 4000)
        
        if (user) {
          const favs = await apiGetFavorites()
          setFavorites((favs || []).map((p: any) => p._id || p.id))
        }
      } catch (error) {
        console.error('Erreur chargement données:', error)
      }
    })()
  }, [user])

  // Auto-scroll des promos
  useEffect(() => {
    if (promos.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % promos.length)
    }, autoScrollInterval)
    return () => clearInterval(interval)
  }, [promos, autoScrollInterval])

  // (supprimé) Redirection automatique si admin pour permettre la navigation libre

  // Filtrer les produits
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

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
      title: "Produit ajouté !",
      description: `${product.name} a été ajouté au panier`,
    })
  }

  const toggleFavorite = async (productId: string) => {
    try {
      if (!user) {
        toast({ title: "Connexion requise", description: "Connectez-vous pour gérer vos favoris" })
        return
      }
      if (favorites.includes(productId)) {
        await apiRemoveFavorite(productId)
        setFavorites((prev) => prev.filter((id) => id !== productId))
        toast({ title: "Retiré des favoris", description: "Vos favoris ont été mis à jour" })
      } else {
        await apiAddFavorite(productId)
        setFavorites((prev) => [...prev, productId])
        toast({ title: "Ajouté aux favoris", description: "Vos favoris ont été mis à jour" })
      }
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.response?.data?.message || "Action impossible", variant: "destructive" })
    }
  }

  const getItemQuantity = (productId: string) => {
    const item = cartItems?.find((item) => item.id === productId)
    return item?.quantity || 0
  }

  const updateQuantity = (product: any, newQuantity: number) => {
    const currentQuantity = getItemQuantity(product.id)
    
    if (newQuantity <= 0) {
      // Supprimer complètement l'article du panier
      updateCartQuantity(product.id, 0)
      toast({
        title: "Produit retiré",
        description: `${product.name} a été retiré du panier`,
      })
      return
    }

    if (newQuantity > currentQuantity) {
      // Incrémentation : ajouter la différence
      const difference = newQuantity - currentQuantity
      for (let i = 0; i < difference; i++) {
        addToCart({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          imageUrl: product.imageUrl,
          category: product.category,
        })
      }
    } else if (newQuantity < currentQuantity) {
      // Décrémentation : utiliser updateCartQuantity
      updateCartQuantity(product.id, newQuantity)
      toast({
        title: "Quantité mise à jour",
        description: `${product.name} : ${newQuantity}`,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-6 border-b border-gray-100">
        <div className="flex items-center justify-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">Bonjour {user?.name || "Invité"} 👋</h1>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 h-5 w-5" />
          <Input
            placeholder="Rechercher des produits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-200 border-0 rounded-2xl h-12 text-base"
          />
        </div>
      </div>

      {/* Carrousel de promos */}
      <div className="px-4 py-6">
        <div className="relative overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentPromo * 100}%)` }}
          >
            {promos.map((promo) => (
              <div key={promo._id || promo.id} className="w-full flex-shrink-0">
                <div className={`bg-gradient-to-r ${promo.color} p-6 rounded-2xl text-white relative overflow-hidden`}>
                  <div className="relative z-10">
                    {promo.discount && (
                      <Badge className="bg-white/20 text-white border-0 mb-2">{promo.discount}</Badge>
                    )}
                    <h3 className="text-xl font-bold mb-1">{promo.title}</h3>
                    <p className="text-white/90 text-sm">{promo.subtitle}</p>
                  </div>
                  <div className="absolute right-4 top-4 text-6xl opacity-20">{promo.emoji}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Indicateurs */}
          <div className="flex justify-center gap-2 mt-4">
            {promos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPromo(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentPromo ? "bg-orange-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Navigation par catégories */}
      <div className="px-4 mb-6">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category._id || category.id}
              onClick={() => setSelectedCategory(category.slug || category.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl whitespace-nowrap transition-colors ${
                selectedCategory === (category.slug || category.name)
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              <span className="text-lg">{category.emoji}</span>
              <span className="font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grille de produits */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {selectedCategory === "all" ? "Tous nos produits" : categories.find((c) => c.id === selectedCategory)?.name}
          </h2>
          <span className="text-sm text-gray-600">
            {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((product) => {
            const quantity = getItemQuantity(product.id)
            const isFavorite = favorites.includes(product.id)

            return (
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
                      <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                    </button>
                  </div>

                  <div className="p-3">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{product.name}</h3>
                    </Link>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-md font-bold text-orange-500">{product.price.toLocaleString()} F CFA</span>
                      </div>
                      {quantity > 0 ? (
                        <div className="flex items-center gap-2 bg-orange-50 rounded-xl p-1">
                          <button
                            onClick={() => updateQuantity(product, quantity - 1)}
                            className="p-1 hover:bg-orange-100 rounded-lg transition-colors"
                          >
                            <Minus className="h-3 w-3 text-orange-500" />
                          </button>
                          <span className="text-sm font-medium text-orange-500 min-w-[20px] text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product, quantity + 1)}
                            className="p-1 hover:bg-orange-100 rounded-lg transition-colors"
                          >
                            <Plus className="h-3 w-3 text-orange-500" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(product)}
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
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-600 mb-4">Essayez de modifier vos critères de recherche</p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl"
            >
              Voir tous les produits
            </Button>
          </div>
        )}
      </div>

      <MobileBottomNav />
    </div>
  )
}
