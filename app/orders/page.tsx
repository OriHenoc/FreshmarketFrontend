"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Package, Truck, CheckCircle, Clock, Eye, MapPin, Phone, ArrowLeft, X } from "lucide-react"
import MobileBottomNav from "@/components/mobile-bottom-nav"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { getMyOrders as apiGetMyOrders, fetchDeliverySlots } from "@/lib/api"

// Données simulées des commandes
const mockOrders = [
  {
    id: "CMD123456",
    date: "2024-01-15",
    status: "delivered",
    total: 45000,
    items: [
      { name: "Panier Essentiel Familial", quantity: 1, price: 28000 },
      { name: "Pack Légumes Bio", quantity: 1, price: 17000 },
    ],
    delivery: {
      address: "Cocody, Abidjan",
      estimatedDate: "2024-01-16",
      actualDate: "2024-01-16",
    },
    tracking: [
      { status: "confirmed", date: "2024-01-15 10:30", message: "Commande confirmée" },
      { status: "preparing", date: "2024-01-15 14:00", message: "Préparation en cours" },
      { status: "shipped", date: "2024-01-16 08:00", message: "Commande expédiée" },
      { status: "delivered", date: "2024-01-16 15:30", message: "Commande livrée" },
    ],
  },
  {
    id: "CMD123457",
    date: "2024-01-20",
    status: "shipped",
    total: 32000,
    items: [
      { name: "Combo Petit Déjeuner Gourmand", quantity: 2, price: 15500 },
      { name: "Pack Fruits Tropicaux", quantity: 1, price: 19500 },
    ],
    delivery: {
      address: "Yopougon, Abidjan",
      estimatedDate: "2024-01-21",
    },
    tracking: [
      { status: "confirmed", date: "2024-01-20 09:15", message: "Commande confirmée" },
      { status: "preparing", date: "2024-01-20 11:30", message: "Préparation en cours" },
      { status: "shipped", date: "2024-01-21 07:45", message: "Commande expédiée" },
    ],
  },
  {
    id: "CMD123458",
    date: "2024-01-22",
    status: "preparing",
    total: 28000,
    items: [{ name: "Panier Essentiel Familial", quantity: 1, price: 28000 }],
    delivery: {
      address: "Marcory, Abidjan",
      estimatedDate: "2024-01-23",
    },
    tracking: [
      { status: "confirmed", date: "2024-01-22 16:20", message: "Commande confirmée" },
      { status: "preparing", date: "2024-01-22 17:00", message: "Préparation en cours" },
    ],
  },
]

