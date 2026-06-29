import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { updateCabbageUser } from "../../cabbage/cabbage-main/mvc/cabbage.ts";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("updatersn")
    .setDescription("Set or update your RSN")
    .addStringOption((option) =>
      option
        .setName("rsn")
        .setDescription("RSN that will be used for events")
        .setRequired(true),
    ),
  async execute(interaction) {
    try {
      const rsn = interaction.options.getString("rsn");
      const discord_id = interaction.user.id;
      const discord_username = interaction.user.username;
      const discord_avatar = interaction.user.avatarURL() || null;
      const role = process.env.MODERATORS?.includes(discord_id)
        ? "moderator"
        : "player";
      await updateCabbageUser(
        discord_id,
        discord_username,
        rsn,
        discord_avatar,
        role,
      );
      await interaction.reply({
        content: `Your RSN has been updated to **${rsn}**!`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error(`Error updating RSN: ${error}`);
      await interaction.reply({
        content: `There was an error updating your RSN. Please try again later.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
