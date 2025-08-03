import { getAllBountyEmbeds } from "../embeds/embededBounties.js";
import { getHighscoresEmbeds } from "../embeds/embededHighscores.js";

import dotenv from "dotenv";
dotenv.config();

// Used to update broadcasted messages that have already been created, if they haven't then create a new one and just
// clg the savedMessageId for both highscores and bounties to be saved
// Need to save the two different broadcasted IDs after first post
export updateBroadcast = async (savedMessageId, broadcastType) => {
  // If savedMessageID is not null, edit it, otherwise will create and post what the message Id is
  try {
    let channelId;
    let embeds;
    if (broadcastType === "highscores") {
      channelId = process.env.HIGHSCORES_CHANNEL_ID
      embeds = getAllBountyEmbeds()
    } else if (broadcastType === "bounties") {
      channelId = process.env.BOUNTIES_CHANNEL_ID
      embeds = getHighscoresEmbeds()
    } else {
      throw new Error(`No correct broadcast type was passed in, passed in: ${broadcastType}`)
    }
    const channel = await client.channels.fetch(channelId);
    // content is the embed
    if (!channel || !channel.isTextBased()) {
      throw new Error(`Channel not found from channel ID`);
    }

    // THOUGHTS: if the event hasn't started yet, show nothing for either channel, OR show template
    if (savedMessageId) {
      try {
        const message = await channel.messages.fetch(savedMessageId);
        await message.edit({ embeds: [embed] });
        console.log(`Edited message ID: ${savedMessageId}`);
      } catch (err) {
        console.warn("Failed to fetch/edit existing message, sending new one.");
        const sent = await channel.send({ embeds: [embed] });
        savedMessageId = sent.id;
        console.log(`New message sent. Save this ID: ${savedMessageId}`);
      }
    } else {
      const sent = await channel.send({ embeds: [embed] });
      savedMessageId = sent.id;
      console.log(`Message sent. Save this ID: ${savedMessageId}`);
    }
  } catch (err) {
    console.error("Error broadcasting message:", err);
  }
}

export const completedBounty = async (bounty) => {
  const embed = completedBountyEmbed(bounty)
  try {
    const channel = await client.channels.fetch(channelId);
    await channel.send({embeds: [embed]})
  } catch (error) {
    console.error(`Error broadcasting completed bounty: ${error}`)
  }
}
