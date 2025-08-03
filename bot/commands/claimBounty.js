import { SlashCommandBuilder, MessageFlags } from "discord.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("claim")
    .setDescription("Claim a bounty manually"),
  async execute(interaction) {
    if (interaction.user.id !== allowedUserId) {
      return interaction.reply({
        content: "Yo fuckoff, you don't need to be here right now.",
        flags: MessageFlags.Ephemeral,
      });
    }
    // locic to manually claim a bounty based on passed in difficulty:id with an image
    await interaction.reply("Need claim logic");
  },
};
