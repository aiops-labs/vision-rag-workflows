import { Storage } from '@google-cloud/storage';

export class GCSService {
  private storage: Storage;
  private bucketName: string;

  constructor() {
    this.storage = new Storage();
    this.bucketName = process.env.GCS_BUCKET_NAME || 'vision-rag-bucket';
  }

  async uploadBuffer(
    buffer: Buffer,
    fileName: string,
    contentType: string,
    userId: string,
    namespace: string
  ): Promise<{ gcsUrl: string; base64: string }> {
    try {
      // Create file path with userId and namespace prefix
      const filePath = `${namespace}/${userId}/${Date.now()}-${fileName}`;
      
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(filePath);

      // Upload buffer to GCS
      await file.save(buffer, {
        metadata: {
          contentType,
        },
      });

      // Generate GCS URL
      const gcsUrl = `gs://${this.bucketName}/${filePath}`;
      
      // Convert buffer to base64
      const base64 = `data:${contentType};base64,${buffer.toString('base64')}`;

      return {
        gcsUrl,
        base64
      };
    } catch (error) {
      console.error('GCS upload error:', error);
      throw new Error('Failed to upload file to GCS');
    }
  }
}

export const gcsService = new GCSService();
