import { NextResponse } from 'next/server';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export async function POST(request: Request) {
  // Always use mock data in browser or if mock mode is enabled
  const useMock = isBrowser || request.headers.get('x-use-mock') === 'true' || process.env.USE_MOCK_API === 'true';

  try {
    const { operation, sourceKey, destinationKey } = await request.json();

    if (!sourceKey) {
      return NextResponse.json({ error: 'Source key is required' }, { status: 400 });
    }

    if (operation === 'move' || operation === 'rename') {
      if (!destinationKey) {
        return NextResponse.json({ error: 'Destination key is required' }, { status: 400 });
      }

      if (useMock) {
        // In mock mode, just return success
        return NextResponse.json({
          success: true,
          message: `File ${operation === 'move' ? 'moved' : 'renamed'} successfully`
        });
      }

      // Dynamically import AWS SDK only on the server
      const AWS = await import('@aws-sdk/client-s3');
      const S3Client = AWS.S3Client;
      const CopyObjectCommand = AWS.CopyObjectCommand;
      const DeleteObjectCommand = AWS.DeleteObjectCommand;

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

      // Copy the object to the new location
      const copyCommand = new CopyObjectCommand({
        Bucket: S3_BUCKET,
        CopySource: `${S3_BUCKET}/${sourceKey}`,
        Key: destinationKey
      });

      await s3Client.send(copyCommand);

      // Delete the original object
      const deleteCommand = new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: sourceKey
      });

      await s3Client.send(deleteCommand);

      return NextResponse.json({
        success: true,
        message: `File ${operation === 'move' ? 'moved' : 'renamed'} successfully`
      });
    } else {
      return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error performing S3 operation:', error);
    return NextResponse.json({ error: 'Failed to perform operation' }, { status: 500 });
  }
}
