import { client } from "../mainBot.js";

const channelId = "1534708789390082251";

const normalizeEmbeds = (embedOrEmbeds) => {
  const embeds = (
    Array.isArray(embedOrEmbeds) ? embedOrEmbeds : [embedOrEmbeds]
  )
    .flat()
    .filter(Boolean)
    .map((entry) =>
      entry && typeof entry.toJSON === "function" ? entry.toJSON() : entry,
    );

  return embeds;
};

export const completionBroadcast = async (embedOrEmbeds) => {
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

    const embeds = normalizeEmbeds(embedOrEmbeds);

    if (embeds.length === 0) {
      throw new Error("No valid embed payload to send.");
    }

    // @ts-ignore
    await channel.send({ embeds });
    return true;
  } catch (error) {
    console.error(`Error sending discord log to ${channelId}:`, error);
    throw error;
  }
};
