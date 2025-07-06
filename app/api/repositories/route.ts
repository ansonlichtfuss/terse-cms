import { NextResponse } from 'next/server';

import { getRepositoryConfig } from '@/lib/paths';

export async function GET() {
  try {
    const repositories = getRepositoryConfig();

    return NextResponse.json({
      repositories: repositories.map((repo) => ({
        id: repo.id,
        label: repo.label,
        path: repo.path
      }))
    });
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
  }
}
