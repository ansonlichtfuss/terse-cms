import { NextResponse } from 'next/server';

export async function POST(_request: Request) {
  try {
    // Dynamically import simple-git only on the server
    const { getGitInstance } = await import('@/lib/git');

    const git = getGitInstance();

    // Check if directory is a git repository
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      return NextResponse.json({ error: 'Not a git repository' }, { status: 400 });
    }

    // Discard all changes
    await git.reset('hard' as any);
    await git.clean('f', ['-d']);

    return NextResponse.json({
      success: true,
      message: 'Changes reverted successfully'
    });
  } catch (error) {
    console.error('Error reverting changes:', error);
    return NextResponse.json({ error: 'Failed to revert changes' }, { status: 500 });
  }
}
