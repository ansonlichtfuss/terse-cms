import { NextResponse } from 'next/server';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export async function POST(request: Request) {
  // Always use mock data in browser or if mock mode is enabled
  const useMock = isBrowser || process.env.USE_MOCK_API === 'true';

  if (useMock) {
    // In mock mode, generate a fake URL and return success
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = (formData.get('path') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = file.name;
    const key = path ? `${path}${fileName}` : fileName;

    return NextResponse.json({
      success: true,
      key,
      url: `https://placehold.co/600x400/EEE/31343C?text=${encodeURIComponent(fileName)}`
    });
  }

  try {
    // Dynamically import AWS SDK only on the server
    const AWS = await import('@aws-sdk/client-s3');
    const S3Client = AWS.S3Client;
    const PutObjectCommand = AWS.PutObjectCommand;

    // Get S3 configuration from environment variables
    const S3_BUCKET = process.env.S3_BUCKET || '';
    const S3_REGION = process.env.S3_REGION || 'us-east-1';
    const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || '';
    const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || '';

    // Create S3 client
    const s3Client = new S3Client({
      region: S3_REGION,
      credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY
      }
    });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = (formData.get('path') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate a unique filename
    const fileName = file.name;
    const key = path ? `${path}${fileName}` : fileName;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type
    });

    await s3Client.send(command);

    return NextResponse.json({
      success: true,
      key,
      url: `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`
    });
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
