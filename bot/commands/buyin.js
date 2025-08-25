import { SlashCommandBuilder, MessageFlags } from "discord.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("buyin")
    .setDescription("Add a buyin with optional donation")
    .addStringOption((option) =>
      option
        .setName("user")
        .setDescription("Select a guild member")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addNumberOption((option) =>
      option
        .setName("donation")
        .setDescription("Optional donation amount")
        .setRequired(false)
    ),

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    await interaction.guild.members.fetch();

    const choices = interaction.guild.members.cache.map((member) => ({
      name: member.user.username,
      value: member.user.id,
    }));

    const filtered = choices.filter((choice) =>
      choice.name.toLowerCase().includes(focusedValue.toLowerCase())
    );

    await interaction.respond(filtered.slice(0, 25));
  },

  async execute(interaction) {
    const userId = interaction.options.getString("user");
    const donation = interaction.options.getNumber("donation") ?? 0;

    try {
      await finalTasks();
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
