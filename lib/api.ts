import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
})

// Intercepteur pour ajouter automatiquement le token à chaque requête
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Précharger le token si présent au chargement (navigation/refresh)
try {
  if (typeof window !== "undefined") {
    const t = localStorage.getItem("token")
    if (t) {
      api.defaults.headers.common["Authorization"] = `Bearer ${t}`
    }
  }
} catch {}

export function setAuthToken(token?: string) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`
    try {
      localStorage.setItem("token", token)
    } catch {}
  } else {
    delete api.defaults.headers.common["Authorization"]
    try {
      localStorage.removeItem("token")
    } catch {}
  }
}

// Auth
export const register = async (payload: { name: string; email: string; password: string; phone?: string; address?: string; commune?: string }) => {
  const { data } = await api.post("/api/auth/register", payload)
  return data
}

export const login = async (payload: { email: string; password: string }) => {
  const { data } = await api.post("/api/auth/login", payload)
  return data
}

export const me = async () => {
  const { data } = await api.get("/api/auth/me")
  return data
}

export const updateProfile = async (payload: { name?: string; phone?: string; address?: string; commune?: string }) => {
  const { data } = await api.put("/api/auth/profile", payload)
  return data
}

// Produits
export const fetchProducts = async (params?: { search?: string; category?: string; sort?: string; page?: number; limit?: number }) => {
  const { data } = await api.get("/api/products", { params })
  return data
}

export const fetchProductsForAdmin = async (params?: { search?: string; category?: string; sort?: string; page?: number; limit?: number }) => {
  const { data } = await api.get("/api/products", { params: { ...params, includeInactive: true } })
  return data
}

export const fetchProductById = async (id: string) => {
  const { data } = await api.get(`/api/products/${id}`)
  return data
}

export const createProduct = async (payload: any) => {
  const { data } = await api.post("/api/products", payload)
  return data
}

export const updateProduct = async (id: string, payload: any) => {
  const { data } = await api.put(`/api/products/${id}`, payload)
  return data
}

export const deleteProduct = async (id: string) => {
  const { data } = await api.delete(`/api/products/${id}`)
  return data
}

// Upload
export const uploadImage = async (file: File) => {
  const form = new FormData()
  form.append("file", file)
  const { data } = await api.post("/api/upload", form, { headers: { "Content-Type": "multipart/form-data" } })
  return data as { url: string; filename: string }
}

// Favoris
export const getFavorites = async () => {
  const { data } = await api.get("/api/users/me/favorites")
  return data
}

export const addFavorite = async (productId: string) => {
  const { data } = await api.post(`/api/users/me/favorites/${productId}`)
  return data
}

export const removeFavorite = async (productId: string) => {
  const { data } = await api.delete(`/api/users/me/favorites/${productId}`)
  return data
}

// Commandes
export const createOrder = async (payload: any) => {
  const { data } = await api.post(`/api/orders`, payload)
  return data
}

export const getMyOrders = async () => {
  const { data } = await api.get(`/api/orders/me`)
  return data
}

export const fetchAdminOrders = async (params?: { status?: string; page?: number; limit?: number }) => {
  const { data } = await api.get(`/api/orders`, { params })
  return data
}

// Admin data
export const fetchAdminUsers = async (params?: { search?: string; page?: number; limit?: number }) => {
  const { data } = await api.get(`/api/admin/users`, { params })
  return data
}

export const fetchAdminStats = async () => {
  const { data } = await api.get(`/api/admin/stats`)
  return data
}

// Payment methods
export const fetchPaymentMethods = async () => {
  const { data } = await api.get(`/api/payment-methods`)
  return data
}

export const createPaymentMethod = async (payload: any) => {
  const { data } = await api.post(`/api/payment-methods`, payload)
  return data
}

export const updatePaymentMethod = async (id: string, payload: any) => {
  const { data } = await api.put(`/api/payment-methods/${id}`, payload)
  return data
}

export const deletePaymentMethod = async (id: string) => {
  const { data } = await api.delete(`/api/payment-methods/${id}`)
  return data
}

// Admin orders
export const updateOrderStatus = async (id: string, status: string) => {
  if (!id || id === 'undefined' || id === 'null') {
    throw new Error('ID de commande invalide')
  }
  const { data } = await api.put(`/api/orders/${id}/status`, { status })
  return data
}

export const recalculateProductSales = async () => {
  const { data } = await api.post("/api/orders/recalculate-sales")
  return data
}

// Categories
export const fetchCategories = async () => {
  const { data } = await api.get("/api/categories")
  return data
}

export const fetchAllCategories = async () => {
  const { data } = await api.get("/api/categories/admin/all")
  return data
}

export const createCategory = async (payload: any) => {
  const { data } = await api.post("/api/categories", payload)
  return data
}

export const updateCategory = async (id: string, payload: any) => {
  const { data } = await api.put(`/api/categories/${id}`, payload)
  return data
}

export const deleteCategory = async (id: string) => {
  const { data } = await api.delete(`/api/categories/${id}`)
  return data
}

// Promotions
export const fetchPromotions = async () => {
  const { data } = await api.get("/api/promotions")
  return data
}

export const fetchAllPromotions = async () => {
  const { data } = await api.get("/api/promotions/admin/all")
  return data
}

export const createPromotion = async (payload: any) => {
  const { data } = await api.post("/api/promotions", payload)
  return data
}

export const updatePromotion = async (id: string, payload: any) => {
  const { data } = await api.put(`/api/promotions/${id}`, payload)
  return data
}

export const deletePromotion = async (id: string) => {
  const { data } = await api.delete(`/api/promotions/${id}`)
  return data
}

// Delivery slots
export const fetchDeliverySlots = async () => {
  const { data } = await api.get("/api/delivery-slots")
  return data
}

export const fetchAllDeliverySlots = async () => {
  const { data } = await api.get("/api/delivery-slots/admin/all")
  return data
}

export const createDeliverySlot = async (payload: any) => {
  const { data } = await api.post("/api/delivery-slots", payload)
  return data
}

export const updateDeliverySlot = async (id: string, payload: any) => {
  const { data } = await api.put(`/api/delivery-slots/${id}`, payload)
  return data
}

export const deleteDeliverySlot = async (id: string) => {
  const { data } = await api.delete(`/api/delivery-slots/${id}`)
  return data
}

export const incrementDeliverySlotOrders = async (slotId: string) => {
  const { data } = await api.post(`/api/delivery-slots/${slotId}/increment`)
  return data
}

// Communes
export const fetchCommunes = async () => {
  const { data } = await api.get("/api/communes")
  return data
}

export const fetchAllCommunes = async () => {
  const { data } = await api.get("/api/communes/admin/all")
  return data
}

export const createCommune = async (payload: any) => {
  const { data } = await api.post("/api/communes", payload)
  return data
}

export const updateCommune = async (id: string, payload: any) => {
  const { data } = await api.put(`/api/communes/${id}`, payload)
  return data
}

export const deleteCommune = async (id: string) => {
  const { data } = await api.delete(`/api/communes/${id}`)
  return data
}

export const getCommuneDeliveryFee = async (communeId: string) => {
  const { data } = await api.get(`/api/communes/${communeId}/delivery-fee`)
  return data
}

// Paramètres globaux
export const fetchGlobalSettings = async () => {
  const { data } = await api.get("/api/global-settings")
  return data
}

export const fetchGlobalSettingsByCategory = async (category: string) => {
  const { data } = await api.get(`/api/global-settings/category/${category}`)
  return data
}

export const getGlobalSetting = async (key: string) => {
  const { data } = await api.get(`/api/global-settings/${key}`)
  return data
}

export const updateGlobalSetting = async (key: string, payload: any) => {
  const { data } = await api.put(`/api/global-settings/${key}`, { key, ...payload })
  return data
}

export const createGlobalSetting = async (payload: any) => {
  const { data } = await api.post("/api/global-settings", payload)
  return data
}

export const deleteGlobalSetting = async (key: string) => {
  const { data } = await api.delete(`/api/global-settings/${key}`)
  return data
}