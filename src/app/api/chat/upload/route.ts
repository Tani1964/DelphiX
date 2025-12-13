import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to base64 data URL for Vercel/serverless compatibility
    // Vercel serverless functions have a read-only filesystem, so we can't write files
    // Instead, we return a base64 data URL that can be used directly
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type || 'application/octet-stream';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Return data URL instead of filesystem path
    // The client and other APIs can use this directly
    return NextResponse.json({ 
      url: dataUrl, 
      type,
      // Also provide a reference URL for backwards compatibility
      reference: `data:${mimeType};base64,${base64.substring(0, 50)}...`
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

