import type { DiscordEmbed } from "@/types/index.ts";
import { client } from "../../bot/mainBot.js";

export const postToDiscordChannel = async (
  channelId: string,
  embed: DiscordEmbed,
): Promise<void> => {
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased() || !channel.isSendable()) {
      throw new Error(
        `Channel with ID ${channelId} is not a sendable text channel`,
      );
    }
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error(
      `Failed to post message to Discord channel ${channelId}:`,
      error,
    );
  }
};
