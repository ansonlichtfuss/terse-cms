import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Commit message is required' }, { status: 400 });
    }

    // Dynamically import simple-git only on the server
    const { simpleGit } = await import('simple-git');
    const { getMarkdownRootDir: getActualMarkdownRootDir } = await import('@/lib/paths');

    const git = simpleGit(getActualMarkdownRootDir());

    // Check if directory is a git repository
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      return NextResponse.json({ error: 'Not a git repository' }, { status: 400 });
    }

    // Add all changes
    await git.add('.');

    // Commit changes
    const commitResult = await git.commit(message);

    return NextResponse.json({
      success: true,
      commit: commitResult
    });
  } catch (error) {
    console.error('Error committing changes:', error);
    return NextResponse.json({ error: 'Failed to commit changes' }, { status: 500 });
  }
}
