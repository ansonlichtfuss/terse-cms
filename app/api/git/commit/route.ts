import { NextResponse } from "next/server"

// Only import Node.js modules on the server
let simpleGit

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

if (!isBrowser) {
  // Only import these on the server
  const git = require("simple-git")
  simpleGit = git.simpleGit
}

// Get the root directory from environment variable or use a default
const ROOT_DIR = process.env.MARKDOWN_ROOT_DIR || "/app/content"

export async function POST(request: Request) {
  // Always use mock data in browser or if mock mode is enabled
  const useMock = isBrowser || request.headers.get("x-use-mock") === "true" || process.env.USE_MOCK_API === "true"

  if (useMock) {
    // In mock mode, just return success
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Commit message is required" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      commit: {
        commit: "mock-commit-hash",
        branch: "main",
        summary: {
          changes: 2,
          insertions: 10,
          deletions: 5,
        },
      },
    })
  }

  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Commit message is required" }, { status: 400 })
    }

    const git = simpleGit(ROOT_DIR)

    // Check if directory is a git repository
    const isRepo = await git.checkIsRepo()

    if (!isRepo) {
      return NextResponse.json({ error: "Not a git repository" }, { status: 400 })
    }

    // Add all changes
    await git.add(".")

    // Commit changes
    const commitResult = await git.commit(message)

    return NextResponse.json({
      success: true,
      commit: commitResult,
    })
  } catch (error) {
    console.error("Error committing changes:", error)
    return NextResponse.json({ error: "Failed to commit changes" }, { status: 500 })
  }
}
