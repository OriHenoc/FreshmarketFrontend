"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { login as apiLogin, register as apiRegister, me as apiMe, updateProfile as apiUpdateProfile } from "@/lib/api"
import { setAuthToken } from "@/lib/api"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  commune?: string
  isAdmin?: boolean
}

interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const token = localStorage.getItem("token")
        const savedUser = localStorage.getItem("user")
        
        if (token && savedUser) {
          // Si on a un token ET un utilisateur sauvegardé, on vérifie que le token est valide
          setAuthToken(token)
          try {
            const me = await apiMe()
            setUser({ id: me._id || me.id, name: me.name, email: me.email, phone: me.phone, address: me.address, commune: me.commune, isAdmin: me.isAdmin })
          } catch (error) {
            // Si le token est invalide, on nettoie tout
            console.error("Token invalide:", error)
            setAuthToken(undefined)
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            setUser(null)
          }
        } else if (savedUser && !token) {
          // Si on a un utilisateur mais pas de token, on nettoie
          localStorage.removeItem("user")
          setUser(null)
        } else if (token && !savedUser) {
          // Si on a un token mais pas d'utilisateur, on récupère les infos
          setAuthToken(token)
          const me = await apiMe()
          setUser({ id: me._id || me.id, name: me.name, email: me.email, phone: me.phone, address: me.address, commune: me.commune, isAdmin: me.isAdmin })
        }
      } catch (error) {
        console.error("Erreur auth auto:", error)
        setAuthToken(undefined)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    try {
      localStorage.setItem("user", JSON.stringify(userData))
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'utilisateur:", error)
    }
  }

  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      setAuthToken(undefined)
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error)
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      try {
        localStorage.setItem("user", JSON.stringify(updatedUser))
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'utilisateur:", error)
      }
    }
  }

  return <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
