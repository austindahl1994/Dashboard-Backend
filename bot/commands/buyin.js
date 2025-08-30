import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { allowedUserIds } from "../utilities/discordUtils.js";
import { memberMoney } from "../../videogames/osrs/data/discordMembers.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("buyin")
    .setDescription("Add a buyin with optional donation")
    .addNumberOption((option) =>
      option
        .setName("donation")
        .setDescription("Optional donation amount")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("user")
        .setDescription("Select a guild member")
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    if (!allowedUserIds.includes(interaction.user.id)) {
      return interaction.reply({
        content: "⛔ You are not allowed to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }
    // inside your autocomplete handler
    const focusedValue = interaction.options.getFocused();
    const members = await interaction.guild.members.fetch();

    const choices = members.map((m) => {
      const nickname = m.nickname ?? m.user.username;
      return {
        name: `${nickname} (${m.user.username})`,
        value: m.user.id,
      };
    });

    // optionally filter by what the user typed
    const filtered = choices.filter((choice) =>
      choice.name.toLowerCase().includes(focusedValue.toLowerCase())
    );

    await interaction.respond(
      filtered.slice(0, 25) // discord limits to 25 choices
    );
  },

  async execute(interaction) {
    try {
      const userId = interaction.options.getString("user");
      const member = await interaction.guild.members.fetch(userId);
      const username = member.user.username;
      const nickname = member.nickname || username;
      const id = member.id
      const donation = interaction.options.getNumber("donation") ?? 0;
      await memberMoney({ nickname, username, id, donation });
      await interaction.reply({
        content: `Buy-in recorded for <@${userId}> with donation: ${donation}`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.reply({
        content: `There was an error saving buy in: ${error}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
