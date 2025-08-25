import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { getAllMembers } from "../../services/google/osrsSheets.js";
import { updateUsers } from "../../videogames/osrs/data/discordMembers.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("updatemembers")
    .setDescription("Add members to the google sheet"),
  async execute(interaction) {
    try {
      const discordMembers = await interaction.guild.members.fetch();
      console.log(`Fetched ${discordMembers.size} guild members from Discord`);
      const sheetsMembers = await getAllMembers();
      await updateUsers(discordMembers, sheetsMembers);
      await interaction.reply({
        content: `Successfully added members to sheets`,
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
