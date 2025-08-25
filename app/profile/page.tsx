"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  User,
  Edit3,
  Save,
  X,
  Settings,
  ShoppingBag,
  Heart,
  MapPin,
  Phone,
  Mail,
  LogOut,
  Building,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select2 } from "@/components/ui/select2"
import { useAuth } from "@/context/auth-context"
import { updateProfile as apiUpdateProfile, getMyOrders, getFavorites, fetchCommunes } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import MobileBottomNav from "@/components/mobile-bottom-nav"

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    commune: user?.commune || "",
  })
  
  // États pour les communes et statistiques
  const [communes, setCommunes] = useState([])
  const [stats, setStats] = useState({
    ordersCount: 0,
    favoritesCount: 0
  })
  
  // Charger les communes et statistiques
  useEffect(() => {
    const loadData = async () => {
      try {
        const [orders, favorites, communesData] = await Promise.all([
          getMyOrders(),
          getFavorites(),
          fetchCommunes()
        ])
        setStats({
          ordersCount: orders.length || 0,
          favoritesCount: favorites.length || 0
        })
        setCommunes(communesData)
      } catch (error) {
        console.error("Erreur chargement données:", error)
      }
    }
    
    if (user) {
      loadData()
    }
  }, [user])

  // Rediriger vers login si pas connecté
  if (!user) {
    router.push("/login")
    return null
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updated = await apiUpdateProfile({ 
        name: formData.name, 
        phone: formData.phone, 
        address: formData.address,
        commune: formData.commune
      })
      updateUser({ 
        name: updated.name, 
        phone: updated.phone, 
        address: updated.address,
        commune: updated.commune
      })
      setIsEditing(false)
      toast({ title: "Profil mis à jour !", description: "Vos informations ont été sauvegardées avec succès" })
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.response?.data?.message || "Mise à jour impossible", variant: "destructive" })
    }
    setIsSaving(false)
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      commune: user?.commune || "",
    })
    setIsEditing(false)
  }

  const handleLogout = () => {
    if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      logout()
      router.push("/")
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      })
    }
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
            <h1 className="text-xl font-bold text-gray-900">Mon Profil</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} className="p-2">
            {isEditing ? <X className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">En ligne</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/orders">
              <div className="text-center p-3 bg-orange-50 rounded-xl">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ShoppingBag className="h-4 w-4 text-white" />
                </div>
                <p className="text-lg font-bold text-gray-900">{stats.ordersCount}</p>
                <p className="text-xs text-gray-600">Commandes</p>
              </div>
            </Link>
            <Link href="/favorites">
              <div className="text-center p-3 bg-red-50 rounded-xl">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Heart className="h-4 w-4 text-white" />
                </div>
                <p className="text-lg font-bold text-gray-900">{stats.favoritesCount}</p>
                <p className="text-xs text-gray-600">Favoris</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Informations</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-xl bg-transparent"
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Modifier
                </>
              )}
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4" />
                Nom complet
              </Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 rounded-xl border-gray-200"
                />
              ) : (
                <p className="mt-1 p-3 bg-gray-50 rounded-xl text-gray-900">{user.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 rounded-xl border-gray-200"
                />
              ) : (
                <p className="mt-1 p-3 bg-gray-50 rounded-xl text-gray-900">{user.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Téléphone
              </Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+225 XX XX XX XX XX"
                  className="mt-1 rounded-xl border-gray-200"
                />
              ) : (
                <p className="mt-1 p-3 bg-gray-50 rounded-xl text-gray-900">{user.phone || "Non renseigné"}</p>
              )}
            </div>

            <div>
              <Label htmlFor="commune" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Commune
              </Label>
              {isEditing ? (
                <Select2
                  options={communes.map((commune: any) => ({
                    value: commune._id,
                    label: commune.name,
                    description: `${commune.deliveryFee.toLocaleString()} F CFA (à la réception)`
                  }))}
                  value={formData.commune}
                  onChange={(value) => setFormData({ ...formData, commune: value })}
                  placeholder="Sélectionner votre commune"
                  searchPlaceholder="Rechercher une commune..."
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 p-3 bg-gray-50 rounded-xl text-gray-900">
                  {user.commune ? communes.find((c: any) => c._id === user.commune)?.name || "Commune non trouvée" : "Non renseignée"}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
              <Label htmlFor="address" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Adresse complète
              </Label>
              {isEditing ? (
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Votre adresse complète"
                  className="mt-1 rounded-xl border-gray-200"
                />
              ) : (
                <p className="mt-1 p-3 bg-gray-50 rounded-xl text-gray-900">{user.address || "Non renseignée"}</p>
              )}
            </div>

          {isEditing && (
            <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex-1"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sauvegarde...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Mettre à jour
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start p-4 h-auto rounded-xl hover:bg-red-50 text-red-600"
          >
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <LogOut className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-left">
              <p className="font-medium">Se déconnecter</p>
              <p className="text-sm text-red-500">Quitter votre session</p>
            </div>
          </Button>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  )
}
