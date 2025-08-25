"use client"

import { useState } from "react"
import ProductCard from "@/components/product-card"

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
}

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredProducts =
    selectedCategory === "All" ? products : products.filter((product) => product.category === selectedCategory)

  return (
    <section className="mt-16">
      <div className="text-center mb-12">
        <h2 className="font-display font-bold text-4xl mb-4 bg-gradient-food bg-clip-text text-transparent">
          Nos Produits Frais
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Découvrez notre sélection de packs alimentaires et combos savoureux, préparés avec amour pour votre famille.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.map((product, index) => (
          <div key={product.id} className="animate-fade-in hover-lift" style={{ animationDelay: `${index * 0.1}s` }}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
