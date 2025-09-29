import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { allowedUserIds } from "../utilities/discordUtils.js";
import { importRecurring } from "../../videogames/osrs/bounties/recurring/recurring.js";
import { broadcastRecurring } from "../broadcasts.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder().setName("recurring").setDescription("secret"),
  async execute(interaction) {
    try {
      if (!allowedUserIds.includes(interaction.user.id)) {
        return interaction.reply({
          content: "⛔ You are not allowed to use this command.",
          flags: MessageFlags.Ephemeral,
        });
      }
      await importRecurring();
      await broadcastRecurring();
      await interaction.reply({
        content: `Updated recurring tasks successfully.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.reply({
        content: `There was an error updating members sheets: ${error}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
