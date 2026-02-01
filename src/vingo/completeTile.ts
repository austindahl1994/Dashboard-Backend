import { streamUpload } from "@/services/aws/s3.js";
import { Completion } from "@/types/completion.ts";
import { addCompletion } from "./mvc/vingo.ts";
import { updateCompletions } from "./completions.ts";
import { addCompletionToTeamState } from "./points.ts";
import { teamStates } from "./cachedData.ts";

export const completeTile = async (
  completion: Completion,
  imageBuffer: Buffer,
  mimetype: string,
): Promise<string> => {
  try {
    const awsURL = await streamUpload(completion.url, imageBuffer, mimetype);
    // console.log(`Successfully uploaded completion image to S3 at ${awsURL}`);
    const insertId = await addCompletion({ ...completion, url: awsURL });
    // console.log(
    //   `Successfully updated completion database with new tile completion, insertId: ${insertId}`,
    // );
    updateCompletions({ ...completion, url: awsURL });
    console.log(`Successfully updated cached completions map`);
    // Final steps:
    // Update cached scores
    // Send SSE event to client side
    addCompletionToTeamState({ ...completion, url: awsURL });
    return awsURL;
  } catch (error) {
    console.error(
      `completeTile: There was an error uploading completion: ${error}`,
    );
    throw error;
  }
};
