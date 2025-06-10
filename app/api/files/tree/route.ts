import { NextResponse } from 'next/server';

import { FileOperations } from '@/lib/file-operations';

export async function GET(_request: Request) {
  const fileOps = new FileOperations();
  const result = await fileOps.getFileTree();

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: result.statusCode });
  }

  return NextResponse.json(result.data);
}
