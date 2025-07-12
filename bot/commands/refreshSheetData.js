import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { testRead } from "../../services/testRead.js";
import dotenv from "dotenv";

dotenv.config();

const allowedChannelID = process.env.DISCORD_CHANNEL_ID;

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("refresh")
    .setDescription("Refresh the sheets data if bounties are not populated"),
  async execute(interaction) {
    const successful = await testRead();
    await interaction.reply({
      content: `Sheets ${
        successful
          ? "refreshed successfully."
          : "did not refresh due to some error."
      }`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
