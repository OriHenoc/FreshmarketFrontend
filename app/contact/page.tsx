"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Headphones } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function ContactPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    type: "general",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulation d'envoi
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast({
      title: "Message envoyé !",
      description: "Nous vous répondrons dans les plus brefs délais (24-48h).",
    })

    // Reset du formulaire
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      type: "general",
    })

    setIsLoading(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-warm-50 via-primary-50 to-secondary-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-gradient-food rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display font-bold text-4xl lg:text-5xl mb-4 text-gradient-food">Contactez-nous</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Une question ? Un problème ? Notre équipe est là pour vous aider et vous accompagner
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Informations de contact */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-effect food-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary-600" />
                  Nos coordonnées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Téléphone</h3>
                    <p className="text-gray-600">+225 27 XX XX XX XX</p>
                    <p className="text-gray-600">+225 05 XX XX XX XX</p>
                    <p className="text-sm text-primary-600 mt-1">Appels et WhatsApp</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-secondary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Email</h3>
                    <p className="text-gray-600">contact@freshmarket.ci</p>
                    <p className="text-gray-600">support@freshmarket.ci</p>
                    <p className="text-sm text-secondary-600 mt-1">Réponse sous 24h</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-accent-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Adresse</h3>
                    <p className="text-gray-600">Cocody, Riviera Palmeraie</p>
                    <p className="text-gray-600">Abidjan, Côte d'Ivoire</p>
                    <p className="text-sm text-accent-600 mt-1">Siège social</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-warm-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-warm-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Horaires</h3>
                    <p className="text-gray-600">Lun - Ven: 8h - 18h</p>
                    <p className="text-gray-600">Sam: 8h - 16h</p>
                    <p className="text-gray-600">Dim: 10h - 14h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ rapide */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-primary-600" />
                  Questions fréquentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Délai de livraison ?</h4>
                  <p className="text-sm text-gray-600">24-48h en zone Abidjan, 2-3 jours en province.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Modes de paiement ?</h4>
                  <p className="text-sm text-gray-600">Mobile Money, carte bancaire, paiement à la livraison.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Retour/échange ?</h4>
                  <p className="text-sm text-gray-600">Possible sous 24h pour les produits non périssables.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Frais de livraison ?</h4>
                  <p className="text-sm text-gray-600">Gratuite dès 50 000 F CFA, sinon 2 500 F CFA.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulaire de contact */}
          <div className="lg:col-span-2">
            <Card className="glass-effect food-shadow">
              <CardHeader>
                <CardTitle className="text-2xl">Envoyez-nous un message</CardTitle>
                <p className="text-gray-600">Remplissez le formulaire ci-dessous et nous vous répondrons rapidement</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 font-medium">
                        Nom complet *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Votre nom complet"
                        className="h-12"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 font-medium">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="votre@email.com"
                        className="h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700 font-medium">
                        Téléphone
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="+225 XX XX XX XX XX"
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-gray-700 font-medium">
                        Type de demande *
                      </Label>
                      <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Choisir le type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">Question générale</SelectItem>
                          <SelectItem value="order">Problème de commande</SelectItem>
                          <SelectItem value="delivery">Livraison</SelectItem>
                          <SelectItem value="payment">Paiement</SelectItem>
                          <SelectItem value="product">Produit défectueux</SelectItem>
                          <SelectItem value="partnership">Partenariat</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-gray-700 font-medium">
                      Sujet *
                    </Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleChange("subject", e.target.value)}
                      placeholder="Résumé de votre demande"
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-700 font-medium">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      placeholder="Décrivez votre demande en détail..."
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <div className="bg-primary-50 p-4 rounded-lg">
                    <p className="text-sm text-primary-700">
                      <strong>💡 Conseil :</strong> Pour un problème de commande, n'oubliez pas de mentionner votre
                      numéro de commande (ex: CMD123456) pour un traitement plus rapide.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-warm hover:opacity-90 text-white font-medium text-lg group"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Envoi en cours...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        Envoyer le message
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section d'aide supplémentaire */}
        <div className="mt-16">
          <h2 className="font-display font-bold text-3xl text-center mb-8 text-gradient-food">
            Autres moyens de nous contacter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Chat en direct</h3>
                <p className="text-gray-600 mb-4">Discutez avec notre équipe en temps réel</p>
                <Button variant="outline" className="bg-transparent">
                  Ouvrir le chat
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">WhatsApp</h3>
                <p className="text-gray-600 mb-4">Contactez-nous via WhatsApp</p>
                <Button variant="outline" className="bg-transparent">
                  Ouvrir WhatsApp
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Support téléphonique</h3>
                <p className="text-gray-600 mb-4">Appelez-nous directement</p>
                <Button variant="outline" className="bg-transparent">
                  +225 27 XX XX XX XX
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Carte/localisation */}
        <div className="mt-16">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-center">Notre localisation</CardTitle>
              <p className="text-center text-gray-600">Venez nous rendre visite à notre siège social</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-64 bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">FreshMarket CI</h3>
                  <p className="text-gray-600">Cocody, Riviera Palmeraie</p>
                  <p className="text-gray-600">Abidjan, Côte d'Ivoire</p>
                  <Button className="mt-4 bg-gradient-warm" size="sm">
                    Voir sur Google Maps
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
