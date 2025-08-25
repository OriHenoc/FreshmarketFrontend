import { fetchProducts, fetchProductById } from "./api"

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
}

const products: Product[] = [
  {
    id: "1",
    name: "Panier Essentiel Familial",
    description:
      "Un panier complet avec riz, huile, sucre, pâtes et conserves pour nourrir toute la famille pendant une semaine.",
    price: 28000,
    imageUrl: "/placeholder.svg?height=300&width=400",
    category: "Paniers",
  },
  {
    id: "2",
    name: "Combo Petit Déjeuner Gourmand",
    description:
      "Céréales premium, lait frais, miel local, fruits de saison et pain artisanal pour des matins savoureux.",
    price: 15500,
    imageUrl: "/placeholder.svg?height=300&width=400",
    category: "Combos",
  },
  {
    id: "3",
    name: "Pack Légumes Bio du Marché",
    description:
      "Sélection quotidienne de légumes frais et bio : tomates, oignons, carottes, épinards, aubergines locales.",
    price: 22000,
    imageUrl: "/placeholder.svg?height=300&width=400",
    category: "Packs",
  },
  {
    id: "4",
    name: "Panier Fruits Tropicaux Premium",
    description:
      "Mangues juteuses, ananas sucrés, papayes mûres, bananes plantains et fruits de la passion sélectionnés.",
    price: 19500,
    imageUrl: "/placeholder.svg?height=300&width=400",
    category: "Paniers",
  },
  {
    id: "5",
    name: "Pack Protéines Fraîches",
    description: "Poisson frais du jour, poulet fermier, bœuf local et œufs de poules élevées au grain.",
    price: 48000,
    imageUrl: "/placeholder.svg?height=300&width=400",
    category: "Packs",
  },
  {
    id: "6",
    name: "Combo Pâtes & Sauces Artisanales",
    description: "Variété de pâtes italiennes avec sauces tomate maison, pesto frais et parmesan râpé.",
    price: 13500,
    imageUrl: "/placeholder.svg?height=300&width=400",
    category: "Combos",
  },
  {
    id: "7",
    name: "Pack Épices & Condiments",
    description: "Épices locales, piment, gingembre, ail, cube maggi, huile de palme et condiments traditionnels.",
    price: 16000,
    imageUrl: "/placeholder.svg?height=300&width=400",
    category: "Packs",
  },
  {
    id: "8",
    name: "Panier Bébé & Enfants",
    description:
      "Produits adaptés aux enfants : céréales infantiles, compotes, lait en poudre, biscuits sans sucre ajouté.",
    price: 32000,
    imageUrl: "/placeholder.svg?height=300&width=400",
    category: "Paniers",
  },
]

const categories: string[] = ["Paniers", "Combos", "Packs"]

// Versions dynamiques avec repli local si l'API n'est pas dispo
export async function getProducts(params?: { search?: string; category?: string; sort?: string; page?: number; limit?: number }): Promise<Product[]> {
  try {
    const remote = await fetchProducts(params)
    const list = Array.isArray(remote.items) ? remote.items : remote
    return list.map((p: any) => ({
      id: p._id || p.id,
      name: p.name,
      description: p.description ?? "",
      price: p.price,
      imageUrl: p.imageUrl ?? "",
      category: p.category ?? "Paniers",
    }))
  } catch {
    return products
  }
}

export function getCategories(): string[] {
  return categories
}

export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    const p = await fetchProductById(id)
    return {
      id: p._id || p.id,
      name: p.name,
      description: p.description ?? "",
      price: p.price,
      imageUrl: p.imageUrl ?? "",
      category: p.category ?? "Paniers",
    }
  } catch {
    return products.find((product) => product.id === id)
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const all = await getProducts()
  if (category === "All") return all
  return all.filter((product) => product.category === category)
}
