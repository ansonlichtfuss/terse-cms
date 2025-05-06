"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, FileIcon, CheckIcon, XIcon, ChevronRight, ChevronLeft } from "lucide-react"
import { format, isValid, parseISO } from "date-fns"
import matter from "gray-matter"

interface MetadataSidebarProps {
  content: string
  isVisible: boolean
  onToggle: () => void
}

export function MetadataSidebar({ content, isVisible, onToggle }: MetadataSidebarProps) {
  const [frontMatter, setFrontMatter] = useState<any>({})

  // Parse front matter whenever content changes
  useEffect(() => {
    try {
      const { data } = matter(content)
      setFrontMatter(data || {})
    } catch (error) {
      console.error("Error parsing front matter:", error)
      setFrontMatter({})
    }
  }, [content])

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    try {
      // Try different date formats
      const date = new Date(dateString)
      if (isValid(date)) {
        return format(date, "PPP")
      }

      // Try ISO format
      const isoDate = parseISO(dateString)
      if (isValid(isoDate)) {
        return format(isoDate, "PPP")
      }
    } catch (e) {
      // Not a valid date string
    }
    return dateString
  }

  // Helper to determine if a value is an image URL
  const isImageUrl = (value: string) => {
    return (
      typeof value === "string" &&
      (/\.(jpg|jpeg|png|gif|webp|svg)($|\?)/.test(value) || value.includes("media") || value.includes("image"))
    )
  }

  // Helper to check if a string is a date
  const isDateString = (value: string) => {
    if (!value) return false

    try {
      // Check common date formats
      const date = new Date(value)
      if (isValid(date)) return true

      // Check ISO format
      const isoDate = parseISO(value)
      if (isValid(isoDate)) return true

      // Check YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return isValid(new Date(value))
      }
    } catch (e) {
      return false
    }

    return false
  }

  // Helper to check if an array contains image objects
  const isImageArray = (arr: any[]) => {
    if (!Array.isArray(arr) || arr.length === 0 || typeof arr[0] !== "object") return false

    // Check if objects have image-related properties
    const imageProps = ["image", "url", "src", "source", "thumbnail"]
    return arr.some((item) => {
      return Object.keys(item).some(
        (key) => imageProps.includes(key.toLowerCase()) || (typeof item[key] === "string" && isImageUrl(item[key])),
      )
    })
  }

  // Render different types of values
  const renderValue = (key: string, value: any) => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-muted-foreground italic">Empty</span>
    }

    if (typeof value === "boolean") {
      return value ? (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckIcon className="h-3 w-3 mr-1" /> True
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XIcon className="h-3 w-3 mr-1" /> False
        </Badge>
      )
    }

    if (typeof value === "string") {
      // Check if it's a date
      if (isDateString(value)) {
        return (
          <div className="flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1 text-muted-foreground" />
            <span>{formatDate(value)}</span>
          </div>
        )
      }

      // Check if it's an image URL
      if (isImageUrl(value)) {
        return (
          <div className="flex flex-col gap-1">
            <div className="relative aspect-video w-full max-w-[120px] bg-muted rounded-md overflow-hidden">
              <img
                src={value || "/placeholder.svg"}
                alt={key}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=100&width=120"
                }}
              />
            </div>
          </div>
        )
      }

      // Regular string - truncate if too long
      return value.length > 50 ? (
        <span className="truncate" title={value}>
          {value.substring(0, 50)}...
        </span>
      ) : (
        <span>{value}</span>
      )
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-muted-foreground italic">Empty array</span>

      if (isImageArray(value)) {
        return (
          <div className="grid grid-cols-2 gap-2">
            {value.slice(0, 4).map((item, index) => {
              const imageUrl = item.url || item.src || item.image || ""
              const alt = item.alt || `Image ${index + 1}`

              return (
                <div key={index} className="flex flex-col gap-1">
                  <div className="relative aspect-video w-full bg-muted rounded-md overflow-hidden">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt={alt}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=60&width=80"
                      }}
                    />
                  </div>
                </div>
              )
            })}
            {value.length > 4 && (
              <Badge variant="outline" className="mt-1">
                +{value.length - 4} more
              </Badge>
            )}
          </div>
        )
      }

      return <Badge>{value.length} items</Badge>
    }

    if (typeof value === "object" && value !== null) {
      // Try to handle date objects
      if (value instanceof Date || (value.toISOString && typeof value.toISOString === "function")) {
        try {
          return (
            <div className="flex items-center">
              <CalendarIcon className="h-3 w-3 mr-1 text-muted-foreground" />
              <span>{formatDate(value.toISOString())}</span>
            </div>
          )
        } catch (e) {
          // Fall back to default object handling
        }
      }
      return <Badge>Object</Badge>
    }

    return <span>{String(value)}</span>
  }

  // If sidebar is hidden, show the button to restore it
  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="absolute right-0 top-1/2 -translate-y-1/2 h-24 w-6 rounded-r-none rounded-l-md border-r-0 bg-gradient-secondary hover:bg-gradient-primary hover:text-white transition-all z-10"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <div className="w-64 border-l relative">
      <div className="p-3 border-b flex items-center justify-between bg-gradient-secondary">
        <h3 className="text-sm font-medium">Metadata</h3>
        <Button variant="ghost" size="sm" onClick={onToggle} className="h-7 w-7 p-0">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="p-3">
          {Object.keys(frontMatter).length === 0 ? (
            <div className="text-xs text-muted-foreground">No metadata found</div>
          ) : (
            <div className="space-y-4">
              {Object.entries(frontMatter).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center gap-1">
                    {isDateString(String(value)) && <CalendarIcon className="h-3 w-3 text-muted-foreground" />}
                    {typeof value === "string" && isImageUrl(value) && (
                      <FileIcon className="h-3 w-3 text-muted-foreground" />
                    )}
                    {Array.isArray(value) && isImageArray(value) && (
                      <FileIcon className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className="text-xs font-medium capitalize">{key}</span>
                  </div>
                  <div className="text-xs">{renderValue(key, value)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
