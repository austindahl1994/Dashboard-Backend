import { Dink } from "@/types/dink.ts";
import { Player } from "@/types/player.ts";
import { getPlayerInfo } from "./players.ts";
import { streamUpload } from "@/services/aws/s3.js";
import { addShame } from "./mvc/vingo.ts";

interface Shame {
  rsn: string;
  team: number;
  url: string;
}

export const checkShame = async (
  data: Dink,
  image: Buffer,
  mimetype: string
) => {
  try {
    if (data.type.toLocaleLowerCase() !== "death") return;
    const player: Player | undefined = getPlayerInfo(data.playerName);
    if (!player) {
      console.log(`No player found on teams with user: ${data.playerName}`);
      return;
    }
    const key: string = "/shame/" + data.playerName + Date.now();
    const url = await streamUpload(key, image, mimetype);
    await addShame({
      playerName: data.playerName,
      pvp: data.extra?.isPvP ? 1 : 0,
      killer: data.extra?.killerName,
      url,
    });
    // since type was death, add them to "shame" table, save playerName, image, and what killed them (if included)
  } catch (error) {
    throw error;
  }
};
