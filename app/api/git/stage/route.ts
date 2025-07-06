import { NextResponse } from 'next/server';

import { getGitInstanceForRequest, validateGitRepository } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const gitResult = getGitInstanceForRequest(request);
    if (gitResult.error) {
      return gitResult.error;
    }

    const { getGitInstanceForRepository } = await import('@/lib/git');
    const git = getGitInstanceForRepository(gitResult.repoId);

    // Check if directory is a git repository
    const validation = await validateGitRepository(git);
    if (!validation.isValid) {
      return validation.error!;
    }

    // Stage all changes
    await git.add('.');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error staging changes:', error);
    return NextResponse.json({ error: 'Failed to stage changes' }, { status: 500 });
  }
}
