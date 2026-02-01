import { Dink } from "@/types/dink.ts";
import { Player } from "@/types/player.ts";
import { getPlayerInfo } from "./players.ts";
import { streamUpload } from "@/services/aws/s3.js";
import { addShame, getAllShames } from "./mvc/vingo.ts";
import { deathEmbed } from "../bot/embeds/vingo/logs.js";
import { sendLog } from "../bot/broadcasts/sendLog.js";
import { teamShameMap } from "./cachedData.ts";

export const checkShame = async (
  data: Dink,
  image: Buffer,
  mimetype: string,
) => {
  try {
    if (data.type.toLocaleLowerCase() !== "death") return;
    const player: Player | undefined = getPlayerInfo(data.playerName);
    if (!player) {
      console.log(`No player found on teams with rsn: ${data.playerName}`);
      return;
    }
    const safeName = player.rsn.replace(/ /g, "_");
    const key = `shame/${safeName}-${Date.now()}.png`;
    const url = await streamUpload(key, image, mimetype);
    await addShame({
      playerName: data.playerName,
      pvp: data.extra?.isPvp ? 1 : 0,
      killer: data.extra?.killerName || null,
      url,
      team: player.team,
    });
    // Increment cached team shame count for this player's team
    try {
      const current = teamShameMap.get(player.team) || 0;
      teamShameMap.set(player.team, current + 1);
    } catch (e) {
      // noop on cache update failure
      console.log(`Error adding shame to counter: ${e}`);
    }
    // const embed: any = deathEmbed(data, url);
    // await sendLog(embed);
    // since type was death, add them to "shame" table, save playerName, image, and what killed them (if included)
  } catch (error) {
    throw error;
  }
};

export const createCachedShameCounts = async () => {
  try {
    const allShames = await getAllShames();
    // Ensure we have keys for the three teams initialized to 0
    const shameCountMap: Map<number, number> = new Map<number, number>([
      [1, 0],
      [2, 0],
      [3, 0],
    ]);

    for (const shameEntry of allShames) {
      const teamNum = Number(shameEntry.team);
      if (!shameCountMap.has(teamNum)) continue; // ignore entries outside teams 1-3
      const currentCount = shameCountMap.get(teamNum) || 0;
      shameCountMap.set(teamNum, currentCount + 1);
    }
    // console.log(`Shame counts by team: `);
    // console.log(shameCountMap);
    // Update global cached map
    for (const [team, count] of shameCountMap) {
      teamShameMap.set(team, count);
    }
  } catch (error) {
    throw error;
  }
};
