import { client } from "../mainBot.js";

const channelId = process.env.LOG_CHANNEL_ID;

export const sendLog = async (embed) => {
  if (!channelId) {
    throw new Error(
      "No channelId provided and DISCORD_LOG_CHANNEL_ID not set."
    );
  }
  if (!client) {
    throw new Error(
      "Discord client not available. Start the bot first or pass a client."
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
