import { randomUUID } from 'node:crypto';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { env, isR2Configured } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

let client: S3Client | null = null;

const getClient = (): S3Client => {
  if (!isR2Configured) {
    throw new ApiError(503, 'Skladište slika (Cloudflare R2) nije podešeno');
  }
  client ??= new S3Client({
    region: 'auto',
    endpoint: `https://${env.r2.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: env.r2.accessKeyId, secretAccessKey: env.r2.secretAccessKey },
  });
  return client;
};

const EXTENSIONS: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg' };

/** Verifies the real file type from its magic bytes (the client-sent mimetype can't be trusted). */
const detectImageType = (buffer: Buffer): 'image/png' | 'image/jpeg' | null => {
  if (buffer.length > 8 && buffer.readUInt32BE(0) === 0x89504e47) return 'image/png';
  if (buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  return null;
};

export interface StoredFile {
  key: string;
  url: string;
}

export const uploadImage = async (buffer: Buffer, folder: string): Promise<StoredFile> => {
  const contentType = detectImageType(buffer);
  if (!contentType) {
    throw new ApiError(400, 'Dozvoljene su samo PNG i JPG slike');
  }

  const key = `${env.r2.prefix}/${folder}/${randomUUID()}.${EXTENSIONS[contentType]}`;
  await getClient().send(
    new PutObjectCommand({
      Bucket: env.r2.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );

  return { key, url: `${env.r2.publicUrl}/${key}` };
};

/** Deletes a file; failures are logged, not thrown, so a missing object never blocks deleting a record. */
export const deleteFile = async (key: string | undefined | null): Promise<void> => {
  if (!key || !isR2Configured) return;
  try {
    await getClient().send(new DeleteObjectCommand({ Bucket: env.r2.bucket, Key: key }));
  } catch (err) {
    console.error(`Failed to delete R2 object ${key}:`, err);
  }
};

/** Downloads a file as a Buffer, or returns null if it can't be read. */
export const getFileBuffer = async (key: string): Promise<Buffer | null> => {
  try {
    const result = await getClient().send(new GetObjectCommand({ Bucket: env.r2.bucket, Key: key }));
    if (!result.Body) return null;
    return Buffer.from(await result.Body.transformToByteArray());
  } catch (err) {
    console.error(`Failed to read R2 object ${key}:`, err);
    return null;
  }
};
