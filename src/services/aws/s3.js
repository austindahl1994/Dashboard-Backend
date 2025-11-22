import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import fs from "fs";

// USING UPLOAD INSTEAD OF PUTOBJECT TO ALLOW BUFFER OR STREAM
import { Upload } from "@aws-sdk/lib-storage";

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

const streamBucket = process.env.S3_BUCKET_NAME;

export const streamUpload = async (key, image, mimetype) => {
  if (!image || !image.length) {
    throw new Error("Image is empty or undefined");
  }

  try {
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: streamBucket,
        Key: key,
        Body: image,
        ContentType: mimetype || "image/png",
      },
    });

    await upload.done();
    console.log("✅ Upload successful");

    return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error("❌ Upload error:", error);
    throw error;
  }
};
