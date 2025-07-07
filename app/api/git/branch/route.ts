import { NextResponse } from 'next/server';

import { createGitInstance } from '@/lib/git';

export async function GET(request: Request) {
  try {
    const git = await createGitInstance(request);

    const branchSummary = await git.branchLocal();
    const currentBranch = branchSummary.current;
    return NextResponse.json({ branch: currentBranch });
  } catch (error) {
    console.error('Failed to get git branch:', error);
    return NextResponse.json({ error: 'Failed to get git branch' }, { status: 500 });
  }
}
