import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "@/configs/s3";

/**
 * Delete an image from S3 bucket
 * @param s3Url - Full S3 URL (e.g., https://bucket.s3.region.amazonaws.com/folder/file.jpg)
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export const deleteFromS3 = async (s3Url: string): Promise<boolean> => {
  try {
    if (!s3Url) {
      console.warn("No S3 URL provided for deletion");
      return false;
    }

    // Skip if it's not an S3 URL (e.g., local public folder paths)
    if (!s3Url.includes("s3") && !s3Url.includes("amazonaws.com")) {
      console.log("Skipping deletion - not an S3 URL:", s3Url);
      return false;
    }

    // Extract the key from the S3 URL
    // URL format: https://bucket.s3.region.amazonaws.com/folder/file.jpg
    // or: https://bucket.s3.region.amazonaws.com/folder/file.jpg
    const urlPattern = /https?:\/\/[^\/]+\/(.+)$/;
    const match = s3Url.match(urlPattern);

    if (!match || !match[1]) {
      console.error("Could not extract S3 key from URL:", s3Url);
      return false;
    }

    const key = decodeURIComponent(match[1]);
    console.log("Deleting from S3 - Key:", key);

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    };

    await s3.send(new DeleteObjectCommand(params));
    console.log("✅ Successfully deleted from S3:", key);
    return true;
  } catch (error) {
    console.error("❌ Error deleting from S3:", error);
    // Don't throw - we don't want to fail the entire operation if S3 deletion fails
    return false;
  }
};

/**
 * Delete multiple images from S3
 * @param s3Urls - Array of S3 URLs
 * @returns Promise<{ success: number, failed: number }>
 */
export const deleteMultipleFromS3 = async (
  s3Urls: string[]
): Promise<{ success: number; failed: number }> => {
  const results = await Promise.all(
    s3Urls.map((url) => deleteFromS3(url))
  );

  const success = results.filter((r) => r === true).length;
  const failed = results.filter((r) => r === false).length;

  return { success, failed };
};


