import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import path from 'path';
import sharp from 'sharp';
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
   * Optimize image (resize + compress to WebP) and upload to Cloudflare R2
   */
  async uploadImage(buffer, originalFilename, mimeType, folder = 'products') {
    const randomKey = crypto.randomBytes(16).toString('hex');
    const isSvg = mimeType === 'image/svg+xml' || (originalFilename && originalFilename.toLowerCase().endsWith('.svg'));

    let finalBuffer = buffer;
    let finalMimeType = mimeType || 'image/jpeg';
    let ext = '.webp';

    if (isSvg) {
      ext = '.svg';
      finalMimeType = 'image/svg+xml';
    } else {
      // Process and convert to WebP with Sharp
      try {
        const originalSize = buffer.length;
        finalBuffer = await sharp(buffer)
          .rotate() // auto-orient based on EXIF
          .resize(1600, 1600, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 82, effort: 4 })
          .toBuffer();

        finalMimeType = 'image/webp';
        ext = '.webp';

        const compressedSize = finalBuffer.length;
        const reductionPercent = originalSize > 0 ? Math.round(((originalSize - compressedSize) / originalSize) * 100) : 0;
        logger.info(
          `Image optimized: ${Math.round(originalSize / 1024)}KB -> ${Math.round(compressedSize / 1024)}KB (${reductionPercent}% reduced) as .webp`
        );
      } catch (sharpErr) {
        logger.warn(`Sharp WebP optimization fallback: ${sharpErr.message}`);
        ext = path.extname(originalFilename || '').toLowerCase() || '.jpg';
      }
    }

    const key = `${folder}/${Date.now()}-${randomKey}${ext}`;
    const client = getR2Client();

    if (client && env.CLOUDFLARE_R2_BUCKET) {
      try {
        await client.send(
          new PutObjectCommand({
            Bucket: env.CLOUDFLARE_R2_BUCKET,
            Key: key,
            Body: finalBuffer,
            ContentType: finalMimeType,
          })
        );

        const publicUrl = `${env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
        logger.info(`Uploaded optimized file to Cloudflare R2: ${publicUrl}`);
        return {
          imageUrl: publicUrl,
          r2Key: key,
          format: ext.replace('.', ''),
          sizeBytes: finalBuffer.length,
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
      format: ext.replace('.', ''),
      sizeBytes: finalBuffer.length,
    };
  },

  /**
   * Delete object from R2 bucket (accepts key or full URL)
   */
  async deleteImage(keyOrUrl) {
    if (!keyOrUrl) return;

    let r2Key = keyOrUrl;
    if (typeof r2Key === 'string' && (r2Key.startsWith('http://') || r2Key.startsWith('https://'))) {
      try {
        const u = new URL(r2Key);
        r2Key = u.pathname.startsWith('/') ? u.pathname.substring(1) : u.pathname;
      } catch {
        // ignore parse error
      }
    }

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

  /**
   * Batch delete multiple objects from R2 bucket
   */
  async deleteMultipleImages(keysOrUrls = []) {
    if (!Array.isArray(keysOrUrls) || keysOrUrls.length === 0) return;
    await Promise.all(
      keysOrUrls.map((k) =>
        this.deleteImage(k).catch((e) =>
          logger.warn(`Batch delete R2 image failed: ${e.message}`)
        )
      )
    );
  },
};

export default r2Service;
