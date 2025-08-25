"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  Eye,
  Edit,
  Plus,
  Search,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Bell,
  LogOut,
  Home,
  PieChart,
  Activity,
  Star,
  Truck,
  CreditCard,
  Target,
  TrendingDown,
  User,
  MoreVertical,
  Calendar,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from "chart.js"
import { Bar, Pie, Line } from "react-chartjs-2"
import { fetchProductsForAdmin as apiFetchProducts, createProduct as apiCreateProduct, updateProduct as apiUpdateProduct, deleteProduct as apiDeleteProduct, uploadImage as apiUploadImage, fetchAllCategories } from "@/lib/api"
import { fetchPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod, updateOrderStatus as apiUpdateOrderStatus, fetchAdminOrders, uploadImage as apiUpload, recalculateProductSales } from "@/lib/api"
import { fetchAdminStats, fetchAdminUsers, fetchAllPromotions, createPromotion, updatePromotion, deletePromotion, fetchCategories, createCategory, updateCategory, deleteCategory, fetchAllDeliverySlots, createDeliverySlot, updateDeliverySlot, deleteDeliverySlot, fetchAllCommunes, createCommune, updateCommune, deleteCommune, getGlobalSetting, updateGlobalSetting, findDeliverySlot } from "@/lib/api"

// Enregistrement des composants Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement)

// État des statistiques (backend)
// Fallbacks si API indisponible
const defaultStats = {
  totals: { totalOrders: 0, totalRevenue: 0, totalProducts: 0, totalUsers: 0, pendingOrders: 0, lowStockProducts: 0, deliveredCount: 0, deliveredRate: 0 },
  charts: { salesByMonth: Array.from({ length: 12 }).map((_, i) => ({ label: "", total: 0 })), payments: [] as any[] },
}

// mockOrders supprimé - maintenant chargé depuis l'API

// mockProducts supprimé - maintenant chargé depuis l'API

// mockCustomers supprimé - maintenant chargé depuis l'API

const statusConfig = {
  pending: { label: "En attente", color: "bg-yellow-500", textColor: "text-yellow-700", bgColor: "bg-yellow-100" },
  confirmed: { label: "Confirmée", color: "bg-blue-500", textColor: "text-blue-700", bgColor: "bg-blue-100" },
  preparing: { label: "En préparation", color: "bg-orange-500", textColor: "text-orange-700", bgColor: "bg-orange-100" },
  shipped: { label: "Expédiée", color: "bg-purple-500", textColor: "text-purple-700", bgColor: "bg-purple-100" },
  delivered: { label: "Livrée", color: "bg-green-500", textColor: "text-green-700", bgColor: "bg-green-100" },
  cancelled: { label: "Annulée", color: "bg-red-500", textColor: "text-red-700", bgColor: "bg-red-100" },
}

