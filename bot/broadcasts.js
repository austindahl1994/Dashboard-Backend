import { client } from "./mainBot.js";
import { getAllBountyEmbeds } from "./embeds/embededBounties.js";
import { getHighscoresEmbeds } from "./embeds/embededHighscores.js";
import { completedBountyEmbed } from "./embeds/completedBountyEmbed.js";
import dotenv from "dotenv";

dotenv.config();

const completedBountiesChannel = process.env.COMPLETED_BOUNTIES_CHANNEL_ID;
const bountyBoardChannel = process.env.BOUNTY_BOARD_CHANNEL_ID;
const highscoresChannel = process.env.HIGHSCORES_CHANNEL_ID;

// Used to update broadcasted messages that have already been created, if they haven't then create a new one and just
// clg the savedMessageId for both highscores and bounties to be saved
// Need to save the two different broadcasted IDs after first post
export const updateBroadcast = async (broadcastType) => {
  // If savedMessageID is not null, edit it, otherwise will create and post what the message Id is
  try {
    let channelId;
    let embed;
    let savedMessageId;
    // console.log(`Received type: ${broadcastType}`);
    if (broadcastType === "highscores") {
      channelId = highscoresChannel;
      embed = getHighscoresEmbeds();
      savedMessageId = process.env.SAVED_HS_MESSAGE_ID;
    } else if (broadcastType === "bounties") {
      channelId = bountyBoardChannel;
      embed = getAllBountyEmbeds(); //already an array
      savedMessageId = process.env.SAVED_BB_MESSAGE_ID;
    } else {
      throw new Error(
        `No correct broadcast type was passed in, passed in: ${broadcastType}`
      );
    }
    const channel = await client.channels.fetch(channelId);
    // content is the embed
    if (!channel || !channel.isTextBased()) {
      throw new Error(`Channel not found from channel ID`);
    }

    // THOUGHTS: if the event hasn't started yet, show nothing for either channel, OR show template
    if (savedMessageId && savedMessageId.trim() !== "") {
      try {
        const message = await channel.messages.fetch(savedMessageId);
        await message.edit({ embeds: embed });
        //console.log(`Edited message ID: ${savedMessageId}`);
      } catch (err) {
        console.log("Failed to fetch/edit existing message, sending new one.");
        const sent = await channel.send({ embeds: embed });
        savedMessageId = sent.id;
        console.log(`New message sent. Save this ID: ${savedMessageId}`);
      }
    } else {
      const sent = await channel.send({ embeds: embed });
      savedMessageId = sent.id;
      console.log(`Message sent. Save this ID: ${savedMessageId}`);
    }
  } catch (err) {
    console.error("Error broadcasting message:", err);
  }
};

export const broadcastBountyCompletion = async (bounty) => {
  try {
    const embed = completedBountyEmbed(bounty);
    const channel = await client.channels.fetch(completedBountiesChannel);
    await channel.send({
      embeds: [embed],
    });
  } catch (error) {
    console.error(`Error broadcasting completed bounty: ${error}`);
  }
};
