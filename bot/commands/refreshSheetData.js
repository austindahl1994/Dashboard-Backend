import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { getAllSheetBounties } from "../../services/google/osrsSheets.js";
import { updateBroadcast } from "../broadcasts.js";
import { allowedUserIds } from "../utilities/discordUtils.js";
import { getCachedData } from "../../videogames/osrs/data/cachingData.js";

import dotenv from "dotenv";
dotenv.config();

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("refresh")
    .setDescription("Refresh the sheets data if bounties are not populated"),
  async execute(interaction) {
    try {
      await interaction.deferReply({
        content: "Attempting to refresh sheets.",
        flags: MessageFlags.Ephemeral,
      });
      await getCachedData();
      // await getAllSheetBounties();
      await updateBroadcast("bounties");
      await interaction.editReply({
        content: `Sheets refreshed successfully.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.editReply({
        content: `Sheets did not refresh properly: ${error}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