export default function AdminDashboard() {
  const { user, logout, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  // Rediriger vers l'accueil si non-admin (ex: après déconnexion)
  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.replace("/")
    }
  }, [user, authLoading, router])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrderStatus, setSelectedOrderStatus] = useState("all")
  
  // État pour les modals de confirmation
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm: () => void
    confirmText?: string
    cancelText?: string
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
    confirmText: "Confirmer",
    cancelText: "Annuler"
  })
  const [selectedProductCategory, setSelectedProductCategory] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Filtres de date pour les commandes
  const [dateFilter, setDateFilter] = useState("all") // all, today, week, month, custom
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  // Ajouter ces états au début du composant principal
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [promotions, setPromotions] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [deliverySlots, setDeliverySlots] = useState<any[]>([])
  const [communes, setCommunes] = useState<any[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<any>(null)
  const [showPromotionModal, setShowPromotionModal] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<any>(null)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [showDeliverySlotModal, setShowDeliverySlotModal] = useState(false)
  const [editingDeliverySlot, setEditingDeliverySlot] = useState<any>(null)
  const [showCommuneModal, setShowCommuneModal] = useState(false)
  const [editingCommune, setEditingCommune] = useState<any>(null)
  const [globalSettings, setGlobalSettings] = useState<any>({})
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false)
  const [showCreateProductModal, setShowCreateProductModal] = useState(false)
  const [editingOrder, setEditingOrder] = useState<any>(null)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [stockAlerts, setStockAlerts] = useState<any[]>([])
  const [stats, setStats] = useState<any>(defaultStats)

  // Pagination/filtre des commandes (API)
  const [ordersPage, setOrdersPage] = useState(1)
  const [ordersStatus, setOrdersStatus] = useState<string>("all")
  const [ordersCount, setOrdersCount] = useState(0)
  const ORDERS_LIMIT = 20

  // Charger les données depuis l'API au montage
  useEffect(() => {
    ;(async () => {
      try {
        const [remote, methods, s, o, users, promos, cats, slots, comms, scrollInterval] = await Promise.all([
          apiFetchProducts(),
          fetchPaymentMethods(),
          fetchAdminStats(),
          fetchAdminOrders({ status: ordersStatus === 'all' ? undefined : ordersStatus, page: ordersPage, limit: ORDERS_LIMIT }),
          fetchAdminUsers(),
          fetchAllPromotions(),
          fetchAllCategories(),
          fetchAllDeliverySlots(),
          fetchAllCommunes(),
          getGlobalSetting('promo_auto_scroll_interval').catch(() => ({ value: 4000 }))
        ])
        
        setProducts(Array.isArray((remote as any).items) ? (remote as any).items : (remote as any))
        setPaymentMethods(methods)
        setStats({ totals: s.totals || defaultStats.totals, charts: s.charts || defaultStats.charts })
        setOrders(o.items || [])
        setOrdersCount(o.count || 0)
        setCustomers(users.items || [])
        setPromotions(promos)
        setCategories(cats)
        setDeliverySlots(slots)
        setCommunes(comms)
        setGlobalSettings({ promo_auto_scroll_interval: scrollInterval.value || 4000 })
        
        // Mettre à jour les alertes de stock
        const productsList = Array.isArray((remote as any).items) ? (remote as any).items : (remote as any)
        const alerts = productsList
          .filter((p: any) => p.stock <= 5)
          .map((p: any) => ({
            id: p._id || p.id,
            name: p.name,
            stock: p.stock,
            alert: p.stock === 0 ? "Rupture de stock" : "Stock faible",
          }))
        setStockAlerts(alerts)
      } catch (e) {
        console.error('Erreur chargement données admin:', e)
      }
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const o = await fetchAdminOrders({ status: ordersStatus === "all" ? undefined : ordersStatus, page: ordersPage, limit: ORDERS_LIMIT })
        setOrders(o.items || [])
        setOrdersCount(o.count || 0)
        
        // Mettre à jour les statistiques basées sur les nouvelles commandes
        const updatedOrders = o.items || []
        const totalRevenue = updatedOrders
          .filter((order: any) => order.status === 'delivered')
          .reduce((sum: number, order: any) => sum + (order.total || 0), 0)
        
        const pendingOrders = updatedOrders.filter((order: any) => order.status === 'pending').length
        
        // Mettre à jour les stats avec les nouvelles données
        setStats((prev: any) => ({
          ...prev,
          totals: {
            ...prev.totals,
            totalOrders: o.count || 0,
            pendingOrders: pendingOrders,
            totalRevenue: totalRevenue
          }
        }))
      } catch (e) {
        console.error('Erreur lors du changement de filtre:', e)
      }
    })()
  }, [ordersStatus, ordersPage])

  // Fonction helper pour ouvrir les modals de confirmation
  const showConfirmModal = (title: string, description: string, onConfirm: () => void, confirmText = "Confirmer", cancelText = "Annuler") => {
    setConfirmModal({
      isOpen: true,
      title,
      description,
      onConfirm,
      confirmText,
      cancelText
    })
  }

  // Fonction de suppression de produit
  const handleDeleteProduct = async (product: any) => {
    showConfirmModal(
      "Supprimer le produit",
      `Êtes-vous sûr de vouloir supprimer ${product.name} ?`,
      async () => {
        const targetId = (product as any)._id || product.id
        
        try {
          await apiDeleteProduct(targetId)
          setProducts(products.filter((p: any) => (((p as any)._id || p.id) !== targetId)))
          toast({ title: "Produit supprimé", description: `${product.name} a été supprimé du catalogue.` })
        } catch (e: any) {
          const errorMessage = e?.response?.data?.message || "Suppression impossible"
          
          // Message spécial pour les produits avec commandes
          if (errorMessage.includes("déjà été commandé")) {
            showConfirmModal(
              "Produit avec commandes",
              `${product.name} a déjà été commandé et ne peut pas être supprimé.\n\nVoulez-vous le désactiver à la place ? (Il ne sera plus visible aux clients mais restera dans l'historique des commandes)`,
              async () => {
                try {
                  // Désactiver le produit
                  const updated = await apiUpdateProduct(targetId, { ...product, status: 'inactive' })
                  setProducts(products.map((p: any) => ((((p as any)._id || p.id) === targetId) ? updated : p)))
                  toast({ 
                    title: "Produit désactivé", 
                    description: `${product.name} a été désactivé et n'est plus visible aux clients.` 
                  })
                } catch (disableError: any) {
                  toast({ 
                    title: "Erreur", 
                    description: disableError?.response?.data?.message || "Impossible de désactiver le produit", 
                    variant: "destructive" 
                  })
                }
              },
              "Désactiver",
              "Annuler"
            )
          } else {
            toast({ title: "Erreur", description: errorMessage, variant: "destructive" })
          }
        }
      }
    )
  }

  // Event listeners pour les actions du modal produit
  useEffect(() => {
    const handleEditProductEvent = (event: CustomEvent) => {
      setEditingProduct(event.detail)
    }
    
    const handleDeleteProductEvent = (event: CustomEvent) => {
      handleDeleteProduct(event.detail)
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('editProduct', handleEditProductEvent as EventListener)
      window.addEventListener('deleteProduct', handleDeleteProductEvent as EventListener)
      
      return () => {
        window.removeEventListener('editProduct', handleEditProductEvent as EventListener)
        window.removeEventListener('deleteProduct', handleDeleteProductEvent as EventListener)
      }
    }
  }, [])

  // Si non-admin, ne pas afficher le contenu (la redirection ci-dessus s'occupe de sortir de la page)
  if (!user || !user.isAdmin) {
    return null
  }

  // Données pour les graphiques basées sur stats
  const salesChartData = {
    labels: stats.charts.salesByMonth.map((m: any) => m.label || ""),
    datasets: [
      {
        label: "Ventes (F CFA)",
        data: stats.charts.salesByMonth.map((m: any) => m.total || 0),
        backgroundColor: "rgba(245, 158, 11, 0.8)",
        borderColor: "rgba(245, 158, 11, 1)",
        borderWidth: 2,
      },
    ],
  }

  const paymentsPieData = {
    labels: stats.charts.payments.map((p: any) => p.method),
    datasets: [
      {
        data: stats.charts.payments.map((p: any) => p.count),
        backgroundColor: [
          "rgba(245, 158, 11, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(59, 130, 246, 0.8)",
        ],
        borderWidth: 2,
      },
    ],
  }

  const categoryChartData = {
    labels: ["Paniers", "Combos", "Packs", "Fruits", "Légumes"],
    datasets: [
      {
        data: [35, 25, 20, 12, 8],
        backgroundColor: [
          "rgba(245, 158, 11, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(59, 130, 246, 0.8)",
        ],
        borderWidth: 2,
      },
    ],
  }

  const revenueChartData = {
    labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
    datasets: [
      {
        label: "Revenus hebdomadaires",
        data: [800000, 1200000, 950000, 1400000],
        borderColor: "rgba(34, 197, 94, 1)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => new Intl.NumberFormat("fr-FR").format(value) + " F CFA",
        },
      },
    },
  }

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  }

  // Fonctions d'actions
  const handleRefreshData = async () => {
    setIsRefreshing(true)
    try {
      // Actualiser TOUTES les données en parallèle
      const [
        productsData,
        statsData,
        ordersData,
        usersData,
        categoriesData,
        promotionsData,
        paymentMethodsData,
        deliverySlotsData,
        communesData,
        scrollInterval
      ] = await Promise.all([
        apiFetchProducts(),
        fetchAdminStats(),
        fetchAdminOrders({ status: ordersStatus === 'all' ? undefined : ordersStatus, page: ordersPage, limit: ORDERS_LIMIT }),
        fetchAdminUsers({ page: 1 }),
        fetchAllCategories(),
        fetchAllPromotions(),
        fetchPaymentMethods(),
        fetchAllDeliverySlots(),
        fetchAllCommunes(),
        getGlobalSetting('promo_auto_scroll_interval').catch(() => ({ value: 4000 }))
      ])

      // Mettre à jour TOUS les états
      const updatedProducts = Array.isArray((productsData as any).items) ? (productsData as any).items : (productsData as any)
      const updatedOrders = Array.isArray((ordersData as any).items) ? (ordersData as any).items : (ordersData as any)
      
      setProducts(updatedProducts)
      setStats({ totals: statsData.totals || defaultStats.totals, charts: statsData.charts || defaultStats.charts })
      setOrders(updatedOrders)
      setOrdersCount((ordersData as any).count || 0)
      setCustomers(Array.isArray((usersData as any).items) ? (usersData as any).items : (usersData as any))
      setCategories(categoriesData || [])
      setPromotions(promotionsData || [])
      setPaymentMethods(paymentMethodsData || [])
      setDeliverySlots(deliverySlotsData || [])
      setCommunes(communesData || [])
      setGlobalSettings({ promo_auto_scroll_interval: scrollInterval.value || 4000 })

      // Mettre à jour les alertes de stock basées sur les nouveaux produits
      const newStockAlerts = updatedProducts
        .filter((product: any) => product.stock <= 5)
        .map((product: any) => ({
          id: product._id || product.id,
          name: product.name,
          stock: product.stock,
          alert: product.stock === 0 ? "Rupture de stock" : "Stock faible",
        }))
      setStockAlerts(newStockAlerts)

      // Calculer les statistiques mises à jour
      const totalRevenue = updatedOrders
        .filter((order: any) => order.status === 'delivered')
        .reduce((sum: number, order: any) => sum + (order.total || 0), 0)
      
      const pendingOrders = updatedOrders.filter((order: any) => order.status === 'pending').length
      const lowStockProducts = newStockAlerts.length

      toast({ 
        title: "Données actualisées", 
        description: `✅ ${updatedProducts.length} produits | 📦 ${updatedOrders.length} commandes | ⚠️ ${newStockAlerts.length} alertes stock | 💰 ${totalRevenue.toLocaleString('fr-FR')} F CFA revenus` 
      })
    } catch (e) {
      console.error('Erreur lors de l\'actualisation:', e)
      toast({ 
        title: "Erreur", 
        description: "Impossible de charger certaines données", 
        variant: "destructive" 
      })
    }
    setIsRefreshing(false)
  }

  const handleRecalculateSales = async () => {
    try {
      const result = await recalculateProductSales()
      toast({ 
        title: "Données recalculées", 
        description: `Ventes et stock mis à jour. ${result.deliveredOrders} commandes livrées, ${result.activeOrders} commandes actives.` 
      })
      // Recharger TOUTES les données après le recalcul
      await handleRefreshData()
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.response?.data?.message || "Impossible de recalculer les données", variant: "destructive" })
    }
  }

  // Fonctions pour les filtres de date
  const handleDateFilterChange = (filter: string) => {
    setDateFilter(filter)
    if (filter !== "custom") {
      setStartDate("")
      setEndDate("")
    }
  }

  const clearDateFilter = () => {
    setDateFilter("all")
    setStartDate("")
    setEndDate("")
  }

  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case "today": return "Aujourd'hui"
      case "week": return "7 derniers jours"
      case "month": return "30 derniers jours"
      case "custom": return "Période personnalisée"
      default: return "Toutes les dates"
    }
  }

  const handleExportData = async (entity = 'dashboard') => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/export?entity=${entity}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      if (typeof window !== 'undefined') {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = entity === 'dashboard' ? 'dashboard-freshmarket.pdf' : `${entity}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
      
      toast({
        title: "Export réussi",
        description: entity === 'dashboard' ? "Le rapport PDF a été téléchargé." : `Le fichier ${entity}.csv a été téléchargé.`,
      })
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données.",
        variant: "destructive"
      })
    }
  }

  // Remplacer les fonctions d'actions par ces vraies implémentations :

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order)
  }

  const handleEditOrder = (order: any) => {
    setEditingOrder(order)
  }

  const handleDeleteOrder = (order: any) => {
    showConfirmModal(
      "Supprimer la commande",
      `Êtes-vous sûr de vouloir supprimer la commande ${order.orderNumber} ?`,
      () => {
        setOrders(orders.filter((o) => o.id !== order.id))
        toast({
          title: "Commande supprimée",
          description: `La commande ${order.orderNumber} a été supprimée avec succès.`,
        })
      }
    )
  }

  const handleCreateOrder = () => {
    setShowCreateOrderModal(true)
  }

  const handleSaveOrder = (orderData: any) => {
    if (editingOrder) {
      // Mise à jour
      setOrders(orders.map((o) => (o.id === editingOrder.id ? { ...o, ...orderData } : o)))
      toast({
        title: "Commande mise à jour",
        description: `La commande ${editingOrder.orderNumber} a été mise à jour.`,
      })
    } else {
      // Création
      const newOrder = {
        ...orderData,
        id: `CMD${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
      }
      setOrders([newOrder, ...orders])
      toast({
        title: "Commande créée",
        description: `La commande ${newOrder.orderNumber} a été créée avec succès.`,
      })
    }
    setEditingOrder(null)
    setShowCreateOrderModal(false)
  }

  const handleViewProduct = (product: any) => {
    setSelectedProduct(product)
  }

  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
  }

  const handleAddProduct = () => {
    setShowCreateProductModal(true)
  }

  const handleSaveProduct = async (productData: any) => {
    console.log('Données du produit à sauvegarder:', productData)
    try {
      let imageUrl = productData.imageUrl || productData.image || ""
      if (productData.imageFile instanceof File) {
        const up = await apiUploadImage(productData.imageFile)
        imageUrl = up.url
      }
      const payload: any = {
        name: productData.name,
        description: productData.description || "",
        category: productData.category,
        price: Number(productData.price) || 0,
        stock: Number(productData.stock) || 0,
        status: productData.status || "active",
        imageUrl,
      }
      if (editingProduct) {
        const targetId = (editingProduct as any)._id || editingProduct.id
        const updated = await apiUpdateProduct(targetId, payload)
        setProducts(products.map((p: any) => ((((p as any)._id || p.id) === targetId) ? updated : p)))
        toast({ title: "Produit mis à jour", description: `${updated.name} a été mis à jour.` })
      } else {
        const created = await apiCreateProduct(payload)
        setProducts([created, ...products])
        toast({ title: "Produit créé", description: `${created.name} a été ajouté au catalogue.` })
      }
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.response?.data?.message || "Opération impossible", variant: "destructive" })
    }
    setEditingProduct(null)
    setShowCreateProductModal(false)
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Vérifier que orderId est valide
      if (!orderId || orderId === 'undefined' || orderId === 'null') {
        toast({ title: "Erreur", description: "ID de commande invalide", variant: "destructive" })
        return
      }
      
      await apiUpdateOrderStatus(orderId, newStatus)
      setOrders(orders.map((order: any) => ((order.id || order._id) === orderId ? { ...order, status: newStatus } : order)))
      
      // Si la commande est livrée, rafraîchir les statistiques et les produits
      if (newStatus === 'delivered') {
        // Recharger les données
        try {
          const [remote, s] = await Promise.all([
            apiFetchProducts(),
            fetchAdminStats()
          ])
          setProducts(Array.isArray((remote as any).items) ? (remote as any).items : (remote as any))
          setStats({ totals: s.totals || defaultStats.totals, charts: s.charts || defaultStats.charts })
        } catch (e) {
          console.error('Erreur rechargement données:', e)
        }
      }
      
      toast({ title: "Statut mis à jour", description: `Commande ${statusConfig[newStatus as keyof typeof statusConfig]?.label || newStatus}` })
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.response?.data?.message || "Mise à jour impossible", variant: "destructive" })
    }
  }

  const handleUpdateStock = (productId: string, newStock: number) => {
    setProducts(products.map((p) => (p.id === productId ? { ...p, stock: newStock } : p)))

    // Mettre à jour les alertes de stock
    const updatedProduct = products.find((p) => p.id === productId)
    if (updatedProduct) {
      if (newStock <= 5) {
        const alert = {
          id: productId,
          name: updatedProduct.name,
          stock: newStock,
          alert: newStock === 0 ? "Rupture de stock" : "Stock faible",
        }
        setStockAlerts((prev) => {
          const existing = prev.find((a) => a.id === productId)
          if (existing) {
            return prev.map((a) => (a.id === productId ? alert : a))
          }
          return [...prev, alert]
        })
      } else {
        setStockAlerts((prev) => prev.filter((a) => a.id !== productId))
      }
    }

    toast({
      title: "Stock mis à jour",
      description: `Stock de ${updatedProduct?.name} mis à jour à ${newStock}`,
    })
  }

  // Filtrage des données
  // Remplacer les filteredOrders et filteredProducts par :
  const filteredOrders = orders.filter((order) => {
    // Vérifier que order est un objet valide
    if (!order || typeof order !== 'object') return false
    
    const orderId = order.id || order._id || order.orderNumber || ""
    const customerName = order.customer || order.delivery?.name || ""
    
    const matchesSearch =
      orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedOrderStatus === "all" || order.status === selectedOrderStatus
    
    // Filtre par date
    let matchesDate = true
    if (dateFilter !== "all") {
      const orderDate = new Date(order.createdAt || order.date || Date.now())
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      switch (dateFilter) {
        case "today":
          const orderToday = new Date(orderDate)
          orderToday.setHours(0, 0, 0, 0)
          matchesDate = orderToday.getTime() === today.getTime()
          break
        case "week":
          const weekAgo = new Date(today)
          weekAgo.setDate(today.getDate() - 7)
          matchesDate = orderDate >= weekAgo
          break
        case "month":
          const monthAgo = new Date(today)
          monthAgo.setMonth(today.getMonth() - 1)
          matchesDate = orderDate >= monthAgo
          break
        case "custom":
          if (startDate && endDate) {
            const start = new Date(startDate)
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999) // Fin de la journée
            matchesDate = orderDate >= start && orderDate <= end
          }
          break
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const filteredProducts = products.filter((product) => {
    // Vérifier que product est un objet valide
    if (!product || typeof product !== 'object') return false
    
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedProductCategory === "all" || product.category === selectedProductCategory
    return matchesSearch && matchesCategory
  })

  const paymentMethodsChartData = {
    labels: ["Mobile Money", "Carte bancaire", "Paiement livraison"],
    datasets: [
      {
        data: [65, 25, 10],
        backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(34, 197, 94, 0.8)", "rgba(245, 158, 11, 0.8)"],
        borderColor: ["rgba(59, 130, 246, 1)", "rgba(34, 197, 94, 1)", "rgba(245, 158, 11, 1)"],
        borderWidth: 2,
      },
    ],
  }

  const handleAddPaymentMethod = () => {
    setEditingPaymentMethod(null)
    setShowPaymentModal(true)
  }

  const handleEditPaymentMethod = (method: any) => {
    setEditingPaymentMethod(method)
    setShowPaymentModal(true)
  }

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false)
    setEditingPaymentMethod(null)
  }

  const handleSavePaymentMethod = async (data: any, file?: File) => {
    try {
      let qrImage = data.qrImage || ''
      
      // Convertir le fichier en base64 si fourni
      if (file) {
        const reader = new FileReader()
        qrImage = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
      }
      
      const payload = {
        name: data.name,
        code: data.code,
        number: data.number || '',
        isActive: data.isActive,
        qrImage
      }
      
      if (editingPaymentMethod) {
        const updated = await updatePaymentMethod(editingPaymentMethod._id, payload)
        setPaymentMethods(paymentMethods.map((m) => (m._id === editingPaymentMethod._id ? updated : m)))
        toast({ title: "Moyen de paiement mis à jour", description: `${updated.name} a été mis à jour.` })
      } else {
        const created = await createPaymentMethod(payload)
        setPaymentMethods([created, ...paymentMethods])
        toast({ title: "Moyen de paiement créé", description: `${created.name} a été ajouté.` })
      }
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.response?.data?.message || "Opération impossible", variant: "destructive" })
    }
    handleClosePaymentModal()
  }

  const handleDeletePaymentMethod = async (id: string) => {
    showConfirmModal(
      "Supprimer le moyen de paiement",
      "Êtes-vous sûr de vouloir supprimer définitivement ce moyen de paiement ?",
      async () => {
        try {
          await deletePaymentMethod(id)
          setPaymentMethods(paymentMethods.filter((m) => m._id !== id))
          toast({ title: "Moyen de paiement supprimé", description: `Le moyen de paiement a été supprimé.` })
        } catch (e: any) {
          toast({ title: "Erreur", description: e?.response?.data?.message || "Suppression impossible", variant: "destructive" })
        }
      }
    )
  }

  // Gestion des promotions
  const handleSavePromotion = async (data: any) => {
    try {
      if (editingPromotion) {
        const updated = await updatePromotion(editingPromotion._id, data)
        setPromotions(promotions.map((p) => (p._id === editingPromotion._id ? updated : p)))
        toast({ title: "Promotion mise à jour", description: "Promotion mise à jour avec succès" })
      } else {
        const created = await createPromotion(data)
        setPromotions([...promotions, created])
        toast({ title: "Promotion créée", description: "Promotion créée avec succès" })
      }
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.response?.data?.message || "Opération impossible", variant: "destructive" })
    }
    handleClosePromotionModal()
  }

  const handleDeletePromotion = async (promotion: any) => {
    showConfirmModal(
      "Supprimer la promotion",
      "Êtes-vous sûr de vouloir supprimer définitivement cette promotion ?",
      async () => {
        try {
          await deletePromotion(promotion._id)
          setPromotions(promotions.filter((p) => p._id !== promotion._id))
          toast({ title: "Promotion supprimée", description: "Promotion supprimée avec succès" })
        } catch (e: any) {
          toast({ title: "Erreur", description: e?.response?.data?.message || "Suppression impossible", variant: "destructive" })
        }
      }
    )
  }

  const handleClosePromotionModal = () => {
    setShowPromotionModal(false)
    setEditingPromotion(null)
  }

  // Gestion des catégories
  const handleSaveCategory = async (data: any) => {
    try {
      if (editingCategory) {
        const updated = await updateCategory(editingCategory._id, data)
        setCategories(categories.map((c) => (c._id === editingCategory._id ? updated : c)))
        toast({ title: "Catégorie mise à jour", description: "Catégorie mise à jour avec succès" })
      } else {
        const created = await createCategory(data)
        setCategories([...categories, created])
        toast({ title: "Catégorie créée", description: "Catégorie créée avec succès" })
      }
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.response?.data?.message || "Opération impossible", variant: "destructive" })
    }
    handleCloseCategoryModal()
  }

  const handleDeleteCategory = async (category: any) => {
    showConfirmModal(
      "Supprimer la catégorie",
      "Êtes-vous sûr de vouloir supprimer définitivement cette catégorie ?",
      async () => {
        try {
          await deleteCategory(category._id)
          setCategories(categories.filter((c) => c._id !== category._id))
          toast({ title: "Catégorie supprimée", description: "Catégorie supprimée avec succès" })
        } catch (e: any) {
          toast({ title: "Erreur", description: e?.response?.data?.message || "Suppression impossible", variant: "destructive" })
        }
      }
    )
  }

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false)
    setEditingCategory(null)
  }

  // Gestion des plages horaires
  const handleSaveDeliverySlot = async (data: any) => {
    try {
      if (editingDeliverySlot) {
        const updated = await updateDeliverySlot(editingDeliverySlot._id, data)
        setDeliverySlots(deliverySlots.map((s) => (s._id === editingDeliverySlot._id ? updated : s)))
        toast({ title: "Plage horaire mise à jour", description: "Plage horaire mise à jour avec succès" })
      } else {
        const created = await createDeliverySlot(data)
        setDeliverySlots([...deliverySlots, created])
        toast({ title: "Plage horaire créée", description: "Plage horaire créée avec succès" })
      }
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.response?.data?.message || "Opération impossible", variant: "destructive" })
    }
    handleCloseDeliverySlotModal()
  }

  const handleDeleteDeliverySlot = async (slot: any) => {
    showConfirmModal(
      "Supprimer la plage horaire",
      "Êtes-vous sûr de vouloir supprimer définitivement cette plage horaire ?",
      async () => {
        try {
          await deleteDeliverySlot(slot._id)
          setDeliverySlots(deliverySlots.filter((s) => s._id !== slot._id))
          toast({ title: "Plage horaire supprimée", description: "Plage horaire supprimée avec succès" })
        } catch (e: any) {
          toast({ title: "Erreur", description: e?.response?.data?.message || "Suppression impossible", variant: "destructive" })
        }
      }
    )
  }

  const handleCloseDeliverySlotModal = () => {
    setShowDeliverySlotModal(false)
    setEditingDeliverySlot(null)
  }

  // Gestion des communes
  const handleSaveCommune = async (data: any) => {
    try {
      if (editingCommune) {
        const updated = await updateCommune(editingCommune._id, data)
        setCommunes(communes.map((c) => (c._id === editingCommune._id ? updated : c)))
        toast({ title: "Commune mise à jour", description: "Commune mise à jour avec succès" })
      } else {
        const created = await createCommune(data)
        setCommunes([...communes, created])
        toast({ title: "Commune créée", description: "Commune créée avec succès" })
      }
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.response?.data?.message || "Opération impossible", variant: "destructive" })
    }
    handleCloseCommuneModal()
  }

  const handleDeleteCommune = async (commune: any) => {
    showConfirmModal(
      "Supprimer la commune",
      "Êtes-vous sûr de vouloir supprimer définitivement cette commune ?",
      async () => {
        try {
          await deleteCommune(commune._id)
          setCommunes(communes.filter((c) => c._id !== commune._id))
          toast({ title: "Commune supprimée", description: "Commune supprimée avec succès" })
        } catch (e: any) {
          toast({ title: "Erreur", description: e?.response?.data?.message || "Suppression impossible", variant: "destructive" })
        }
      }
    )
  }

  const handleCloseCommuneModal = () => {
    setShowCommuneModal(false)
    setEditingCommune(null)
  }

  const handleUpdateGlobalSetting = async (key: string, value: any) => {
    try {
      await updateGlobalSetting(key, { value })
      setGlobalSettings((prev: any) => ({ ...prev, [key]: value }))
      toast({ title: "Paramètre mis à jour", description: "Le paramètre a été sauvegardé avec succès." })
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.response?.data?.message || "Impossible de sauvegarder le paramètre", variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-4 overflow-x-hidden">
      {/* Header Admin */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="font-display font-bold text-2xl text-orange-400">Administration</h1>
              <p className="text-gray-600">Bienvenue, {user.name}</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" onClick={handleRefreshData} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
            <Button variant="outline" onClick={() => handleExportData('dashboard')}>
              <Download className="h-4 w-4 mr-2" />
              Exporter PDF
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              <Home className="h-4 w-4 mr-2" />
              Voir le site
            </Button>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreVertical className="h-4 w-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border shadow-lg z-50">
                <DropdownMenuItem onClick={handleRefreshData} className="flex items-center gap-2">
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  Actualiser
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportData('dashboard')} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exporter PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/")} className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Voir le site
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Commandes totales"
            value={(stats.totals.totalOrders || 0).toLocaleString()}
            icon={ShoppingCart}
            color="bg-blue-500"
            subtitle={`${stats.totals.pendingOrders || 0} en attente`}
          />
          <StatCard
            title="Produits"
            value={(stats.totals.totalProducts || 0).toString()}
            icon={Package}
            color="bg-purple-500"
            subtitle={`${stats.totals.lowStockProducts || 0} en rupture`}
          />
          <StatCard
            title="Clients"
            value={(stats.totals.totalUsers || 0).toString()}
            icon={Users}
            color="bg-orange-500"
            subtitle=""
          />
        </div>

        {/* Métriques secondaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Commandes livrées</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totals.deliveredRate}%</p>
                </div>
                <Truck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Chiffre d'affaires</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totals.deliveredRevenue || 0 } F CFA</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Évolution des ventes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56 md:h-80">
                <Bar data={salesChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          <Card>
            <CardHeader>
              <CardTitle>Alertes et notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Stock faible</p>
                  <p className="text-sm text-yellow-600">{stats.totals.lowStockProducts} produit(s) en rupture de stock</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Nouvelles commandes</p>
                  <p className="text-sm text-blue-600">{stats.totals.pendingOrders} commande(s) à traiter</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets de gestion */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="w-full overflow-x-auto flex gap-2 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger 
              className="flex-shrink-0 rounded-lg data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm" 
              value="orders"
            >
              Commandes
            </TabsTrigger>
            <TabsTrigger 
              className="flex-shrink-0 rounded-lg data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm" 
              value="products"
            >
              Produits
            </TabsTrigger>
            <TabsTrigger 
              className="flex-shrink-0 rounded-lg data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm" 
              value="users"
            >
              Clients
            </TabsTrigger>
            <TabsTrigger 
              className="flex-shrink-0 rounded-lg data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm" 
              value="payments"
            >
              Plus
            </TabsTrigger>
          </TabsList>

          {/* Gestion des commandes */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle>Gestion des commandes ({filteredOrders.length})</CardTitle>
                    {(dateFilter !== "all" || startDate || endDate) && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Filtre: {getDateFilterLabel()}</span>
                        {dateFilter === "custom" && startDate && endDate && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <div className="relative flex-1 min-w-0">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Rechercher une commande..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full"
                      />
                    </div>
                    <Select value={selectedOrderStatus} onValueChange={(v) => { setSelectedOrderStatus(v); setOrdersStatus(v) }}>
                      <SelectTrigger className="w-full sm:w-48 bg-white border border-gray-300">
                        <SelectValue placeholder="Filtrer par statut" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border shadow-lg z-50">
                        <SelectItem value="all" className="bg-white hover:bg-gray-100">
                          Tous les statuts
                        </SelectItem>
                        <SelectItem value="pending" className="bg-white hover:bg-gray-100">
                          En attente
                        </SelectItem>
                        <SelectItem value="confirmed" className="bg-white hover:bg-gray-100">
                          Confirmées
                        </SelectItem>
                        <SelectItem value="shipped" className="bg-white hover:bg-gray-100">
                          Expédiées
                        </SelectItem>
                        <SelectItem value="delivered" className="bg-white hover:bg-gray-100">
                          Livrées
                        </SelectItem>
                        <SelectItem value="cancelled" className="bg-white hover:bg-gray-100">
                          Annulées
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                      <SelectTrigger className="w-full sm:w-48 bg-white border border-gray-300">
                        <SelectValue placeholder="Filtrer par date" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border shadow-lg z-50">
                        <SelectItem value="all" className="bg-white hover:bg-gray-100">
                          Toutes les dates
                        </SelectItem>
                        <SelectItem value="today" className="bg-white hover:bg-gray-100">
                          Aujourd'hui
                        </SelectItem>
                        <SelectItem value="week" className="bg-white hover:bg-gray-100">
                          7 derniers jours
                        </SelectItem>
                        <SelectItem value="month" className="bg-white hover:bg-gray-100">
                          30 derniers jours
                        </SelectItem>
                        <SelectItem value="custom" className="bg-white hover:bg-gray-100">
                          Période personnalisée
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {dateFilter === "custom" && (
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-40"
                          placeholder="Date début"
                        />
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-40"
                          placeholder="Date fin"
                        />
                      </div>
                    )}
                    {(dateFilter !== "all" || startDate || endDate) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearDateFilter}
                        className="flex items-center gap-1"
                      >
                        <X className="h-4 w-4" />
                        Effacer
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <OrderRow
                      key={order.id || order._id || Math.random()}
                      order={order}
                      onView={handleViewOrder}
                      onEdit={handleEditOrder}
                      onDelete={handleDeleteOrder}
                      onUpdateStatus={handleUpdateOrderStatus}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestion des produits */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <CardTitle>Gestion des produits ({filteredProducts.length})</CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <div className="relative flex-1 min-w-0">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Rechercher un produit..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full"
                      />
                    </div>
                    <Select value={selectedProductCategory} onValueChange={setSelectedProductCategory}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filtrer par catégorie" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border shadow-lg z-50">
                        <SelectItem value="all">Toutes les catégories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category.name}>
                            {category.emoji} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddProduct} className="bg-gradient-warm">
                      <Plus className="h-4 w-4 mr-2" />
                      Nouveau produit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <ProductRow
                      key={product.id || Math.random()}
                      product={product}
                      onView={handleViewProduct}
                      onEdit={handleEditProduct}
                      onDelete={handleDeleteProduct}
                      onUpdateStock={handleUpdateStock}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestion des clients (API) */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des clients</CardTitle>
              </CardHeader>
              <CardContent>
                <UsersSection orders={orders} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Méthodes de paiement et Promotions */}
          <TabsContent value="payments">
            <div className="space-y-6">
              {/* Méthodes de paiement */}
              <Card>
                <CardHeader>
                  <CardTitle>Méthodes de paiement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {paymentMethods.map((m: any) => (
                        <div key={m._id} className="p-3 rounded-xl border flex flex-col items-center justify-between">
                          <div className="flex items-center gap-3 space-y-2 mb-2">
                            {m.qrImage && (<img src={m.qrImage} alt="QR" className="w-12 h-12 rounded-lg border" />)}
                            <div>
                              <p className="font-medium text-gray-900">{m.name} <span className="text-xs text-gray-500">({m.code})</span></p>
                              <p className="text-sm text-gray-600">{m.number || "—"}</p>
                              {!m.isActive && <span className="text-xs text-red-500">Inactif</span>}
                            </div>
                          </div>
                          <hr className="w-full" />
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" className="bg-gradient-warm" variant="outline" onClick={() => handleEditPaymentMethod(m)}>Éditer</Button>
                            <Button size="sm" className="outline-red-500" variant="outline" onClick={async () => { 
                  showConfirmModal(
                    "Supprimer la méthode de paiement",
                    "Êtes-vous sûr de vouloir supprimer cette méthode de paiement ?",
                    async () => {
                      await deletePaymentMethod(m._id)
                      setPaymentMethods(paymentMethods.filter((x:any)=>x._id!==m._id))
                    }
                  )
                }}>Supprimer</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex underline">
                      <Button onClick={handleAddPaymentMethod}>Ajouter une méthode</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Promotions */}
              <Card>
                <CardHeader>
                  <CardTitle>Promotions ({promotions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {promotions.map((promo: any) => (
                        <div key={promo._id} className="p-4 rounded-xl border bg-gradient-to-r from-gray-50 to-white">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{promo.emoji}</span>
                              <div>
                                <p className="font-medium text-gray-900">{promo.title}</p>
                                <p className="text-sm text-gray-600">{promo.subtitle}</p>
                              </div>
                            </div>
                                                         <Badge variant={promo.isActive ? "default" : "secondary"}>
                              {promo.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          {promo.discount && (
                            <div className="mb-3">
                              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                                {promo.discount}
                              </Badge>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="bg-gradient-warm"
                              onClick={() => { setEditingPromotion(promo); setShowPromotionModal(true) }}
                            >
                              Éditer
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="outline-red-500"
                              onClick={() => handleDeletePromotion(promo)}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex underline">
                      <Button onClick={() => setShowPromotionModal(true)}>
                        Ajouter une promotion
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Catégories */}
              <Card>
                <CardHeader>
                  <CardTitle>Catégories ({categories.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categories.map((category: any) => (
                        <div key={category._id} className="p-4 rounded-xl border bg-gradient-to-r from-gray-50 to-white">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{category.emoji}</span>
                              <div>
                                <p className="font-medium text-gray-900">{category.name}</p>
                                <p className="text-sm text-gray-600">{category.slug}</p>
                              </div>
                            </div>
                                                         <Badge variant={category.isActive ? "default" : "secondary"}>
                              {category.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          {category.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{category.description}</p>
                          )}
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-gradient-warm" 
                              onClick={() => { setEditingCategory(category); setShowCategoryModal(true) }}
                            >
                              Éditer
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="outline-red-500"
                              onClick={() => handleDeleteCategory(category)}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex underline">
                      <Button onClick={() => setShowCategoryModal(true)}>
                        Ajouter une catégorie
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Communes */}
              <Card>
                <CardHeader>
                  <CardTitle>Communes et frais de livraison ({communes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {communes.map((commune: any) => (
                        <div key={commune._id} className="p-4 rounded-xl border bg-gradient-to-r from-gray-50 to-white">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium text-gray-900">{commune.name}</p>
                              <p className="text-sm text-gray-600">{commune.code}</p>
                            </div>
                                                         <Badge variant={commune.isActive ? "default" : "secondary"}>
                              {commune.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-3">
                            <p className="font-semibold text-orange-600">
                              {commune.deliveryFee.toLocaleString()} F CFA
                            </p>
                            {commune.description && (
                              <p className="text-xs text-gray-500 mt-1">{commune.description}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="bg-gradient-warm"
                              onClick={() => { setEditingCommune(commune); setShowCommuneModal(true) }}
                            >
                              Éditer
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="outline-red-500"
                              onClick={() => handleDeleteCommune(commune)}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex underline">
                      <Button onClick={() => setShowCommuneModal(true)}>
                        Ajouter une commune
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Plages horaires */}
              <Card>
                <CardHeader>
                  <CardTitle>Plages horaires de livraison ({deliverySlots.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {deliverySlots.map((slot: any) => (
                        <div key={slot._id} className="p-4 rounded-xl border bg-gradient-to-r from-gray-50 to-white">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium text-gray-900">{slot.name}</p>
                              <p className="text-sm text-gray-600">{slot.startTime} - {slot.endTime}</p>
                            </div>
                                                         <Badge variant={slot.isActive ? "default" : "secondary"}>
                              {slot.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-3">
                            <p>Commandes aujourd'hui: {slot.currentOrders}</p>
                            {slot.maxOrders > 0 && (
                              <p>Limite: {slot.maxOrders} commandes</p>
                            )}
                            {slot.maxOrders === 0 && (
                              <p>Limite: Illimitée</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="bg-gradient-warm"
                              onClick={() => { setEditingDeliverySlot(slot); setShowDeliverySlotModal(true) }}
                            >
                              Éditer
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="outline-red-500"
                              onClick={() => handleDeleteDeliverySlot(slot)}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex underline">
                      <Button onClick={() => setShowDeliverySlotModal(true)}>
                        Ajouter une plage horaire
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Paramètres généraux */}
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres généraux</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Intervalle de défilement des promotions (secondes)</Label>
                      <Input 
                        type="number" 
                        value={globalSettings.promo_auto_scroll_interval ? globalSettings.promo_auto_scroll_interval / 1000 : 4} 
                        onChange={(e) => handleUpdateGlobalSetting('promo_auto_scroll_interval', Number(e.target.value) * 1000)} 
                        min="1" 
                        max="10" 
                        step="0.5"
                        className="w-48" 
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Durée entre chaque changement automatique de promotion (1-10 secondes)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} deliverySlots={deliverySlots} />}
      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      {showCreateOrderModal && (
        <CreateOrderModal onClose={() => setShowCreateOrderModal(false)} onSave={handleSaveOrder} />
      )}
      {showCreateProductModal && (
        <CreateProductModal 
          onClose={() => setShowCreateProductModal(false)} 
          onSave={handleSaveProduct}
          categories={categories}
        />
      )}
      {editingOrder && (
        <EditOrderModal order={editingOrder} onClose={() => setEditingOrder(null)} onSave={handleSaveOrder} />
      )}
      {editingProduct && (
        <EditProductModal 
          product={editingProduct} 
          onClose={() => setEditingProduct(null)} 
          onSave={handleSaveProduct}
          categories={categories}
        />
      )}
      {showPaymentModal && (
        <PaymentMethodModal
          method={editingPaymentMethod}
          onClose={() => { setShowPaymentModal(false); setEditingPaymentMethod(null) }}
          onSave={handleSavePaymentMethod}
        />
      )}
      {showPromotionModal && (
        <PromotionModal
          promotion={editingPromotion}
          onClose={handleClosePromotionModal}
          onSave={handleSavePromotion}
        />
      )}
      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          onClose={handleCloseCategoryModal}
          onSave={handleSaveCategory}
        />
      )}
      {showDeliverySlotModal && (
        <DeliverySlotModal
          slot={editingDeliverySlot}
          onClose={handleCloseDeliverySlotModal}
          onSave={handleSaveDeliverySlot}
        />
      )}
      {showCommuneModal && (
        <CommuneModal
          commune={editingCommune}
          onClose={handleCloseCommuneModal}
          onSave={handleSaveCommune}
        />
      )}

      {/* Modal de confirmation */}
      <Dialog open={confirmModal.isOpen} onOpenChange={(open) => setConfirmModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>{confirmModal.title}</DialogTitle>
            <DialogDescription className="whitespace-pre-line">
              {confirmModal.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
              className="bg-white"
            >
              {confirmModal.cancelText}
            </Button>
            <Button 
              onClick={() => {
                confirmModal.onConfirm()
                setConfirmModal(prev => ({ ...prev, isOpen: false }))
              }}
              className="bg-gradient-warm mb-2"
            >
              {confirmModal.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Composants auxiliaires
function StatCard({
  title,
  value,
  growth,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string
  value: string
  growth?: number
  icon: any
  color: string
  subtitle?: string
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold mb-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            {growth && (
              <p className="text-sm text-green-600 mt-2 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />+{growth}% ce mois
              </p>
            )}
          </div>
          <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function OrderRow({
  order,
  onView,
  onEdit,
  onDelete,
  onUpdateStatus,
}: {
  order: any
  onView: (order: any) => void
  onEdit: (order: any) => void
  onDelete: (order: any) => void
  onUpdateStatus: (orderId: string, status: string) => void
}) {
  const statusInfo = statusConfig[order.status as keyof typeof statusConfig]
  
  // Définir les transitions de statut autorisées
  const allowedTransitions: Record<string, string[]> = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['preparing', 'cancelled'],
    'preparing': ['shipped', 'cancelled'],
    'shipped': ['delivered', 'cancelled'],
    'delivered': [], // Une commande livrée ne peut plus changer de statut
    'cancelled': [] // Une commande annulée ne peut plus changer de statut
  }
  
  const currentStatus = order.status || 'pending'
  const allowedNextStatuses = allowedTransitions[currentStatus] || []
  const isStatusLocked = allowedNextStatuses.length === 0

  return (
    <div className="p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <p className="font-medium">#{order.orderNumber || "N/A"}</p>
          <p className="text-sm text-gray-600">{order.customer || order.delivery?.name || "Client non spécifié"}</p>
        </div>
        <div className="sm:min-w-[120px]">
          <Badge className={`${statusInfo?.color || "bg-gray-500"} text-white ${isStatusLocked ? 'opacity-75' : ''}`}>
            {statusInfo?.label || order.status || "Non défini"}
            {isStatusLocked && <span className="ml-1">🔒</span>}
          </Badge>
          <p className="text-xs text-gray-500 mt-1 uppercase">Paiement par : {order.paymentMethod || "Non spécifié"}</p>
        </div>
        <div className="sm:ml-auto text-left sm:text-right">
          <p className="font-medium">{order.total ? order.total.toLocaleString("fr-FR") : "0"} F CFA</p>
          <p className="text-sm text-gray-600">{Array.isArray(order.items) ? order.items.length : 0} article(s)</p>
          <p className="text-xs text-gray-500">
            {order.date ? new Date(order.date).toLocaleDateString("fr-FR") : 
             order.createdAt ? new Date(order.createdAt).toLocaleDateString("fr-FR") : 
             "Date non disponible"}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {isStatusLocked ? (
          <div className="w-full sm:w-32 p-2 bg-gray-100 border border-gray-300 rounded text-sm text-gray-500 text-center">
            {currentStatus === 'delivered' ? 'Livrée' : currentStatus === 'cancelled' ? 'Annulée' : order.status}
          </div>
        ) : (
          <Select onValueChange={(value) => onUpdateStatus(order._id || order.id, value)}>
            <SelectTrigger className="w-full sm:w-32 bg-white border border-gray-300">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              {allowedNextStatuses.includes('confirmed') && (
                <SelectItem value="confirmed" className="bg-white hover:bg-gray-100">
                  Confirmée
                </SelectItem>
              )}
              {allowedNextStatuses.includes('preparing') && (
                <SelectItem value="preparing" className="bg-white hover:bg-gray-100">
                  En préparation
                </SelectItem>
              )}
              {allowedNextStatuses.includes('shipped') && (
                <SelectItem value="shipped" className="bg-white hover:bg-gray-100">
                  Expédiée
                </SelectItem>
              )}
              {allowedNextStatuses.includes('delivered') && (
                <SelectItem value="delivered" className="bg-white hover:bg-gray-100">
                  Livrée
                </SelectItem>
              )}
              {allowedNextStatuses.includes('cancelled') && (
                <SelectItem value="cancelled" className="bg-white hover:bg-gray-100">
                  Annulée
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        )}
        <Button variant="outline" size="icon" onClick={() => onView(order)}>
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function ProductRow({
  product,
  onView,
  onEdit,
  onDelete,
  onUpdateStock,
}: {
  product: any
  onView: (product: any) => void
  onEdit: (product: any) => void
  onDelete: (product: any) => void
  onUpdateStock: (productId: string, newStock: number) => void
}) {
  const [stockInput, setStockInput] = useState(product.stock)

  const handleStockUpdate = () => {
    onUpdateStock(product.id, stockInput)
  }

  return (
    <div className="p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex flex-row sm:flex-row sm:items-center gap-4">
        <div className="relative">
          <img
            src={product.image || product.imageUrl || "/placeholder.svg"}
            alt={product.name}
            className="w-20 h-20 rounded-lg object-cover border"
          />
          {product.stock <= 5 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-2 w-2 text-white" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium">{product.name}</p>
            {product.status === 'inactive' && (
              <Badge variant="secondary" className="text-xs bg-gray-500 text-white">
                Inactif
              </Badge>
            )}
          </div>
          <p className="font-medium text-sm">{product.price.toLocaleString("fr-FR")} F CFA</p>
          <p className="text-sm text-gray-600">{product.category}</p>
          <p className="text-xs text-gray-500">Créé le {new Date(product.createdAt).toLocaleDateString("fr-FR")}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2 justify-center">
        <Button variant="outline" onClick={() => onView(product)}>
          <Eye className="h-4 w-4" /> Voir les détails
        </Button>
      </div>
    </div>
  )
}

function CustomerRow({ customer, orders }: { customer: any; orders: any[] }) {
  // Calculer les statistiques de commandes pour ce client
  const customerOrders = orders.filter((order: any) => {
    // Correspondance par ID utilisateur
    if (order.user === customer._id) return true
    
    // Correspondance par email
    if (order.delivery?.email && customer.email && 
        order.delivery.email.toLowerCase() === customer.email.toLowerCase()) return true
    
    // Correspondance par téléphone
    if (order.delivery?.phone && customer.phone && 
        order.delivery.phone === customer.phone) return true
    
    // Correspondance par nom (si email et téléphone correspondent)
    if (order.delivery?.name && customer.name && 
        order.delivery.name.toLowerCase() === customer.name.toLowerCase() &&
        (order.delivery?.email === customer.email || order.delivery?.phone === customer.phone)) return true
    
    return false
  })
  
  const totalOrders = customerOrders.length
  const deliveredOrders = customerOrders.filter((order: any) => order.status === 'delivered').length
  const pendingOrders = customerOrders.filter((order: any) => order.status === 'pending').length
  const totalRevenue = customerOrders
    .filter((order: any) => order.status === 'delivered')
    .reduce((sum: number, order: any) => sum + (order.total || 0), 0)

  return (
    <div className="p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex flex-row sm:flex-row sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-medium break-words">{customer.name}</p>
          <p className="text-sm text-gray-600 break-words">{customer.email}</p>
          <p className="text-xs text-gray-500 break-words">{customer.phone}</p>
          <p className="text-xs text-gray-500 break-words">{customer.address}</p>
          <p className="text-xs text-gray-500 mb-2">Inscrit le {new Date(customer.createdAt).toLocaleDateString("fr-FR")}</p>
        </div>
        <div className="sm:ml-auto text-left sm:text-right">
          {/* Statistiques des commandes */}
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 w-fit">
              📦 {totalOrders} commande{totalOrders > 1 ? 's' : ''}
            </Badge>
            {deliveredOrders > 0 && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 w-fit">
                ✅ {deliveredOrders} livrée{deliveredOrders > 1 ? 's' : ''}
              </Badge>
            )}
            {pendingOrders > 0 && (
              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 w-fit">
                ⏳ {pendingOrders} en attente
              </Badge>
            )}
            {totalRevenue > 0 && (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 w-fit">
                💰 {totalRevenue.toLocaleString('fr-FR')} F CFA
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function OrderModal({ order, onClose, deliverySlots }: { order: any; onClose: () => void; deliverySlots: any[] }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="bg-white border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Détails de la commande #{order.orderNumber || "N/A"}</CardTitle>
            <Button variant="ghost" onClick={onClose} className="hover:bg-gray-100">
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 bg-white p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-gray-800">LE CLIENT</h4>
              <p className="text-gray-700 mb-2">
                <strong>Nom :</strong>
                <p>{order.delivery?.name || "Non spécifié"}</p>
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Téléphone :</strong>
                <p>{order.delivery?.phone || "Non spécifié"}</p>
              </p>
              <p className="text-gray-700">
                <strong>Adresse :</strong> 
                <p>{order.deliveryAddress || order.delivery?.address || "Non spécifié"}</p>
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-gray-800">LA COMMANDE</h4>
              <p className="text-gray-700 mb-2">
                <strong>Date :</strong> 
                <p>{order.date ? new Date(order.date).toLocaleDateString("fr-FR") : 
                                       order.createdAt ? new Date(order.createdAt).toLocaleDateString("fr-FR") : 
                                       "Date non disponible"}</p>
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Statut :</strong> 
                <p>{statusConfig[order.status as keyof typeof statusConfig]?.label || order.status || "Non défini"}</p>
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Paiement :</strong> {order.paymentMethod || "Non spécifié"}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Créneau de livraison :</strong> 
                <p>{order.delivery?.deliverySlot ? 
                  (() => {
                    const slot = findDeliverySlot(order.delivery.deliverySlot, deliverySlots)
                    return slot ? `${slot.name} (${slot.startTime} - ${slot.endTime})` : "Créneau non trouvé"
                  })() : 
                  "Non spécifié"}</p>
              </p>
              <p className="text-gray-700">
                <strong>Total :</strong> 
                <p>{order.total ? order.total.toLocaleString("fr-FR") : "0"} F CFA</p>
              </p>
            </div>
          </div>
          
          {/* Articles de la commande */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 text-gray-800">Articles commandés</h4>
            {Array.isArray(order.items) && order.items.length > 0 ? (
              <div className="space-y-2">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.imageUrl || item.image || "/placeholder.svg"} 
                        alt={item.name} 
                        className="w-8 h-8 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">Quantité: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium text-sm">{item.price ? item.price.toLocaleString("fr-FR") : "0"} F CFA</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Aucun article détaillé disponible</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ProductModal({ product, onClose }: { product: any; onClose: () => void }) {
  const { toast } = useToast()
  
  const handleEdit = () => {
    onClose()
    // On va utiliser le state global pour déclencher l'édition
    // Cette fonction sera appelée depuis le composant parent
  }
  
  const handleDuplicate = () => {
    const duplicatedProduct = {
      ...product,
      name: `${product.name} (copie)`,
      id: undefined,
      _id: undefined
    }
    // On pourrait implémenter la duplication ici
    toast({
      title: "Fonctionnalité à venir",
      description: "La duplication sera bientôt disponible",
    })
  }
  
  const handleDelete = () => {
    // Cette fonction n'est plus utilisée car la suppression se fait via le modal de confirmation
    // qui est géré par le composant parent
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="bg-white border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Détails du produit</CardTitle>
            <Button variant="ghost" onClick={onClose} className="hover:bg-gray-100">
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 bg-white p-6">
          <div className="flex gap-4">
            <img
              src={product.image || product.imageUrl || "/placeholder.svg"}
              alt={product.name}
              className="w-24 h-24 rounded-lg object-cover border"
            />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
              <p className="text-lg font-bold text-orange-600">{product.price.toLocaleString("fr-FR")} F CFA</p>
              <p className="text-gray-600">{product.category}</p>
              <p className="text-sm">
                <span className="text-gray-600">Créé le :</span>
                <span className="ml-2">{new Date(product.createdAt).toLocaleDateString("fr-FR")}</span>
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600 text-sm">{product.description || "Aucune description disponible"}</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Stock</p>
              <p className={`text-xl font-bold ${product.stock > 5 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                {product.stock}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Vendus</p>
              <p className="text-xl font-bold text-gray-800">{product.sold || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Statut</p>
                             <Badge variant={product.status === "active" ? "default" : "secondary"}>
                {product.status === "active" ? "Actif" : "Inactif"}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4 border-t justify-center">
            <Button 
              className="bg-gradient-warm" 
              onClick={() => {
                onClose()
                // On va déclencher l'édition depuis le composant parent
                setTimeout(() => {
                  // Utiliser un timeout pour permettre la fermeture du modal
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('editProduct', { detail: product }))
                  }
                }, 100)
              }}
            >
              Modifier le produit
            </Button>
            <Button 
              variant="outline" 
              className="bg-white text-red-600 border-red-200"
              onClick={() => {
                onClose()
                // On va déclencher la suppression depuis le composant parent
                setTimeout(() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('deleteProduct', { detail: product }))
                  }
                }, 100)
              }}
            >
              Supprimer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CreateOrderModal({ onClose, onSave }: { onClose: () => void; onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    customer: "",
    email: "",
    total: 0,
    items: 1,
    status: "pending",
    paymentMethod: "Mobile Money",
    deliveryAddress: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card className="w-full max-w-md bg-white border shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="bg-white border-b">
          <CardTitle>Nouvelle commande</CardTitle>
        </CardHeader>
        <CardContent className="bg-white p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Client</Label>
              <Input
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                required
                className="bg-white"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-white"
              />
            </div>
            <div>
              <Label>Total (F CFA)</Label>
              <Input
                type="number"
                value={formData.total}
                onChange={(e) => setFormData({ ...formData, total: Number(e.target.value) })}
                required
                className="bg-white"
              />
            </div>
            <div>
              <Label>Adresse de livraison</Label>
              <Input
                value={formData.deliveryAddress}
                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                required
                className="bg-white"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="bg-gradient-warm flex-1">
                Créer
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="bg-white">
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function CreateProductModal({ onClose, onSave, categories }: { onClose: () => void; onSave: (data: any) => void; categories: any[] }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: categories.length > 0 ? categories[0].name : "Paniers",
    price: 0,
    stock: 0,
    status: "active",
    imageUrl: "",
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploadingImage(true)
    try {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        setImagePreview(dataUrl)
        setFormData((prev) => ({ ...prev, imageUrl: dataUrl }))
        setUploadingImage(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Erreur lors du chargement de l\'image:', error)
      setUploadingImage(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card className="w-full max-w-md bg-white border shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="bg-white border-b">
          <CardTitle>Nouveau produit</CardTitle>
        </CardHeader>
        <CardContent className="bg-white p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Image du produit</Label>
              <div className="mt-2 flex items-center gap-3">
                <div className="w-20 h-20 rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center">
                  {uploadingImage ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                    </div>
                  ) : imagePreview ? (
                    <img src={imagePreview} alt="Prévisualisation" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-500">Aucune image</span>
                  )}
                </div>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="bg-white"
                  disabled={uploadingImage}
                />
              </div>
            </div>
            <div>
              <Label>Nom du produit</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-white"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description détaillée du produit..."
                className="bg-white"
                rows={3}
              />
            </div>
            <div>
              <Label>Catégorie</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg">
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category.name}>
                      {category.emoji} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prix (F CFA)</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
                className="bg-white"
              />
            </div>
            <div>
              <Label>Stock</Label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                required
                className="bg-white"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="bg-gradient-warm flex-1">
                Créer
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="bg-white">
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function EditOrderModal({ order, onClose, onSave }: { order: any; onClose: () => void; onSave: (data: any) => void }) {
  const [formData, setFormData] = useState(order)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card className="w-full max-w-md bg-white border shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="bg-white border-b">
          <CardTitle>Modifier la commande #{order.orderNumber}</CardTitle>
        </CardHeader>
        <CardContent className="bg-white p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Client</Label>
              <Input
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                className="bg-white"
              />
            </div>
            <div>
              <Label>Statut</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="confirmed">Confirmée</SelectItem>
                  <SelectItem value="shipped">Expédiée</SelectItem>
                  <SelectItem value="delivered">Livrée</SelectItem>
                  <SelectItem value="cancelled">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Total (F CFA)</Label>
              <Input
                type="number"
                value={formData.total}
                onChange={(e) => setFormData({ ...formData, total: Number(e.target.value) })}
                className="bg-white"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="bg-gradient-warm flex-1">
                Sauvegarder
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="bg-white">
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function EditProductModal({
  product,
  onClose,
  onSave,
  categories,
}: { product: any; onClose: () => void; onSave: (data: any) => void; categories: any[] }) {
  const [formData, setFormData] = useState({
    ...product,
    description: product.description || "",
    imageUrl: product.imageUrl || product.image || ""
  })
  const [imagePreview, setImagePreview] = useState<string | null>(product.imageUrl || product.image || null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploadingImage(true)
    try {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        setImagePreview(dataUrl)
        setFormData((prev: any) => ({ ...prev, imageUrl: dataUrl }))
        setUploadingImage(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Erreur lors du chargement de l\'image:', error)
      setUploadingImage(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card className="w-full max-w-md bg-white border shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="bg-white border-b">
          <CardTitle>Modifier le produit</CardTitle>
        </CardHeader>
        <CardContent className="bg-white p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Image du produit</Label>
              <div className="mt-2 flex items-center gap-3">
                <div className="w-20 h-20 rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center">
                  {uploadingImage ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                    </div>
                  ) : imagePreview ? (
                    <img src={imagePreview} alt="Prévisualisation" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-500">Aucune image</span>
                  )}
                </div>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="bg-white"
                  disabled={uploadingImage}
                />
              </div>
            </div>
            <div>
              <Label>Nom du produit</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description détaillée du produit..."
                className="bg-white"
                rows={3}
              />
            </div>
            <div>
              <Label>Catégorie</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg">
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category.name}>
                      {category.emoji} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prix (F CFA)</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="bg-white"
              />
            </div>
            <div>
              <Label>Stock</Label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="bg-white"
              />
            </div>
            <div>
              <Label>Statut</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="bg-gradient-warm flex-1">
                Sauvegarder
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="bg-white">
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function CategoryModal({ category, onClose, onSave }: { category: any; onClose: () => void; onSave: (data: any) => void }) {
  const [name, setName] = useState(category?.name || "")
  const [slug, setSlug] = useState(category?.slug || "")
  const [description, setDescription] = useState(category?.description || "")
  const [emoji, setEmoji] = useState(category?.emoji || "📦")
  const [isActive, setIsActive] = useState(category?.isActive ?? true)
  const [sortOrder, setSortOrder] = useState(category?.sortOrder || 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card className="w-full max-w-lg bg-white border shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle>{category ? "Modifier la catégorie" : "Nouvelle catégorie"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Nom</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-white" />
            </div>
            <div>
              <Label>Slug (URL)</Label>
              <Input 
                value={slug} 
                onChange={(e) => setSlug(e.target.value)} 
                placeholder="ex: paniers, fruits, legumes"
                className="bg-white" 
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Emoji</Label>
                <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} className="bg-white" />
              </div>
              <div>
                <Label>Ordre d'affichage</Label>
                <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="bg-white" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input id="active" type="checkbox" checked={isActive} onChange={(e)=> setIsActive(e.target.checked)} />
              <Label htmlFor="active">Active</Label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={()=> onSave({ name, slug, description, emoji, isActive, sortOrder })} className="bg-gradient-warm flex-1">Enregistrer</Button>
              <Button variant="outline" onClick={onClose} className="bg-white flex-1">Annuler</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PromotionModal({ promotion, onClose, onSave }: { promotion: any; onClose: () => void; onSave: (data: any) => void }) {
  const [title, setTitle] = useState(promotion?.title || "")
  const [subtitle, setSubtitle] = useState(promotion?.subtitle || "")
  const [description, setDescription] = useState(promotion?.description || "")
  const [emoji, setEmoji] = useState(promotion?.emoji || "🎉")
  const [color, setColor] = useState(promotion?.color || "from-orange-400 to-red-500")
  const [discount, setDiscount] = useState(promotion?.discount || "")
  const [isActive, setIsActive] = useState(promotion?.isActive ?? true)
  const [sortOrder, setSortOrder] = useState(promotion?.sortOrder || 0)
  const [targetAudience, setTargetAudience] = useState(promotion?.targetAudience || "all")

  const colorOptions = [
    { value: "from-orange-400 to-red-500", label: "Orange-Rouge" },
    { value: "from-emerald-500 to-green-100", label: "Vert" },
    { value: "from-blue-400 to-purple-500", label: "Bleu-Violet" },
    { value: "from-blue-500 to-blue-100", label: "Bleu" },
    { value: "from-purple-500 to-purple-100", label: "Violet" },
    { value: "from-pink-400 to-rose-500", label: "Rose" },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card className="w-full max-w-lg bg-white border shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle>{promotion ? "Modifier la promotion" : "Nouvelle promotion"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Titre</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-white" />
            </div>
            <div>
              <Label>Sous-titre</Label>
              <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="bg-white" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Emoji</Label>
                <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} className="bg-white" />
              </div>
              <div>
                <Label>Ordre d'affichage</Label>
                <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="bg-white" />
              </div>
            </div>
            <div>
              <Label>Couleur</Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Réduction (optionnel)</Label>
              <Input value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="ex: -20%, GRATUIT, NOUVEAU" className="bg-white" />
            </div>
            <div>
              <Label>Public cible</Label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  <SelectItem value="all">Tous les utilisateurs</SelectItem>
                  <SelectItem value="new">Nouveaux utilisateurs</SelectItem>
                  <SelectItem value="vip">Utilisateurs VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input id="active" type="checkbox" checked={isActive} onChange={(e)=> setIsActive(e.target.checked)} />
              <Label htmlFor="active">Active</Label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={()=> onSave({ title, subtitle, description, emoji, color, discount, isActive, sortOrder, targetAudience })} className="bg-gradient-warm flex-1">Enregistrer</Button>
              <Button variant="outline" onClick={onClose} className="bg-white flex-1">Annuler</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PaymentMethodModal({ method, onClose, onSave }: { method: any; onClose: () => void; onSave: (data: any, file?: File) => void }) {
  const [name, setName] = useState(method?.name || "")
  const [code, setCode] = useState(method?.code || "")
  const [number, setNumber] = useState(method?.number || "")
  const [isActive, setIsActive] = useState(method?.isActive ?? true)
  const [file, setFile] = useState<File | undefined>(undefined)
  const [previewUrl, setPreviewUrl] = useState<string>(method?.qrImage || "")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card className="w-full max-w-lg bg-white border shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle>{method ? "Modifier la méthode de paiement" : "Nouvelle méthode de paiement"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Nom</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-white" />
            </div>
            <div>
              <Label>Code</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="ex: orange, mtn, wave" className="bg-white" />
            </div>
            <div>
              <Label>Numéro</Label>
              <Input value={number} onChange={(e) => setNumber(e.target.value)} className="bg-white" />
            </div>
            <div>
              <Label>Image QR</Label>
              <Input type="file" accept="image/*" onChange={handleFileChange} className="bg-white" />
              {previewUrl && (
                <div className="mt-2">
                  <img src={previewUrl} alt="QR Preview" className="w-32 h-32 object-contain border rounded" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input id="active" type="checkbox" checked={isActive} onChange={(e)=> setIsActive(e.target.checked)} />
              <Label htmlFor="active">Actif</Label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={()=> onSave({ name, code, number, isActive }, file)} className="bg-gradient-warm flex-1">Enregistrer</Button>
              <Button variant="outline" onClick={onClose} className="bg-white flex-1">Annuler</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DeliverySlotModal({ slot, onClose, onSave }: { slot: any; onClose: () => void; onSave: (data: any) => void }) {
  const [name, setName] = useState(slot?.name || "")
  const [startTime, setStartTime] = useState(slot?.startTime || "09:00")
  const [endTime, setEndTime] = useState(slot?.endTime || "11:00")
  const [isActive, setIsActive] = useState(slot?.isActive ?? true)
  const [sortOrder, setSortOrder] = useState(slot?.sortOrder || 0)
  const [maxOrders, setMaxOrders] = useState(slot?.maxOrders || 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card className="w-full max-w-lg bg-white border shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle>{slot ? "Modifier la plage horaire" : "Nouvelle plage horaire"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Nom</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-white" placeholder="ex: Matin, Après-midi" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Heure de début</Label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-white" />
              </div>
              <div>
                <Label>Heure de fin</Label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="bg-white" />
              </div>
            </div>
            <div>
              <Label>Limite de commandes (0 = illimité)</Label>
              <Input type="number" value={maxOrders} onChange={(e) => setMaxOrders(Number(e.target.value))} className="bg-white" min="0" />
            </div>
            <div>
              <Label>Ordre d'affichage</Label>
              <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="bg-white" />
            </div>
            <div className="flex items-center gap-2">
              <input id="active" type="checkbox" checked={isActive} onChange={(e)=> setIsActive(e.target.checked)} />
              <Label htmlFor="active">Active</Label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={()=> onSave({ name, startTime, endTime, isActive, sortOrder, maxOrders })} className="bg-gradient-warm flex-1">Enregistrer</Button>
              <Button variant="outline" onClick={onClose} className="bg-white flex-1">Annuler</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CommuneModal({ commune, onClose, onSave }: { commune: any; onClose: () => void; onSave: (data: any) => void }) {
  const [name, setName] = useState(commune?.name || "")
  const [code, setCode] = useState(commune?.code || "")
  const [deliveryFee, setDeliveryFee] = useState(commune?.deliveryFee || 2500)
  const [description, setDescription] = useState(commune?.description || "")
  const [isActive, setIsActive] = useState(commune?.isActive ?? true)
  const [sortOrder, setSortOrder] = useState(commune?.sortOrder || 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card className="w-full max-w-lg bg-white border shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle>{commune ? "Modifier la commune" : "Nouvelle commune"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Nom de la commune</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-white" placeholder="ex: Cocody, Marcory" />
            </div>
            <div>
              <Label>Code</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} className="bg-white" placeholder="ex: COCO, MARC" />
            </div>
            <div>
              <Label>Frais de livraison (F CFA)</Label>
              <Input type="number" value={deliveryFee} onChange={(e) => setDeliveryFee(Number(e.target.value))} className="bg-white" min="0" />
            </div>
            <div>
              <Label>Description (optionnel)</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-white" placeholder="Description de la commune..." />
            </div>
            <div>
              <Label>Ordre d'affichage</Label>
              <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="bg-white" />
            </div>
            <div className="flex items-center gap-2">
              <input id="active" type="checkbox" checked={isActive} onChange={(e)=> setIsActive(e.target.checked)} />
              <Label htmlFor="active">Active</Label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={()=> onSave({ name, code, deliveryFee, description, isActive, sortOrder })} className="bg-gradient-warm flex-1">Enregistrer</Button>
              <Button variant="outline" onClick={onClose} className="bg-white flex-1">Annuler</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function UsersSection({ orders }: { orders: any[] }) {
  const [items, setItems] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const limit = 20

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetchAdminUsers({ search: search || undefined, page, limit })
        setItems(res.items || [])
        setCount(res.count || 0)
      } catch {}
    })()
  }, [page, search])

  const totalPages = Math.max(1, Math.ceil(count / limit))

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="Rechercher..." value={search} onChange={(e)=> setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>
      {items.map((u) => (
        <CustomerRow key={u._id} customer={u} orders={orders} />
      ))}
      <div className="flex justify-between items-center pt-2">
        <span className="text-sm text-gray-600">{count} client(s)</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page<=1} onClick={()=> setPage((p)=> Math.max(1, p-1))}>Précédent</Button>
          <span className="text-sm text-gray-700">{page}/{totalPages}</span>
          <Button variant="outline" size="sm" disabled={page>=totalPages} onClick={()=> setPage((p)=> p+1)}>Suivant</Button>
        </div>
      </div>
    </div>
  )
}
