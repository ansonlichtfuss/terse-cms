"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Plus, Trash, ImageIcon, ArrowUp, ArrowDown, Loader2 } from "lucide-react"
import { MediaDialog } from "@/components/media-dialog"
import { toast } from "@/components/ui/use-toast"

interface ImageArrayFieldProps {
  name: string
  value: any[]
  path: string
  onChange: (path: string, value: any) => void
  onAddItem: (path: string) => void
  onRemoveItem: (path: string, index: number) => void
}

export function ImageArrayField({ name, value, path, onChange, onAddItem, onRemoveItem }: ImageArrayFieldProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null)
  const [generatingAltText, setGeneratingAltText] = useState<Record<number, boolean>>({})

  // Determine which field contains the image URL
  const getImageField = (item: any): string => {
    if (item.url && typeof item.url === "string") return "url"

    // Fallbacks if url doesn't exist
    const possibleFields = ["src", "source", "image", "thumbnail"]
    for (const field of possibleFields) {
      if (item[field] && typeof item[field] === "string") {
        return field
      }
    }

    // If no specific image field is found, return the first string field
    const firstStringField = Object.entries(item).find(([_, val]) => typeof val === "string")?.[0]
    return firstStringField || ""
  }

  const handleMediaSelect = async (url: string) => {
    if (activeImageIndex !== null) {
      const newValue = [...value]
      newValue[activeImageIndex] = {
        ...newValue[activeImageIndex],
        url: url,
      }
      onChange(path, newValue)

      // Generate alt text for the new image
      generateAltText(activeImageIndex, url)
    }
    setIsMediaDialogOpen(false)
    setActiveImageIndex(null)
  }

  const openMediaDialog = (index: number) => {
    setActiveImageIndex(index)
    setIsMediaDialogOpen(true)
  }

  // Function to generate alt text using Gemini AI
  const generateAltText = async (index: number, imageUrl: string) => {
    if (!imageUrl) return

    // Set loading state for this specific image
    setGeneratingAltText((prev) => ({ ...prev, [index]: true }))

    try {
      const response = await fetch("/api/ai/generate-alt-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate alt text")
      }

      const data = await response.json()

      if (data.altText) {
        // Update the alt text for this image
        const newValue = [...value]
        newValue[index] = {
          ...newValue[index],
          alt: data.altText,
        }
        onChange(path, newValue)

        toast({
          title: "Alt text generated",
          description: "AI-generated alt text has been added to the image",
        })
      }
    } catch (error) {
      console.error("Error generating alt text:", error)
      toast({
        title: "Error",
        description: "Failed to generate alt text",
        variant: "destructive",
      })
    } finally {
      // Clear loading state
      setGeneratingAltText((prev) => {
        const newState = { ...prev }
        delete newState[index]
        return newState
      })
    }
  }

  // Function to handle URL change and trigger alt text generation
  const handleUrlChange = (index: number, newUrl: string, imageField: string) => {
    const newValue = [...value]
    // Preserve the original structure but update the URL field
    newValue[index] = {
      ...newValue[index],
      [imageField]: newUrl,
    }
    // If we're using a non-standard field, also set the url field
    if (imageField !== "url") {
      newValue[index].url = newUrl
    }
    onChange(path, newValue)

    // If the URL is valid and the alt text is empty, generate alt text
    if (newUrl && (!newValue[index].alt || newValue[index].alt === "")) {
      generateAltText(index, newUrl)
    }
  }

  // Function to move an item up in the array
  const moveItemUp = (index: number) => {
    if (index <= 0) return // Can't move the first item up

    const newValue = [...value]
    const temp = newValue[index]
    newValue[index] = newValue[index - 1]
    newValue[index - 1] = temp

    onChange(path, newValue)
  }

  // Function to move an item down in the array
  const moveItemDown = (index: number) => {
    if (index >= value.length - 1) return // Can't move the last item down

    const newValue = [...value]
    const temp = newValue[index]
    newValue[index] = newValue[index + 1]
    newValue[index + 1] = temp

    onChange(path, newValue)
  }

  // Custom function to add a new image item with only url and alt fields
  const handleAddImageItem = () => {
    const newItem = {
      url: "",
      alt: "",
    }

    const newValue = [...value, newItem]
    onChange(path, newValue)
  }

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
              {isOpen ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
              <Label className="capitalize cursor-pointer">{name}</Label>
            </Button>
          </CollapsibleTrigger>
          <Button variant="outline" size="sm" onClick={handleAddImageItem}>
            <Plus className="h-3 w-3 mr-1" />
            Add Image
          </Button>
        </div>
        <CollapsibleContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {value.map((item, index) => {
              const imageField = getImageField(item)
              const imageUrl = item[imageField] || ""
              const altText = item.alt || ""
              const isGenerating = generatingAltText[index] || false

              return (
                <Card key={index} className="border overflow-hidden">
                  <div className="relative aspect-video bg-muted">
                    {imageUrl ? (
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt={altText || `Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // If image fails to load, show placeholder
                          e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 bg-background/80 hover:bg-background"
                        onClick={() => onRemoveItem(path, index)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium">Image {index + 1}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveItemUp(index)}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveItemDown(index)}
                          disabled={index === value.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* URL Field */}
                    <div className="space-y-1">
                      <Label htmlFor={`${path}-${index}-url`} className="text-xs">
                        URL
                      </Label>
                      <div className="flex gap-1">
                        <Input
                          id={`${path}-${index}-url`}
                          value={imageUrl}
                          onChange={(e) => handleUrlChange(index, e.target.value, imageField)}
                          className="h-8 text-xs"
                        />
                        <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => openMediaDialog(index)}>
                          <ImageIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Alt Text Field */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`${path}-${index}-alt`} className="text-xs">
                          Alt Text
                        </Label>
                        {imageUrl && !isGenerating && !altText && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 px-2 text-xs"
                            onClick={() => generateAltText(index, imageUrl)}
                          >
                            Generate
                          </Button>
                        )}
                      </div>
                      <div className="relative">
                        <Input
                          id={`${path}-${index}-alt`}
                          value={altText}
                          onChange={(e) => {
                            const newValue = [...value]
                            newValue[index] = {
                              ...newValue[index],
                              alt: e.target.value,
                            }
                            onChange(path, newValue)
                          }}
                          className="h-8 text-xs"
                          placeholder={isGenerating ? "Generating alt text..." : "Describe the image"}
                          disabled={isGenerating}
                        />
                        {isGenerating && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <MediaDialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen} onSelect={handleMediaSelect} />
    </>
  )
}
