"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isValid, parseISO } from "date-fns"
import { CalendarIcon, Plus, Trash, ChevronDown, ChevronRight, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ImageArrayField } from "@/components/image-array-field"
import { MediaDialog } from "@/components/media-dialog"

interface DynamicFieldProps {
  name: string
  value: any
  path?: string
  onChange: (path: string, value: any) => void
  onAddItem?: (path: string) => void
  onRemoveItem?: (path: string, index: number) => void
  level?: number
}

export function DynamicField({
  name,
  value,
  path = name,
  onChange,
  onAddItem,
  onRemoveItem,
  level = 0,
}: DynamicFieldProps) {
  const [isOpen, setIsOpen] = useState(level < 1)
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false)

  // Determine the field type
  const getFieldType = (value: any): string => {
    if (value === null || value === undefined) return "null"
    if (typeof value === "boolean") return "boolean"
    if (typeof value === "number") return "number"
    if (typeof value === "string") {
      // Check if it's a date string
      try {
        const date = parseISO(value)
        if (isValid(date) && value.includes("T")) {
          return "date"
        }
      } catch (e) {
        // Not a valid date string
      }

      // Check if it's an image URL
      if (/\.(jpg|jpeg|png|gif|webp|svg)($|\?)/.test(value) || value.includes("media") || value.includes("image")) {
        return "image"
      }

      // Check if it's a multiline string
      if (value.includes("\n")) {
        return "textarea"
      }

      return "string"
    }
    if (Array.isArray(value)) {
      // Check if it's an array of image objects
      if (value.length > 0 && typeof value[0] === "object" && isImageArray(value)) {
        return "image-array"
      }
      return "array"
    }
    if (typeof value === "object") return "object"
    return "string" // Default
  }

  // Helper to determine if an array contains image objects
  const isImageArray = (arr: any[]): boolean => {
    if (arr.length === 0 || typeof arr[0] !== "object") return false

    // Check if the array name suggests images
    if (
      name.toLowerCase().includes("image") ||
      name.toLowerCase().includes("photo") ||
      name.toLowerCase().includes("gallery")
    ) {
      return true
    }

    // Check if objects have image-related properties
    const imageProps = ["image", "url", "src", "source", "thumbnail"]
    return arr.some((item) => {
      return Object.keys(item).some(
        (key) =>
          imageProps.includes(key.toLowerCase()) ||
          (typeof item[key] === "string" &&
            (/\.(jpg|jpeg|png|gif|webp|svg)($|\?)/.test(item[key]) ||
              item[key].includes("media") ||
              item[key].includes("image"))),
      )
    })
  }

  const fieldType = getFieldType(value)

  const handleMediaSelect = (url: string) => {
    onChange(path, url)
    setIsMediaDialogOpen(false)
  }

  // Custom function to add a new image item with only url and alt fields
  const handleAddImageItem = (path: string) => {
    const newItem = {
      url: "",
      alt: "",
    }

    if (onAddItem) {
      // Override the default onAddItem behavior for image arrays
      const currentValue = Array.isArray(value) ? [...value] : []
      onChange(path, [...currentValue, newItem])
    }
  }

  // Render field based on type
  const renderField = () => {
    switch (fieldType) {
      case "boolean":
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Checkbox id={path} checked={value} onCheckedChange={(checked) => onChange(path, checked)} />
              <Label htmlFor={path} className="capitalize">
                {name}
              </Label>
            </div>
          </div>
        )

      case "number":
        return (
          <div className="space-y-1">
            <Label htmlFor={path} className="capitalize text-xs">
              {name}
            </Label>
            <Input
              id={path}
              type="number"
              value={value}
              onChange={(e) => onChange(path, Number(e.target.value))}
              className="h-7 text-xs"
            />
          </div>
        )

      case "date":
        return (
          <div className="space-y-1">
            <Label htmlFor={path} className="capitalize text-xs">
              {name}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-7 text-xs",
                    !value && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {value ? format(new Date(value), "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={value ? new Date(value) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      // Preserve time component if it exists
                      const currentDate = value ? new Date(value) : new Date()
                      date.setHours(currentDate.getHours())
                      date.setMinutes(currentDate.getMinutes())
                      date.setSeconds(currentDate.getSeconds())
                      onChange(path, date.toISOString())
                    } else {
                      onChange(path, null)
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )

      case "image":
        return (
          <div className="grid grid-cols-2 gap-2 items-start">
            <Label htmlFor={path} className="capitalize text-xs pt-2">
              {name}
            </Label>
            <div className="space-y-2">
              <div className="flex gap-1">
                <Input
                  id={path}
                  value={value}
                  onChange={(e) => onChange(path, e.target.value)}
                  className="h-7 text-xs"
                />
                <Button variant="outline" size="sm" onClick={() => setIsMediaDialogOpen(true)} className="h-7">
                  <ImageIcon className="h-3 w-3" />
                </Button>
              </div>
              {value && (
                <div className="relative aspect-video w-full max-w-md bg-muted rounded-md overflow-hidden">
                  <img
                    src={value || "/placeholder.svg"}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // If image fails to load, show placeholder
                      e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )

      case "textarea":
        return (
          <div className="space-y-1">
            <Label htmlFor={path} className="capitalize text-xs">
              {name}
            </Label>
            <Textarea
              id={path}
              value={value}
              onChange={(e) => onChange(path, e.target.value)}
              rows={4}
              className="text-xs"
            />
          </div>
        )

      case "image-array":
        return (
          <ImageArrayField
            name={name}
            value={value}
            path={path}
            onChange={onChange}
            onAddItem={handleAddImageItem}
            onRemoveItem={onRemoveItem!}
          />
        )

      case "array":
        return (
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                  {isOpen ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                  <Label className="capitalize cursor-pointer text-xs">{name}</Label>
                </Button>
              </CollapsibleTrigger>
              {onAddItem && (
                <Button variant="outline" size="sm" onClick={() => onAddItem(path)} className="h-6 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Item
                </Button>
              )}
            </div>
            <CollapsibleContent className="space-y-2">
              {value.map((item: any, index: number) => (
                <Card key={index} className="border">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-xs font-medium">Item {index + 1}</Label>
                      {onRemoveItem && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRemoveItem(path, index)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    {typeof item === "object" && item !== null ? (
                      // If array contains objects, render each property
                      Object.entries(item).map(([key, val]) => (
                        <div key={key} className="mt-2">
                          <DynamicField
                            name={key}
                            value={val}
                            path={`${path}[${index}].${key}`}
                            onChange={onChange}
                            level={level + 1}
                          />
                        </div>
                      ))
                    ) : (
                      // If array contains primitive values
                      <Input
                        value={item}
                        onChange={(e) => {
                          const newValue = [...value]
                          newValue[index] = e.target.value
                          onChange(path, newValue)
                        }}
                        className="h-7 text-xs"
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )

      case "object":
        return (
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                {isOpen ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                <Label className="capitalize cursor-pointer text-xs">{name}</Label>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pl-4 border-l">
              {Object.entries(value).map(([key, val]) => (
                <DynamicField
                  key={key}
                  name={key}
                  value={val}
                  path={`${path}.${key}`}
                  onChange={onChange}
                  onAddItem={onAddItem}
                  onRemoveItem={onRemoveItem}
                  level={level + 1}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )

      case "null":
        return (
          <div className="space-y-1">
            <Label htmlFor={path} className="capitalize text-xs">
              {name}
            </Label>
            <Input
              id={path}
              value=""
              placeholder="Empty value"
              onChange={(e) => onChange(path, e.target.value)}
              className="h-7 text-xs"
            />
          </div>
        )

      default:
        return (
          <div className="space-y-1">
            <Label htmlFor={path} className="capitalize text-xs">
              {name}
            </Label>
            <Input id={path} value={value} onChange={(e) => onChange(path, e.target.value)} className="h-7 text-xs" />
          </div>
        )
    }
  }

  return (
    <div className="space-y-2">
      {renderField()}
      <MediaDialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen} onSelect={handleMediaSelect} />
    </div>
  )
}
