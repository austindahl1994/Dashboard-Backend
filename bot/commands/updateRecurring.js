import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { allowedUserIds } from "../utilities/discordUtils.js";
import { updateRecurring } from "../../videogames/osrs/bounties/recurring/recurring.js"

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
      await updateRecurring()
      await interaction.editReply({
        content: `Updated recurring tasks successfully.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.editReply({
        content: `There was an error updating members sheets: ${error}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
