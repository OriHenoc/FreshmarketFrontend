"use client"

import { Users, Target, Award, Truck, Heart, Leaf } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-warm-50 via-primary-50 to-secondary-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-gradient-food rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h1 className="font-display font-bold text-4xl lg:text-5xl mb-6 text-gradient-food">À propos de nous</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            FreshMarket CI est né de la passion de rendre l'alimentation saine et de qualité accessible à tous les
            Ivoiriens, directement depuis le confort de leur domicile.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        {/* Notre histoire */}
        <section className="mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="font-display font-bold text-3xl mb-6 text-gray-800">Notre Histoire</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Fondée en 2024, FreshMarket CI est née du constat simple que l'accès à une alimentation de qualité
                  devrait être facile et accessible pour tous les Ivoiriens.
                </p>
                <p>
                  Notre équipe de passionnés s'est donnée pour mission de révolutionner la façon dont les familles
                  ivoiriennes font leurs courses, en proposant des produits frais, locaux et de qualité, livrés
                  directement à domicile.
                </p>
                <p>
                  Aujourd'hui, nous servons fièrement plus de 1000 familles à travers Abidjan et ses environs, avec
                  l'ambition de nous étendre dans toute la Côte d'Ivoire.
                </p>
              </div>
            </div>
            <div className="relative animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="relative w-full h-96 rounded-3xl overflow-hidden food-shadow">
                <img
                  src="/placeholder.svg?height=400&width=500"
                  alt="Équipe FreshMarket CI"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Nos valeurs */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl mb-4 text-gradient-food">Nos Valeurs</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Les principes qui guident chacune de nos actions et décisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow animate-fade-in">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Leaf className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-4">Qualité & Fraîcheur</h3>
                <p className="text-gray-600">
                  Nous sélectionnons rigoureusement nos produits pour garantir fraîcheur et qualité exceptionnelle.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow animate-fade-in">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-secondary-600" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-4">Proximité Client</h3>
                <p className="text-gray-600">
                  Chaque client est unique. Nous offrons un service personnalisé et une écoute attentive.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow animate-fade-in">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Truck className="h-8 w-8 text-accent-600" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-4">Livraison Rapide</h3>
                <p className="text-gray-600">
                  Nous nous engageons à livrer vos commandes dans les meilleurs délais, partout en Côte d'Ivoire.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow animate-fade-in">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-warm-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="h-8 w-8 text-warm-600" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-4">Innovation</h3>
                <p className="text-gray-600">
                  Nous innovons constamment pour améliorer votre expérience d'achat et de livraison.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow animate-fade-in">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-4">Engagement Social</h3>
                <p className="text-gray-600">
                  Nous soutenons les producteurs locaux et contribuons au développement de notre communauté.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow animate-fade-in">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-4">Excellence</h3>
                <p className="text-gray-600">
                  Nous visons l'excellence dans tout ce que nous faisons, de la sélection à la livraison.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Statistiques */}
        <section className="mb-20">
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-12">
            <div className="text-center mb-12">
              <h2 className="font-display font-bold text-3xl mb-4 text-gray-800">FreshMarket CI en chiffres</h2>
              <p className="text-gray-600">Quelques chiffres qui témoignent de notre croissance</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">1000+</div>
                <div className="text-gray-600">Clients satisfaits</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary-600 mb-2">50+</div>
                <div className="text-gray-600">Produits disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-accent-600 mb-2">24h</div>
                <div className="text-gray-600">Délai de livraison</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-warm-600 mb-2">98%</div>
                <div className="text-gray-600">Taux de satisfaction</div>
              </div>
            </div>
          </div>
        </section>

        {/* Notre équipe */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl mb-4 text-gradient-food">Notre Équipe</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des professionnels passionnés au service de votre satisfaction
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Kouadio Jean-Marc",
                role: "Fondateur & CEO",
                image: "/placeholder.svg?height=300&width=300",
                description: "Passionné d'innovation et d'entrepreneuriat social",
              },
              {
                name: "Aminata Traoré",
                role: "Directrice Qualité",
                image: "/placeholder.svg?height=300&width=300",
                description: "Experte en sélection et contrôle qualité des produits",
              },
              {
                name: "Yves Kouassi",
                role: "Responsable Logistique",
                image: "/placeholder.svg?height=300&width=300",
                description: "Spécialiste de la chaîne d'approvisionnement et livraison",
              },
            ].map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow animate-fade-in">
                <CardContent className="p-6">
                  <div className="w-24 h-24 bg-gradient-food rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="font-display font-semibold text-xl mb-2">{member.name}</h3>
                  <p className="text-primary-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to action */}
        <section className="text-center">
          <div className="bg-gradient-to-br from-warm-50 to-primary-50 rounded-3xl p-12">
            <h2 className="font-display font-bold text-3xl mb-4 text-gray-800">Rejoignez l'aventure FreshMarket CI</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Découvrez dès maintenant nos produits frais et de qualité, livrés directement chez vous
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="bg-gradient-warm text-lg px-8 py-4">
                  Découvrir nos produits
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-transparent">
                  Nous contacter
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
