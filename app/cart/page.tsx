"use client"

import { useState } from "react"
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/hooks/use-toast"
import MobileBottomNav from "@/components/mobile-bottom-nav"
import Link from "next/link"
import Image from "next/image"

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const totalItems = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0
  const subtotal = cartItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0
  const total = subtotal // Les frais de livraison ne sont pas inclus dans le total

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id)
      toast({
        title: "Produit retiré",
        description: "Le produit a été retiré du panier",
      })
    } else {
      updateQuantity(id, newQuantity)
    }
  }

  const handleCheckout = async () => {
    setIsLoading(true)
    // Simuler le processus de commande
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    toast({
      title: "Commande passée !",
      description: "Votre commande a été confirmée",
    })
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white px-4 py-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Mon Panier</h1>
          </div>
        </div>

        {/* État vide */}
        <div className="flex flex-col items-center justify-center px-4 py-20">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Votre panier est vide</h2>
          <p className="text-gray-600 text-center mb-8">
            Découvrez nos délicieux produits et ajoutez-les à votre panier
          </p>
          <Link href="/">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl px-8 py-3">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Commencer mes achats
            </Button>
          </Link>
        </div>

        <MobileBottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white px-4 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Mon Panier</h1>
          </div>
          <span className="text-sm text-gray-600">
            {totalItems} article{totalItems > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Liste des produits */}
      <div className="px-4 py-6 space-y-4">
        {cartItems.map((item) => (
          <Card key={item.id} className="border-0 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Image
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded-xl"
                />

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-orange-500 font-bold text-lg">{item.price.toLocaleString()} F CFA</p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Minus className="h-4 w-4 text-gray-600" />
                      </button>
                      <span className="font-medium text-gray-900 min-w-[30px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Plus className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        removeFromCart(item.id)
                        toast({
                          title: "Produit retiré",
                          description: "Le produit a été retiré du panier",
                        })
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Résumé de commande fixe */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 px-4 py-6">
        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-gray-600">
            <span>Sous-total</span>
            <span>{subtotal.toLocaleString()} F CFA</span>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-500">
              💡 Les frais de livraison seront calculés selon votre commune lors de la validation de la commande
            </p>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total à payer</span>
              <span>{total.toLocaleString()} F CFA</span>
            </div>
            <p className="text-xs text-gray-500 text-center mt-1">
              + Frais de livraison à la réception
            </p>
          </div>
        </div>

        <Link href="/checkout">
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-4 text-lg font-semibold"
            disabled={isLoading}
          >
            {isLoading ? "Traitement..." : "Passer la commande"}
          </Button>
        </Link>
      </div>

      <MobileBottomNav />
    </div>
  )
}
