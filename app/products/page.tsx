"use client"

import { useState, useEffect } from "react"
import { Search, Filter, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getProducts } from "@/lib/data"
import { fetchCategories } from "@/lib/api"
import MobileProductCard from "@/components/mobile-product-card"
import MobileBottomNav from "@/components/mobile-bottom-nav"
import Link from "next/link"

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tous")
  const [sortBy, setSortBy] = useState("-createdAt")
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const [data, cats] = await Promise.all([
          getProducts({
            search: searchQuery,
            category: selectedCategory === "Tous" ? undefined : selectedCategory,
            sort: sortBy,
            page,
            limit: 20,
          }),
          fetchCategories()
        ])
        setProducts(data)
        setCategories(cats)
      } catch (error) {
        console.error('Erreur chargement données:', error)
      } finally {
        setLoading(false)
      }
    })()
  }, [searchQuery, selectedCategory, sortBy, page])
  // Categories chargées dynamiquement depuis l'API

  // Filter and sort products
  let filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (selectedCategory !== "Tous") {
    filteredProducts = filteredProducts.filter((product) => product.category === selectedCategory)
  }

  // Sort products
  if (sortBy === "price") {
    filteredProducts.sort((a, b) => a.price - b.price)
  } else if (sortBy === "-price") {
    filteredProducts.sort((a, b) => b.price - a.price)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-40">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Tous les produits</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Rechercher des produits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-gray-50 border-0 rounded-2xl"
          />
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-4">
          <button
            onClick={() => setSelectedCategory("Tous")}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
              "Tous" === selectedCategory ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            Tous
          </button>
          {categories.map((category) => (
            <button
              key={category._id || category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                category.name === selectedCategory ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm text-gray-600 bg-transparent border-0 focus:outline-none"
          >
            <option value="-createdAt">Plus récents</option>
            <option value="price">Prix croissant</option>
            <option value="-price">Prix décroissant</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""} trouvé
            {filteredProducts.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-600">Chargement...</div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <MobileProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-500 mb-6">Essayez de modifier vos critères de recherche</p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("Tous")
              }}
              variant="outline"
              className="bg-transparent"
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>

      <MobileBottomNav />
    </div>
  )
}
