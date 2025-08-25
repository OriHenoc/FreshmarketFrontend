"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/auth-context"
import { login as apiLogin, setAuthToken } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { token, user } = await apiLogin({ email, password })
      setAuthToken(token)
      login({ id: user._id || user.id, name: user.name, email: user.email, phone: user.phone, address: user.address, isAdmin: user.isAdmin })
      toast({
        title: "Connexion réussie !",
        description: `Bienvenue ${user.name}`,
      })
      if (user.isAdmin) {
        router.push("/admin")
      } else {
        router.push("/")
      }
    } catch (e: any) {
      toast({
        title: "Erreur de connexion",
        description: e?.response?.data?.message || "Email ou mot de passe incorrect",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  const fillTestAccount = (type: "admin" | "user") => {
    if (type === "admin") {
      setEmail("admin@foodapp.com")
      setPassword("admin123")
    } else {
      setEmail("user@foodapp.com")
      setPassword("user123")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Connexion</h1>
        </div>
      </div>

      <div className="px-4 py-8">
        {/* Welcome */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🍽️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bon retour !</h2>
          <p className="text-gray-600">Connectez-vous pour continuer vos achats</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="mt-1 rounded-xl border-gray-200"
                required
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
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

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-4 text-lg font-semibold mt-6"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion...
                </div>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
        </div>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Pas encore de compte ?</p>
          <Link href="/register">
            <Button variant="outline" className="w-full rounded-2xl py-4 bg-transparent">
              Créer un compte
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
