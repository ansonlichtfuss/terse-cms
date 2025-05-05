import { NextResponse } from "next/server"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

export async function POST(request: Request) {
  // Always use mock data in browser or if mock mode is enabled
  const useMock = isBrowser || request.headers.get("x-use-mock") === "true" || process.env.USE_MOCK_API === "true"

  if (useMock) {
    // In mock mode, just return success
    const { path, name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 })
    }

    const folderKey = path ? `${path}${name}/` : `${name}/`

    return NextResponse.json({
      success: true,
      key: folderKey,
    })
  }

  try {
    // Dynamically import AWS SDK only on the server
    const AWS = await import("@aws-sdk/client-s3")
    const S3Client = AWS.S3Client
    const PutObjectCommand = AWS.PutObjectCommand

    // Get S3 configuration from environment variables
    const S3_BUCKET = process.env.S3_BUCKET || ""
    const S3_REGION = process.env.S3_REGION || "us-east-1"
    const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || ""
    const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || ""

    // Create S3 client
    const s3Client = new S3Client({
      region: S3_REGION,
      credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
      },
    })

    const { path, name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 })
    }

    // Create folder key (S3 doesn't have folders, but we can use a trailing slash)
    const folderKey = path ? `${path}${name}/` : `${name}/`

    // Create an empty object with the folder key
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: folderKey,
      Body: "",
    })

    await s3Client.send(command)

    return NextResponse.json({
      success: true,
      key: folderKey,
    })
  } catch (error) {
    console.error("Error creating folder in S3:", error)
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 })
  }
}
