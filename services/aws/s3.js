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

// async function getTest() {
//   try {
//     const key = "test-image.jpg";
//     const getCommand = new GetObjectCommand({
//       Bucket: bucketName,
//       Key: key,
//     });

//     // Generate a signed URL valid for 15 minutes (900 seconds)
//     const signedUrl = await getSignedUrl(s3, getCommand, { expiresIn: 900 });
//     console.log("✅ Signed URL:", signedUrl);
//   } catch (err) {
//     console.error("Get error:", err);
//   }
// }

// async function uploadTest() {
//   try {
//     const fileContent = fs.readFileSync("spring.png"); // put a test image in your folder
//     const key = "spring.png"; // S3 key (file name in bucket)

//     const putCommand = new PutObjectCommand({
//       Bucket: bucketName,
//       Key: key,
//       Body: fileContent,
//       ContentType: "image/jpeg",
//     });

//     await s3.send(putCommand);
//     console.log("✅ Upload successful");

//     // Generate public URL if bucket/object is public
//     const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
//     console.log("Image URL:", url);
//   } catch (err) {
//     console.error("Upload error:", err);
//   }
// }
//key is what the file will be named in the bucket, image is the png

// async function runTest() {
//   await uploadTest();
//   await getTest();
// }

//runTest();
