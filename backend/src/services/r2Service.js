import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import path from 'path';
import env from '../config/env.js';
import logger from '../config/logger.js';
import AppError from '../utils/customError.js';

let s3Client = null;

function getR2Client() {
  if (s3Client) return s3Client;

  if (env.CLOUDFLARE_R2_ACCOUNT_ID && env.CLOUDFLARE_R2_ACCESS_KEY_ID && env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      },
    });
    logger.info('Cloudflare R2 S3 Client configured successfully');
  }

  return s3Client;
}

export const r2Service = {
  /**
   * Upload image buffer to Cloudflare R2
   */
  async uploadImage(buffer, originalFilename, mimeType, folder = 'products') {
    const ext = path.extname(originalFilename || '').toLowerCase() || '.jpg';
    const randomKey = crypto.randomBytes(16).toString('hex');
    const key = `${folder}/${Date.now()}-${randomKey}${ext}`;

    const client = getR2Client();

    if (client && env.CLOUDFLARE_R2_BUCKET) {
      try {
        await client.send(
          new PutObjectCommand({
            Bucket: env.CLOUDFLARE_R2_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: mimeType || 'image/jpeg',
          })
        );

        const publicUrl = `${env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
        logger.info(`Uploaded file to Cloudflare R2: ${publicUrl}`);
        return {
          imageUrl: publicUrl,
          r2Key: key,
        };
      } catch (err) {
        logger.error(`Failed to upload to Cloudflare R2: ${err.message}`);
        throw AppError.internal('Failed to upload image to storage');
      }
    }

    // Development fallback: generate simulated storage URL
    const fallbackUrl = `https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80&key=${encodeURIComponent(key)}`;
    logger.info(`[R2 DEV FALLBACK] Generated media reference: ${fallbackUrl}`);
    return {
      imageUrl: fallbackUrl,
      r2Key: key,
    };
  },

  /**
   * Delete object from R2 bucket
   */
  async deleteImage(r2Key) {
    if (!r2Key) return;
    const client = getR2Client();
    if (client && env.CLOUDFLARE_R2_BUCKET) {
      try {
        await client.send(
          new DeleteObjectCommand({
            Bucket: env.CLOUDFLARE_R2_BUCKET,
            Key: r2Key,
          })
        );
        logger.info(`Deleted file from Cloudflare R2: ${r2Key}`);
      } catch (err) {
        logger.warn(`Failed to delete file from Cloudflare R2 (${r2Key}): ${err.message}`);
      }
    }
  },
};

export default r2Service;
