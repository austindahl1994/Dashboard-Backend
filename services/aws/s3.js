import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const s3 = new S3Client({ region: process.env.AWS_REGION });
const bucketName = process.env.S3_BUCKET_NAME;

export const uploadScreenshot = async (key, image, mimetype) => {
  try {
    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: image,
      ContentType: mimetype || "image/png",
    });

    await s3.send(putCommand);
    console.log("✅ Upload successful");

    const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    //console.log("Image URL:", url);
    return url;
  } catch (error) {
    console.error(`There was an error uploading the image: ${error}`);
  }
};
