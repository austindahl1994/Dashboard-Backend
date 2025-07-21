import { SlashCommandBuilder, MessageFlags } from "discord.js";
import dotenv from "dotenv";
import { getHighscoresEmbeds } from "../embeds/embededHighscores.js";

dotenv.config();

const channelId = process.env.DISCORD_CHANNEL_ID;
const modId = process.env.MOD_ID;
const allowedUserId = process.env.TEMP_USER_ID;
export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("highscores")
    .setDescription("Gets current highscores"),
  async execute(interaction) {
    if (interaction.user.id !== allowedUserId) {
      return interaction.reply({
        content: "Yo fuckoff, you don't need to be here right now.",
        ephemeral: true,
      });
    }
    // if (!interaction.member.roles.cache.has(modId)) {
    //   return interaction.reply({
    //     content: "Only moderators can use this command.",
    //     flags: MessageFlags.Ephemeral,
    //   });
    // }
    // if (interaction.channelId !== channelId) {
    //   return interaction.reply({
    //     content: "You must be in the proper channel to make use this command",
    //     flags: MessageFlags.Ephemeral,
    //   });
    // }

    const embeds = getHighscoresEmbeds();
    // console.log("Total embeds generated:", embeds.length);
    // embeds.forEach((embed, i) => {
    //   console.log(`Embed #${i + 1}:`, embed.data);
    // });
    if (!embeds || embeds.length === 0) {
      return interaction.reply({
        content: `There are no current highscores available.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.reply({ embeds: embeds, flags: MessageFlags.Ephemeral });
  },
};
