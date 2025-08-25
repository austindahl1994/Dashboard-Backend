import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { getAllSheetBounties } from "../../services/google/osrsSheets.js";
import { updateBroadcast } from "../broadcasts.js";
import { allowedUserIds } from "../utilities/discordUtils.js";

import dotenv from "dotenv";
dotenv.config();

const allowedChannel = process.env.EVENT_CHANNEL_ID;

// const allowedUserId = process.env.TEMP_USER_ID;

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("refresh")
    .setDescription("Refresh the sheets data if bounties are not populated"),
  async execute(interaction) {
    try {
      if (!allowedUserIds.includes(interaction.user.id)) {
        return interaction.reply({
          content: "⛔ You are not allowed to use this command.",
          flags: MessageFlags.Ephemeral,
        });
      }
      await getAllSheetBounties();
      await updateBroadcast("bounties");
      await interaction.reply({
        content: `Sheets refreshed successfully.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.reply({
        content: `Sheets did not refresh properly: ${error}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
