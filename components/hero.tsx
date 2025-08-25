"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Truck, Shield, Clock } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-warm-50 via-primary-50 to-secondary-50 py-20">
      {/* Éléments décoratifs animés */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-primary-200 rounded-full opacity-20 animate-float"></div>
      <div
        className="absolute top-32 right-20 w-16 h-16 bg-secondary-200 rounded-full opacity-20 animate-float"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute bottom-20 left-1/4 w-12 h-12 bg-accent-200 rounded-full opacity-20 animate-float"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h1 className="font-display font-bold text-5xl lg:text-6xl leading-tight mb-6">
              <span className="bg-gradient-food bg-clip-text text-transparent">Vos courses</span>
              <br />
              <span className="text-gray-800">livrées chez vous</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Découvrez nos packs alimentaires soigneusement sélectionnés et nos combos savoureux. Livraison rapide
              partout en Côte d'Ivoire avec paiement Mobile Money.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/products">
                <Button size="lg" className="bg-gradient-warm hover:opacity-90 text-lg px-8 py-4 group">
                  Commander maintenant
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4 border-primary-300 hover:bg-primary-50 bg-transparent"
                >
                  En savoir plus
                </Button>
              </Link>
            </div>

            {/* Avantages */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3 group">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <Truck className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Livraison rapide</h3>
                  <p className="text-sm text-gray-600">24-48h</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 group">
                <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center group-hover:bg-secondary-200 transition-colors">
                  <Shield className="h-6 w-6 text-secondary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Paiement sécurisé</h3>
                  <p className="text-sm text-gray-600">Mobile Money</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 group">
                <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center group-hover:bg-accent-200 transition-colors">
                  <Clock className="h-6 w-6 text-accent-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Service 24/7</h3>
                  <p className="text-sm text-gray-600">Support client</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image Hero */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="relative w-full h-96 lg:h-[500px] rounded-3xl overflow-hidden food-shadow">
              <img
                src="/placeholder.svg?height=500&width=600"
                alt="Panier de courses frais"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Badge flottant */}
            <div className="absolute -top-4 -right-4 bg-accent-500 text-white px-6 py-3 rounded-full font-bold text-lg animate-bounce-gentle">
              -20% 🎉
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
