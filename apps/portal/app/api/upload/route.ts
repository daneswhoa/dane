import { Storage } from '@google-cloud/storage';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Filename and contentType are required' }, { status: 400 });
    }

    let storageOptions: any = {
      projectId: process.env.GCS_PROJECT_ID || 'landlordhungary',
    };

    if (process.env.GCP_CREDENTIALS) {
      try {
        storageOptions.credentials = JSON.parse(process.env.GCP_CREDENTIALS);
        storageOptions.projectId = storageOptions.credentials.project_id;
      } catch (err: any) {
        console.error('Failed to parse GCP_CREDENTIALS environment variable as JSON:', err.message);
      }
    } else {
      // Resolve key path
      const keyPath = path.resolve(process.cwd(), 'secrets/gcp-service-account.json');
      if (fs.existsSync(keyPath)) {
        storageOptions.keyFilename = keyPath;
      } else {
        console.warn('GCP credentials not found in env or file. Using mock URL for local development.');
        const mockUrl = `https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400&h=400`;
        return NextResponse.json({ uploadUrl: '', publicUrl: mockUrl });
      }
    }

    const storage = new Storage(storageOptions);

    const bucketName = process.env.GCS_BUCKET_NAME || 'landlordhu-property-asset';
    const bucket = storage.bucket(bucketName);
    
    // Unique file name to prevent collisions - store in tenant-profiles directory
    const gcsFilename = `tenant-profiles/${Date.now()}_${filename.replace(/\s+/g, '_')}`;
    const file = bucket.file(gcsFilename);

    // Generate V4 signed URL
    const [uploadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: contentType,
    });

    // Public GCS URL format
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${gcsFilename}`;

    return NextResponse.json({ uploadUrl, publicUrl });
  } catch (error: any) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