const statusConfig = {
  pending: { label: "En attente", color: "bg-gray-500", icon: Clock },
  confirmed: { label: "Confirmée", color: "bg-blue-500", icon: CheckCircle },
  preparing: { label: "En préparation", color: "bg-yellow-500", icon: Clock },
  shipped: { label: "Expédiée", color: "bg-purple-500", icon: Truck },
  delivered: { label: "Livrée", color: "bg-green-500", icon: Package },
  cancelled: { label: "Annulée", color: "bg-red-500", icon: X },
  // Fallback pour les statuts inconnus
  default: { label: "En cours", color: "bg-orange-500", icon: Clock },
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [orders, setOrders] = useState<any[]>(mockOrders)
  const [deliverySlots, setDeliverySlots] = useState<any[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        if (user) {
          const data = await apiGetMyOrders()
          setOrders(data)
        }
      } catch {}
    })()
  }, [user])

  useEffect(() => {
    const loadDeliverySlots = async () => {
      try {
        const slots = await fetchDeliverySlots()
        setDeliverySlots(slots)
      } catch (error) {
        console.error('Erreur lors du chargement des créneaux de livraison:', error)
      }
    }
    loadDeliverySlots()
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pb-32">
        <div className="bg-white px-4 py-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Mes Commandes</h1>
          </div>
        </div>

        <div className="px-4 py-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-md mx-auto">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-4">Connexion requise</h2>
            <p className="text-gray-600 mb-6">Vous devez être connecté pour voir vos commandes.</p>
            <Link href="/login">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl w-full">Se connecter</Button>
            </Link>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="bg-white px-4 py-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Mes Commandes</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Résumé de vos commandes</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-orange-50 rounded-xl">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="h-4 w-4 text-white" />
              </div>
              <p className="text-lg font-bold text-gray-900">{orders.length}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-xl">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <p className="text-lg font-bold text-gray-900">
                {orders.filter((o) => o.status !== "delivered").length}
              </p>
              <p className="text-xs text-gray-600">En cours</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <p className="text-lg font-bold text-gray-900">
                {orders.filter((o) => o.status === "delivered").length}
              </p>
              <p className="text-xs text-gray-600">Livrées</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Truck className="h-4 w-4 text-white" />
              </div>
              <p className="text-lg font-bold text-gray-900">
                {orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString("fr-FR")}
              </p>
              <p className="text-xs text-gray-600">Total dépensé</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Tabs defaultValue="current" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-xl p-1">
              <TabsTrigger 
                value="current" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm"
              >
                Commandes en cours
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm"
              >
                Historique
              </TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-4">
              {orders.filter((order) => order.status !== "delivered").length > 0 ? (
                orders
                  .filter((order) => order.status !== "delivered")
                  .map((order) => (
                    <OrderCard key={order.id || order._id || Math.random()} order={order} onViewDetails={setSelectedOrder} deliverySlots={deliverySlots} />
                  ))
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune commande en cours</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {orders.filter((order) => order.status === "delivered").length > 0 ? (
                orders
                  .filter((order) => order.status === "delivered")
                  .map((order) => (
                    <OrderCard key={order.id || order._id || Math.random()} order={order} onViewDetails={setSelectedOrder} deliverySlots={deliverySlots} />
                  ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune commande livrée</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={orders.find((o) => (o.id || o._id) === selectedOrder)!}
          onClose={() => setSelectedOrder(null)}
          deliverySlots={deliverySlots}
        />
      )}

      <MobileBottomNav />
    </div>
  )
}

function OrderCard({ order, onViewDetails, deliverySlots }: { order: any; onViewDetails: (id: string) => void; deliverySlots: any[] }) {
  const statusInfo = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.default
  const StatusIcon = statusInfo?.icon || Clock

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-900">#{order.orderNumber || "N/A"}</h3>
          <p className="text-sm text-gray-600">
            Passée le {order.date ? new Date(order.date).toLocaleDateString("fr-FR") : 
                       order.createdAt ? new Date(order.createdAt).toLocaleDateString("fr-FR") : 
                       "Date non disponible"}
          </p>
        </div>
        <Badge className={`${statusInfo?.color || "bg-gray-500"} text-white rounded-xl`}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {statusInfo?.label || order.status || "Non défini"}
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{order.delivery?.address || order.deliveryAddress || "Adresse non spécifiée"}</span>
          </div>
          <span className="font-bold text-lg text-orange-600">{order.total ? order.total.toLocaleString("fr-FR") : "0"} F CFA</span>
        </div>
        
        {order.delivery?.deliverySlot && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-600">
              Créneau : {(() => {
                const slot = deliverySlots.find(s => s._id === order.delivery.deliverySlot)
                return slot ? `${slot.name} (${slot.startTime} - ${slot.endTime})` : "Créneau non trouvé"
              })()}
            </span>
          </div>
        )}

        <div className="space-y-2">
          {Array.isArray(order.items) && order.items.length > 0 ? (
            order.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.quantity || 1}x {item.name || "Produit non spécifié"}
                </span>
                <span className="text-gray-900 font-medium">{item.price ? item.price.toLocaleString("fr-FR") : "0"} F CFA</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Aucun article détaillé disponible</p>
          )}
        </div>

        <div className="flex gap-2 pt-3 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => onViewDetails(order.id || order._id || order.orderNumber || "")}
            className="flex-1 rounded-xl bg-transparent border-gray-200"
          >
            <Eye className="h-4 w-4 mr-2" />
            Voir les détails
          </Button>
        </div>
      </div>
    </div>
  )
}

function OrderDetailsModal({ order, onClose, deliverySlots }: { order: any; onClose: () => void; deliverySlots: any[] }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Détails de la commande #{order.orderNumber || "N/A"}</h2>
            <Button variant="ghost" onClick={onClose} className="p-2 rounded-xl">
              ✕
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Suivi de la commande</h3>
            <div className="space-y-4">
              {Array.isArray(order.tracking) && order.tracking.length > 0 ? (
                order.tracking.map((step: any, index: number) => {
                  const statusInfo = statusConfig[step.status as keyof typeof statusConfig] || statusConfig.default
                  const StatusIcon = statusInfo?.icon || Clock
                  const isCompleted = index < order.tracking.length - 1 || order.status === step.status

                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? (statusInfo?.color || "bg-gray-500") : "bg-gray-200"
                        }`}
                      >
                        <StatusIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{step.message}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(step.date).toLocaleDateString("fr-FR")} à{" "}
                          {new Date(step.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-gray-500 text-sm">Aucun suivi disponible</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4">Articles commandés</h3>
            <div className="space-y-3">
              {Array.isArray(order.items) && order.items.length > 0 ? (
                order.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-medium text-gray-900">{item.name || "Produit non spécifié"}</div>
                      <div className="text-sm text-gray-600">Quantité : {item.quantity || 1}</div>
                    </div>
                    <div className="font-bold text-orange-600">{item.price ? item.price.toLocaleString("fr-FR") : "0"} F CFA</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Aucun article détaillé disponible</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4">Informations de livraison</h3>
            <div className="bg-gray-50 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{order.delivery?.address || order.deliveryAddress || "Adresse non spécifiée"}</span>
              </div>
              {order.delivery?.deliverySlot && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-700">
                    Créneau : {(() => {
                      const slot = deliverySlots.find(s => s._id === order.delivery.deliverySlot)
                      return slot ? `${slot.name} (${slot.startTime} - ${slot.endTime})` : "Créneau non trouvé"
                    })()}
                  </span>
                </div>
              )}
              {order.delivery?.actualDate && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700">
                    Livrée le {new Date(order.delivery.actualDate).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span className="text-gray-900">Total</span>
              <span className="text-orange-600">{order.total ? order.total.toLocaleString("fr-FR") : "0"} F CFA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
