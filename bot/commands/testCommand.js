import { SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const allowedChannelID = process.env.DISCORD_CHANNEL_ID;

import {
  cachedBounties,
  highscores,
} from "../../videogames/osrs/cachedData.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Just a test to use async data"),
  async execute(interaction) {
    // Example: just reply with cachedTest string and array lengths
    const bountyCount = cachedBounties.length;
    const highscoreCount = highscores.length;

    await interaction.reply(
      `Cached Test Data: ${cachedTest}\n` +
        `Bounties: ${bountyCount}\n` +
        `Highscores: ${highscoreCount}`
    );
  },
};
