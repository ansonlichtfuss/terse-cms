// Helper to determine if a value is an image URL
export function isImageUrl(value: string): boolean {
  return (
    typeof value === "string" &&
    (/\.(jpg|jpeg|png|gif|webp|svg)($|\?)/.test(value) || value.includes("media") || value.includes("image"))
  )
}

// Helper to check if an array contains image objects
export function isImageArray(arr: any[]): boolean {
  if (!Array.isArray(arr) || arr.length === 0 || typeof arr[0] !== "object") return false

  // Check if the array name suggests images
  const imageNamePatterns = ["image", "photo", "gallery", "picture", "thumbnail"]
  const hasImageName = imageNamePatterns.some((pattern) =>
    arr.some((item) => Object.keys(item).some((key) => key.toLowerCase().includes(pattern))),
  )

  if (hasImageName) return true

  // Check if objects have image-related properties
  const imageProps = ["image", "url", "src", "source", "thumbnail"]
  return arr.some((item) => {
    return Object.keys(item).some(
      (key) =>
        imageProps.includes(key.toLowerCase()) ||
        (typeof item[key] === "string" &&
          (isImageUrl(item[key]) || item[key].includes("media") || item[key].includes("image"))),
    )
  })
}

// Helper to get the image field from an object
export function getImageField(item: any): string {
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

// Helper to get item name from key
export function getItemName(key: string, isMarkdownFile = false): string {
  if (isMarkdownFile) {
    // For markdown files, the key is the full path
    const parts = key.split("/")
    return parts[parts.length - 1] || "Root"
  } else {
    // For S3 items, remove trailing slash for folders
    const cleanKey = key.endsWith("/") ? key.slice(0, -1) : key
    // Get the last part of the path
    const parts = cleanKey.split("/")
    return parts[parts.length - 1] || "Root"
  }
}
