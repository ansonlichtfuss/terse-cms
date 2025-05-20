import { NextResponse } from "next/server";

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Get the root directory from environment variable or use a default
const ROOT_DIR = process.env.MARKDOWN_ROOT_DIR || "/app/content";

export async function POST(request: Request) {
  // Always use mock data in browser or if mock mode is enabled
  const useMock =
    isBrowser ||
    request.headers.get("x-use-mock") === "true" ||
    process.env.USE_MOCK_API === "true";

  try {
    // Dynamically import simple-git only on the server
    const { simpleGit } = await import("simple-git");

    const git = simpleGit("./mock-data");

    // Check if directory is a git repository
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      return NextResponse.json(
        { error: "Not a git repository" },
        { status: 400 },
      );
    }

    // Discard all changes
    await git.reset("hard" as any);
    await git.clean("f", ["-d"]);

    return NextResponse.json({
      success: true,
      message: "Changes reverted successfully",
    });
  } catch (error) {
    console.error("Error reverting changes:", error);
    return NextResponse.json(
      { error: "Failed to revert changes" },
      { status: 500 },
    );
  }
}
