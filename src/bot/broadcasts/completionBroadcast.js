import { client } from "../mainBot.js";

const channelId = "1534708789390082251";

export const completionBroadcast = async (embed) => {
  if (!channelId) {
    throw new Error("No channelId provided.");
  }
  if (!client) {
    throw new Error(
      "Discord client not available. Start the bot first or pass a client.",
    );
  }
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) throw new Error(`Channel ${channelId} not found.`);

    // @ts-ignore
    await channel.send({ embeds: [embed] });
    return true;
  } catch (error) {
    console.error(`Error sending discord log to ${channelId}:`, error);
    throw error;
  }
};
