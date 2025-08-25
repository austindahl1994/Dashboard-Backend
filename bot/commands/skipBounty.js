import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { allowedUserIds } from "../utilities/discordUtils.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip a bounty manually"),
  async execute(interaction) {
    try {
      if (!allowedUserIds.includes(interaction.user.id)) {
        return interaction.reply({
          content: "⛔ You are not allowed to use this command.",
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
