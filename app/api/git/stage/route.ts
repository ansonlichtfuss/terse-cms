import { NextResponse } from 'next/server';

import { getGitInstance } from '@/lib/git';

export async function POST() {
  try {
    const git = getGitInstance(); // Assuming the git repo is in mock-data as per status endpoint

    // Check if directory is a git repository
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      return NextResponse.json({ error: 'Not a git repository' }, { status: 400 });
    }

    // Stage all changes
    await git.add('.');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error staging changes:', error);
    return NextResponse.json({ error: 'Failed to stage changes' }, { status: 500 });
  }
}
