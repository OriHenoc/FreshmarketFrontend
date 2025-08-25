"use client"

import { ArrowLeft, Bell, Search, Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MobileHeaderProps {
  title: string
  showBack?: boolean
  showBell?: boolean
  showSearch?: boolean
  showHeart?: boolean
  showShare?: boolean
  onBack?: () => void
  onSearch?: () => void
  onHeart?: () => void
  onShare?: () => void
  isLiked?: boolean
}

export default function MobileHeader({
  title,
  showBack = false,
  showBell = false,
  showSearch = false,
  showHeart = false,
  showShare = false,
  onBack,
  onSearch,
  onHeart,
  onShare,
  isLiked = false,
}: MobileHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {showSearch && (
            <Button variant="ghost" size="icon" onClick={onSearch}>
              <Search className="h-5 w-5" />
            </Button>
          )}

          {showHeart && (
            <Button variant="ghost" size="icon" onClick={onHeart}>
              <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </Button>
          )}

          {showShare && (
            <Button variant="ghost" size="icon" onClick={onShare}>
              <Share2 className="h-5 w-5" />
            </Button>
          )}

          {showBell && (
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
