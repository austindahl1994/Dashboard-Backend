import { SlashCommandBuilder, MessageFlags } from "discord.js";

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
    // inside your autocomplete handler
    const focusedValue = interaction.options.getFocused();
    const members = await interaction.guild.members.fetch();

    const choices = members.map((m) => {
      const nickname = m.nickname ?? m.user.username;
      return {
        name: `${nickname} (${m.user.username})`,
        value: m.user.id, // or username, whatever you want your command to receive
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
    const userId = interaction.options.getString("user");
    const donation = interaction.options.getNumber("donation") ?? 0;

    try {
      await interaction.reply({
        content: `Buy-in recorded for <@${userId}> with donation: ${donation}`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.reply({
        content: `There was an error getting data: ${error}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
