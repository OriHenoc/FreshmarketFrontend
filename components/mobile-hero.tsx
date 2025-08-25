"use client"

import { useState, useEffect } from "react"
import { MapPin } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { fetchPromotions, getGlobalSetting } from "@/lib/api"

export default function MobileHero() {
  const { user } = useAuth()
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0)
  const [promos, setPromos] = useState<any[]>([])
  const [autoScrollInterval, setAutoScrollInterval] = useState(4000)

  useEffect(() => {
    ;(async () => {
      try {
        const [promosData, scrollInterval] = await Promise.all([
          fetchPromotions(),
          getGlobalSetting('promo_auto_scroll_interval').catch(() => ({ value: 4000 }))
        ])
        setPromos(promosData)
        setAutoScrollInterval(scrollInterval.value || 4000)
      } catch (error) {
        console.error('Erreur chargement promotions:', error)
      }
    })()
  }, [])

  useEffect(() => {
    if (promos.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promos.length)
    }, autoScrollInterval)
    return () => clearInterval(interval)
  }, [promos, autoScrollInterval])

  return (
    <div className="bg-white px-4 py-6 border-b border-gray-100">
      {/* Greeting */}
      <div className="mb-4">
        <p className="text-gray-600 text-sm">Bonjour {user?.name || "Invité"} 👋</p>
        <h1 className="text-xl font-bold text-gray-900">Que voulez-vous manger ?</h1>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="h-4 w-4 text-orange-500" />
        <span className="text-sm text-gray-600">Livrer à</span>
        <span className="text-sm font-medium text-gray-900">Cocody, Abidjan</span>
      </div>

      {/* Promo Carousel */}
      <div className="relative h-32 rounded-2xl overflow-hidden mb-4">
        {promos.length > 0 && (
          <div
            className={`absolute inset-0 bg-gradient-to-r ${promos[currentPromoIndex].color} flex items-center justify-between px-6 text-white`}
          >
            <div>
              <h3 className="text-xl font-bold mb-1">{promos[currentPromoIndex].title}</h3>
              <p className="text-white/90">{promos[currentPromoIndex].subtitle}</p>
            </div>
            <div className="text-4xl">{promos[currentPromoIndex].emoji}</div>
          </div>
        )}
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2">
        {promos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPromoIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentPromoIndex ? "bg-orange-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
