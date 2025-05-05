import type React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarProps {
  children: React.ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <div className="h-full border-r flex flex-col">
      <div className="p-4 flex-1 overflow-hidden">
        <ScrollArea className="h-full">{children}</ScrollArea>
      </div>
    </div>
  )
}
