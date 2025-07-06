import { NextResponse } from 'next/server';

import { getGitInstanceForRequest } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const gitResult = getGitInstanceForRequest(request);
    if (gitResult.error) {
      return gitResult.error;
    }

    const { getGitInstanceForRepository } = await import('@/lib/git');
    const git = getGitInstanceForRepository(gitResult.repoId);

    const branchSummary = await git.branchLocal();
    const branchList = branchSummary.all.map((branchName) => ({
      name: branchName,
      isCurrent: branchName === branchSummary.current
    }));
    return NextResponse.json({ branches: branchList });
  } catch (error) {
    console.error('Failed to get git branches:', error);
    return NextResponse.json({ error: 'Failed to get git branches' }, { status: 500 });
  }
}
