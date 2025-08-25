"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface CategoryNavigationProps {
  categories: string[]
  activeCategory?: string
  onCategoryChange?: (category: string) => void
}

export default function CategoryNavigation({
  categories,
  activeCategory = "All",
  onCategoryChange,
}: CategoryNavigationProps) {
  const handleCategoryClick = (category: string) => {
    if (onCategoryChange) {
      onCategoryChange(category)
    }
  }

  const allCategories = ["All", ...categories]

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-lg border bg-white/50 backdrop-blur-sm">
      <div className="flex w-max space-x-2 p-4">
        {allCategories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "ghost"}
            onClick={() => handleCategoryClick(category)}
            className={cn(
              "whitespace-nowrap transition-all duration-200",
              activeCategory === category
                ? "bg-gradient-warm text-white shadow-md"
                : "hover:bg-primary-50 hover:text-primary-700",
            )}
          >
            {category === "All" ? "Toutes les catégories" : category}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
