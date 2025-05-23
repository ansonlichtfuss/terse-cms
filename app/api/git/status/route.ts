import { NextResponse } from 'next/server';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Get the root directory from environment variable or use a default
const ROOT_DIR = process.env.MARKDOWN_ROOT_DIR || '/app/content';

export async function GET(request: Request) {
  // Always use mock data in browser or if mock mode is enabled
  const useMock = isBrowser || request.headers.get('x-use-mock') === 'true' || process.env.USE_MOCK_API === 'true';

  try {
    // Dynamically import simple-git only on the server
    const { simpleGit } = await import('simple-git');

    const git = simpleGit('./mock-data');

    // Check if directory is a git repository
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      return NextResponse.json({ error: 'Not a git repository' }, { status: 400 });
    }

    // Get status
    const status = await git.status();

    // Get modified files
    const modifiedFiles = [
      ...status.modified,
      ...status.not_added,
      ...status.created,
      ...status.deleted,
      ...status.renamed.map((file) => file.to)
    ];

    return NextResponse.json({
      modifiedFiles,
      isClean: status.isClean()
    });
  } catch (error) {
    console.error('Error getting git status:', error);
    return NextResponse.json({ error: 'Failed to get git status' }, { status: 500 });
  }
}
