import { NextResponse } from 'next/server';
import { simpleGit } from 'simple-git';

// Get the root directory from environment variable or use a default
const ROOT_DIR = process.env.MARKDOWN_ROOT_DIR || '/app/content';

export async function POST() {
  try {
    const git = simpleGit('./mock-data'); // Assuming the git repo is in mock-data as per status endpoint

    // Check if directory is a git repository
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      return NextResponse.json({ error: 'Not a git repository' }, { status: 400 });
    }

    // Stage all changes
    await git.add('.');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error staging changes:', error);
    return NextResponse.json({ error: 'Failed to stage changes' }, { status: 500 });
  }
}
