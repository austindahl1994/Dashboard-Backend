import { streamUpload } from "@/services/aws/s3.js";
import { Completion } from "@/types/completion.ts";
import { addCompletion } from "./mvc/vingo.ts";
import { updateCompletions } from "./completions.ts";

export const completeTile = async (
  completion: Completion,
  imageBuffer: Buffer,
  mimetype: string
): Promise<void> => {
  try {
    await streamUpload(completion.url, imageBuffer, mimetype);
    console.log(
      `Successfully uploaded completion image to S3 at ${completion.url}`
    );
    const insertId = await addCompletion(completion);
    console.log(
      `Successfully updated completion database with new tile completion, insertId: ${insertId}`
    );
    updateCompletions(completion);
    console.log(`Successfully updated cached completions map`);
    // Final 3 steps:
    // Update cached scores
    // Post to team discord
    // Send SSE event to client side
  } catch (error) {
    console.error(
      `completeTile: There was an error uploading completion: ${error}`
    );
    throw error;
  }
};
