"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import MobileProductCard from "./mobile-product-card"
import { getProducts } from "@/lib/data"
import { fetchCategories } from "@/lib/api"

export default function MobileProductGrid() {
  const [selectedCategory, setSelectedCategory] = useState("Tous")
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  
  useEffect(() => {
    ;(async () => {
      try {
        const [data, cats] = await Promise.all([
          getProducts(),
          fetchCategories()
        ])
        setProducts(data)
        setCategories(cats)
      } catch (error) {
        console.error('Erreur chargement données:', error)
      }
    })()
  }, [])

  const filteredProducts =
    selectedCategory === "Tous" ? products : products.filter((product) => product.category === selectedCategory)

  return (
    <div className="px-4">
      {/* Categories */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Catégories</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory("Tous")}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
              "Tous" === selectedCategory
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            Tous
          </button>
          {categories.map((category) => (
            <button
              key={category._id || category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                category.name === selectedCategory
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          {selectedCategory === "Tous" ? "Tous les produits" : selectedCategory}
        </h2>
        <Link href="/products" className="text-orange-500 text-sm font-medium">
          Voir tout
        </Link>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredProducts.slice(0, 6).map((product) => (
          <MobileProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
