import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { allowedUserIds } from "../utilities/discordUtils.js";
import { teams } from "../../videogames/osrs/cachedData.js";
import { updateTeamName } from "../../videogames/osrs/data/discordMembers.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("groupname")
    .setDescription("Change the Bounty Event group name for a team")
    .addStringOption((option) =>
      option
        .setName("oldname")
        .setDescription("Select a current team name to change: ")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("newname")
        .setDescription("Updated to name: ")
        .setRequired(true)
    ),
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();

    const choices = Object.keys(teams).map((name) => {
      return {
        name: name,
        value: name,
      };
    });

    const filtered = choices.filter((choice) =>
      choice.name.toLowerCase().includes(focusedValue.toLowerCase())
    );

    await interaction.respond(filtered.slice(0, 25));
  },

  async execute(interaction) {
    try {
      if (!allowedUserIds.includes(interaction.user.id)) {
        return interaction.reply({
          content: "⛔ You are not allowed to use this command.",
          flags: MessageFlags.Ephemeral,
        });
      }
      await interaction.deferReply({
        content: "Attempting to update team name...",
        flags: MessageFlags.Ephemeral,
      });
      const prevName = interaction.options.getString("oldname");
      const newName = interaction.options.getString("newname");
      await updateTeamName(prevName, newName);
      await interaction.editReply({
        content: "Updated team name!",
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.editReply({
        content: `There was an error creating groups: ${error}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
