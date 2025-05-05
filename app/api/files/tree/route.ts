import { NextResponse } from "next/server"
import { mockFileTree } from "@/lib/mock-data"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

interface FileNode {
  name: string
  path: string
  type: "file" | "directory"
  children?: FileNode[]
}

export async function GET(request: Request) {
  // Always use mock data in browser or if mock mode is enabled
  const useMock = isBrowser || request.headers.get("x-use-mock") === "true" || process.env.USE_MOCK_API === "true"

  if (useMock) {
    return NextResponse.json({ files: mockFileTree })
  }

  try {
    // Dynamically import Node.js modules only on the server
    const fs = await import("fs")
    const path = await import("path")

    // Get the root directory from environment variable or use a default
    const ROOT_DIR = process.env.MARKDOWN_ROOT_DIR || "/app/content"

    // Function to build the file tree
    const buildFileTree = (dir: string, basePath = ""): FileNode[] => {
      const entries = fs.readdirSync(dir, { withFileTypes: true })

      return entries
        .filter((entry) => {
          // Skip hidden files and directories
          if (entry.name.startsWith(".")) return false

          // Only include markdown files
          if (entry.isFile() && !entry.name.endsWith(".md")) return false

          return true
        })
        .map((entry) => {
          const relativePath = path.join(basePath, entry.name)
          const fullPath = path.join(dir, entry.name)

          if (entry.isDirectory()) {
            return {
              name: entry.name,
              path: relativePath,
              type: "directory",
              children: buildFileTree(fullPath, relativePath),
            }
          } else {
            return {
              name: entry.name,
              path: relativePath,
              type: "file",
            }
          }
        })
        .sort((a, b) => {
          // Sort directories first, then by name
          if (a.type === "directory" && b.type === "file") return -1
          if (a.type === "file" && b.type === "directory") return 1
          return a.name.localeCompare(b.name)
        })
    }

    // Check if root directory exists
    if (!fs.existsSync(ROOT_DIR)) {
      fs.mkdirSync(ROOT_DIR, { recursive: true })
    }

    const files = buildFileTree(ROOT_DIR)

    return NextResponse.json({ files })
  } catch (error) {
    console.error("Error reading file tree:", error)
    return NextResponse.json({ error: "Failed to read file tree" }, { status: 500 })
  }
}
