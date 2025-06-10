import { NextResponse } from 'next/server';

import { FileOperations } from '@/lib/api/files/file-operations';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('path');

  if (!filePath) {
    return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 });
  }

  const fileOps = new FileOperations();
  const result = await fileOps.readFile(filePath);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: result.statusCode });
  }

  return NextResponse.json(result.data);
}

export async function POST(request: Request) {
  try {
    const { path: filePath, content } = await request.json();

    if (!filePath) {
      return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 });
    }

    const fileOps = new FileOperations();
    const result = await fileOps.writeFile(filePath, content);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode });
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

    if (!filePath) {
      return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 });
    }

    const fileOps = new FileOperations();
    const result = await fileOps.deleteFile(filePath);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error parsing request:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
