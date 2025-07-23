import { NextResponse } from 'next/server';

import { getFileOperationsForRequest, validateRequiredParam } from '@/lib/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('path');

  const validationError = validateRequiredParam(filePath, 'Path parameter');
  if (validationError) {
    return validationError;
  }

  const fileOpsOrError = getFileOperationsForRequest(request);
  if (fileOpsOrError instanceof NextResponse) {
    return fileOpsOrError;
  }

  const result = await fileOpsOrError.readFile(filePath!);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: result.statusCode });
  }

  return NextResponse.json(result.data);
}

export async function POST(request: Request) {
  try {
    const { path: filePath, content } = await request.json();

    const validationError = validateRequiredParam(filePath, 'Path parameter');
    if (validationError) {
      return validationError;
    }

    const fileOpsOrError = getFileOperationsForRequest(request);
    if (fileOpsOrError instanceof NextResponse) {
      throw fileOpsOrError;
    }

    const result = await fileOpsOrError.writeFile(filePath, content);

    if (!result.success) {
      throw result;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error parsing request:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { path: filePath } = await request.json();

    const validationError = validateRequiredParam(filePath, 'Path parameter');
    if (validationError) {
      return validationError;
    }

    const fileOpsOrError = getFileOperationsForRequest(request);
    if (fileOpsOrError instanceof NextResponse) {
      return fileOpsOrError;
    }

    const result = await fileOpsOrError.deleteFile(filePath);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error parsing request:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
