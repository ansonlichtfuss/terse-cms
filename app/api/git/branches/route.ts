import { NextResponse } from 'next/server';

import { createGitInstance } from '@/lib/git';

export async function GET(request: Request) {
  try {
    const git = await createGitInstance(request);

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
