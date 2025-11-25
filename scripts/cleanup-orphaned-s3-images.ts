/**
 * Cleanup script to find and delete orphaned images from S3
 *
 * This script:
 * 1. Fetches all images from the database (Media and HomePageImage)
 * 2. Lists all objects in S3 bucket
 * 3. Finds objects in S3 that are not referenced in the database
 * 4. Optionally deletes the orphaned objects
 *
 * Usage:
 *   ts-node scripts/cleanup-orphaned-s3-images.ts [--dry-run] [--delete]
 *
 *   --dry-run: Only list orphaned images without deleting (default)
 *   --delete: Actually delete the orphaned images
 */

import { ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../src/configs/s3";
import prisma from "../src/configs/db";

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
const DRY_RUN = !process.argv.includes("--delete");

interface OrphanedImage {
  key: string;
  url: string;
  size?: number;
  lastModified?: Date;
}

async function getAllDatabaseImageUrls(): Promise<Set<string>> {
  console.log("📊 Fetching all image URLs from database...");

  // Get all media URLs
  const mediaImages = await prisma.media.findMany({
    select: { url: true },
  });

  // Get all home page image URLs
  const homePageImages = await prisma.homePageImage.findMany({
    select: { imageUrl: true, mobileImageUrl: true },
  });

  const dbUrls = new Set<string>();

  // Add media URLs
  mediaImages.forEach((img) => {
    if (img.url) dbUrls.add(img.url);
  });

  // Add home page image URLs
  homePageImages.forEach((img) => {
    if (img.imageUrl) dbUrls.add(img.imageUrl);
    if (img.mobileImageUrl) dbUrls.add(img.mobileImageUrl);
  });

  console.log(`✅ Found ${dbUrls.size} image URLs in database`);
  return dbUrls;
}

async function getAllS3Objects(): Promise<OrphanedImage[]> {
  console.log("📦 Listing all objects in S3 bucket...");

  const s3Objects: OrphanedImage[] = [];
  let continuationToken: string | undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      ContinuationToken: continuationToken,
    });

    const response = await s3.send(command);

    if (response.Contents) {
      for (const object of response.Contents) {
        if (object.Key) {
          const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${object.Key}`;
          s3Objects.push({
            key: object.Key,
            url,
            size: object.Size,
            lastModified: object.LastModified,
          });
        }
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  console.log(`✅ Found ${s3Objects.length} objects in S3 bucket`);
  return s3Objects;
}

async function findOrphanedImages(): Promise<OrphanedImage[]> {
  const [dbUrls, s3Objects] = await Promise.all([
    getAllDatabaseImageUrls(),
    getAllS3Objects(),
  ]);

  console.log("\n🔍 Comparing S3 objects with database URLs...");

  const orphaned: OrphanedImage[] = [];

  for (const s3Obj of s3Objects) {
    // Check if this S3 object URL exists in database
    if (!dbUrls.has(s3Obj.url)) {
      orphaned.push(s3Obj);
    }
  }

  return orphaned;
}

async function deleteOrphanedImages(orphaned: OrphanedImage[]): Promise<void> {
  if (orphaned.length === 0) {
    console.log("\n✅ No orphaned images found!");
    return;
  }

  console.log(
    `\n${DRY_RUN ? "🔍 DRY RUN" : "🗑️  DELETING"} ${
      orphaned.length
    } orphaned images...`
  );

  let deleted = 0;
  let failed = 0;

  for (const image of orphaned) {
    try {
      if (!DRY_RUN) {
        const command = new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: image.key,
        });
        await s3.send(command);
      }
      deleted++;
      console.log(`${DRY_RUN ? "[DRY RUN]" : "✅"} Deleted: ${image.key}`);
    } catch (error) {
      failed++;
      console.error(`❌ Failed to delete ${image.key}:`, error);
    }
  }

  console.log(`\n${DRY_RUN ? "📊 DRY RUN SUMMARY" : "✅ DELETION SUMMARY"}:`);
  console.log(`   Total orphaned images: ${orphaned.length}`);
  console.log(`   ${DRY_RUN ? "Would delete" : "Deleted"}: ${deleted}`);
  console.log(`   Failed: ${failed}`);

  // Calculate total size
  const totalSize = orphaned.reduce((sum, img) => sum + (img.size || 0), 0);
  const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
  console.log(`   Total size: ${sizeInMB} MB`);
}

async function main() {
  console.log("🚀 Starting S3 orphaned images cleanup...\n");
  console.log(`Mode: ${DRY_RUN ? "DRY RUN (no deletions)" : "DELETE MODE"}\n`);

  try {
    const orphaned = await findOrphanedImages();

    if (orphaned.length > 0) {
      console.log(`\n⚠️  Found ${orphaned.length} orphaned images:`);
      orphaned.slice(0, 10).forEach((img) => {
        console.log(`   - ${img.key}`);
      });
      if (orphaned.length > 10) {
        console.log(`   ... and ${orphaned.length - 10} more`);
      }

      await deleteOrphanedImages(orphaned);
    } else {
      console.log("\n✅ No orphaned images found! S3 bucket is clean.");
    }
  } catch (error) {
    console.error("\n❌ Error during cleanup:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main();
