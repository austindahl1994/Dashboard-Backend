import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { testRead } from "../../services/testRead.js";
import dotenv from "dotenv";

dotenv.config();

const allowedChannelID = process.env.DISCORD_CHANNEL_ID;
const allowedUserId = process.env.TEMP_USER_ID;
export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("refresh")
    .setDescription("Refresh the sheets data if bounties are not populated"),
  async execute(interaction) {
    if (interaction.user.id !== allowedUserId) {
      return interaction.reply({
        content: "Yo fuckoff, you don't need to be here right now.",
        flags: MessageFlags.Ephemeral,
      });
    }
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
