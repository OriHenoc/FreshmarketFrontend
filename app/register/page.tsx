"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select2 } from "@/components/ui/select2"
import { useAuth } from "@/context/auth-context"
import { register as apiRegister, setAuthToken, fetchCommunes } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    commune: "",
  })
  const [communes, setCommunes] = useState<any[]>([])

  // Charger les communes
  useEffect(() => {
    ;(async () => {
      try {
        const comms = await fetchCommunes()
        setCommunes(comms)
      } catch (error) {
        console.error('Erreur lors du chargement des communes:', error)
      }
    })()
  }, [])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { token, user } = await apiRegister({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        commune: formData.commune || undefined,
      })
      setAuthToken(token)
      login({ id: user._id || user.id, name: user.name, email: user.email, phone: user.phone, address: user.address, isAdmin: user.isAdmin })
      toast({ title: "Compte créé !", description: `Bienvenue ${formData.name} !` })
      router.push("/")
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.response?.data?.message || "Impossible de créer le compte", variant: "destructive" })
    }

    setIsLoading(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Créer un compte</h1>
        </div>
      </div>

      <div className="px-4 py-8">
        {/* Welcome */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Rejoignez-nous !</h2>
          <p className="text-gray-600">Créez votre compte pour commencer vos achats</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4" />
                Nom complet
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Votre nom complet"
                className="mt-1 rounded-xl border-gray-200"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="votre@email.com"
                className="mt-1 rounded-xl border-gray-200"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Téléphone
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+225 XX XX XX XX XX"
                className="mt-1 rounded-xl border-gray-200"
                required
              />
            </div>

            <div>
              <Label htmlFor="commune" className="text-sm font-medium text-gray-700">
                Commune de résidence
              </Label>
              <Select2
                options={communes.map((commune) => ({
                  value: commune._id,
                  label: commune.name,
                  description: `${commune.deliveryFee.toLocaleString()} F CFA (à la réception)`
                }))}
                value={formData.commune}
                onChange={(value) => handleInputChange("commune", value)}
                placeholder="Sélectionner votre commune"
                searchPlaceholder="Rechercher une commune..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Mot de passe
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Au moins 6 caractères"
                  className="rounded-xl border-gray-200 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Confirmer le mot de passe
              </Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="Répétez votre mot de passe"
                  className="rounded-xl border-gray-200 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-4 text-lg font-semibold mt-6"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Création du compte...
                </div>
              ) : (
                "Créer mon compte"
              )}
            </Button>
          </form>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Déjà un compte ?</p>
          <Link href="/login">
            <Button variant="outline" className="w-full rounded-2xl py-4 bg-transparent">
              Se connecter
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
