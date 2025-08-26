import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { resetAllTasks } from "../../videogames/osrs/bounties/modifyBounties.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("reset")
    .setDescription("Reset the bounties to the first task")
    .addStringOption((option) =>
      option
        .setName("resettier")
        .setDescription("What bounty tier to reset?")
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
      if (interaction.user.id !== process.env.DUBZ_DISCORD_ID) {
        return interaction.reply({
          content:
            "⛔ You are not allowed to use this command (Only Dubz can).",
          flags: MessageFlags.Ephemeral,
        });
      }
      const choice = interaction.options
        .getString("resettier")
        .trim()
        .toLowerCase();
      await resetAllTasks(choice);
      await interaction.reply({
        content: `Skipping bounty...`,
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
