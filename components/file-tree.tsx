"use client"
import { FileBrowser } from "@/components/file-browser"

// Update the interface to match the FileBrowser component's expected props
interface FileTreeProps {
  onFileSelect: (path: string) => void
  isMobile?: boolean
}

export function FileTree({ onFileSelect, isMobile = false }: FileTreeProps) {
  // Pass onFileSelect as the onSelect prop to FileBrowser
  return (
    <div className="h-full flex flex-col">
      <FileBrowser type="files" onSelect={onFileSelect} isMobile={isMobile} inSidebar={true} />
    </div>
  )
}
