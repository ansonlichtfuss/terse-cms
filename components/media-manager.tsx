"use client"
import { FileBrowser } from "@/components/file-browser"

interface MediaManagerProps {
  onSelect: (url: string) => void
  isMobile?: boolean
  inSidebar?: boolean
}

export function MediaManager({ onSelect, isMobile = false, inSidebar = false }: MediaManagerProps) {
  // Create a handler function that correctly passes the URL to onSelect
  const handleSelect = (_path: string, url?: string) => {
    if (typeof onSelect === "function" && url) {
      onSelect(url)
    }
  }

  return (
    <div className="h-full">
      <FileBrowser type="media" onSelect={handleSelect} isMobile={isMobile} inSidebar={inSidebar} />
    </div>
  )
}
