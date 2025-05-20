import { NextResponse } from "next/server";

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

export async function POST(request: Request) {
  // Always use mock data in browser or if mock mode is enabled
  const useMock =
    isBrowser ||
    request.headers.get("x-use-mock") === "true" ||
    process.env.USE_MOCK_API === "true";

  try {
    const { operation, sourcePath, destinationPath, newName, type } =
      await request.json();

    if (!sourcePath) {
      return NextResponse.json(
        { error: "Source path is required" },
        { status: 400 },
      );
    }

    // Dynamically import Node.js modules only on the server
    const fs = await import("fs");
    const path = await import("path");

    // Get the root directory from environment variable or use a default
    const ROOT_DIR = process.env.MARKDOWN_ROOT_DIR || "mock-data/filesystem";

    const fullSourcePath = path.join(ROOT_DIR, sourcePath);

    // Check if source exists
    if (!fs.existsSync(fullSourcePath)) {
      return NextResponse.json(
        { error: "Source file not found" },
        { status: 404 },
      );
    }

    if (operation === "move") {
      if (!destinationPath) {
        return NextResponse.json(
          { error: "Destination path is required" },
          { status: 400 },
        );
      }

      const fullDestPath = path.join(ROOT_DIR, destinationPath);

      // Create destination directory if it doesn't exist
      if (!fs.existsSync(fullDestPath)) {
        fs.mkdirSync(fullDestPath, { recursive: true });
      }

      const fileName = path.basename(fullSourcePath);
      const newFilePath = path.join(fullDestPath, fileName);

      // Move the file
      fs.renameSync(fullSourcePath, newFilePath);

      return NextResponse.json({
        success: true,
        message: `${
          type === "directory" ? "Folder" : "File"
        } moved successfully`,
      });
    } else if (operation === "rename") {
      if (!newName) {
        return NextResponse.json(
          { error: "New name is required" },
          { status: 400 },
        );
      }

      const dirName = path.dirname(fullSourcePath);
      const newFilePath = path.join(dirName, newName);

      // Rename the file
      fs.renameSync(fullSourcePath, newFilePath);

      return NextResponse.json({
        success: true,
        message: `${
          type === "directory" ? "Folder" : "File"
        } renamed successfully`,
      });
    } else {
      return NextResponse.json({ error: "Invalid operation" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error performing file operation:", error);
    return NextResponse.json(
      { error: "Failed to perform operation" },
      { status: 500 },
    );
  }
}
