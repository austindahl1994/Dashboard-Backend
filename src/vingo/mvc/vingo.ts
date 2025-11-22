import { Completion } from "@/types/completion.js";

export const getAllCompletionData = async (): Promise<Array<Completion>> => {
  try {
    const temp: Completion = {
      id: 1,
      team: 0,
      tile_id: 69,
      rsn: "Dubzie",
      url: "dahldash.com",
      item: "BCP",
      obtained_at: "Today",
    };
    return [temp];
  } catch (error) {
    throw error;
  }
};
