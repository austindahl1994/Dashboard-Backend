import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { updateUsers } from "../../vingo/players.ts";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("updatemembers")
    .setDescription("Add members to the google sheet"),
  async execute(interaction) {
    try {
      await interaction.deferReply({
        content: "Attempting to update members",
        flags: MessageFlags.Ephemeral,
      });
      const discordMembers = await interaction.guild.members.fetch();
      console.log(`Fetched ${discordMembers.size} guild members from Discord`);
      await updateUsers(discordMembers);
      await interaction.editReply({
        content: `Successfully added members to sheets`,
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
