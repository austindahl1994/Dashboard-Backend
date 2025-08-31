import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { allowedUserIds } from "../utilities/discordUtils.js";
import { skipTask } from "../../videogames/osrs/bounties/modifyBounties.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip a bounty manually")
    .addStringOption((option) =>
      option
        .setName("difficulty")
        .setDescription("Select the difficulty of the bounty to skip")
        .setRequired(true)
        .addChoices(
          { name: "Easy", value: "easy" },
          { name: "Medium", value: "medium" },
          { name: "Hard", value: "hard" },
          { name: "Elite", value: "elite" },
          { name: "Master", value: "master" },
          { name: "All", value: "all" }
        )
    ),
  async execute(interaction) {
    try {
      if (!allowedUserIds.includes(interaction.user.id)) {
        return interaction.reply({
          content: "⛔ You are not allowed to use this command.",
          flags: MessageFlags.Ephemeral,
        });
      }
      const choice = interaction.options
        .getString("difficulty")
        .trim()
        .toLowerCase();
      await interaction.deferReply({ 
        content: `Attempting to skip bounty ${choice}`,
        flags: MessageFlags.Ephemeral 
      });
      await skipTask(choice);
      await interaction.editReply({
        content: `Skipped Bounty`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.reply({
        content: `There was an error skipping: ${error}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
