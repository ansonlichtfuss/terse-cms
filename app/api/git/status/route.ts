import { NextResponse } from 'next/server';

export async function GET(_request: Request) {
  try {
    // Dynamically import simple-git only on the server
    const { simpleGit } = await import('simple-git');
    const { getMarkdownRootDir: getActualMarkdownRootDir } = await import('@/lib/paths');

    const git = simpleGit(getActualMarkdownRootDir());

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
