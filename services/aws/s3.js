import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const s3 = new S3Client({ region: process.env.AWS_REGION });
const bucketName = process.env.S3_BUCKET_NAME;

export const uploadScreenshot = async (key, image, mimetype) => {
  try {
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: image, // can be Buffer, stream, or blob
        ContentType: mimetype || "image/png",
      },
    });

    upload.on("httpUploadProgress", (progress) => {
      console.log("Upload progress:", progress);
    });

    const result = await upload.done();
    console.log("✅ Upload successful:", result);

    const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return url;
  } catch (error) {
    console.error(`❌ Error uploading image:`, error);
    throw error;
  }
};
