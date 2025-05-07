import { NextResponse } from "next/server";

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get("path");

  if (!filePath) {
    return NextResponse.json(
      { error: "Path parameter is required" },
      { status: 400 }
    );
  }

  // Always use mock data in browser or if mock mode is enabled
  const useMock =
    isBrowser ||
    request.headers.get("x-use-mock") === "true" ||
    process.env.USE_MOCK_API === "true";

  // Dynamically import Node.js modules only on the server
  const fs = await import("fs");
  const path = await import("path");

  if (useMock) {
    const MOCK_ROOT_DIR = "mock-data/filesystem";
    const fullPath = path.join(MOCK_ROOT_DIR, filePath);

    // Check if file exists in mock filesystem
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: "File not found in mock filesystem" },
        { status: 404 }
      );
    }

    // Read file content from mock filesystem
    const fileContent = fs.readFileSync(fullPath, "utf8");

    return NextResponse.json({
      path: filePath,
      content: fileContent,
    });
  }

  try {
    // Get the root directory from environment variable or use a default
    const ROOT_DIR = process.env.MARKDOWN_ROOT_DIR || "/app/content";

    const fullPath = path.join(ROOT_DIR, filePath);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read file content
    const fileContent = fs.readFileSync(fullPath, "utf8");

    return NextResponse.json({
      path: filePath,
      content: fileContent,
    });
  } catch (error) {
    console.error("Error reading file:", error);
    return NextResponse.json({ error: "Failed to read file" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { path: filePath, content } = await request.json();

    if (!filePath) {
      return NextResponse.json(
        { error: "Path parameter is required" },
        { status: 400 }
      );
    }

    // Always use mock data in browser or if mock mode is enabled
    const useMock =
      isBrowser ||
      request.headers.get("x-use-mock") === "true" ||
      process.env.USE_MOCK_API === "true";

    // Dynamically import Node.js modules only on the server
    const fs = await import("fs");
    const path = await import("path");

    if (useMock) {
      const MOCK_ROOT_DIR = "mock-data/filesystem";
      const fullPath = path.join(MOCK_ROOT_DIR, filePath);

      // Create directory if it doesn't exist in mock filesystem
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write file to mock filesystem
      fs.writeFileSync(fullPath, content, "utf8");

      return NextResponse.json({ success: true });
    }

    // Get the root directory from environment variable or use a default
    const ROOT_DIR = process.env.MARKDOWN_ROOT_DIR || "/app/content";

    const fullPath = path.join(ROOT_DIR, filePath);

    // Create directory if it doesn't exist
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(fullPath, content, "utf8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving file:", error);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { path: filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json(
        { error: "Path parameter is required" },
        { status: 400 }
      );
    }

    // Always use mock data in browser or if mock mode is enabled
    const useMock =
      isBrowser ||
      request.headers.get("x-use-mock") === "true" ||
      process.env.USE_MOCK_API === "true";

    // Dynamically import Node.js modules only on the server
    const fs = await import("fs");
    const path = await import("path");

    if (useMock) {
      const MOCK_ROOT_DIR = "mock-data/filesystem";
      const fullPath = path.join(MOCK_ROOT_DIR, filePath);

      // Check if file exists in mock filesystem
      if (!fs.existsSync(fullPath)) {
        return NextResponse.json(
          { error: "File not found in mock filesystem" },
          { status: 404 }
        );
      }

      // Check if it's a directory in mock filesystem
      const isDirectory = fs.lstatSync(fullPath).isDirectory();

      if (isDirectory) {
        // Remove directory recursively from mock filesystem
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        // Remove file from mock filesystem
        fs.unlinkSync(fullPath);
      }

      return NextResponse.json({ success: true });
    }

    // Get the root directory from environment variable or use a default
    const ROOT_DIR = process.env.MARKDOWN_ROOT_DIR || "/app/content";

    const fullPath = path.join(ROOT_DIR, filePath);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Check if it's a directory
    const isDirectory = fs.lstatSync(fullPath).isDirectory();

    if (isDirectory) {
      // Remove directory recursively
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else {
      // Remove file
      fs.unlinkSync(fullPath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
