import { NextResponse } from "next/server";
import simpleGit from "simple-git";

const git = simpleGit();

export async function POST(request: Request) {
  try {
    const { branchName } = await request.json();

    if (!branchName) {
      return NextResponse.json(
        { error: "Branch name is required" },
        { status: 400 }
      );
    }

    // Check for pending changes
    const status = await git.status();
    if (status.files.length > 0) {
      return NextResponse.json(
        {
          error:
            "Pending changes detected. Please commit or stash them before switching branches.",
        },
        { status: 409 }
      ); // 409 Conflict
    }

    // Switch branch
    await git.checkout(branchName);

    return NextResponse.json({
      success: true,
      message: `Switched to branch ${branchName}`,
    });
  } catch (error: any) {
    console.error("Failed to switch branch:", error);
    return NextResponse.json(
      { error: error.message || "Failed to switch branch" },
      { status: 500 }
    );
  }
}
