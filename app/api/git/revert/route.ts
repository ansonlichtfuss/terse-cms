import { NextResponse } from 'next/server';
import { ResetMode } from 'simple-git';

import { getGitInstanceForRequest, validateGitRepository } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const gitResult = getGitInstanceForRequest(request);
    if (gitResult.error) {
      return gitResult.error;
    }

    // Dynamically import simple-git only on the server
    const { getGitInstanceForRepository } = await import('@/lib/git');

    const git = getGitInstanceForRepository(gitResult.repoId);

    // Check if directory is a git repository
    const validation = await validateGitRepository(git);
    if (!validation.isValid) {
      return validation.error!;
    }

    // Discard all changes
    await git.reset('hard' as ResetMode);
    await git.clean('f', ['-d']);

    return NextResponse.json({
      success: true,
      message: 'Changes reverted'
    });
  } catch (error) {
    console.error('Error reverting changes:', error);
    return NextResponse.json({ error: 'Failed to revert changes' }, { status: 500 });
  }
}
