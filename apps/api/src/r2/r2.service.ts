import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class R2Service {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async uploadFile(fileBuffer: Buffer, key: string, mimeType: string): Promise<string> {
    const bucketName = process.env.R2_BUCKET_NAME || 'kindred';
    const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-d33c13728d81440088421e0298b11617.r2.dev';

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
      })
    );

    // Normalize public URL endpoint and append resource key path
    const normalizedBaseUrl = publicUrl.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl;
    return `${normalizedBaseUrl}/${key}`;
  }
}
