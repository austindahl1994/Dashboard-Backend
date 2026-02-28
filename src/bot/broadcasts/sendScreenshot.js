import { completionSS } from "../embeds/vingo/completionSS.js";
import { client } from "../mainBot.js";
const channelIds = [
  "1475643233508921568",
  "1475643261518348388",
  "1475643289142169651",
];
export const sendScreenshot = async (completion) => {
  const channelId = channelIds[Number(completion.team) - 1];
  if (!channelId) {
    throw new Error(
      "No channelId provided and DISCORD_LOG_CHANNEL_ID not set.",
    );
  }
  if (!client) {
    throw new Error(
      "Discord client not available. Start the bot first or pass a client.",
    );
  }
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) throw new Error(`Channel ${channelId} not found.`);
    const embed = completionSS({
      rsn: completion.rsn,
      tile_id: completion.tile_id,
      item: completion.item,
      url: completion.url,
      obtained_at: completion.obtained_at,
    });
    // @ts-ignore
    await channel.send({ embeds: [embed] });
    return true;
  } catch (error) {
    console.error(`Error sending discord log to ${channelId}:`, error);
    throw error;
  }
};
