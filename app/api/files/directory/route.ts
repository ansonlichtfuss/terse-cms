import { NextRequest, NextResponse } from 'next/server';

import { getFileOperationsForRequest } from '@/lib/api/shared/file-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '';

    const fileOpsOrError = getFileOperationsForRequest(request);
    if (fileOpsOrError instanceof NextResponse) {
      return fileOpsOrError;
    }

    const result = await fileOpsOrError.getDirectoryContents(path);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in directory API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
