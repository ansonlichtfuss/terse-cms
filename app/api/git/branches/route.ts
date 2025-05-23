import { NextResponse } from 'next/server';
import simpleGit from 'simple-git';

import { getMarkdownRootDir } from '@/lib/paths';

const git = simpleGit(getMarkdownRootDir());

export async function GET() {
  try {
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
