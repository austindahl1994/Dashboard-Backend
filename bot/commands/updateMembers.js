import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { updateUsers } from "../../videogames/osrs/data/discordMembers.js";
import { allowedUserIds } from "../utilities/discordUtils.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("updatemembers")
    .setDescription("Add members to the google sheet"),
  async execute(interaction) {
    try {
      if (!allowedUserIds.includes(interaction.user.id)) {
        return interaction.reply({
          content: "⛔ You are not allowed to use this command.",
          flags: MessageFlags.Ephemeral,
        });
      }
      const discordMembers = await interaction.guild.members.fetch();
      console.log(`Fetched ${discordMembers.size} guild members from Discord`);
      await updateUsers(discordMembers);
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
