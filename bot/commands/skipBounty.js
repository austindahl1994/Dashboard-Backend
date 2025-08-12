import { SlashCommandBuilder, MessageFlags } from "discord.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip a bounty manually"),
  async execute(interaction) {
    try {
      if (interaction.user.id !== allowedUserId) {
        return interaction.reply({
          content: "Yo fuckoff, you don't need to be here right now.",
          flags: MessageFlags.Ephemeral,
        });
      }
      // locic to manually skip a bounty, based on array of allowed discord_ids since can't use mod ID?
      // or if we can use based on their permissions: member.permissions.has('SomePermission')
      await interaction.reply("Need skip logic");
    } catch (error) {
      await interaction.reply({
        content: `There was an error skipping: ${error}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
