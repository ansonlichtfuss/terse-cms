import { NextResponse } from 'next/server';

import { getFileOperationsForRequest } from '@/lib/api';

export async function GET(request: Request) {
  const fileOpsOrError = getFileOperationsForRequest(request);
  if (fileOpsOrError instanceof NextResponse) {
    return fileOpsOrError;
  }

  const result = await fileOpsOrError.getFileTree();

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: result.statusCode });
  }

  return NextResponse.json(result.data);
}
