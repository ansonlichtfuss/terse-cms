import { NextResponse } from 'next/server';

import { getGitInstanceForRequest } from '@/lib/api';
import { getGitInstanceForRepository } from '@/lib/git';

export async function GET(request: Request) {
  try {
    const gitResult = getGitInstanceForRequest(request);
    if (gitResult.error) {
      return gitResult.error;
    }

    const git = getGitInstanceForRepository(gitResult.repoId);

    const branchSummary = await git.branchLocal();
    const currentBranch = branchSummary.current;
    return NextResponse.json({ branch: currentBranch });
  } catch (error) {
    console.error('Failed to get git branch:', error);
    return NextResponse.json({ error: 'Failed to get git branch' }, { status: 500 });
  }
}
