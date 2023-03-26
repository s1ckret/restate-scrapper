import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { AWS_DEFAULT_REGION } from "./config";

const client = new S3Client({
  region: AWS_DEFAULT_REGION
});

async function uploadImageToS3(
  bucket: string,
  key: string,
  image: any,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: image,
    ContentType: contentType
  });

  await client.send(command);

  return `https://${bucket}.s3.${AWS_DEFAULT_REGION}.amazonaws.com/${key}`;
}

export async function uploadImages(
  images: any[],
  keyPrefix: string,
  s3Bucket: string
): Promise<[string[], string[]]> {
  const imageKeys = [];
  const uploadedImageUrls = [];
  for (const image of images) {
    try {
      const fileName = image[0].split("/").pop();
      const key = `${keyPrefix}/${fileName}`;
      const url = await uploadImageToS3(s3Bucket, key, image[1], image[2]);
      imageKeys.push(key);
      uploadedImageUrls.push(url);
      console.log(`Successfully uploaded ${s3Bucket}/${key}`);
    } catch (error) {
      console.error(`Failed to upload image to ${s3Bucket}:`, error);
    }
  }
  return [imageKeys, uploadedImageUrls];
}

export function shutdown() {
  client.destroy();
}
