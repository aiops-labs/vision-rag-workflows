// If you haven't already, install: npm install @google-cloud/storage
import { Storage } from '@google-cloud/storage';

// You should set these environment variables or add to your config
const GCS_BUCKET = process.env['GCS_BUCKET'] as string;
const GCS_PROJECT_ID = process.env['GCS_PROJECT_ID'] as string;
const GCS_KEYFILE = process.env['GCS_KEYFILE'] as string; // Path to service account key JSON

if (!GCS_BUCKET || !GCS_PROJECT_ID || !GCS_KEYFILE) {
  throw new Error('Missing GCS configuration. Set GCS_BUCKET, GCS_PROJECT_ID, and GCS_KEYFILE env vars.');
}

export const gcsClient = new Storage({
  projectId: GCS_PROJECT_ID,
  keyFilename: GCS_KEYFILE,
});

export async function uploadBufferToGCS(buffer: Buffer, destination: string, contentType: string): Promise<string> {
  const bucket = gcsClient.bucket(GCS_BUCKET);
  const file = bucket.file(destination);
  await file.save(buffer, {
    contentType,
    public: true,
    resumable: false,
  });
  // Make the file public
  await file.makePublic();
  // Return the public URL
  return `https://storage.googleapis.com/${GCS_BUCKET}/${destination}`;
} 