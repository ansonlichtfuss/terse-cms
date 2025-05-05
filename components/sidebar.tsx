import type React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarProps {
  children: React.ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <div className="h-full border-r">
      <div className="p-4">
        <ScrollArea className="h-[calc(100vh-8rem)]">{children}</ScrollArea>
      </div>
    </div>
  )
}
