import { NextResponse } from 'next/server';
import simpleGit from 'simple-git';

import { getMarkdownRootDir } from '@/lib/paths';

const git = simpleGit(getMarkdownRootDir());

export async function GET() {
  try {
    const branchSummary = await git.branchLocal();
    const currentBranch = branchSummary.current;
    return NextResponse.json({ branch: currentBranch });
  } catch (error) {
    console.error('Failed to get git branch:', error);
    return NextResponse.json({ error: 'Failed to get git branch' }, { status: 500 });
  }
}
