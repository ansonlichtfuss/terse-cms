import { NextResponse } from 'next/server';

import { createGitInstance } from '@/lib/git';

export async function POST(request: Request) {
  try {
    const git = await createGitInstance(request);

    // Stage all changes
    await git.add('.');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error staging changes:', error);
    return NextResponse.json({ error: 'Failed to stage changes' }, { status: 500 });
  }
}
