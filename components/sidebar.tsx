import type React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  children: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  return <ScrollArea>{children}</ScrollArea>;
}
