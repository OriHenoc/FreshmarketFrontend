"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, User, Heart, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import CartIcon from "@/components/cart-icon"
import { useAuth } from "@/context/auth-context"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.email === "admin@foodapp.com"

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-primary-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-food rounded-full flex items-center justify-center group-hover:animate-bounce-gentle">
              <span className="text-white font-bold text-lg">🥕</span>
            </div>
            <span className="font-display font-bold text-xl bg-gradient-food bg-clip-text text-transparent">
              FreshMarket CI
            </span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-500 transition-colors font-medium">
              Accueil
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-primary-500 transition-colors font-medium">
              Produits
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-primary-500 transition-colors font-medium">
              À propos
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-primary-500 transition-colors font-medium">
              Contact
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                {/* Favoris */}
                <Link href="/favorites">
                  <Button variant="ghost" size="icon" className="hover:bg-primary-100 relative">
                    <Heart className="h-5 w-5" />
                    <span className="sr-only">Favoris</span>
                  </Button>
                </Link>

                {/* Menu utilisateur */}
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary-600" />
                  <span className="text-sm font-medium hidden sm:block">{user.name}</span>
                </div>

                {/* Menu déroulant utilisateur */}
                <div className="relative group">
                  <Button variant="ghost" size="icon" className="hover:bg-primary-100">
                    <Settings className="h-4 w-4" />
                  </Button>

                  {/* Dropdown menu */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50">
                        Mes commandes
                      </Link>
                      <Link href="/favorites" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50">
                        Mes favoris
                      </Link>
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50">
                        Mon profil
                      </Link>
                      {isAdmin && (
                        <>
                          <div className="border-t my-1"></div>
                          <Link
                            href="/admin"
                            className="block px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 font-medium"
                          >
                            🛠️ Administration
                          </Link>
                        </>
                      )}
                      <div className="border-t my-1"></div>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Déconnexion
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" className="hover:bg-primary-100">
                    Connexion
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-warm hover:opacity-90">Inscription</Button>
                </Link>
              </div>
            )}

            <CartIcon />

            {/* Menu Mobile */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="md:hidden py-4 animate-slide-up border-t">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-primary-500 transition-colors">
                Accueil
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-primary-500 transition-colors">
                Produits
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-primary-500 transition-colors">
                À propos
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-primary-500 transition-colors">
                Contact
              </Link>

              {user ? (
                <div className="pt-4 border-t space-y-2">
                  <Link href="/orders" className="block text-gray-700 hover:text-primary-500 transition-colors">
                    Mes commandes
                  </Link>
                  <Link href="/favorites" className="block text-gray-700 hover:text-primary-500 transition-colors">
                    Mes favoris
                  </Link>
                  <Link href="/profile" className="block text-gray-700 hover:text-primary-500 transition-colors">
                    Mon profil
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="block text-primary-600 hover:text-primary-700 font-medium">
                      🛠️ Administration
                    </Link>
                  )}
                  <button onClick={logout} className="block w-full text-left text-red-600 hover:text-red-700">
                    Déconnexion
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <Link href="/login">
                    <Button variant="ghost" className="w-full justify-start">
                      Connexion
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full bg-gradient-warm">Inscription</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
