"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, MapPin, Smartphone, CheckCircle, Clock, Truck, Upload, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select2 } from "@/components/ui/select2"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/context/cart-context"
import { createOrder as apiCreateOrder, uploadImage as apiUploadImage, fetchPaymentMethods, fetchDeliverySlots, incrementDeliverySlotOrders, fetchCommunes, getCommuneDeliveryFee } from "@/lib/api"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

type Step = "delivery" | "payment" | "verification" | "confirmation"
type PaymentMethod = string

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState<Step>("delivery")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [orderData, setOrderData] = useState<any>(null)

  const { cartItems, clearCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [deliveryInfo, setDeliveryInfo] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    instructions: "",
    deliverySlot: "",
    commune: "",
  })

  // Charger méthodes de paiement, plages horaires et communes depuis l'API
  const [methods, setMethods] = useState<any[]>([])
  const [deliverySlots, setDeliverySlots] = useState<any[]>([])
  const [communes, setCommunes] = useState<any[]>([])
  useEffect(() => {
    ;(async () => {
      try {
        const [m, slots, comms] = await Promise.all([
          fetchPaymentMethods(),
          fetchDeliverySlots(),
          fetchCommunes()
        ])
        const activeMethods = m.filter((x: any) => x.isActive)
        setMethods(activeMethods)
        setDeliverySlots(slots)
        setCommunes(comms)
        
        // Définir la première méthode active comme valeur par défaut
        if (activeMethods.length > 0 && !paymentMethod) {
          setPaymentMethod(activeMethods[0].code)
        }
        
        // Définir la première plage active comme valeur par défaut
        if (slots.length > 0 && !deliveryInfo.deliverySlot) {
          setDeliveryInfo(prev => ({ ...prev, deliverySlot: slots[0]._id }))
        }
        
        // Auto-sélectionner la commune de l'utilisateur connecté
        if (user?.commune) {
          setDeliveryInfo(prev => ({ ...prev, commune: user.commune || "" }))
        }
      } catch {}
    })()
  }, [user]) // Recharger quand l'utilisateur change

  // Mettre à jour les informations de livraison quand l'utilisateur change
  useEffect(() => {
    if (user) {
      setDeliveryInfo(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
        commune: user.commune || prev.commune || ""
      }))
    }
  }, [user])

  // Calculer les frais de livraison dynamiques (à titre informatif)
  const getDeliveryFee = () => {
    const selectedCommune = communes.find(c => c._id === deliveryInfo.commune)
    return selectedCommune ? selectedCommune.deliveryFee : 0
  }

  const subtotal = cartItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0
  const deliveryFee = getDeliveryFee()
  const total = subtotal // Les frais de livraison ne sont pas inclus dans le total

  // Informations de paiement par opérateur
  const paymentInfo = methods.reduce((acc: any, m: any) => {
            acc[m.code] = { name: m.name, color: `bg-${m.color}-500`, number: m.number, qrCode: m.qrImage }
    return acc
  }, { cash: { name: "Paiement à la livraison", color: "bg-green-500", number: "Paiement en espèces", qrCode: null } })

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address || !deliveryInfo.commune || !deliveryInfo.deliverySlot) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires et sélectionner une commune et une plage horaire",
        variant: "destructive",
      })
      return
    }
    setCurrentStep("payment")
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (paymentMethod === "cash") {
      // Pour le paiement à la livraison, on passe directement à la confirmation
      handleFinalConfirmation()
    } else {
      // Pour les autres méthodes, on passe à la vérification
      setCurrentStep("verification")
    }
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!proofFile) {
      toast({
        title: "Preuve manquante",
        description: "Veuillez télécharger la capture d'écran de votre paiement",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    let proofBase64: string | undefined
    try {
      if (proofFile) {
        // Convertir le fichier en base64
        proofBase64 = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(proofFile)
        })
      }
    } catch {}
    setIsProcessing(false)

    handleFinalConfirmation(proofBase64)
  }

  const handleFinalConfirmation = async (uploadedProofBase64?: string) => {
    const orderNum = `CMD${Date.now().toString().slice(-6)}`
    setOrderNumber(orderNum)

    const localOrder = {
      items: cartItems,
      delivery: deliveryInfo,
      payment: paymentMethod,
      subtotal,
      deliveryFee,
      total,
      proofPreview: uploadedProofBase64 || proofPreview,
      orderNumber: orderNum,
      orderDate: new Date(),
    }
    setOrderData(localOrder)

    setCurrentStep("confirmation")

    // Enregistrer côté API si connecté
    try {
      if (user) {
        await apiCreateOrder({
          items: cartItems.map((i) => ({ product: i.id, name: i.name, price: i.price, quantity: i.quantity, imageUrl: i.imageUrl })),
          delivery: deliveryInfo,
          paymentMethod: paymentMethod,
          subtotal,
          deliveryFee,
          total,
          proofUrl: uploadedProofBase64,
        })
        
        // Incrémenter le compteur de la plage horaire sélectionnée
        if (deliveryInfo.deliverySlot) {
          try {
            await incrementDeliverySlotOrders(deliveryInfo.deliverySlot)
          } catch (error) {
            console.error('Erreur lors de l\'incrémentation du compteur de plage horaire:', error)
          }
        }
      }
    } catch {}

    clearCart()

    toast({
      title: "Commande confirmée !",
      description: `Votre commande ${orderNum} a été enregistrée`,
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProofFile(file)

      // Créer un aperçu de l'image
      const reader = new FileReader()
      reader.onload = (e) => {
        setProofPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      toast({
        title: "Fichier ajouté !",
        description: `${file.name} a été sélectionné`,
      })
    }
  }

  if ((!cartItems || cartItems.length === 0) && currentStep !== "confirmation") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Panier vide</h2>
          <p className="text-gray-600 mb-6">Ajoutez des produits avant de passer commande</p>
          <Link href="/">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl px-8">
              Retourner à la boutique
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentPaymentInfo = paymentInfo[paymentMethod] || paymentInfo.cash
  const displayItems = currentStep === "confirmation" && orderData ? orderData.items : cartItems
  const displayDeliveryInfo = currentStep === "confirmation" && orderData ? orderData.delivery : deliveryInfo
  const displaySubtotal = currentStep === "confirmation" && orderData ? orderData.subtotal : subtotal
  const displayDeliveryFee = currentStep === "confirmation" && orderData ? orderData.deliveryFee : deliveryFee
  const displayTotal = currentStep === "confirmation" && orderData ? orderData.total : total
  const displayProofPreview = currentStep === "confirmation" && orderData ? orderData.proofPreview : proofPreview

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-6 border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Commande</h1>
          </div>
          <div className="text-sm text-gray-600">
            Étape{" "}
            {currentStep === "delivery"
              ? "1"
              : currentStep === "payment"
                ? "2"
                : currentStep === "verification"
                  ? "3"
                  : "4"}
            /{paymentMethod === "cash" ? "3" : "4"}
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center mt-4 gap-2">
          <div
            className={`flex-1 h-2 rounded-full ${currentStep !== "delivery" ? "bg-orange-500" : "bg-orange-200"}`}
          />
          <div
            className={`flex-1 h-2 rounded-full ${
              currentStep === "verification" || currentStep === "confirmation" ? "bg-orange-500" : "bg-gray-200"
            }`}
          />
          {paymentMethod !== "cash" && (
            <div
              className={`flex-1 h-2 rounded-full ${currentStep === "confirmation" ? "bg-orange-500" : "bg-gray-200"}`}
            />
          )}
          <div
            className={`flex-1 h-2 rounded-full ${currentStep === "confirmation" ? "bg-orange-500" : "bg-gray-200"}`}
          />
        </div>
      </div>

      {/* Delivery Step */}
      {currentStep === "delivery" && (
        <div className="px-4 py-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <MapPin className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Informations de livraison</h2>
            </div>

            <form onSubmit={handleDeliverySubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nom complet *
                </Label>
                <Input
                  id="name"
                  value={deliveryInfo.name}
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, name: e.target.value })}
                  placeholder="Votre nom complet"
                  className="mt-1 rounded-xl border-gray-200"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Téléphone *
                </Label>
                <Input
                  id="phone"
                  value={deliveryInfo.phone}
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })}
                  placeholder="+225 XX XX XX XX XX"
                  className="mt-1 rounded-xl border-gray-200"
                  required
                />
              </div>

              <div>
                <Label htmlFor="commune" className="text-sm font-medium text-gray-700">
                  Commune *
                </Label>
                <Select2
                  options={communes.map((commune) => ({
                    value: commune._id,
                    label: commune.name,
                    description: `${commune.deliveryFee.toLocaleString()} F CFA (à la réception)`
                  }))}
                  value={deliveryInfo.commune}
                  onChange={(value) => setDeliveryInfo({ ...deliveryInfo, commune: value })}
                  placeholder="Sélectionner votre commune"
                  searchPlaceholder="Rechercher une commune..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Adresse de livraison *
                </Label>
                <Textarea
                  id="address"
                  value={deliveryInfo.address}
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                  placeholder="Rue, quartier, points de repère..."
                  className="mt-1 rounded-xl border-gray-200 resize-none"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="deliverySlot" className="text-sm font-medium text-gray-700">
                  Plage horaire de livraison *
                </Label>
                <div className="mt-1 space-y-2">
                  {deliverySlots.map((slot) => (
                    <button
                      key={slot._id}
                      type="button"
                      onClick={() => setDeliveryInfo({ ...deliveryInfo, deliverySlot: slot._id })}
                      className={`w-full p-3 rounded-xl border text-left transition-colors ${
                        deliveryInfo.deliverySlot === slot._id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{slot.name}</p>
                          <p className="text-sm text-gray-600">{slot.startTime} - {slot.endTime}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {slot.currentOrders} commande(s) aujourd'hui
                          </p>
                          {slot.maxOrders > 0 && (
                            <p className="text-xs text-gray-500">
                              Limite: {slot.maxOrders}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="instructions" className="text-sm font-medium text-gray-700">
                  Instructions spéciales (optionnel)
                </Label>
                <Textarea
                  id="instructions"
                  value={deliveryInfo.instructions}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value.length <= 150) {
                      setDeliveryInfo({ ...deliveryInfo, instructions: value })
                    }
                  }}
                  placeholder="Instructions pour le livreur..."
                  className="mt-1 rounded-xl border-gray-200 resize-none"
                  rows={2}
                  maxLength={150}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Maximum 150 caractères
                  </p>
                  <p className="text-xs text-gray-500">
                    {deliveryInfo.instructions.length}/150
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-4 text-lg font-semibold mt-6"
              >
                Continuer vers le paiement
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Résumé de la commande</h3>
            <div className="space-y-3">
              {cartItems.slice(0, 2).map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <Image
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">Qté: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {(item.price * item.quantity).toLocaleString()} F CFA
                  </span>
                </div>
              ))}
              {cartItems.length > 2 && (
                <p className="text-sm text-gray-500">+{cartItems.length - 2} autre(s) produit(s)</p>
              )}

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{subtotal.toLocaleString()} F CFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frais de livraison</span>
                  <span className="text-gray-500 text-xs">
                    {deliveryFee > 0 ? `${deliveryFee.toLocaleString()} F CFA` : "À définir"}
                  </span>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700">
                    💡 Les frais de livraison sont payables à la réception du produit
                  </p>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total à payer</span>
                  <span className="text-orange-600">{subtotal.toLocaleString()} F CFA</span>
                </div>
                <p className="text-xs text-gray-500 text-center mt-1">
                  + Frais de livraison à la réception
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Step */}
      {currentStep === "payment" && (
        <div className="px-4 py-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Méthode de paiement</h2>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
                              {/* Payment Methods */}
                <div className="space-y-3">
                 {/* Méthodes de paiement dynamiques depuis l'API */}
                 {methods.map((method) => (
                   <button
                     key={method._id}
                     type="button"
                     onClick={() => setPaymentMethod(method.code as PaymentMethod)}
                     className={`w-full p-4 rounded-2xl border-2 transition-colors ${
                       paymentMethod === method.code ? `border-${method.color}-500 bg-${method.color}-50` : "border-gray-200 bg-white"
                     }`}
                   >
                     <div className="flex items-center gap-3">
                       <div className={`w-8 h-8 bg-${method.color}-500 rounded-full flex items-center justify-center`}>
                         <span className="text-white text-xl font-bold">
                           {method.code === "orange" ? "O" : 
                            method.code === "mtn" ? "M" : 
                            method.code === "moov" ? "M" : 
                            method.code === "wave" ? "🐧" : 
                            method.name.charAt(0).toUpperCase()}
                         </span>
                       </div>
                       <div className="text-left">
                         <p className="font-semibold text-gray-900">{method.name}</p>
                         <p className="text-sm text-gray-500">Paiement via {method.name}</p>
                         {method.number && (
                           <p className="text-xs text-gray-400">{method.number}</p>
                         )}
                       </div>
                     </div>
                   </button>
                 ))}

                 {/* Paiement à la livraison (toujours disponible) */}
                 <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`w-full p-4 rounded-2xl border-2 transition-colors ${
                    paymentMethod === "cash" ? "border-green-500 bg-green-50" : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xl">💰</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Paiement à la livraison</p>
                      <p className="text-sm text-gray-500">Espèces ou Mobile Money</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Payment Instructions */}
              {paymentMethod !== "cash" && currentPaymentInfo && (
                <div
                  className={`${currentPaymentInfo.color?.replace("bg-", "bg-").replace("-500", "-50") || "bg-gray-50"} rounded-2xl p-6`}
                >
                  <h3 className="font-bold text-gray-900 mb-4">Instructions de paiement</h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* QR Code */}
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 mb-3">Scanner le QR Code</p>
                      <div className="bg-white p-4 rounded-2xl inline-block">
                        <Image
                          src={currentPaymentInfo.qrCode || "/placeholder.svg"}
                          alt={`QR Code ${currentPaymentInfo.name || "Paiement"}`}
                          width={150}
                          height={150}
                          className="mx-auto"
                        />
                      </div>
                    </div>

                    {/* Manual Payment */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">Ou envoyer à ce numéro</p>
                      <div className="bg-white p-4 rounded-2xl">
                        <p className="font-bold text-lg text-center">{currentPaymentInfo.number || "Numéro non disponible"}</p>
                        <p className="text-center text-sm text-gray-600 mt-2">
                          Montant : <span className="font-bold text-orange-600">{total.toLocaleString()} F CFA</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-white rounded-2xl">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs">ℹ️</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Étapes à suivre :</p>
                        <ol className="text-sm text-gray-700 space-y-1">
                          <li>1. Effectuez le paiement via QR Code ou numéro</li>
                          <li>2. Prenez une capture d'écran de la confirmation</li>
                          <li>3. Cliquez sur "Continuer" pour télécharger la preuve</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "cash" && (
                <div className="bg-green-50 rounded-2xl p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800 mb-1">Paiement à la livraison</p>
                      <p className="text-sm text-green-700">
                        Vous pourrez payer en espèces ou par Mobile Money directement au livreur. Assurez-vous d'avoir
                        le montant exact : <strong>{total.toLocaleString()} F CFA</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep("delivery")}
                  className="flex-1 rounded-2xl py-4"
                >
                  Retour
                </Button>
                <Button
                  type="submit"
                  className="flex-2 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-4 font-semibold"
                >
                  {paymentMethod === "cash" ? "Confirmer la commande" : "J'ai effectué le paiement"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verification Step */}
      {currentStep === "verification" && (
        <div className="px-4 py-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Upload className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Vérification du paiement</h2>
            </div>

            <form onSubmit={handleVerificationSubmit} className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="h-10 w-10 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Téléchargez votre preuve de paiement</h3>
                <p className="text-gray-600 mb-6">
                  Prenez une capture d'écran de la confirmation de votre paiement {currentPaymentInfo.name || "mobile money"} et
                  téléchargez-la ci-dessous.
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="proof-upload" />
                <label htmlFor="proof-upload" className="cursor-pointer">
                  {proofFile ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <Image
                          src={proofPreview || "/placeholder.svg"}
                          alt="Preuve de paiement"
                          width={200}
                          height={300}
                          className="max-w-full h-auto max-h-64 object-contain rounded-2xl border-2 border-green-200"
                        />
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <p className="font-medium text-green-600">Preuve de paiement ajoutée</p>
                      <Button type="button" variant="outline" className="rounded-2xl bg-transparent">
                        Changer l'image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <Upload className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="font-medium text-gray-900">Cliquez pour télécharger</p>
                      <p className="text-sm text-gray-500">PNG, JPG jusqu'à 10MB</p>
                    </div>
                  )}
                </label>
              </div>

              <div className="bg-blue-50 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">💡</span>
                  </div>
                  <div>
                    <p className="font-medium text-blue-800 mb-1">Conseils pour une bonne capture</p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Assurez-vous que le montant est visible</li>
                      <li>• Incluez la date et l'heure de la transaction</li>
                      <li>• Vérifiez que l'image est nette et lisible</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep("payment")}
                  className="flex-1 rounded-2xl py-4"
                >
                  Retour
                </Button>
                <Button
                  type="submit"
                  disabled={!proofFile || isProcessing}
                  className="flex-2 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-4 font-semibold disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Vérification...
                    </div>
                  ) : (
                    "Confirmer la commande"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Step */}
      {currentStep === "confirmation" && (
        <div className="px-4 py-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Commande confirmée !</h2>
            <p className="text-gray-600 mb-6">
              Votre commande <span className="font-semibold text-orange-600">#{orderNumber}</span> a été enregistrée
              avec succès
            </p>

            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Prochaines étapes</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {paymentMethod === "cash" ? "Confirmation par SMS" : "Vérification du paiement"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {paymentMethod === "cash" ? "Dans les 5 minutes" : "Dans les minutes qui suivent"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Préparation</p>
                    <p className="text-sm text-gray-500">Après la validation du paiement</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Truck className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Livraison</p>
                    <p className="text-sm text-gray-500">Après la préparation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">RÉCAPITULATIF COMPLET DE LA COMMANDE</h3>
              <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                #{orderNumber}
              </span>
            </div>

            {/* Date et heure de commande */}
            <div className="bg-orange-50 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-orange-800">Date de commande</p>
                  <p className="text-sm text-orange-700">
                    {(orderData?.orderDate || new Date()).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-orange-800">Statut</p>
                  <p className="text-sm text-orange-700">
                    {paymentMethod === "cash" ? "En attente de confirmation" : "Paiement en vérification"}
                  </p>
                </div>
              </div>
            </div>

            {/* Informations client détaillées */}
            <div className="border-2 border-gray-100 rounded-2xl p-6 mb-6 w-full overflow-hidden">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-600" />
                INFORMATIONS DE LIVRAISON
              </h4>
              <div className="grid md:grid-cols-2 gap-4 w-full">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Nom complet</p>
                  <p className="font-semibold text-gray-900 text-lg">{displayDeliveryInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Téléphone</p>
                  <p className="font-semibold text-gray-900 text-lg">{displayDeliveryInfo.phone}</p>
                </div>
                {displayDeliveryInfo.commune && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-600 mb-1">Commune de livraison</p>
                    <p className="font-semibold text-gray-900 text-lg">
                      {(() => {
                        const selectedCommune = communes.find(commune => commune._id === displayDeliveryInfo.commune)
                        return selectedCommune ? `${selectedCommune.name}` : "Commune non définie"
                      })()}
                    </p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-600 mb-1">Adresse complète de livraison</p>
                  <p className="font-semibold text-gray-900 text-lg break-words overflow-wrap-anywhere">{displayDeliveryInfo.address}</p>
                </div>
                {displayDeliveryInfo.deliverySlot && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-600 mb-1">Plage horaire de livraison</p>
                    <p className="font-medium text-gray-900 text-lg break-words overflow-wrap-anywhere">
                      {(() => {
                        const selectedSlot = deliverySlots.find(slot => slot._id === displayDeliveryInfo.deliverySlot)
                        return selectedSlot ? `${selectedSlot.name} (${selectedSlot.startTime} - ${selectedSlot.endTime})` : "Plage non définie"
                      })()}
                    </p>
                  </div>
                )}
                {displayDeliveryInfo.instructions && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-600 mb-1">Instructions spéciales</p>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 max-w-full overflow-hidden">
                      <p className="font-medium text-gray-800 text-sm break-words overflow-wrap-anywhere whitespace-pre-wrap">
                        {displayDeliveryInfo.instructions}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Méthode de paiement détaillée */}
            <div className="border-2 border-gray-100 rounded-2xl p-6 mb-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-orange-600" />
                MÉTHODE DE PAIEMENT
              </h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 ${currentPaymentInfo.color || "bg-gray-500"} rounded-full flex items-center justify-center`}
                  >
                    <span className="text-white font-bold text-xl">
                      {paymentMethod === "orange"
                        ? "O"
                        : paymentMethod === "mtn"
                          ? "M"
                          : paymentMethod === "moov"
                            ? "M"
                            : paymentMethod === "wave"
                              ? "🐧"
                              : "💰"}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{currentPaymentInfo.name || "Méthode de paiement"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-2xl text-orange-600">{displaySubtotal.toLocaleString()} F CFA</p>
                  <p className="text-xs text-gray-500">
                    + Frais de livraison <br/>à payer à la réception
                  </p>
                </div>
              </div>

              {/* Preuve de paiement si disponible */}
              {displayProofPreview && paymentMethod !== "cash" && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="font-medium text-gray-700 mb-3">Preuve de paiement téléchargée :</p>
                  <div className="bg-gray-50 rounded-2xl p-4 text-center">
                    <Image
                      src={displayProofPreview || "/placeholder.svg"}
                      alt="Preuve de paiement"
                      width={200}
                      height={250}
                      className="max-w-full h-auto max-h-40 object-contain rounded-xl mx-auto border-2 border-green-200"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Liste complète des produits */}
            <div className="border-2 border-gray-100 rounded-2xl p-6 mb-6">
              <h4 className="text-md font-bold text-gray-900 mb-4">
                PRODUITS COMMANDÉS ({displayItems.length} article{displayItems.length > 1 ? "s" : ""})
              </h4>
              <div className="space-y-4">
                {displayItems.map((item: any, index: number) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="text-sm font-bold text-gray-500 w-8 text-center">{index + 1}.</div>
                    <Image
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.name}
                      width={60}
                      height={60}
                      className="w-15 h-15 object-cover rounded-xl border-2 border-white shadow-sm"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg">{item.name}</p>
                      <p className="text-sm text-gray-600">P.U. : {item.price.toLocaleString()} F</p>
                      <p className="text-sm font-medium text-orange-600">Qté : {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-gray-900">
                        {(item.price * item.quantity).toLocaleString()} F CFA
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Détail des coûts */}
            <div className="border-2 border-orange-200 bg-orange-50 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">DÉTAIL DES COÛTS</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-gray-700">Sous-total :</span>
                  <span className="font-bold text-gray-900">{displaySubtotal.toLocaleString()} F CFA</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="text-gray-700">Frais de livraison :</span>
                  <span className="text-gray-500 text-sm">
                    {displayDeliveryFee > 0 ? `${displayDeliveryFee.toLocaleString()} F CFA` : "À définir"}
                  </span>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    💡 Les frais de livraison sont payables à la réception du produit
                  </p>
                </div>
                <div className="border-t-2 border-orange-300 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">TOTAL À PAYER :</span>
                    <span className="text-lg font-bold text-orange-600">{displaySubtotal.toLocaleString()} F CFA</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    + Frais de livraison à payer à la réception
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Link href="/orders">
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-4 font-semibold mb-4">
                Suivre ma commande
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full rounded-2xl py-4 bg-transparent">
                Continuer mes achats
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
